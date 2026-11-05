export const HERO_LOOP_SECONDS = 13.5;
export const HERO_PIPELINE_END = 10.5;
export function heroSceneOpacity(seconds: number) {
  const smooth=(v:number)=>{const t=Math.max(0,Math.min(1,v));return t*t*(3-2*t);};
  return {
    furniture: seconds<3?1:seconds<3.25?1-smooth((seconds-3)/.25):seconds<12?0:smooth((seconds-12)/1.5),
    timeline: seconds<5.5?1:seconds<5.85?1-smooth((seconds-5.5)/.35):seconds<12?0:smooth((seconds-12)/1.5),
    pipeline: seconds<5.5?0:seconds<5.85?smooth((seconds-5.5)/.35):seconds<=10.5?1:1-smooth((seconds-10.5)/1.3),
  };
}
// Insert a 1.5-second hold at the old nine-second return boundary.
export function heroHoldTrack(values: number[], times: number[]) {
  const boundary=.75;
  let upper=times.findIndex(t=>t>=boundary);
  if(upper<0)upper=times.length-1;
  const lower=Math.max(0,upper-1);
  const fraction=times[upper]===times[lower]?0:(boundary-times[lower])/(times[upper]-times[lower]);
  const held=values[lower]+(values[upper]-values[lower])*fraction;
  const pairs=times.flatMap((t,i)=>Math.abs(t-boundary)<.001?[]:[[t*12+(t>boundary?1.5:0),values[i]]]);
  pairs.push([9,held],[HERO_PIPELINE_END,held]);pairs.sort((a,b)=>a[0]-b[0]);
  return {values:pairs.map(p=>p[1]),times:pairs.map(p=>p[0]/HERO_LOOP_SECONDS)};
}
export const HERO_NODE_SECONDS = .6;
export const HERO_LINKS = [
  [128,287,140,287,140,254,152,254],
  [248,254,260,254,260,231,272,231],
  [368,231,380,231,380,254,392,254],
  [488,254,500,254,500,287,512,287],
];
export function heroFlowAt(seconds: number) {
  const t = seconds - 6;
  const index = Math.max(0, Math.min(4, Math.floor(t / HERO_NODE_SECONDS)));
  const local = Math.max(0, Math.min(HERO_NODE_SECONDS, t - index * HERO_NODE_SECONDS));
  // The node settles before its outgoing packet begins travelling.
  const lift = local < .4 ? -8 * Math.sin(Math.PI * local / .4) ** 2 : 0;
  const travel = Math.max(0, Math.min(1, (local - .4) / .2));
  return { index, lift, travel, travelling: t >= 0 && t < 3 && index < 4 && local >= .4 };
}
export function heroCurvePoint(curve: number[], t: number) {
  const u = 1 - t;
  return [u*u*u*curve[0]+3*u*u*t*curve[2]+3*u*t*t*curve[4]+t*t*t*curve[6],
    u*u*u*curve[1]+3*u*u*t*curve[3]+3*u*t*t*curve[5]+t*t*t*curve[7]];
}
export function heroSafeClipY(top: number, translation: number) { return Math.max(200 - top, translation); }
export type HeroScene = 'editing' | 'transforming' | 'pipeline' | 'returning';
export function heroSceneAt(seconds: number): HeroScene {
  const t = ((seconds % HERO_LOOP_SECONDS) + HERO_LOOP_SECONDS) % HERO_LOOP_SECONDS;
  return t < 3 ? 'editing' : t < 6 ? 'transforming' : t < HERO_PIPELINE_END ? 'pipeline' : 'returning';
}
export function heroCanPlay(state: { manual: boolean; interacting: boolean; visible: boolean; hidden: boolean; static: boolean }) {
  return !state.manual && !state.interacting && state.visible && !state.hidden && !state.static;
}
export function heroParallax(position: number, size: number) {
  return size > 0 ? Math.max(-4, Math.min(4, (position / size - .5) * 8)) : 0;
}

// Nine editing clips gather into five shared silhouettes before icons appear.
export function heroClipMorph(seconds:number,index:number,left:number,top:number,width:number){
  const smooth=(v:number)=>{const t=Math.max(0,Math.min(1,v));return t*t*(3-2*t);};
  const progress=smooth((seconds-3.3)/2.2);
  const targets=[0,1,2,0,2,3,1,3,4];
  const target=targets[index];
  const xs=[32,152,272,392,512],ys=[240,207,184,207,240];
  const shape=smooth((progress-.45)/.55);
  const returning=seconds>=12;
  const visible=seconds<5.5?1:seconds<5.85?1-smooth((seconds-5.5)/.35):returning?smooth((seconds-12)/1.5):0;
  return {x:returning||progress===0?0:(xs[target]-left)*progress,y:returning||progress===0?0:(ys[target]-top)*progress,
    sx:returning?1:1+(96/width-1)*shape,sy:returning?1:1+(96/36-1)*shape,shape:returning?0:shape,opacity:visible};
}
