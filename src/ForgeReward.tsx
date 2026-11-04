import { Download } from 'lucide-react';
import { useForge } from './ForgeProvider';
import { allProjectsRevealed } from './forgeState';
import { forgeProjects } from './forgeData';
import { receiptFor } from './forgeReceipt';

const journey = [
  { title: 'Control the state', ids: ['text-editor'], detail: 'Buffers, cursor edits and reversible actions.' },
  { title: 'Connect the data', ids: ['stock-pipeline', 'nyc-taxi', 'ecommerce-warehouse', 'research-reproductions'], detail: 'From batches and streams to queryable models.' },
  { title: 'Support decisions', ids: ['venomlink', 'ombudsai'], detail: 'Geographic access and human review workflows.' },
];
export function ForgeReward() {
  const { state } = useForge();
  if (!allProjectsRevealed(state)) return null;
  function download() {
    const url = URL.createObjectURL(new Blob([receiptFor(state)], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'workspace-receipt.txt'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <div className="folio-spread forge-reward">
    <div className="folio-left"><span className="folio-page-number">THE FINAL PAGE</span><h3>The engineer behind the builds<span>.</span></h3><p>I build data pipelines and explore cloud and AI systems through practical projects.</p><small>A map of the work, not a dated timeline.</small><button className="folio-source" onClick={download}>Workspace receipt <Download size={14} /></button></div>
    <div className="folio-right"><ol>{journey.map(group => <li key={group.title}><strong>{group.title}</strong><p>{group.detail}</p><div>{group.ids.map(id => { const p = forgeProjects.find(p => p.id === id)!; return <a key={id} href={p.githubUrl} target="_blank" rel="noreferrer">{p.title} ↗</a>; })}</div></li>)}</ol></div>
  </div>;
}
