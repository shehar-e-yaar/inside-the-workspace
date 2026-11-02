import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, FormEvent, KeyboardEvent } from 'react';
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { ArrowUpRight, ArrowDown, ArrowLeft, ArrowRight, Terminal as TerminalIcon, Github, Mail, X, Menu, Command, RotateCcw, Sparkles } from 'lucide-react';
import { certificates, profile, projects, skillCollections } from './data';
import { commands, runCommand } from './terminal';

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
      <div className="boot-line"><span className="status-dot"/> WORKSPACE ONLINE <span className="boot-version">v.2026</span></div>
      <p className="terminal-greeting">Hello, world<span className="cyan">.</span></p>
      <p className="terminal-name">I'm Muhammad<br className="mobile-break"/> Sheheryar<span className="cyan">_</span></p>
      <p className="terminal-intro">Data Engineer in the making.<br/><span>Computer Science · UVAS Lahore</span></p>
      <div className="terminal-rule"/>
      <p className="terminal-tip">Welcome to my workspace.<br/>A little curiosity goes a long way. Type <button onClick={()=>execute('help')}>help</button> to start.</p>
      <div className="terminal-log" role="log" aria-live="polite" aria-relevant="additions">{lines.map((l,i)=><div className="log-entry" key={i}><p><span className="cyan">❯</span> {l.command}</p><pre>{l.output}</pre></div>)}</div>
      <form onSubmit={submit} className="terminal-form"><label htmlFor="command-input"><span className="cyan">sheheryar</span><span className="muted">@portfolio</span><span>:~$</span></label><input id="command-input" ref={field} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={keydown} autoComplete="off" autoCapitalize="off" spellCheck={false} aria-label="Terminal command"/><span className="cursor" aria-hidden="true"/></form>
    </div>
    <div className="terminal-bottom"><span><span className="status-dot"/> Available for meaningful work</span><span>UTF-8 <span className="cyan">↵</span></span></div>
    <div className="command-shortcuts" aria-label="Terminal command shortcuts">{['help','whoami','skills','projects','clear'].map(c=><button key={c} onClick={()=>{execute(c);field.current?.focus({preventScroll:true});}}>{c}</button>)}</div>
  </div>;
}
function Intro() {
  const scene = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const {scrollYProgress} = useScroll({target:scene,offset:['start start','end end']});
  const scale = useTransform(scrollYProgress,[0,0.12,0.85,1],[1,0.97,0.58,0.56]);
  const rotateX=useTransform(scrollYProgress,[0,1],[0,9]);
  const rotateY=useTransform(scrollYProgress,[0,0.75,1],[0,-12,-8]);
  const y=useTransform(scrollYProgress,[0,1],[0,-25]);
  // Keep reveal opacity on the main scroll subscription. Native opacity timelines
  // can lag behind the transform timeline on some browser compositor paths.
  function updateReveal(progress:number) {
    const clamp=(n:number)=>Math.max(0,Math.min(1,n));
    scene.current?.style.setProperty('--reveal-opacity',String(clamp((progress-.05)/.4)));
    scene.current?.style.setProperty('--scene-label-opacity',String(1-clamp(progress/.25)));
    scene.current?.style.setProperty('--end-opacity',String(clamp((progress-.55)/.35)));
  }
  useMotionValueEvent(scrollYProgress,'change',updateReveal);
  useEffect(()=>{updateReveal(scrollYProgress.get());},[scrollYProgress]);
  return <section id="home" ref={scene} className={`intro-scene ${reduced?'reduced':''}`} aria-label="Interactive computer introduction">
    <div className="intro-sticky">
      <div className="ambient ambient-cyan"/><div className="ambient ambient-purple"/>
      <div className="scene-label"><span>01 / ENTER THE WORKSPACE</span><span>LAHORE, PK <span className="live-dot"/></span></div>
      <div className="perspective-stage"><motion.div className="computer" style={reduced?{}:{scale,rotateX,rotateY,y}}>
        <div className="monitor"><div className="webcam"/><Terminal/><div className="monitor-chin"><span>MS / WORKSPACE</span><span className="power-light"/></div></div>
        <div className="monitor-stand"/><div className="monitor-foot"/>
        <div className="keyboard" aria-hidden="true">{Array.from({length:56},(_,i)=><i key={i}/>)}</div>
      </motion.div></div>
      <div className="beyond-screen"><span className="eyebrow">THERE'S A BUILDER BEHIND EVERY SYSTEM.</span><p>Let's go beyond<br/><span>the screen.</span></p></div>
      <div className="scroll-cue"><span className="scroll-line"/><span>Type help <b>·</b> Scroll to discover</span><ArrowDown size={15}/></div>
      <a className="skip-intro" href="#about">Skip intro <ArrowDown size={13}/></a>
    </div>
  </section>;
}
function SkillDeck() {
  const [page,setPage]=useState(0);
  const [hover,setHover]=useState<number|null>(null);
  const [flipped,setFlipped]=useState<string[]>([]);
  const [selected,setSelected]=useState(0);
  const [mobile,setMobile]=useState(()=>window.matchMedia('(max-width: 700px)').matches);
  const reduced=useReducedMotion();
  const touch=useRef<number|null>(null);
  const swiped=useRef(false);
  useEffect(()=>{const m=window.matchMedia('(max-width: 700px)');const update=()=>setMobile(m.matches);m.addEventListener('change',update);return()=>m.removeEventListener('change',update);},[]);
  const cards=skillCollections[page].cards;
  const fanStep=5/Math.max(1,cards.length-1);
  function move(delta:number){setSelected(n=>(n+delta+cards.length)%cards.length);}
  function flip(name:string){setFlipped(f=>f.includes(name)?f.filter(n=>n!==name):[...f,name]);}
  return <><div className="skills-toolbar"><div className="segmented" aria-label="Skill collection">{skillCollections.map(({label},i)=><button aria-pressed={page===i} key={label} onClick={()=>{setPage(i);setSelected(0);setHover(null);}}>{label}</button>)}</div><span className="deck-hint"><RotateCcw size={14}/> {mobile?'Swipe to explore · Tap to flip':'Hover to discover · Click to flip'}</span></div>
    <div className="deck" onTouchStart={e=>{swiped.current=false;touch.current=e.touches[0].clientX;}} onTouchEnd={e=>{if(touch.current!==null){const diff=e.changedTouches[0].clientX-touch.current;if(Math.abs(diff)>40){swiped.current=true;move(diff<0?1:-1);}}touch.current=null;}}>
      <div className="deck-orbit" aria-hidden="true"/>
      {cards.map((skill,i)=>{const offset=(i-(cards.length-1)/2)*fanStep;const active=hover===i;const isFlipped=flipped.includes(skill.name);const delta=i-selected;return <motion.button key={skill.name} className={`skill-card ${isFlipped?'is-flipped':''}`} style={{'--accent':skill.color,zIndex:active?30:mobile?10-Math.abs(delta):i+1} as CSSProperties}
        animate={mobile?{x:delta*280,y:0,rotate:0,scale:delta===0?1:0.92,opacity:Math.abs(delta)>1?0:1}:{x:offset*142+(hover!==null&&!active?(i<hover?-28:28):0),y:active?-70:Math.abs(offset)*17,rotate:active?0:offset*8,scale:active?1.08:1,opacity:1}}
        transition={reduced?{duration:0}:{type:'spring',stiffness:190,damping:22}}
        onMouseEnter={()=>!mobile&&setHover(i)} onMouseLeave={()=>setHover(null)} onFocus={()=>!mobile&&setHover(i)} onBlur={()=>setHover(null)} onClick={()=>{if(swiped.current){swiped.current=false;return;}flip(skill.name);}}
        tabIndex={mobile&&delta!==0?-1:0} aria-hidden={mobile&&Math.abs(delta)>1?true:undefined} aria-label={`${skill.name}: ${skill.status}. ${isFlipped?'Show front':'Flip for details'}`} aria-pressed={isFlipped}>
          <span className="card-flipper"><span className="card-face card-front" aria-hidden={isFlipped}><span className="card-top"><span>{String(i+1).padStart(2,'0')}</span><Sparkles size={15}/></span><span className="tech-art"><img src={`/logos/${skill.icon}.svg`} alt="" onError={e=>{e.currentTarget.style.display='none';}}/><span className="tech-symbol">{skill.symbol}</span></span><span className="card-category">{skill.category}</span><strong>{skill.name}</strong><span className="card-bottom"><span>{skill.status}</span><ArrowUpRight size={17}/></span></span>
          <span className="card-face card-back" aria-hidden={!isFlipped}><span className="card-category">{skill.category}</span><strong>{skill.name}</strong><span className="back-description">{skill.description}</span><span className="card-context">{skill.context}</span><span className="card-bottom"><span>{skill.status}</span><RotateCcw size={16}/></span></span></span>
        </motion.button>;})}
    </div><div className="deck-controls"><button onClick={()=>move(-1)} aria-label="Previous skill"><ArrowLeft size={18}/></button><span>{String(selected+1).padStart(2,'0')} / {String(cards.length).padStart(2,'0')}</span><button onClick={()=>move(1)} aria-label="Next skill"><ArrowRight size={18}/></button></div>
    <p className="skills-footnote">Built through projects. Still learning, always.<span>Hands-on ≠ mastery. Exploring means active experimentation.</span></p></>;
}
function CertificateGallery(){
  const [index,setIndex]=useState<number|null>(null);
  const dialog=useRef<HTMLDialogElement>(null);
  const returnFocus=useRef<HTMLElement|null>(null);
  const close=()=>setIndex(null);
  useEffect(()=>{if(index!==null){if(!dialog.current?.open){returnFocus.current=document.activeElement as HTMLElement;dialog.current?.showModal();}const old=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=old;};}else{dialog.current?.close();returnFocus.current?.focus({preventScroll:true});}},[index]);
  function keydown(e:KeyboardEvent<HTMLDialogElement>){if(e.key==='ArrowRight'){e.preventDefault();setIndex(n=>n===null?null:(n+1)%certificates.length);}if(e.key==='ArrowLeft'){e.preventDefault();setIndex(n=>n===null?null:(n-1+certificates.length)%certificates.length);}}
  return <><div className="cert-grid">{certificates.map((c,i)=><button className="certificate" key={c.title} onClick={()=>setIndex(i)}><span className="certificate-preview"><img src={c.image} alt={`${c.issuer}: ${c.title} certificate awarded to Muhammad Sheheryar`} loading="lazy" width="600" height="360"/><span className="expand-icon"><ArrowUpRight size={18}/></span></span><span className="cert-meta"><span>{c.issuer}</span><ArrowUpRight size={16}/></span><strong>{c.title}</strong><span className="cert-date">{c.date}</span></button>)}</div>
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
    <div className="content-wrap"><section id="about" className="about section"><div className="section-marker"><span>01 / THE HUMAN</span><span className="tiny-symbol">✳</span></div><div className="about-grid"><h1>Curiosity got<br/>me started.<br/><span>Building systems<br/>kept me going.</span></h1><div className="about-copy"><span className="eyebrow"><span className="status-dot"/> A WORK IN PROGRESS. BY DESIGN.</span><p>I'm Muhammad Sheheryar, a Computer Science student at UVAS, Lahore, finding my way into <em>data engineering.</em></p><p>I learn by building: turning raw data into pipelines, exploring cloud platforms, and seeing what happens when AI meets a real problem.</p><p>The projects here are pieces of that process. Each one starts with a question — and teaches me a better one.</p><div className="location-row"><span>LAHORE, PAKISTAN</span><span>31.5204° N · 74.3587° E</span></div></div></div></section>
    <section id="skills" className="skills-section section"><div className="section-marker"><span>02 / THE TOOLKIT</span><span>COLLECTED THROUGH CURIOSITY</span></div><div className="section-heading"><h2>A few of my<br/><span>tech superpowers.</span></h2><p>Different tools. One instinct:<br/>make the pieces work together.</p></div><SkillDeck/></section>
    <section id="projects" className="projects section"><div className="section-marker"><span>03 / SELECTED EXPLORATIONS</span><span>BUILD. BREAK. UNDERSTAND.</span></div><div className="section-heading"><h2>Learning,<br/><span>made tangible.</span></h2><a className="text-link" href={profile.github} target="_blank" rel="noreferrer">All repositories <ArrowUpRight size={18}/></a></div><div className="project-list">{projects.map((p,i)=><a href={p.url} target="_blank" rel="noreferrer" key={p.name} className="project-row"><span className="project-index">{String(i+1).padStart(2,'0')}</span><span className="project-title"><span className="eyebrow">{p.category}</span><h3>{p.name}</h3></span><span className="project-info"><span>{p.tags}</span><small>{p.note}</small></span><span className="project-arrow"><ArrowUpRight size={23}/></span></a>)}</div></section>
    <section id="certifications" className="certifications section"><div className="section-marker"><span>04 / MILESTONES</span><span>PROOF OF THE PROCESS</span></div><div className="section-heading"><h2>Small milestones.<br/><span>Real momentum.</span></h2><p>A few steps on a longer journey.<br/>Select a credential to take a closer look.</p></div><CertificateGallery/><p className="credential-note">FortyGuard recognition is for hackathon completion and demonstrated excellence.</p></section>
    <section id="contact" className="contact section"><div className="section-marker"><span>05 / WHAT'S NEXT?</span><Command size={16}/></div><span className="eyebrow"><span className="status-dot"/> OPEN TO CONVERSATIONS & COLLABORATION</span><h2>Let's build<br/>something <span>meaningful.</span><span className="contact-cursor">_</span></h2><a className="email-link" href={`mailto:${profile.email}`}>{profile.email}<ArrowUpRight size={24}/></a><div className="contact-links"><a href={profile.github} target="_blank" rel="noreferrer"><Github size={17}/> GitHub <ArrowUpRight size={15}/></a><a href={profile.linkedin} target="_blank" rel="noreferrer">in <span>LinkedIn</span> <ArrowUpRight size={15}/></a><a href={`mailto:${profile.email}`}><Mail size={17}/> Email <ArrowUpRight size={15}/></a></div></section>
    <footer><a className="brand" href="#home"><TerminalIcon size={18}/> sheheryar<span className="cyan">.</span></a><span>Built with curiosity. © {new Date().getFullYear()}</span><a href="#home">Back to the workspace <ArrowUpRight size={15}/></a></footer></div></main></>;
}
