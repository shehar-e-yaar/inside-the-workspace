import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Maximize2, Minus, Plus, X } from 'lucide-react';
import { useForge } from './ForgeProvider';
import { projectRevealed } from './forgeState';
import { projectById } from './forgeData';
import { pipelines } from './projectPipelines';

/** Static Figma artwork. Loading a diagram replaces the former simulation gate. */
export function ProjectPipeline({ projectId, revision, active }: { projectId: string; revision: number; active: boolean }) {
  const { store } = useForge();
  const diagram = pipelines[projectId];
  const [loaded, setLoaded] = useState(false), [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false), [zoom, setZoom] = useState(false), [attempt, setAttempt] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const src = `/pipelines/${projectId}.png${attempt ? `?retry=${attempt}` : ''}`;
  useEffect(() => {
    if (loaded && active && !projectRevealed(store.getSnapshot(), projectId)) {
      store.dispatch({ type: 'pipeline-viewed', projectId, revision });
    }
  }, [loaded, active, store, projectId, revision]);
  useEffect(() => {
    if (!open) return;
    dialog.current?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [open]);
  const close = () => { dialog.current?.close(); setOpen(false); setZoom(false); };
  return <>
    {failed ? <div className="pipeline-error" role="status">Diagram unavailable.
      <button onClick={() => { setFailed(false); setAttempt(n => n + 1); }}>Retry</button>
    </div> : <button className="project-pipeline" aria-label={`Enlarge ${projectById[projectId].title} pipeline`} onClick={() => setOpen(true)}>
      <img src={src} alt={diagram.alt} width={diagram.width} height={diagram.height} decoding="async"
        onLoad={() => setLoaded(true)} onError={() => { setFailed(true); setLoaded(false); }} draggable={false} />
      <span>View flow <Maximize2 size={13} aria-hidden="true" /></span>
    </button>}
    {open && createPortal(<dialog ref={dialog} className="pipeline-dialog" aria-label={`${projectById[projectId].title} pipeline`}
      onCancel={close} onClose={() => { setOpen(false); setZoom(false); }} onKeyDown={e => e.stopPropagation()}
      onClick={e => { if (e.target === e.currentTarget) close(); }}>
      <header><strong>{projectById[projectId].title}</strong><div>
        <button onClick={() => setZoom(v => !v)} aria-label={zoom ? 'Fit diagram' : 'Zoom diagram'} aria-pressed={zoom}>{zoom ? <Minus size={20} /> : <Plus size={20} />}</button>
        <button autoFocus onClick={close} aria-label="Close diagram"><X size={20} /></button>
      </div></header>
      <div className={`pipeline-image-scroll ${zoom ? 'is-zoomed' : ''}`} tabIndex={0} aria-label="Pipeline image; scroll to inspect when zoomed">
        <img src={src} alt={diagram.alt} width={diagram.width} height={diagram.height} draggable={false} />
      </div>
    </dialog>, document.body)}
  </>;
}
