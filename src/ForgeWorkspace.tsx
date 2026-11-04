import {useEffect,useMemo,useRef,useState} from 'react';
import type {CSSProperties,PointerEvent,ReactNode} from 'react';
import {motion,useMotionValueEvent,useScroll,useSpring,useTransform} from 'motion/react';
import type {MotionValue} from 'motion/react';
import {ArrowUpRight,ArrowLeft,ArrowRight,RotateCcw} from 'lucide-react';
import {skills} from './data';
import {createHoverIntent} from './hoverIntent';
import type {advanceDeck} from './deckState';
import {useReducedMotion} from 'motion/react';
import {useForge,FORGE_DRAG_TYPE} from './ForgeProvider';
import {inventoryOf} from './forgeState';
import ProjectForge,{summaries} from './ProjectForge';
import {slotDomId} from './mystery';
import {forgeProjects} from './forgeData';
function DockTrack({children,progress,enabled,i,width,mobile,fanX,fanY,angle,layer}:{children:ReactNode;progress:MotionValue<number>;enabled:boolean;i:number;width:number;mobile:boolean;fanX:number;fanY:number;angle:number;layer:number}){
 const reduced=useReducedMotion();const input=useTransform(progress,v=>reduced?(v>.5?1:0):v);
 const a=-angle*Math.PI/180,scale=mobile?.27:.31;
 const targetX=-width/2+48+(i%(mobile?4:3))*(mobile?77:83),targetY=mobile?-200+Math.floor(i/4)*92:-160+Math.floor(i/3)*108;
 const dx=targetX-scale*(fanX*Math.cos(a)-fanY*Math.sin(a)),dy=targetY-scale*(fanX*Math.sin(a)+fanY*Math.cos(a));
 const x=useTransform(input,v=>enabled?v*dx:0),y=useTransform(input,v=>enabled?v*dy:0),r=useTransform(input,v=>enabled?-angle*v:0),z=useTransform(input,v=>enabled?1-(1-scale)*v:1);
 return <motion.div className="dock-track" style={{x,y,rotate:r,scale:z,zIndex:layer}}>{children}</motion.div>;
}
export default function ForgeWorkspace() {
  const {state,store}=useForge();const deckState=state.deck;const inventory=inventoryOf(state);const dispatchDeck=(action:Parameters<typeof advanceDeck>[1])=>store.dispatch({type:'deck',action});
  const workspace=useRef<HTMLDivElement>(null);const [docked,setDocked]=useState(false);const [width,setWidth]=useState(1000);
  const drag=useRef<{id:typeof skills[number]['icon'];x:number;y:number;moving:boolean}|null>(null);const [ghost,setGhost]=useState<{id:typeof skills[number]['icon'];x:number;y:number}|null>(null);const dragged=useRef(false);
  const {scrollYProgress}=useScroll({target:workspace,offset:['start start','end end']});const dockTarget=useTransform(scrollYProgress,[0,.65],[0,1]);const dock=useSpring(dockTarget,{stiffness:200,damping:32});
  const dockStatus=useRef(false);useMotionValueEvent(dock,'change',v=>{const next=v>.8;if(next!==dockStatus.current){dockStatus.current=next;setDocked(next);}});
  useEffect(()=>{const observer=new ResizeObserver(e=>setWidth(e[0].contentRect.width));if(workspace.current)observer.observe(workspace.current);return()=>observer.disconnect();},[]);
  const quickIndex=useRef<HTMLDialogElement>(null);
  const [flight,setFlight]=useState<{id:string;from:{x:number;y:number};to:{x:number;y:number}}|null>(null);
  useEffect(()=>{const listener=(e:Event)=>setFlight((e as CustomEvent).detail);window.addEventListener('forge-flight',listener);return()=>window.removeEventListener('forge-flight',listener);},[]);
  const focusedRequest=useRef(0);useEffect(()=>{if(!docked||!state.focusTarget||focusedRequest.current===state.focusRequest)return;const frame=requestAnimationFrame(()=>{document.getElementById(slotDomId(state.focusTarget?.slotId))?.focus({preventScroll:true});focusedRequest.current=state.focusRequest;});return()=>cancelAnimationFrame(frame);},[docked,state.focusRequest,state.focusTarget]);
  const deckRef=useRef<HTMLDivElement>(null);
  const restoreCardFocus=useRef(false);
  const stacked=deckState.mode==='stacked';
  const expanded=deckState.mode==='expanded';
  const busy=deckState.cycle!=='idle'||deckState.mode==='transitioning';
  const [hover,setHover]=useState<number|null>(null);
  const hoverIntent=useMemo(()=>createHoverIntent(setHover),[]);
  useEffect(()=>()=>hoverIntent.dispose(),[hoverIntent]);
  const [flipped,setFlipped]=useState<string[]>([]);
  const [selected,setSelected]=useState(0);
  useEffect(()=>{if(docked){hoverIntent.dispose();setHover(null);setFlipped([]);}},[docked,hoverIntent]);
  const [mobile,setMobile]=useState(()=>window.matchMedia('(max-width: 700px)').matches);
  const reduced=useReducedMotion();
  useEffect(()=>{
    const action=deckState.mode==='transitioning'?'expanded':deckState.cycle==='sending'?'return':deckState.cycle==='returning'?'settled':null;
    if(!action)return;
    const delay=reduced?0:action==='expanded'?850:action==='return'?220:240;
    const timer=setTimeout(()=>dispatchDeck(action),delay);
    return()=>clearTimeout(timer);
  },[deckState,reduced]);
  useEffect(()=>{
    if(!busy&&restoreCardFocus.current){
      restoreCardFocus.current=false;
      deckRef.current?.querySelector<HTMLButtonElement>(`[data-skill-index="${expanded&&mobile?selected:deckState.front}"]`)?.focus({preventScroll:true});
    }
  },[busy,expanded,mobile,selected,deckState.front]);
  const touch=useRef<number|null>(null);
  const swiped=useRef(false);
  useEffect(()=>{const m=window.matchMedia('(max-width: 700px)');const update=()=>setMobile(m.matches);m.addEventListener('change',update);return()=>m.removeEventListener('change',update);},[]);
  const cards=skills;
  const fanStep=5/Math.max(1,cards.length-1);
  // Use resting fan coordinates, never animated card bounds or event.target.
  // A stationary pointer therefore cannot activate another card as cards move.
  function trackPointer(e:PointerEvent<HTMLDivElement>) {
    if(dock.get()>.05||!expanded||mobile||e.pointerType==='touch')return;
    const deck=e.currentTarget;
    const bounds=deck.getBoundingClientRect();
    const x=(e.clientX-bounds.left)*deck.offsetWidth/bounds.width;
    const y=(e.clientY-bounds.top)*deck.offsetHeight/bounds.height;
    const card=deck.querySelector<HTMLButtonElement>('.skill-card');
    if(!card)return;
    const step=fanStep*142;
    const first=deck.offsetWidth/2-(cards.length-1)*step/2;
    const halfWidth=card.offsetWidth*.65;
    const top=(deck.offsetHeight-card.offsetHeight)/2-30;
    const bottom=(deck.offsetHeight+card.offsetHeight)/2+65;
    if(x<first-halfWidth||x>first+(cards.length-1)*step+halfWidth||y<top||y>bottom){hoverIntent.leave();return;}
    hoverIntent.request(Math.max(0,Math.min(cards.length-1,Math.round((x-first)/step))));
  }
  useEffect(()=>{hoverIntent.dispose();setHover(null);},[mobile,hoverIntent]);
  function move(delta:number){if(expanded)setSelected(n=>(n+delta+cards.length)%cards.length);}
  function flip(name:string){setFlipped(f=>f.includes(name)?f.filter(n=>n!==name):[...f,name]);}
  return <div ref={workspace} className={`forge-journey ${expanded?'journey-expanded':''} ${docked?'journey-docked':''}`}><div className="forge-journey-sticky" onPointerDownCapture={e=>{if(!docked||e.button!==0)return;const target=(e.target as HTMLElement).closest<HTMLElement>('[data-skill-index]');if(!target)return;const id=skills[Number(target.dataset.skillIndex)].icon;if(inventory[id]<1)return;drag.current={id,x:e.clientX,y:e.clientY,moving:false};target.setPointerCapture(e.pointerId);}} onPointerMoveCapture={e=>{const g=drag.current;if(!g)return;if(!g.moving&&Math.hypot(e.clientX-g.x,e.clientY-g.y)<8)return;g.moving=true;dragged.current=true;setGhost({id:g.id,x:e.clientX,y:e.clientY});}} onPointerUpCapture={e=>{const g=drag.current;if(!g)return;drag.current=null;if(g.moving){const slot=document.elementFromPoint(e.clientX,e.clientY)?.closest<HTMLElement>('[data-forge-slot]');if(slot?.dataset.projectId&&slot.dataset.forgeSlot)store.dispatch({type:'assign',projectId:slot.dataset.projectId,slotId:slot.dataset.forgeSlot,skillId:g.id});}setGhost(null);setTimeout(()=>{dragged.current=false;},0);}} onPointerCancel={()=>{drag.current=null;setGhost(null);dragged.current=false;}}>
    {!docked&&<button className="journey-browse" onClick={()=>quickIndex.current?.showModal()}>Explore All Projects</button>}<dialog className="project-index" ref={quickIndex} aria-label="Explore All Projects"><button onClick={()=>quickIndex.current?.close()} aria-label="Close project index">Close</button>{forgeProjects.map(p=><a key={p.id} href={p.githubUrl} target="_blank" rel="noreferrer"><strong>{p.title}</strong><span>{summaries[p.id]}</span></a>)}</dialog>
    <p id="toolkit-hint" className="toolkit-hint" style={{visibility:stacked?'visible':'hidden'}} aria-hidden={!stacked}>{mobile?'Tap':'Click'} through my toolkit — there’s a reveal at the end.</p>
    <div ref={deckRef} className={`deck deck-${deckState.mode}`} data-mode={deckState.mode} aria-busy={busy} onPointerMove={trackPointer} onPointerLeave={()=>{if(!mobile)hoverIntent.leave();}} onPointerCancel={()=>hoverIntent.leave()} onTouchStart={e=>{if(!expanded)return;swiped.current=false;touch.current=e.touches[0].clientX;}} onTouchEnd={e=>{if(!expanded)return;if(touch.current!==null){const diff=e.changedTouches[0].clientX-touch.current;if(Math.abs(diff)>40){swiped.current=true;move(diff<0?1:-1);}}touch.current=null;}}>
      <div className="deck-orbit" aria-hidden="true"/>
      {cards.map((skill,i)=>{const offset=(i-(cards.length-1)/2)*fanStep;const active=expanded&&hover===i;const isFlipped=flipped.includes(skill.name);const delta=i-selected;
        const rank=(i-deckState.front+cards.length)%cards.length;
        const depth=Math.min(rank,6);
        const sending=stacked&&deckState.cycle==='sending'&&rank===0;
        const stackPose=sending?{x:mobile?120:160,y:mobile?-10:-45,rotate:mobile?8:16,rotateY:-12,scale:1.025,opacity:1}:{x:depth*3,y:-depth*5,rotate:-depth*.7,rotateY:0,scale:1-depth*.006,opacity:1};
        return <DockTrack layer={stacked?(sending?40:20-rank):active?40:mobile?20-Math.abs(delta):i+1} key={skill.icon} progress={dock} enabled={expanded} i={i} width={width} mobile={mobile} fanX={mobile?delta*280:offset*142} fanY={mobile?0:Math.abs(offset)*17} angle={mobile?0:offset*8}><motion.button initial={false} data-skill-index={i} data-skill-id={skill.icon} key={skill.name} className={`skill-card ${isFlipped?'is-flipped':''} ${docked&&state.selectedSkill===skill.icon?'inventory-selected':''}`} style={{'--accent':skill.color,pointerEvents:stacked?(rank===0&&!busy?'auto':'none'):expanded?'auto':'none',zIndex:stacked?(sending?40:20-rank):active?30:mobile?20-Math.abs(delta):i+1} as CSSProperties}
        animate={stacked?stackPose:mobile?{x:delta*280,y:0,rotate:0,rotateY:0,scale:delta===0?1:0.92,opacity:docked?1:Math.abs(delta)>1?0:1}:{x:offset*142,rotateY:0,y:Math.abs(offset)*17-(active?6:0),rotate:active?0:offset*8,scale:active?1.025:1,opacity:1}}
        transition={reduced?{duration:0}:stacked?{type:'tween',duration:deckState.cycle==='sending'?.22:.24,ease:[.22,1,.36,1]}:!expanded?{type:'tween',duration:.6,delay:i*.018,ease:[.22,1,.36,1]}:mobile?{type:'spring',stiffness:280,damping:30,mass:.5}:{type:'tween',duration:.25,ease:[.22,1,.36,1]}}
        onDragStartCapture={e=>{if(!expanded)return;e.dataTransfer.setData(FORGE_DRAG_TYPE,skill.icon);e.dataTransfer.effectAllowed='copy';store.dispatch({type:'select',skillId:skill.icon});}} draggable={expanded&&!docked&&inventory[skill.icon]>0}
        onFocus={e=>{if(expanded&&!mobile&&e.currentTarget.matches(':focus-visible'))hoverIntent.focus(i);}} onBlur={()=>{if(!mobile)hoverIntent.leave();}} onClick={e=>{if(busy||dragged.current)return;if(docked&&expanded){store.dispatch({type:'select',skillId:skill.icon});return;}if(stacked){restoreCardFocus.current=e.detail===0;setFlipped([]);dispatchDeck('click');return;}if(swiped.current){swiped.current=false;return;}const target=!mobile&&e.detail!==0&&hover!==null?hover:i;if(!mobile)hoverIntent.focus(target);flip(cards[target].name);}}
        tabIndex={stacked?(rank===0?0:-1):!expanded||mobile&&!docked&&delta!==0?-1:0} aria-hidden={stacked?rank!==0:mobile&&!docked&&Math.abs(delta)>1?true:undefined} aria-disabled={busy||undefined} aria-describedby={stacked?'toolkit-hint':undefined} aria-label={stacked?`${skill.name}. ${i===cards.length-1?'Expand all technologies':'Next technology'} (${i+1} of ${cards.length})`:docked?`${skill.name}, ${inventory[skill.icon]} available. Select card`:`${skill.name}: ${skill.status}. ${isFlipped?'Show front':'Flip for details'}`} aria-pressed={expanded?(docked?state.selectedSkill===skill.icon:isFlipped):undefined}>
          {expanded&&<span className="skill-inventory-badge">×{inventory[skill.icon]}</span>}<span className="card-flipper"><span className="card-face card-front" aria-hidden={isFlipped}><span className="tech-art"><img src={`/logos/${skill.icon}.${skill.icon==='apachekafka'?'png':'svg'}`} alt="" onError={e=>{e.currentTarget.style.display='none';}}/><span className="tech-symbol">{skill.symbol}</span></span><strong>{skill.name}</strong><span className="card-bottom"><span>{skill.status}</span><ArrowUpRight size={17}/></span></span>
          <span className="card-face card-back" aria-hidden={!isFlipped}><strong>{skill.name}</strong><span className="back-description">{skill.description}</span><span className="card-context">{skill.context}</span><span className="card-bottom"><span>{skill.status}</span><RotateCcw size={16}/></span></span></span>
        </motion.button></DockTrack>;})}
    </div><div className="deck-actions">{stacked&&<div className="stack-controls"><p role="status" aria-live="polite">{deckState.front+1} / {cards.length} <span>{cards[deckState.front].name}</span></p><button disabled={busy} onClick={()=>flip(cards[deckState.front].name)} aria-pressed={flipped.includes(cards[deckState.front].name)}>{flipped.includes(cards[deckState.front].name)?'Show front':'View details'} <RotateCcw size={14}/></button></div>}
    {expanded&&<div className="deck-controls"><button onClick={()=>move(-1)} aria-label="Previous skill"><ArrowLeft size={18}/></button><span>{String(selected+1).padStart(2,'0')} / {String(cards.length).padStart(2,'0')}</span><button onClick={()=>move(1)} aria-label="Next skill"><ArrowRight size={18}/></button></div>}</div>
    <motion.section id="projects" className="journey-book" style={{opacity:useTransform(dock,v=>expanded?Math.max(0,Math.min(1,(v-.15)/.7)):0),x:useTransform(dock,v=>reduced?0:120*(1-v)),scale:useTransform(dock,v=>reduced?1:.88+.12*v)}} aria-hidden={!docked||!expanded} inert={!docked||!expanded}><ProjectForge active={docked&&expanded}/></motion.section>{ghost&&<div className="folio-drag-ghost" style={{transform:`translate3d(${ghost.x-40}px,${ghost.y-50}px,0)`}} aria-hidden="true"><img src={`/logos/${ghost.id}.${ghost.id==='apachekafka'?'png':'svg'}`} alt=""/><span>{skills.find(s=>s.icon===ghost.id)?.name}</span></div>}{flight&&<motion.div className="folio-drag-ghost" style={{position:'fixed'}} initial={{x:flight.from.x,y:flight.from.y,opacity:1}} animate={{x:flight.to.x,y:flight.to.y,opacity:0}} transition={{duration:reduced?0:.4}} onAnimationComplete={()=>setFlight(null)} aria-hidden="true"><img src={`/logos/${flight.id}.${flight.id==='apachekafka'?'png':'svg'}`} alt=""/></motion.div>}</div></div>;
}
