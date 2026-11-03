import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import type { CSSProperties, FormEvent, KeyboardEvent, PointerEvent } from 'react';
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import { ArrowUpRight, ArrowDown, ArrowLeft, ArrowRight, Terminal as TerminalIcon, Github, Mail, X, Menu, RotateCcw } from 'lucide-react';
import { certificates, profile, projects, skills } from './data';
import { commands, runCommand } from './terminal';
import { createHoverIntent } from './hoverIntent';
import { advanceDeck, initialDeck } from './deckState';

const sections = ['Home','About','Skills','Projects','Certifications','Contact'];
function Terminal() {
  const [input,setInput] = useState('');
  const [lines,setLines] = useState<{command:string;output:string}[]>([]);
  const [history,setHistory] = useState<string[]>([]);
  const historyIndex = useRef(0);
  const screen = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);
  function execute(value:string) {
    if(!value.trim()) return;
    setHistory(h=>{const next=[...h,value];historyIndex.current=next.length;return next;});
    setLines(l=>value.trim().toLowerCase()==='clear'?[]:[...l.slice(-39),{command:value,output:runCommand(value)}]);
    setInput('');
  }
  useEffect(()=>{if(screen.current) screen.current.scrollTop=screen.current.scrollHeight;},[lines]);
  function keydown(e:KeyboardEvent<HTMLInputElement>) {
    if(e.key==='ArrowUp'||e.key==='ArrowDown') {
      e.preventDefault();historyIndex.current=Math.max(0,Math.min(history.length,historyIndex.current+(e.key==='ArrowUp'?-1:1)));setInput(history[historyIndex.current]??'');
    }
    if(e.key==='Tab') {e.preventDefault();const matches=commands.filter(c=>c.startsWith(input.toLowerCase()));if(matches.length===1)setInput(matches[0]);}
    if(e.ctrlKey && e.key.toLowerCase()==='l'){e.preventDefault();setLines([]);}
  }
  function submit(e:FormEvent){e.preventDefault();execute(input);}
  return <div className="terminal">
    <div className="terminal-bar"><div className="window-dots" aria-hidden="true"><i/><i/><i/></div><span>sheheryar — workspace</span><TerminalIcon size={14}/></div>
    <div ref={screen} className="terminal-content" tabIndex={0} aria-label="Terminal output, scroll to review commands">
      <p className="terminal-greeting">Hello, world<span className="cyan">.</span></p>
      <p className="terminal-name">I'm Muhammad<br className="mobile-break"/> Sheheryar<span className="cyan">_</span></p>
      <p className="terminal-intro">Data Engineer in the making.<br/><span>Computer Science · UVAS Lahore</span></p>
      <div className="terminal-rule"/>
      <p className="terminal-tip">Welcome to my workspace.<br/>A little curiosity goes a long way. Type <button onClick={()=>execute('help')}>help</button> to start.</p>
      <div className="terminal-log" role="log" aria-live="polite" aria-relevant="additions">{lines.map((l,i)=><div className="log-entry" key={i}><p><span className="cyan">❯</span> {l.command}</p><pre>{l.output}</pre></div>)}</div>
      <form onSubmit={submit} className="terminal-form"><label htmlFor="command-input"><span className="cyan">sheheryar</span><span className="muted">@portfolio</span><span>:~$</span></label><input id="command-input" ref={field} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={keydown} autoComplete="off" autoCapitalize="off" spellCheck={false} aria-label="Terminal command"/><span className="cursor" aria-hidden="true"/></form>
    </div>
    <div className="command-shortcuts" aria-label="Terminal command shortcuts">{['help','whoami','skills','projects','clear'].map(c=><button key={c} onClick={()=>{execute(c);field.current?.focus({preventScroll:true});}}>{c}</button>)}</div>
  </div>;
}
function Intro() {
  const scene = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const {scrollYProgress} = useScroll({target:scene,offset:['start start','end end']});
  const revealProgress=useSpring(scrollYProgress,{stiffness:220,damping:34,mass:.35});
  const scale = useTransform(revealProgress,[0,0.12,0.85,1],[1,0.97,0.58,0.56]);
  const rotateX=useTransform(revealProgress,[0,1],[0,9]);
  const rotateY=useTransform(revealProgress,[0,0.75,1],[0,-12,-8]);
  const y=useTransform(revealProgress,[0,1],[0,-25]);
  // Keep reveal opacity on the main scroll subscription. Native opacity timelines
  // can lag behind the transform timeline on some browser compositor paths.
  function updateReveal(progress:number) {
    if(reduced)return;
    const clamp=(n:number)=>Math.max(0,Math.min(1,n));
    scene.current?.style.setProperty('--reveal-opacity',String(clamp((progress-.05)/.4)));
    scene.current?.style.setProperty('--intro-hint-opacity',String(1-clamp(progress/.25)));
  }
  useMotionValueEvent(revealProgress,'change',updateReveal);
  useEffect(()=>{updateReveal(scrollYProgress.get());},[scrollYProgress]);
  return <><section id="home" ref={scene} className={`intro-scene ${reduced?'reduced':''}`} aria-label="Interactive computer introduction">
    <div className="intro-sticky">
      <div className="ambient ambient-cyan"/><div className="ambient ambient-purple"/>
      <div className="perspective-stage"><motion.div className="computer" style={reduced?{}:{scale,rotateX,rotateY,y}}>
        <div className="monitor"><div className="webcam"/><Terminal/><div className="monitor-chin" aria-hidden="true"><span className="power-light"/></div></div>
        <div className="monitor-stand"/><div className="monitor-foot"/>
        <div className="keyboard" aria-hidden="true">{Array.from({length:56},(_,i)=><i key={i}/>)}</div>
      </motion.div></div>
      <a className="scroll-cue" href="#about" aria-label="Scroll to About"><ArrowDown size={20}/></a>
    </div>
  </section><div className="intro-transition"><div className="reveal-divider"><SectionGlow/></div><span className="eyebrow">THERE'S A BUILDER BEHIND EVERY SYSTEM.</span><p>Let's go beyond<br/><span>the screen.</span></p></div></>;
}
function SectionGlow(){
  const boundary=useRef<HTMLDivElement>(null);
  const reduced=useReducedMotion();
  const {scrollYProgress}=useScroll({target:boundary,offset:['start end','start center']});
  const progress=useSpring(scrollYProgress,{stiffness:180,damping:30,mass:.3});
  const scaleX=useTransform(progress,[0,1],[.12,1]);
  const opacity=useTransform(progress,[0,1],[.12,.48]);
  return <div ref={boundary} className="section-glow" aria-hidden="true"><motion.span style={reduced?{scaleX:.5,opacity:.24}:{scaleX,opacity}}/></div>;
}
function SkillDeck() {
  const [deckState,dispatchDeck]=useReducer((state:typeof initialDeck,action:Parameters<typeof advanceDeck>[1])=>advanceDeck(state,action,skills.length),initialDeck);
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
    if(!expanded||mobile||e.pointerType==='touch')return;
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
  return <>
    <div ref={deckRef} className={`deck deck-${deckState.mode}`} data-mode={deckState.mode} aria-busy={busy} onPointerMove={trackPointer} onPointerLeave={()=>{if(!mobile)hoverIntent.leave();}} onPointerCancel={()=>hoverIntent.leave()} onTouchStart={e=>{if(!expanded)return;swiped.current=false;touch.current=e.touches[0].clientX;}} onTouchEnd={e=>{if(!expanded)return;if(touch.current!==null){const diff=e.changedTouches[0].clientX-touch.current;if(Math.abs(diff)>40){swiped.current=true;move(diff<0?1:-1);}}touch.current=null;}}>
      <div className="deck-orbit" aria-hidden="true"/>
      {cards.map((skill,i)=>{const offset=(i-(cards.length-1)/2)*fanStep;const active=expanded&&hover===i;const isFlipped=flipped.includes(skill.name);const delta=i-selected;
        const rank=(i-deckState.front+cards.length)%cards.length;
        const depth=Math.min(rank,6);
        const sending=stacked&&deckState.cycle==='sending'&&rank===0;
        const stackPose=sending?{x:160,y:-45,rotate:16,rotateY:-12,scale:1.025,opacity:1}:{x:depth*3,y:-depth*5,rotate:-depth*.7,rotateY:0,scale:1-depth*.006,opacity:1};
        return <motion.button initial={false} data-skill-index={i} key={skill.name} className={`skill-card ${isFlipped?'is-flipped':''}`} style={{'--accent':skill.color,pointerEvents:stacked?(rank===0&&!busy?'auto':'none'):expanded?'auto':'none',zIndex:stacked?(sending?40:20-rank):active?30:mobile?20-Math.abs(delta):i+1} as CSSProperties}
        animate={stacked?stackPose:mobile?{x:delta*280,y:0,rotate:0,rotateY:0,scale:delta===0?1:0.92,opacity:Math.abs(delta)>1?0:1}:{x:offset*142,rotateY:0,y:Math.abs(offset)*17-(active?6:0),rotate:active?0:offset*8,scale:active?1.025:1,opacity:1}}
        transition={reduced?{duration:0}:stacked?{type:'tween',duration:deckState.cycle==='sending'?.22:.24,ease:[.22,1,.36,1]}:!expanded?{type:'tween',duration:.6,delay:i*.018,ease:[.22,1,.36,1]}:mobile?{type:'spring',stiffness:280,damping:30,mass:.5}:{type:'tween',duration:.25,ease:[.22,1,.36,1]}}
        onFocus={e=>{if(expanded&&!mobile&&e.currentTarget.matches(':focus-visible'))hoverIntent.focus(i);}} onBlur={()=>{if(!mobile)hoverIntent.leave();}} onClick={e=>{if(busy)return;if(stacked){restoreCardFocus.current=e.detail===0;setFlipped([]);dispatchDeck('click');return;}if(swiped.current){swiped.current=false;return;}const target=!mobile&&e.detail!==0&&hover!==null?hover:i;if(!mobile)hoverIntent.focus(target);flip(cards[target].name);}}
        tabIndex={stacked?(rank===0?0:-1):!expanded||mobile&&delta!==0?-1:0} aria-hidden={stacked?rank!==0:mobile&&Math.abs(delta)>1?true:undefined} aria-disabled={busy||undefined} aria-label={stacked?`${skill.name}. ${i===cards.length-1?'Expand all technologies':'Next technology'} (${i+1} of ${cards.length})`:`${skill.name}: ${skill.status}. ${isFlipped?'Show front':'Flip for details'}`} aria-pressed={expanded?isFlipped:undefined}>
          <span className="card-flipper"><span className="card-face card-front" aria-hidden={isFlipped}><span className="tech-art"><img src={`/logos/${skill.icon}.${skill.icon==='apachekafka'?'png':'svg'}`} alt="" onError={e=>{e.currentTarget.style.display='none';}}/><span className="tech-symbol">{skill.symbol}</span></span><strong>{skill.name}</strong><span className="card-bottom"><span>{skill.status}</span><ArrowUpRight size={17}/></span></span>
          <span className="card-face card-back" aria-hidden={!isFlipped}><strong>{skill.name}</strong><span className="back-description">{skill.description}</span><span className="card-context">{skill.context}</span><span className="card-bottom"><span>{skill.status}</span><RotateCcw size={16}/></span></span></span>
        </motion.button>;})}
    </div><div className="deck-actions">{stacked&&<div className="stack-controls"><p role="status" aria-live="polite">{deckState.front+1} / {cards.length} <span>{cards[deckState.front].name}</span></p><button disabled={busy} onClick={()=>flip(cards[deckState.front].name)} aria-pressed={flipped.includes(cards[deckState.front].name)}>{flipped.includes(cards[deckState.front].name)?'Show front':'View details'} <RotateCcw size={14}/></button></div>}
    {expanded&&<div className="deck-controls"><button onClick={()=>move(-1)} aria-label="Previous skill"><ArrowLeft size={18}/></button><span>{String(selected+1).padStart(2,'0')} / {String(cards.length).padStart(2,'0')}</span><button onClick={()=>move(1)} aria-label="Next skill"><ArrowRight size={18}/></button></div>}</div>
    </>;
}
function CertificateGallery(){
  const [index,setIndex]=useState<number|null>(null);
  const dialog=useRef<HTMLDialogElement>(null);
  const returnFocus=useRef<HTMLElement|null>(null);
  const close=()=>setIndex(null);
  useEffect(()=>{if(index!==null){if(!dialog.current?.open){returnFocus.current=document.activeElement as HTMLElement;dialog.current?.showModal();}const old=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=old;};}else{dialog.current?.close();returnFocus.current?.focus({preventScroll:true});}},[index]);
  function keydown(e:KeyboardEvent<HTMLDialogElement>){if(e.key==='ArrowRight'){e.preventDefault();setIndex(n=>n===null?null:(n+1)%certificates.length);}if(e.key==='ArrowLeft'){e.preventDefault();setIndex(n=>n===null?null:(n-1+certificates.length)%certificates.length);}}
  return <><div className="cert-grid">{certificates.map((c,i)=><button className="certificate" key={c.title} onClick={()=>setIndex(i)}><span className="certificate-preview"><img src={c.image} alt={`${c.issuer}: ${c.title} certificate awarded to Muhammad Sheheryar`} loading="lazy" width="600" height="360"/><span className="expand-icon"><ArrowUpRight size={18}/></span></span><span className="cert-meta"><span>{c.issuer}</span></span><strong>{c.title}</strong><span className="cert-date">{c.date}</span></button>)}</div>
    <dialog ref={dialog} className="certificate-dialog" onCancel={e=>{e.preventDefault();close();}} onClick={e=>{if(e.target===e.currentTarget)close();}} onKeyDown={keydown} aria-labelledby="certificate-title">
      {index!==null&&<div className="dialog-inner"><div className="dialog-header"><div><span className="eyebrow">{certificates[index].issuer}</span><h3 id="certificate-title">{certificates[index].title}</h3></div><button autoFocus className="icon-button" onClick={close} aria-label="Close certificate"><X/></button></div><img src={certificates[index].image} alt={`${certificates[index].title}, original certificate for Muhammad Sheheryar`}/><div className="dialog-footer"><button onClick={()=>setIndex((index+3)%4)} aria-label="Previous certificate"><ArrowLeft size={18}/></button><span>{index+1} / 4 <span className="muted">· {certificates[index].date}</span></span><button onClick={()=>setIndex((index+1)%4)} aria-label="Next certificate"><ArrowRight size={18}/></button></div></div>}
    </dialog></>;
}
export default function App(){
  const [menu,setMenu]=useState(false);
  const [active,setActive]=useState('home');
  useEffect(()=>{const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting)setActive(e.target.id);},{rootMargin:'-15% 0px -55% 0px'});document.querySelectorAll('main section[id]').forEach(s=>observer.observe(s));return()=>observer.disconnect();},[]);
  useEffect(()=>{if(!menu)return;const close=(e:globalThis.KeyboardEvent)=>{if(e.key==='Escape')setMenu(false);};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close);},[menu]);
  return <><a className="skip-content" href="#about">Skip to content</a><header className="site-header"><a href="#home" className="brand" aria-label="Muhammad Sheheryar home"><span className="brand-icon"><TerminalIcon size={19}/></span><span>sheheryar<span className="cyan">.</span></span></a><nav className={menu?'nav open':'nav'} aria-label="Main navigation">{sections.map(s=><a key={s} href={`#${s.toLowerCase()}`} aria-current={active===s.toLowerCase()?'location':undefined} onClick={()=>setMenu(false)}>{s}</a>)}</nav><a className="header-github" href={profile.github} target="_blank" rel="noreferrer" aria-label="GitHub profile"><Github size={18}/><ArrowUpRight size={13}/></a><button className="menu-toggle icon-button" aria-label={menu?'Close navigation':'Open navigation'} aria-expanded={menu} onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</button></header>
    <main><Intro/>
    <div className="content-wrap"><section id="about" className="about section"><SectionGlow/><div className="about-grid"><h1>Curiosity got<br/>me started.<br/><span>Building systems<br/>kept me going.</span></h1><div className="about-copy"><p>I build data pipelines and explore cloud and AI systems through practical projects.</p></div></div></section>
    <section id="skills" className="skills-section section"><SectionGlow/><div className="section-heading"><h2>A few of my<br/><span>tech superpowers.</span></h2></div><SkillDeck/></section>
    <section id="projects" className="projects section"><SectionGlow/><div className="section-heading"><h2>Learning,<br/><span>made tangible.</span></h2><a className="text-link" href={profile.github} target="_blank" rel="noreferrer">All repositories <ArrowUpRight size={18}/></a></div><div className="project-list">{projects.map((p,i)=><a href={p.url} target="_blank" rel="noreferrer" key={p.name} className="project-row"><span className="project-index">{String(i+1).padStart(2,'0')}</span><span className="project-title"><span className="eyebrow">{p.category}</span><h3>{p.name}</h3></span><span className="project-info"><span>{p.tags}</span><small>{p.note}</small></span><span className="project-arrow"><ArrowUpRight size={23}/></span></a>)}</div></section>
    <section id="certifications" className="certifications section"><SectionGlow/><div className="section-heading"><h2>Small milestones.<br/><span>Real momentum.</span></h2><p>A few steps on a longer journey.<br/>Select a credential to take a closer look.</p></div><CertificateGallery/><p className="credential-note">FortyGuard recognition is for hackathon completion and demonstrated excellence.</p></section>
    <section id="contact" className="contact section"><SectionGlow/><h2>Let's build<br/>something <span>meaningful.</span><span className="contact-cursor">_</span></h2><a className="email-link" href={`mailto:${profile.email}`}>{profile.email}<ArrowUpRight size={24}/></a><div className="contact-links"><a href={profile.github} target="_blank" rel="noreferrer"><Github size={17}/> GitHub <ArrowUpRight size={15}/></a><a href={profile.linkedin} target="_blank" rel="noreferrer">in <span>LinkedIn</span> <ArrowUpRight size={15}/></a><a href={`mailto:${profile.email}`}><Mail size={17}/> Email <ArrowUpRight size={15}/></a></div></section>
    <footer><a className="brand" href="#home"><TerminalIcon size={18}/> sheheryar<span className="cyan">.</span></a><span>Built with curiosity. © {new Date().getFullYear()}</span><a href="#home">Back to the workspace <ArrowUpRight size={15}/></a></footer></div></main></>;
}
