import { describe, expect, it } from 'vitest';
import { commands, runCommand } from './terminal';
describe('safe portfolio command registry',()=>{
  it('provides meaningful output for every supported command',()=>{
    for(const command of commands.filter(c=>c!=='clear')) expect(runCommand(command).length).toBeGreaterThan(15);
    expect(runCommand('clear')).toBe('');
  });
  it('handles case and spaces without executing arbitrary code or inherited methods',()=>{
    expect(runCommand('  WHOAMI  ')).toContain('Muhammad Sheheryar');
    for(const value of ['constructor','__proto__','toString','<script>alert(1)</script>','rm -rf /']) expect(runCommand(value)).toContain('Command not found:');
  });
  it('keeps the profile and recognition accurate',()=>{
    expect(runCommand('whoami')).toContain('in the making');
    expect(runCommand('projects')).toContain('Reproductions, not publications');
    expect(runCommand('certifications')).toContain('Demonstrated Excellence');
    expect(runCommand('contact')).toContain('ssshery4946849@gmail.com');
  });
  it('uses Pakistan time for the date command',()=>{
    expect(runCommand('date',new Date('2026-11-02T00:00:00Z'))).toContain('05:00:00');
  });
});
