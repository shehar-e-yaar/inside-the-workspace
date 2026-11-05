import { createElement, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent } from 'react';
import { animate } from 'motion/react';
import type { AnimationPlaybackControls, DOMKeyframesDefinition, AnimationOptions } from 'motion/react';
import design from './heroFlowDesign.json';
import animatedSvg from './heroFlowSvg.json';
import { HERO_LOOP_SECONDS, HERO_LINKS, heroSceneOpacity, heroHoldTrack, heroFlowAt, heroCurvePoint, heroClipMorph, heroCanPlay, heroParallax, heroSceneAt } from './heroFlowTimeline';
import styles from './HeroFlowVisual.module.css';

type Layer = { tag: string; id?: string; name?: string; src?: string; style: CSSProperties; children: (Layer | string)[] };
const scenes = design.scenes as unknown as Record<string, Layer>;
const nodeNames = ['Kafka', 'PySpark', 'Airflow', 'PostgreSQL', 'Snowflake'];

// All geometry, assets and motion values originate in the Figma context archived
// under docs/hero-animation. The renderer does not infer technology or layout.
function renderLayer(layer: Layer | string, key: string): React.ReactNode {
  if (typeof layer === 'string') return layer;
  if (['71:5739', '71:5745', '71:6155'].includes(layer.id ?? '')) return null;
  if (layer.id === '71:5719') return <svg key={key} className={styles.connections} viewBox="0 0 640 520" aria-hidden="true">
    {HERO_LINKS.map((c,i)=><g key={i}><path d={`M${c[0]} ${c[1]}C${c.slice(2).join(' ')}`} className={styles.linkBase}/><path data-flow-link={i} pathLength="1" d={`M${c[0]} ${c[1]}C${c.slice(2).join(' ')}`} className={styles.linkActive}/></g>)}
    <circle data-flow-dot r="3" className={styles.flowDot} opacity="0"/>
  </svg>;
  const svg = layer.src && (animatedSvg as Record<string, string>)[layer.src];
  if (svg) return <span key={key} className={styles.animatedSvg} style={layer.style} aria-hidden="true" data-asset={layer.src} dangerouslySetInnerHTML={{ __html: svg }}/>;
  const identity = layer.name?.startsWith('Node / ') ? layer.name.slice(7) : undefined;
  const props = {
    key, style: identity ? { ...layer.style, overflow: 'visible' } : layer.style, 'data-figma-id': layer.id, 'data-layer-name': layer.name,
    ...(layer.id === '71:5745' || layer.id === '71:6155' ? { title: 'Illustrative events per second — not live telemetry' } : {}),
    ...(identity ? { className: styles.node, type: 'button' as const, 'data-identity': identity, 'aria-label': identity, title: identity } : {}),
    ...(layer.src ? { src: layer.src, alt: '', draggable: false } : {}),
  };
  return createElement(identity ? 'button' : layer.tag, props,
    layer.tag === 'img' ? undefined : layer.children.map((child, i) => renderLayer(child, `${key}-${i}`)));
}

export default function HeroFlowVisual() {
  const root = useRef<HTMLDivElement>(null);
  const background = useRef<HTMLDivElement>(null);
  const animations = useRef<AnimationPlaybackControls[]>([]);
  const schedule = useRef<() => void>(() => {});
  const flags = useRef({ manual: false, interacting: false, visible: false, hidden: document.hidden, static: false });
  const [compact, setCompact] = useState(() => matchMedia('(max-width: 700px)').matches);
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const staticScene = reduced;
  const sync = () => { animations.current.forEach(control => heroCanPlay(flags.current) ? control.play() : control.pause()); schedule.current(); };

  useLayoutEffect(() => {
    const host = root.current!;
    const mobile = matchMedia('(max-width: 700px)');
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const resize = () => {
      setCompact(mobile.matches); setReduced(motion.matches);
      host.style.setProperty('--hf-scale', String(host.clientWidth / 640));
    };
    resize();
    const observer = new ResizeObserver(resize); observer.observe(host);
    mobile.addEventListener('change', resize); motion.addEventListener('change', resize);
    return () => { observer.disconnect(); mobile.removeEventListener('change', resize); motion.removeEventListener('change', resize); };
  }, []);

  useEffect(() => {
    const host = root.current!;
    flags.current.static = staticScene;
    flags.current.interacting = false;
    if (staticScene) {
      host.dataset.scene = 'pipeline'; host.dataset.phase = '6.00'; host.dataset.playing = 'false';
      host.querySelectorAll<HTMLButtonElement>('[data-identity]').forEach(button => { button.disabled = false; });
      if (background.current) background.current.style.translate = '0px 0px';
      return;
    }
    const controls: AnimationPlaybackControls[] = [];
    for (const [id, track] of Object.entries(design.tracks)) {
      if (id === '71:5745' || id === '71:5396' || /^Clip /.test(host.querySelector<HTMLElement>(`[data-figma-id="${id}"]`)?.dataset.layerName ?? '')) continue;
      const element = host.querySelector<HTMLElement>(`[data-figma-id="${id}"]`);
      if (!element) continue;
      // JSON cannot represent Infinity. Restore the exported infinite repeat here.
      const timelineFurniture = Number(id.split(':')[1]) >= 5397 && Number(id.split(':')[1]) <= 5434;
      // Clear ruler/track furniture before clips detach upward, then restore it
      // after the clips settle. This prevents clips crossing visible ruler lines.
      const options = Object.fromEntries(Object.entries(track.options).map(([property, value]) => [property, { ...value, repeat: Infinity }]));
      const values: Record<string, number[]> = timelineFurniture ? { opacity: [1, 1, 0, 0, 1, 1] } : { ...track.values };
      if (element.dataset.identity) {
        // Remove the unrelated exported pulses: the shared flow clock below
        // owns the lift, and the original node fade remains intact.
        values.scaleX = values.scaleY = [.86, .86, 1, 1, .86];
        Object.assign(options, { scaleX: { duration:12, times:[0,.25,.5,.75,1], repeat:Infinity }, scaleY: { duration:12, times:[0,.25,.5,.75,1], repeat:Infinity } });
      }
      for(const property of Object.keys(values)){
        const option=options[property as keyof typeof options];
        const held=heroHoldTrack(values[property],option.times);
        values[property]=held.values;
        Object.assign(option,{duration:HERO_LOOP_SECONDS,times:held.times});
      }
      const control = animate(element, values as DOMKeyframesDefinition, options as AnimationOptions);
      control.pause(); control.time = 0; controls.push(control);
    }
    // One shared lifecycle; pause never restarts or seeks an individual layer.
    animations.current = controls;
    const visibility = () => { flags.current.hidden = document.hidden; sync(); };
    const observer = new IntersectionObserver(([entry]) => { flags.current.visible = entry.isIntersecting; sync(); }, { threshold: .05 });
    observer.observe(host); document.addEventListener('visibilitychange', visibility);
    let frame = 0;
    const nodes = nodeNames.map(name=>host.querySelector<HTMLElement>(`[data-identity="${name}"]`));
    const links = [...host.querySelectorAll<SVGPathElement>('[data-flow-link]')];
    const dot = host.querySelector<SVGCircleElement>('[data-flow-dot]');
    const clips = [...host.querySelectorAll<HTMLElement>('[data-layer-name^="Clip "]')].map(element=>({element,left:parseFloat(element.style.left),top:parseFloat(element.style.top),width:parseFloat(element.style.width),background:element.style.background}));
    const furniture = [...host.querySelectorAll<HTMLElement>('[data-figma-id="71:5396"] > [data-figma-id]')].filter(element=>!element.dataset.layerName?.startsWith('Clip '));
    const update = () => {
      frame = 0;
      const seconds = (controls[0]?.time ?? 0) % HERO_LOOP_SECONDS;
      // One explicit scene envelope prevents nested exported opacity tracks
      // from dimming individual nodes before the shared return begins.
      const opacity=heroSceneOpacity(seconds);
      host.style.setProperty('--hf-pipeline-opacity',String(opacity.pipeline));
      host.style.setProperty('--hf-timeline-opacity',String(opacity.timeline));
      furniture.forEach(element=>element.style.setProperty('opacity',String(opacity.furniture),'important'));
      clips.forEach(({element,left,top,width,background:clipBackground},i)=>{
        const morph=heroClipMorph(seconds,i,left,top,width);
        element.style.transformOrigin='top left';
        element.style.transform=`translate(${morph.x}px,${morph.y}px) scale(${morph.sx},${morph.sy})`;
        element.style.opacity=String(morph.opacity);
        element.style.borderRadius=`${5+11*morph.shape}px`;
        element.style.background=`color-mix(in srgb, ${clipBackground} ${100*(1-morph.shape)}%, #11131a)`;
        for(const child of element.children)(child as HTMLElement).style.opacity=String(1-morph.shape);
      });
      host.dataset.playing = String(heroCanPlay(flags.current));
      host.dataset.phase = seconds.toFixed(2);
      const scene = heroSceneAt(seconds);
      const flow = heroFlowAt(seconds);
      nodes.forEach((node,i)=>{if(node)node.style.translate=`0px ${scene==='pipeline'&&i===flow.index?flow.lift:0}px`;});
      links.forEach((link,i)=>{link.style.strokeDashoffset=String(scene==='pipeline'?(i<flow.index?0:i===flow.index?1-flow.travel:1):1);});
      if(dot){
        dot.setAttribute('opacity',scene==='pipeline'&&flow.travelling?'1':'0');
        const point=heroCurvePoint(HERO_LINKS[Math.min(flow.index,3)],flow.travel);
        dot.setAttribute('cx',String(point[0]));dot.setAttribute('cy',String(point[1]));
      }
      if (host.dataset.scene !== scene) {
        host.dataset.scene = scene;
        host.querySelectorAll<HTMLButtonElement>('[data-identity]').forEach(button => { button.disabled = scene !== 'pipeline'; });
      }
      if(heroCanPlay(flags.current))frame = requestAnimationFrame(update);
    };
    schedule.current = () => { if (!frame) frame = requestAnimationFrame(update); };
    schedule.current();
    return () => {
      cancelAnimationFrame(frame); observer.disconnect(); document.removeEventListener('visibilitychange', visibility);
      controls.forEach(control => control.cancel()); animations.current = [];
      schedule.current = () => {};
    };
  }, [staticScene]);

  const visual = useMemo(() => <>
    <div ref={background} className={styles.background} aria-hidden="true"></div>
    {!reduced && renderLayer(scenes.timeline, 'timeline')}
    {renderLayer(scenes.pipeline, 'pipeline')}
    <span className={styles.caption}>Video Editor to Data Engineer</span>
  </>, [reduced]);

  function interact(target: EventTarget | null) {
    const button = target instanceof Element ? target.closest('[data-identity]') : null;
    flags.current.interacting = Boolean(button);
    sync();
  }
  function parallax(event: PointerEvent<HTMLDivElement>) {
    if (staticScene || event.pointerType !== 'mouse' || !background.current) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    background.current.style.translate = `${heroParallax(event.clientX - bounds.left, bounds.width)}px ${heroParallax(event.clientY - bounds.top, bounds.height)}px`;
  }
  return <div ref={root} className={styles.visual} data-static={staticScene} data-compact={compact}
    role="group" aria-label="From video editing to data engineering. Illustrative animation."
    onPointerMove={parallax} onPointerOver={event => interact(event.target)}
    onPointerLeave={() => { if(background.current)background.current.style.translate='0px 0px'; flags.current.interacting = root.current?.querySelector('[data-identity]:focus') !== null; sync(); }}
    onFocusCapture={event => interact(event.target)} onBlurCapture={event => interact(event.relatedTarget)}>
    <div className={styles.canvas}>{visual}</div>
    <span className={styles.srOnly}>Illustrative pipeline: {nodeNames.join(' → ')}.</span>
  </div>;
}
