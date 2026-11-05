import { describe, expect, it } from 'vitest';
import { HERO_LINKS, heroClipMorph, heroSceneOpacity, heroHoldTrack, heroFlowAt, heroCurvePoint, heroSafeClipY, heroCanPlay, heroParallax, heroSceneAt } from './heroFlowTimeline';
import design from './heroFlowDesign.json';

describe('hero animation lifecycle', () => {
  it('clears all timeline furniture before clips merge and reveals icons at their destination', () => {
    expect(heroSceneOpacity(3.25).furniture).toBe(0);
    expect(heroSceneOpacity(5.4).pipeline).toBe(0);
    const clip=heroClipMorph(5.5,0,94,204,112);
    expect(94+clip.x).toBe(32);
    expect(204+clip.y).toBe(240);
    expect(112*clip.sx).toBe(96);
    expect(36*clip.sy).toBe(96);
    expect(heroSceneOpacity(9.5).pipeline).toBe(1);
    expect(heroSceneOpacity(0)).toEqual(heroSceneOpacity(13.5));
    expect(heroClipMorph(0,0,94,204,112)).toEqual(heroClipMorph(13.5,0,94,204,112));
  });
  it('gives each node .6 seconds and settles before sending its packet', () => {
    for(let i=0;i<5;i++){
      expect(heroFlowAt(6+i*.6+.2).index).toBe(i);
      expect(heroFlowAt(6+i*.6+.2).lift).toBeCloseTo(-8);
      expect(heroFlowAt(6+i*.6+.5).lift).toBe(0);
      expect(heroFlowAt(6+i*.6+.5).travelling).toBe(i<4);
    }
  });
  it('places each dot exactly at the connector endpoints', () => {
    for(const curve of HERO_LINKS){expect(heroCurvePoint(curve,0)).toEqual(curve.slice(0,2));expect(heroCurvePoint(curve,1)).toEqual(curve.slice(6));}
  });
  it('keeps every clip at least 14 pixels below the ruler baseline', () => {
    for(const top of [204,258,312])for(const y of [-110,-70,-28,0,66])expect(top+heroSafeClipY(top,y)).toBeGreaterThanOrEqual(200);
  });
  it('holds the finished pipeline before returning and wraps at 13.5 seconds', () => {
    expect([0, 2.99, 3, 5.99, 6, 10.49, 10.5, 13.49, 13.5, 27].map(heroSceneAt))
      .toEqual(['editing','editing','transforming','transforming','pipeline','pipeline','returning','returning','editing','editing']);
  });
  it('inserts a fully opaque 1.5-second hold before fading', () => {
    const held=heroHoldTrack([0,0,1,1,0],[0,.25,.5,.75,1]);
    expect(held.times.map(t=>t*13.5)).toEqual([0,3,6,9,10.5,13.5]);
    expect(held.values).toEqual([0,0,1,1,1,0]);
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
