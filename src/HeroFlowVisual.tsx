import { createElement, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent } from 'react';
import { animate } from 'motion/react';
import type { AnimationPlaybackControls, DOMKeyframesDefinition, AnimationOptions } from 'motion/react';
import design from './heroFlowDesign.json';
import animatedSvg from './heroFlowSvg.json';
import { heroCanPlay, heroParallax, heroSceneAt } from './heroFlowTimeline';
import styles from './HeroFlowVisual.module.css';

type Layer = { tag: string; id?: string; name?: string; src?: string; style: CSSProperties; children: (Layer | string)[] };
const scenes = design.scenes as unknown as Record<string, Layer>;
const nodeNames = ['Kafka', 'PySpark', 'Airflow', 'PostgreSQL', 'Snowflake'];

// All geometry, assets and motion values originate in the Figma context archived
// under docs/hero-animation. The renderer does not infer technology or layout.
function renderLayer(layer: Layer | string, key: string): React.ReactNode {
  if (typeof layer === 'string') return layer;
  const svg = layer.src && (animatedSvg as Record<string, string>)[layer.src];
  if (svg) return <span key={key} className={styles.animatedSvg} style={layer.style} aria-hidden="true" data-asset={layer.src} dangerouslySetInnerHTML={{ __html: svg }}/>;
  const identity = layer.name?.startsWith('Node / ') ? layer.name.slice(7) : undefined;
  const props = {
    key, style: identity ? { ...layer.style, overflow: 'visible' } : layer.style, 'data-figma-id': layer.id,
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
  const staticScene = compact || reduced;
  const sync = () => { animations.current.forEach(control => heroCanPlay(flags.current) ? control.play() : control.pause()); schedule.current(); };

  useLayoutEffect(() => {
    const host = root.current!;
    const mobile = matchMedia('(max-width: 700px)');
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const resize = () => {
      setCompact(mobile.matches); setReduced(motion.matches);
      host.style.setProperty('--hf-scale', String(host.clientWidth / (mobile.matches ? 390 : 640)));
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
      if (id === '71:5745') continue; // Keep the requested illustrative counter readable while its number changes.
      const element = host.querySelector<HTMLElement>(`[data-figma-id="${id}"]`);
      if (!element) continue;
      // JSON cannot represent Infinity. Restore the exported infinite repeat here.
      const timelineFurniture = Number(id.split(':')[1]) >= 5397 && Number(id.split(':')[1]) <= 5434;
      // Clear ruler/track furniture before clips detach upward, then restore it
      // after the clips settle. This prevents clips crossing visible ruler lines.
      const options = Object.fromEntries(Object.entries(track.options).map(([property, value]) => [property, { ...value, repeat: Infinity }]));
      const values = timelineFurniture ? { opacity: [1, 1, 0, 0, 1, 1] } : track.values;
      if (timelineFurniture) Object.assign(options, { opacity: { duration: 12, times: [0, .25, .275, .94, .99, 1], ease: 'easeInOut', repeat: Infinity } });
      const control = animate(element, values as DOMKeyframesDefinition, options as AnimationOptions);
      control.pause(); control.time = 0; controls.push(control);
    }
    // One shared lifecycle; pause never restarts or seeks an individual layer.
    animations.current = controls;
    const visibility = () => { flags.current.hidden = document.hidden; sync(); };
    const observer = new IntersectionObserver(([entry]) => { flags.current.visible = entry.isIntersecting; sync(); }, { threshold: .05 });
    observer.observe(host); document.addEventListener('visibilitychange', visibility);
    let frame = 0, lastCounter = '', lastBucket = -1;
    const update = () => {
      frame = 0;
      const seconds = (controls[0]?.time ?? 0) % 12;
      host.dataset.playing = String(heroCanPlay(flags.current));
      host.dataset.phase = seconds.toFixed(2);
      const scene = heroSceneAt(seconds);
      if (host.dataset.scene !== scene) {
        host.dataset.scene = scene;
        host.querySelectorAll<HTMLButtonElement>('[data-identity]').forEach(button => { button.disabled = scene !== 'pipeline'; });
      }
      const bucket = Math.floor(seconds * 10);
      if (scene === 'pipeline' && bucket !== lastBucket) {
        lastBucket = bucket;
        const count = `events/sec ${Math.round(12000 + (seconds - 6) / 3 * 480).toLocaleString('en-US')}`;
        if (count !== lastCounter) {
          const counter = host.querySelector('[data-figma-id="71:5745"]');
          if (counter) counter.textContent = count;
          lastCounter = count;
        }
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

  const visual = useMemo(() => compact ? renderLayer(scenes.mobile, 'mobile') : <>
    <div ref={background} className={styles.background} aria-hidden="true"></div>
    {!reduced && renderLayer(scenes.timeline, 'timeline')}
    {renderLayer(scenes.pipeline, 'pipeline')}
    <span className={styles.caption}>edit → engineer</span>
    <div className={styles.edge} aria-hidden="true"/>
  </>, [compact, reduced]);

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
    <span className={styles.srOnly}>Illustrative pipeline: {nodeNames.join(' → ')}. The event counter is a design demonstration, not live telemetry.</span>
  </div>;
}
