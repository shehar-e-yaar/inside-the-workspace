import { useEffect, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import { ArrowUpRight, ArrowDown, ArrowLeft, ArrowRight, Terminal as TerminalIcon, Github, Mail, X, Menu, House, UserRound, Layers3, FolderGit2, Award, Send } from 'lucide-react';
import { certificates, profile } from './data';
import { commands, runCommand } from './terminal';
import { ForgeProvider, useForge } from './ForgeProvider';
import {mysteryLabel} from './mystery';
import { inventoryOf } from './forgeState';
import { projectById, skillById } from './forgeData';
import ForgeWorkspace from './ForgeWorkspace';
import HeroFlowVisual from './HeroFlowVisual';

const sections = ['Home','About','Skills','Projects','Certifications','Contact'];
const navigationIcons=[House,UserRound,Layers3,FolderGit2,Award,Send];
function Terminal() {
  const {state,store}=useForge();
  const requestHandled=useRef(0);
  const returnSlot=state.returnTarget?projectById[state.returnTarget.projectId]?.requiredSlots.find(s=>s.id===state.returnTarget?.slotId):null;
  useEffect(()=>{if(!returnSlot||state.terminalRequest===requestHandled.current)return;requestHandled.current=state.terminalRequest;setInput(`forge ${returnSlot.skillId==='amazonwebservices'?'aws':returnSlot.skillId==='apachekafka'?'kafka':returnSlot.skillId==='apachespark'?'spark':returnSlot.skillId==='apacheairflow'?'airflow':returnSlot.skillId==='cplusplus'?'cpp':returnSlot.skillId} 1`);document.getElementById('home')?.scrollIntoView({behavior:'instant'});field.current?.focus({preventScroll:true});},[state.terminalRequest,returnSlot]);
  const [input,setInput] = useState('');
  const [lines,setLines] = useState<{command:string;output:string}[]>([]);
  const [history,setHistory] = useState<string[]>([]);
  const historyIndex = useRef(0);
  const screen = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);
  function execute(value:string) {
    if(!value.trim()) return;
    setHistory(h=>{const next=[...h,value];historyIndex.current=next.length;return next;});
    const output=runCommand(value,new Date(),store);
    setLines(l=>value.trim().toLowerCase()==='clear'?[]:[...l.slice(-39),{command:value,output}]);
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
    {returnSlot&&<div className="forge-terminal-context"><span>{state.lastForged===returnSlot.skillId&&inventoryOf(state)[returnSlot.skillId]>0?'Token ready.':`Need ${skillById[returnSlot.skillId].name}? Run the suggested command.`}</span><button onClick={()=>store.dispatch({type:'return'})}>Return to {mysteryLabel(state,state.returnTarget!.projectId)} <ArrowDown size={14}/></button></div>}
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
function Portfolio(){
  const [menu,setMenu]=useState(false);
  const [active,setActive]=useState('home');
  useEffect(()=>{const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting)setActive(e.target.id);},{rootMargin:'-15% 0px -55% 0px'});document.querySelectorAll('main section[id]').forEach(s=>observer.observe(s));return()=>observer.disconnect();},[]);
  useEffect(()=>{if(!menu)return;const close=(e:globalThis.KeyboardEvent)=>{if(e.key==='Escape')setMenu(false);};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close);},[menu]);
  return <><a className="skip-content" href="#about">Skip to content</a><header className={menu?'site-header navigation-expanded':'site-header'}><a href="#home" className="brand" aria-label="Muhammad Sheheryar home"><span className="brand-icon"><TerminalIcon size={19}/></span><span>sheheryar<span className="cyan">.</span></span></a><nav id="main-navigation" className={menu?'nav open':'nav'} aria-label="Main navigation">{sections.map((s,i)=>{const Icon=navigationIcons[i];return <a key={s} href={`#${s.toLowerCase()}`} aria-current={active===s.toLowerCase()?'location':undefined} onClick={()=>setMenu(false)}><Icon className="nav-icon" size={16}/><span>{s}</span></a>;})}</nav><a className="header-github" href={profile.github} target="_blank" rel="noreferrer" aria-label="GitHub profile"><Github size={18}/><ArrowUpRight size={13}/></a><button className="menu-toggle icon-button" aria-label={menu?'Close navigation':'Open navigation'} aria-expanded={menu} aria-controls="main-navigation" onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</button></header>
    <main className={menu?'navigation-open':undefined}><Intro/>
    <div className="content-wrap"><section id="about" className="about section"><SectionGlow/><div className="about-grid"><h1>Curiosity got<br/>me started.<br/><span>Building systems<br/>kept me going.</span></h1><div className="about-copy"><HeroFlowVisual/></div></div></section>
    <section id="skills" className="skills-section section"><SectionGlow/><div className="section-heading"><h2>A few of my<br/><span>tech superpowers.</span></h2></div><ForgeWorkspace/></section>
    <section id="certifications" className="certifications section"><SectionGlow/><div className="section-heading"><h2>Small milestones.<br/><span>Real momentum.</span></h2><p>A few steps on a longer journey.<br/>Select a credential to take a closer look.</p></div><CertificateGallery/><p className="credential-note">FortyGuard recognition is for hackathon completion and demonstrated excellence.</p></section>
    <section id="contact" className="contact section"><SectionGlow/><h2>Let's build<br/>something <span>meaningful.</span><span className="contact-cursor">_</span></h2><a className="email-link" href={`mailto:${profile.email}`}>{profile.email}<ArrowUpRight size={24}/></a><div className="contact-links"><a href={profile.github} target="_blank" rel="noreferrer"><Github size={17}/> GitHub <ArrowUpRight size={15}/></a><a href={profile.linkedin} target="_blank" rel="noreferrer">in <span>LinkedIn</span> <ArrowUpRight size={15}/></a><a href={`mailto:${profile.email}`}><Mail size={17}/> Email <ArrowUpRight size={15}/></a></div></section>
    <footer><a className="brand" href="#home"><TerminalIcon size={18}/> sheheryar<span className="cyan">.</span></a><span>Built with curiosity. © {new Date().getFullYear()}</span><a href="#home">Back to the workspace <ArrowUpRight size={15}/></a></footer></div></main></>;
}

export default function App(){return <ForgeProvider><Portfolio/></ForgeProvider>;}
