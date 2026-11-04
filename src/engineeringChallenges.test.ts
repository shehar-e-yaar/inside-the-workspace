import { describe, it, expect } from 'vitest';
import { challenges } from './engineeringChallenges';
import { forgeProjects, skillIds } from './forgeData';
import { allProjectsRevealed, createForgeStore, initialForgeState, inventoryOf, projectRevealed, restoreForge, serializeForge } from './forgeState';
import { receiptFor } from './forgeReceipt';

const ready = () => { const s = initialForgeState(); s.deck = { mode: 'expanded', front: 11, cycle: 'idle' }; return createForgeStore(s); };
type Store = ReturnType<typeof ready>;
function assemble(store: Store, index: number) {
  const p = forgeProjects[index];
  for (const slot of p.requiredSlots) {
    if (!inventoryOf(store.getSnapshot())[slot.skillId]) store.execute(`forge ${slot.skillId} 1`);
    store.dispatch({ type: 'assign', projectId: p.id, slotId: slot.id, skillId: slot.skillId });
  }
  return p;
}
const finish = (store: Store, id: string) => store.dispatch({ type: 'pipeline-viewed', projectId: id, revision: store.getSnapshot().assemblyVersions[id] ?? 0 });
describe('Inside the Build challenge lifecycle', () => {
  it('rejects premature completion and stale callbacks after remove/reassign', () => {
    const s = ready(), p = forgeProjects[0]; finish(s, p.id); expect(projectRevealed(s.getSnapshot(), p.id)).toBe(false);
    assemble(s, 0); const revision = s.getSnapshot().assemblyVersions[p.id];
    s.dispatch({ type: 'remove', projectId: p.id, slotId: p.requiredSlots[0].id });
    s.dispatch({ type: 'pipeline-viewed', projectId: p.id, revision }); expect(projectRevealed(s.getSnapshot(), p.id)).toBe(false);
    s.dispatch({ type: 'assign', projectId: p.id, slotId: p.requiredSlots[0].id, skillId: p.requiredSlots[0].skillId });
    s.dispatch({ type: 'pipeline-viewed', projectId: p.id, revision }); expect(projectRevealed(s.getSnapshot(), p.id)).toBe(false);
    finish(s, p.id); expect(projectRevealed(s.getSnapshot(), p.id)).toBe(true);
  });
  it('preserves accepted reveals through reload and navigation without consuming again', () => {
    const s = ready(), p = assemble(s, 0); finish(s, p.id); finish(s, p.id);
    s.dispatch({ type: 'project', projectId: forgeProjects[1].id });
    const restored = restoreForge(serializeForge(s.getSnapshot()));
    expect(projectRevealed(restored, p.id)).toBe(true); expect(inventoryOf(restored)).toEqual(inventoryOf(s.getSnapshot()));
  });
  it('restores old assignments but requires their first diagram view', () => {
    const s = ready(), p = assemble(s, 0), saved = JSON.parse(serializeForge(s.getSnapshot())); delete saved.revealed;
    const restored = restoreForge(JSON.stringify(saved)); expect(restored.assignments).toEqual(s.getSnapshot().assignments);
    expect(projectRevealed(restored, p.id)).toBe(false);
  });
  it('ignores saved reveals with missing assignments and unknown project IDs', () => {
    const saved = JSON.parse(serializeForge(initialForgeState())); saved.revealed = ['venomlink', '__proto__', 'unknown'];
    expect(restoreForge(JSON.stringify(saved)).revealed).toEqual({});
  });
  it('uses contextual hints and rejects every mismatched card without consuming tokens', () => {
    for (const p of forgeProjects) for (const slot of p.requiredSlots) {
      const s = ready(), before = inventoryOf(s.getSnapshot());
      for (const id of skillIds.filter(id => id !== slot.skillId)) {
        s.dispatch({ type: 'assign', projectId: p.id, slotId: slot.id, skillId: id });
        expect(inventoryOf(s.getSnapshot())).toEqual(before);
        expect(s.getSnapshot().message).toBe(challenges[p.id].roles[slot.skillId]!.clue);
      }
    }
  });
  it('unlocks reward only after all seven diagrams and relocks if an assignment is removed', () => {
    const s = ready();
    for (let i = 0; i < forgeProjects.length; i++) { const p = assemble(s, i); expect(allProjectsRevealed(s.getSnapshot())).toBe(false); finish(s, p.id); }
    expect(allProjectsRevealed(s.getSnapshot())).toBe(true);
    const p = forgeProjects[2]; s.dispatch({ type: 'remove', projectId: p.id, slotId: p.requiredSlots[0].id });
    expect(allProjectsRevealed(s.getSnapshot())).toBe(false); expect(receiptFor(s.getSnapshot())).toContain('6 / 7');
  });
  it('builds receipt from revealed progress only, never unused or unfinished cards', () => {
    const s = ready(); assemble(s, 0); expect(receiptFor(s.getSnapshot())).toContain('0 / 7');
    finish(s, forgeProjects[0].id); const receipt = receiptFor(s.getSnapshot());
    expect(receipt).toContain('1 / 7'); expect(receipt).toContain('VenomLink'); expect(receipt).not.toContain('Stock Pipeline');
    expect(receipt).not.toContain('Azure'); expect(receipt).toContain('Python'); expect(receipt).toContain('AWS');
  });
  it('clears reveals along with inventory and assignments on replay', () => {
    const s = ready(); const p = assemble(s, 0); finish(s, p.id); s.dispatch({ type: 'reset' });
    expect(s.getSnapshot().revealed).toEqual({}); expect(allProjectsRevealed(s.getSnapshot())).toBe(false);
  });
  it('covers each real responsibility and traces insights to existing repository sources', () => {
    expect(Object.keys(challenges)).toHaveLength(forgeProjects.length);
    for (const p of forgeProjects) {
      const c = challenges[p.id]; expect(c.problem.length).toBeGreaterThan(40);
      expect(p.sources[c.source].url).toMatch(/^https:\/\/github.com\/shehar-e-yaar\//);
      for (const slot of p.requiredSlots) { expect(c.roles[slot.skillId]?.label).toBeTruthy(); expect(c.roles[slot.skillId]!.clue.length).toBeGreaterThan(25); }
    }
  });
});
