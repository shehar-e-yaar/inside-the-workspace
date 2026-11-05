import { describe, expect, it } from 'vitest';
import { heroCanPlay, heroParallax, heroSceneAt } from './heroFlowTimeline';
import design from './heroFlowDesign.json';

describe('hero animation lifecycle', () => {
  it('covers four three-second scenes and wraps exactly at twelve', () => {
    expect([0, 2.99, 3, 5.99, 6, 8.99, 9, 11.99, 12, 24].map(heroSceneAt))
      .toEqual(['editing','editing','transforming','transforming','pipeline','pipeline','returning','returning','editing','editing']);
  });
  it('keeps manual pause independent of hover, visibility and reduced motion', () => {
    const ready={manual:false,interacting:false,visible:true,hidden:false,static:false};
    expect(heroCanPlay(ready)).toBe(true);
    for(const flag of ['manual','interacting','hidden','static'])expect(heroCanPlay({...ready,[flag]:true})).toBe(false);
    expect(heroCanPlay({...ready,visible:false})).toBe(false);
    expect(heroCanPlay({...ready,manual:true,interacting:false})).toBe(false);
  });
  it('limits background parallax to four pixels per axis', () => {
    expect([heroParallax(-100,640),heroParallax(320,640),heroParallax(1000,640),heroParallax(10,0)]).toEqual([-4,0,4,0]);
  });
  it('keeps every exported motion track continuous at the loop boundary', () => {
    for(const track of Object.values(design.tracks)){
      for(const values of Object.values(track.values))expect(values.at(-1)).toBe(values[0]);
      for(const options of Object.values(track.options)){
        expect(options.duration).toBe(12);
        expect(options.times[0]).toBe(0);
        expect(options.times.at(-1)).toBe(1);
        expect([...options.times].sort((a,b)=>a-b)).toEqual(options.times);
      }
    }
  });
});
