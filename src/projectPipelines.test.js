import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { forgeProjects } from './forgeData';
import { pipelines } from './projectPipelines';

describe('Figma pipeline assets', () => {
  it('ships a real high-resolution PNG and an accessible description for every project', () => {
    expect(Object.keys(pipelines).sort()).toEqual(forgeProjects.map(p => p.id).sort());
    for (const project of forgeProjects) {
      const diagram = pipelines[project.id];
      const png = readFileSync(new URL(`../public/pipelines/${project.id}.png`, import.meta.url));
      expect(png.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
      expect(png.readUInt32BE(16)).toBe(diagram.width);
      expect(png.readUInt32BE(20)).toBe(diagram.height);
      expect(diagram.width).toBeGreaterThanOrEqual(2560);
      expect(diagram.alt.length).toBeGreaterThan(80);
    }
  });
});
