import { certificates, profile, projects, skills } from './data';
export const commands = ['help','whoami','about','skills','projects','certifications','github','contact','clear','date','neofetch'] as const;
export function runCommand(raw:string, now = new Date()): string {
  const command = raw.trim().toLowerCase();
  const registry: Record<string,()=>string> = {
    help:()=>`Available commands\n${commands.join('  ·  ')}\n\n↑ / ↓ history · Tab autocomplete · Ctrl+L clear\nOr scroll and use the navigation. You can explore without commands.`,
    whoami:()=>`${profile.name}\nBS Computer Science · UVAS Lahore, Pakistan\nData Engineer in the making.`,
    about:()=>`Curiosity got me started. Building systems kept me going.\nI'm a computer science student learning data engineering by building pipelines, exploring cloud platforms, and experimenting with AI.`,
    skills:()=>skills.map(s=>`${s.name.padEnd(12)} ${s.status} — ${s.context}`).join('\n'),
    projects:()=>projects.map((p,i)=>`${String(i+1).padStart(2,'0')}  ${p.name} — ${p.note}\n    ${p.url}`).join('\n'),
    certifications:()=>certificates.map(c=>`${c.title}\n${c.issuer} · ${c.date}`).join('\n\n'),
    github:()=>profile.github,
    contact:()=>`Email     ${profile.email}\nGitHub    ${profile.github}\nLinkedIn  ${profile.linkedin}`,
    clear:()=>'', date:()=>now.toLocaleString('en-GB',{timeZone:'Asia/Karachi'})+' · Asia/Karachi',
    neofetch:()=>`  >_   SHEHERYAR / WORKSPACE\n       OS       Browser\n       Focus    Data engineering\n       Campus   UVAS, Lahore\n       Mode     Learning by building`,
  };
  return Object.hasOwn(registry,command) ? registry[command]() : `Command not found: ${raw.trim()}\nType help to see the available commands.`;
}
