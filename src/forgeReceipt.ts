import { forgeProjects, skillById, skillIds } from './forgeData';
import { projectRevealed } from './forgeState';
import type { ForgeState } from './forgeState';

export function receiptFor(state: ForgeState) {
  const completed = forgeProjects.filter(p => projectRevealed(state, p.id));
  const used = new Set(completed.flatMap(p => p.requiredSlots.map(s => s.skillId)));
  return [
    'INSIDE THE WORKSPACE — WORKSPACE RECEIPT',
    'Project Forge · Inside the Build', '',
    `Challenges completed: ${completed.length} / ${forgeProjects.length}`,
    'Completed means assembled and project pipeline revealed.', '',
    ...completed.map(p => `${p.title}\n${p.githubUrl}`), '',
    `Technologies used: ${skillIds.filter(id => used.has(id)).map(id => skillById[id].name).join(', ') || 'None yet'}`, '',
    'This receipt records local visitor progress, not a certification or live infrastructure run.',
  ].join('\n');
}
