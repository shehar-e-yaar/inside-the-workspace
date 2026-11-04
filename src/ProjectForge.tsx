import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import { ArrowUpRight, Check, Command, Plus, X } from 'lucide-react';
import { mysteryLabel, slotDomId } from './mystery';
import { FORGE_DRAG_TYPE, useForge } from './ForgeProvider';
import { forgeProjects, isSkillId, projectById, skillById } from './forgeData';
import type { ForgeProject, SkillId, SkillSlot } from './forgeData';
import { inventoryOf, projectComplete, projectRevealed, allProjectsRevealed } from './forgeState';
import { challenges } from './engineeringChallenges';
import { ProjectPipeline } from './ProjectPipeline';
import { ForgeReward } from './ForgeReward';
import { commitsPageTurn, pageDragProgress, turnDestination } from './folioNavigation';

export const summaries: Record<string, string> = {
  venomlink: 'Facility data, geographic access and on-device snake classification. An exploratory planning prototype.',
  'stock-pipeline': 'Live stock quotes flow through Kafka and Spark into PostgreSQL for a Streamlit dashboard.',
  'nyc-taxi': 'An Airflow workflow cleans NYC taxi records with Python and loads PostgreSQL.',
  'ecommerce-warehouse': 'Python-generated transactions become a Snowflake warehouse and dbt star schema.',
  ombudsai: 'An experimental guardrail checks agent actions and escalates uncertain cases for human review.',
  'research-reproductions': 'ML reproductions and a file-based Spark streaming audit. Explorations, not publications.',
  'text-editor': 'A C++ console editor with linked text buffers, cursor controls and undo/redo.',
};
function Mark({ id }: { id: SkillId }) {
  return <img className="folio-tech-mark" src={`/logos/${id}.${id === 'apachekafka' ? 'png' : 'svg'}`} alt="" draggable={false} />;
}
function Slot({ project, slot, disabled }: { project: ForgeProject; slot: SkillSlot; disabled: boolean }) {
  const { state, store } = useForge();
  const skill = skillById[slot.skillId], responsibility = challenges[project.id].roles[slot.skillId]!;
  const filled = state.assignments[project.id]?.[slot.id] === slot.skillId;
  const available = inventoryOf(state)[slot.skillId], selected = state.selectedSkill;
  const [over, setOver] = useState(false);
  const invalid = state.feedback === 'error' && state.message === responsibility.clue;
  function assign() {
    if (filled) { store.dispatch({ type: 'remove', projectId: project.id, slotId: slot.id }); return; }
    if (selected) {
      if (selected === slot.skillId && available > 0) {
        const from = document.querySelector(`[data-skill-id="${selected}"]`)?.getBoundingClientRect();
        const to = document.getElementById(slotDomId(slot.id))?.getBoundingClientRect();
        if (from && to) window.dispatchEvent(new CustomEvent('forge-flight', { detail: { id: selected, from: { x: from.x, y: from.y }, to: { x: to.x, y: to.y } } }));
      }
      store.dispatch({ type: 'assign', projectId: project.id, slotId: slot.id, skillId: selected }); return;
    }
    if (!available) { store.dispatch({ type: 'terminal', target: { projectId: project.id, slotId: slot.id } }); return; }
    store.dispatch({ type: 'notice', message: responsibility.clue });
  }
  return <button id={slotDomId(slot.id)} data-forge-slot={slot.id} data-project-id={project.id}
    className={`folio-slot ${filled ? 'filled' : ''} ${over ? 'drop-target' : ''} ${invalid ? 'invalid' : ''}`}
    style={{ '--card-accent': skill.color } as CSSProperties} disabled={disabled} title={responsibility.clue}
    aria-label={filled ? `Remove ${skill.name} from ${mysteryLabel(state, project.id)}` : `${responsibility.label}. ${responsibility.clue}${available === 0 ? ' Replenish in terminal.' : ''}`}
    onDragOver={e => { if (!disabled && !filled) { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; setOver(true); } }} onDragLeave={() => setOver(false)}
    onDrop={e => { e.preventDefault(); setOver(false); const id = e.dataTransfer.getData(FORGE_DRAG_TYPE); if (!disabled && isSkillId(id)) store.dispatch({ type: 'assign', projectId: project.id, slotId: slot.id, skillId: id }); }} onClick={assign}>
    <span className="folio-slot-state" aria-hidden="true">{filled ? <X size={11} /> : available === 0 ? <Command size={12} /> : <Plus size={13} />}</span>
    {filled ? <Mark id={slot.skillId} /> : <span className="mystery-slot-glyph" aria-hidden="true">?</span>}
    <strong>{filled ? skill.name : responsibility.label}</strong>{filled && <Check className="folio-slot-check" size={12} aria-hidden="true" />}
  </button>;
}
function ProjectStory({ project, active }: { project: ForgeProject; active: boolean }) {
  const { state } = useForge(); const reduced = useReducedMotion();
  const revealed = projectRevealed(state, project.id), assembled = projectComplete(state, project.id), challenge = challenges[project.id];
  return <>
    <motion.h3 key={revealed ? 'revealed' : 'mystery'} initial={reduced ? false : { opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .4 }}>{mysteryLabel(state, project.id)}</motion.h3>
    {assembled ? <ProjectPipeline projectId={project.id} revision={state.assemblyVersions[project.id] ?? 0} active={active} /> :
      <><p>{challenge.problem}</p><span className="mystery-place-hint">Select a card, then a role. Tap an empty role for a clue.</span></>}
    {revealed && <a href={project.githubUrl} target="_blank" rel="noreferrer" className="folio-source">GitHub <ArrowUpRight size={15} /></a>}
  </>;
}
type TurnGesture = { startX: number; width: number; side: -1 | 1; pointerId: number };

export default function ProjectForge({ active }: { active: boolean }) {
  const { state, store } = useForge(); const reduced = useReducedMotion();
  const project = projectById[state.activeProjectId] ?? forgeProjects[0];
  const [rewardPage, setRewardPage] = useState(false);
  const rewardReady = allProjectsRevealed(state), showReward = rewardPage && rewardReady;
  const index = showReward ? forgeProjects.length : forgeProjects.findIndex(p => p.id === project.id), pageCount = forgeProjects.length + (rewardReady ? 1 : 0);
  const [covered, setCovered] = useState(true), [opening, setOpening] = useState(false), [turning, setTurning] = useState(false), [turnSide, setTurnSide] = useState<-1 | 1>(1), [peeling, setPeeling] = useState(false);
  const turn = useRef<TurnGesture | null>(null), book = useRef<HTMLDivElement>(null);
  const busy = useRef(false), controls = useRef<ReturnType<typeof animate> | null>(null);
  const progress = useMotionValue(0), coverAngle = useMotionValue(0);
  const coverOpacity = useTransform(coverAngle, [0, -155], [1, 0]), rotation = useTransform(progress, v => v * (turnSide === 1 ? -180 : 180));
  const modal = useRef<HTMLDialogElement>(null);
  const complete = projectRevealed(state, project.id), label = mysteryLabel(state, project.id);
  const [explore, setExplore] = useState(false), [reset, setReset] = useState(false);
  useEffect(() => { if (explore || reset) modal.current?.showModal(); }, [explore, reset]);
  useEffect(() => () => { controls.current?.stop(); }, []);
  useEffect(() => {
    if (!state.returnTarget && state.focusRequest > 0) {
      setCovered(false); setRewardPage(false);
      const frame = requestAnimationFrame(() => {
        const journey = document.querySelector<HTMLElement>('.forge-journey');
        if (journey) window.scrollTo({ top: scrollY + journey.getBoundingClientRect().top + Math.max(0, journey.offsetHeight - innerHeight) * .7, behavior: 'instant' });
        document.getElementById(slotDomId(state.focusTarget?.slotId))?.focus({ preventScroll: true });
      }); return () => cancelAnimationFrame(frame);
    }
  }, [state.focusRequest, state.returnTarget, state.focusTarget]);
  const finishTurn = (side: -1 | 1) => {
    const next = turnDestination(index, side, pageCount);
    if (next === -1) { setCovered(true); coverAngle.set(0); setRewardPage(false); }
    else if (next === forgeProjects.length) setRewardPage(true);
    else if (next !== null) { setRewardPage(false); store.dispatch({ type: 'project', projectId: forgeProjects[next].id }); }
    progress.set(0); setPeeling(false); setTurning(false); busy.current = false;
    requestAnimationFrame(() => book.current?.focus({ preventScroll: true }));
  };
  const settle = (side: -1 | 1, commit: boolean) => {
    busy.current = true; setTurning(true); setTurnSide(side); setPeeling(true);
    const done = () => { if (commit) finishTurn(side); else { progress.set(0); setPeeling(false); setTurning(false); busy.current = false; } };
    if (reduced) { done(); return; }
    controls.current = animate(progress, commit ? 1 : 0, { duration: commit ? Math.max(.2, (1 - progress.get()) * .65) : .32, ease: [.22, .75, .2, 1], onComplete: done });
  };
  const requestTurn = (side: -1 | 1) => { if (busy.current || turn.current || covered || turnDestination(index, side, pageCount) === null) return; setTurnSide(side); settle(side, true); };
  const coverDrag = useRef<{ x: number; id: number } | null>(null);
  const open = () => {
    if (busy.current) return; busy.current = true; setOpening(true);
    const done = () => { setCovered(false); setOpening(false); busy.current = false; requestAnimationFrame(() => book.current?.focus({ preventScroll: true })); };
    if (reduced) { done(); return; }
    controls.current = animate(coverAngle, -155, { duration: .7, ease: [.22, .75, .2, 1], onComplete: done });
  };
  const beginTurn = (e: PointerEvent<HTMLButtonElement>, side: -1 | 1) => {
    if (busy.current || turn.current || turnDestination(index, side, pageCount) === null) return;
    e.currentTarget.setPointerCapture(e.pointerId); turn.current = { startX: e.clientX, width: Math.max(160, book.current!.clientWidth / 2), side, pointerId: e.pointerId }; setTurnSide(side); progress.set(0); setPeeling(true);
  };
  const moveTurn = (e: PointerEvent<HTMLButtonElement>) => { const g = turn.current; if (g?.pointerId === e.pointerId) progress.set(reduced ? 0 : pageDragProgress(g.startX, e.clientX, g.width, g.side)); };
  const releaseTurn = (e: PointerEvent<HTMLButtonElement>, cancel = false) => {
    const g = turn.current; if (!g || g.pointerId !== e.pointerId) return; turn.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    settle(g.side, !cancel && commitsPageTurn(pageDragProgress(g.startX, e.clientX, g.width, g.side), Math.abs(e.clientX - g.startX)));
  };
  return <div className="project-forge folio-experience">
    <div ref={book} className={`folio-shell ${covered ? 'is-covered' : ''} ${peeling ? 'is-peeling' : ''}`} role="group" tabIndex={0}
      aria-label={covered ? 'Project Forge book cover' : showReward ? 'The engineer behind the builds. Final reward page.' : `${label}, project ${index + 1} of ${forgeProjects.length}. Drag a page corner or use left and right arrow keys.`} aria-busy={turning || opening}
      onKeyDown={e => { if (covered) return; if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); requestTurn(e.key === 'ArrowRight' ? 1 : -1); } }}>
      {covered ? <motion.button className="folio-cover" aria-label="Open Project Forge book"
        onPointerDown={e => { if (busy.current) return; controls.current?.stop(); coverDrag.current = { x: e.clientX, id: e.pointerId }; e.currentTarget.setPointerCapture(e.pointerId); }}
        onPointerMove={e => { if (coverDrag.current?.id === e.pointerId) coverAngle.set(reduced ? 0 : -Math.min(150, Math.max(0, coverDrag.current.x - e.clientX) * .6)); }}
        onPointerUp={e => { const g = coverDrag.current; coverDrag.current = null; if (!g) return; const distance = g.x - e.clientX; if (distance > 55 || Math.abs(distance) < 8) open(); else controls.current = animate(coverAngle, 0, { duration: reduced ? 0 : .3 }); }}
        onPointerCancel={() => { coverDrag.current = null; coverAngle.set(0); }} onClick={e => { if (e.detail === 0) open(); }} style={{ rotateY: coverAngle, opacity: coverOpacity }} disabled={opening}>
        <span className="folio-cover-spine" /><span className="folio-cover-edition">MUHAMMAD SHEHERYAR</span><span className="folio-cover-title">Project<br />Forge<span>.</span></span><span className="folio-cover-art" aria-hidden="true"><i /><i /><i /></span><span className="folio-cover-subtitle">Inside the Build</span><span className="folio-cover-bottom">Selected builds <span>Open the book ↗</span></span>
      </motion.button> : <>
        <div className="folio-paper-stack" aria-hidden="true" />
        {showReward ? <ForgeReward /> : <div className={`folio-spread ${complete ? 'mystery-unlocked' : ''}`} key={project.id}>
          <div className={`folio-left ${peeling && turnSide === -1 ? 'under-turn' : ''}`}>
            <span className="folio-page-number">{String(index + 1).padStart(2, '0')} / {String(forgeProjects.length).padStart(2, '0')}</span>
            <ProjectStory key={project.id} project={project} active={active && !peeling && !turning && !explore && !reset} />
          </div>
          <div className={`folio-right ${peeling && turnSide === 1 ? 'under-turn' : ''}`}>
            <div className="folio-slots-heading"><span>{complete ? <><Check size={12} /> Assembled</> : 'Build the solution'}</span><span>{project.requiredSlots.filter(s => state.assignments[project.id]?.[s.id] === s.skillId).length}/{project.requiredSlots.length}</span></div>
            <div className="folio-slots">{project.requiredSlots.map(slot => <Slot key={slot.id} project={project} slot={slot} disabled={turning || peeling} />)}</div>
          </div>
        </div>}
        {peeling && <motion.div className={`folio-turn-sheet ${turnSide === 1 ? 'turn-forward' : 'turn-back'}`} style={{ rotateY: rotation }} aria-hidden="true"><div className={`folio-sheet-front ${turnSide === 1 ? 'folio-right' : 'folio-left'}`}>
          {showReward ? <><strong>The engineer behind the builds.</strong><p>Buffers → data systems → decision support</p></> : turnSide === 1 ? <>
            <div className="folio-slots-heading"><span>{complete ? 'Assembled' : 'Build the solution'}</span></div>
            <div className="folio-slots">{project.requiredSlots.map(slot => {
              const filled = state.assignments[project.id]?.[slot.id] === slot.skillId;
              return <div key={slot.id} className={`folio-slot ${filled ? 'filled' : ''}`} style={{ '--card-accent': skillById[slot.skillId].color } as CSSProperties}>
                {filled ? <Mark id={slot.skillId} /> : <span className="mystery-slot-glyph">?</span>}<strong>{filled ? skillById[slot.skillId].name : challenges[project.id].roles[slot.skillId]!.label}</strong>
              </div>;
            })}</div></> : <><span className="folio-page-number">{index + 1} / {forgeProjects.length}</span><h3>{label}</h3><p>{complete ? summaries[project.id] : challenges[project.id].problem}</p>{complete && <span className="folio-source">GitHub ↗</span>}</>}
        </div><div className="folio-sheet-back"><span>PROJECT FORGE</span></div></motion.div>}
        <button className="folio-page-edge edge-left" aria-label={index === 0 ? 'Close book cover' : 'Turn to previous project'} disabled={turning} onPointerDown={e => beginTurn(e, -1)} onPointerMove={moveTurn} onPointerUp={e => releaseTurn(e)} onPointerCancel={e => releaseTurn(e, true)} onClick={e => { if (e.detail === 0) requestTurn(-1); }}><span aria-hidden="true" /></button>
        <button className="folio-page-edge edge-right" aria-label={index === forgeProjects.length - 1 && rewardReady ? 'Turn to final reward' : 'Turn to next project'} disabled={turning || index === pageCount - 1} onPointerDown={e => beginTurn(e, 1)} onPointerMove={moveTurn} onPointerUp={e => releaseTurn(e)} onPointerCancel={e => releaseTurn(e, true)} onClick={e => { if (e.detail === 0) requestTurn(1); }}><span aria-hidden="true" /></button>
      </>}
    </div>
    <div className="mystery-secondary"><button onClick={() => setExplore(true)}>Explore All Projects</button><button onClick={() => setReset(true)}>Replay</button></div>
    {state.message && <p className={`folio-feedback ${state.feedback}`} role="status" aria-live="polite">{state.message}</p>}
    {explore && <dialog ref={modal} className="project-index" onCancel={() => setExplore(false)} aria-label="Explore All Projects"><button autoFocus onClick={() => setExplore(false)} aria-label="Close project index"><X size={18} /></button>{forgeProjects.map(p => <a key={p.id} href={p.githubUrl} target="_blank" rel="noreferrer"><strong>{p.title}{projectRevealed(state, p.id) ? ' · Unlocked' : ''}</strong><span>{summaries[p.id]}</span><ArrowUpRight size={15} /></a>)}</dialog>}
    {reset && <dialog ref={modal} className="project-index replay-confirm" onCancel={() => setReset(false)} aria-label="Reset Project Forge progression"><p>Replay Project Forge? This clears your card discovery and project assignments.</p><button autoFocus onClick={() => setReset(false)}>Keep progress</button><button onClick={() => { controls.current?.stop(); busy.current = false; setTurning(false); setPeeling(false); setCovered(true); setRewardPage(false); coverAngle.set(0); store.dispatch({ type: 'reset' }); setReset(false); requestAnimationFrame(() => document.getElementById('skills')?.scrollIntoView({ behavior: 'instant' })); }}>Reset and replay</button></dialog>}
  </div>;
}
