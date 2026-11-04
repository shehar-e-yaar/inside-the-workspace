import { challenges } from './engineeringChallenges';
import { advanceDeck, initialDeck } from './deckState';
import type { DeckState } from './deckState';
import { forgeProjects, isSkillId, projectById, skillById, skillIds } from './forgeData';
import type { SkillId } from './forgeData';
export const FORGE_STORAGE_KEY='inside-workspace.project-forge.v1';
export const MAX_FORGE_QUANTITY=99,MAX_SKILL_SUPPLY=999;
export type SlotTarget={projectId:string;slotId:string};
export type ForgeState={version:1;supply:Record<SkillId,number>;assignments:Record<string,Record<string,SkillId>>;revealed:Record<string,boolean>;assemblyVersions:Record<string,number>;deck:DeckState;activeProjectId:string;selectedSkill:SkillId|null;message:string;feedback:'info'|'success'|'error';returnTarget:SlotTarget|null;terminalRequest:number;focusTarget:SlotTarget|null;focusRequest:number;lastForged:SkillId|null;storageUnavailable:boolean};
export type ForgeAction=
 | {type:'deck';action:Parameters<typeof advanceDeck>[1]}
 | {type:'select';skillId:SkillId|null}
 | {type:'assign';projectId:string;slotId:string;skillId:SkillId}
 | {type:'pipeline-viewed';projectId:string;revision:number}
 | {type:'remove';projectId:string;slotId:string}
 | {type:'forge';skillId:SkillId;quantity:number}
 | {type:'project';projectId:string}
 | {type:'activate'}
 | {type:'terminal';target:SlotTarget}
 | {type:'return'} | {type:'reset'} | {type:'notice';message:string;feedback?:ForgeState['feedback']};
export function initialForgeState():ForgeState{return {version:1,supply:Object.fromEntries(skillIds.map(id=>[id,1])) as Record<SkillId,number>,assignments:{},revealed:{},assemblyVersions:{},deck:{...initialDeck},activeProjectId:forgeProjects[0].id,selectedSkill:null,message:'Open Project Forge to activate your inventory.',feedback:'info',returnTarget:null,terminalRequest:0,focusTarget:null,focusRequest:0,lastForged:null,storageUnavailable:false};}
export function inventoryOf(state:ForgeState):Record<SkillId,number>{
 const inventory={...state.supply};
 for(const assignments of Object.values(state.assignments))for(const skill of Object.values(assignments))if(isSkillId(skill))inventory[skill]--;
 return inventory;
}
export function projectComplete(state:ForgeState,projectId:string){const p=projectById[projectId];return !!p&&p.requiredSlots.length>0&&p.requiredSlots.every(slot=>state.assignments[projectId]?.[slot.id]===slot.skillId);}
export function projectRevealed(state:ForgeState,id:string){return state.revealed[id]===true&&projectComplete(state,id);}
export function allProjectsRevealed(state:ForgeState){return forgeProjects.every(p=>projectRevealed(state,p.id));}
function notice(state:ForgeState,message:string,feedback:ForgeState['feedback']='error'):ForgeState{return {...state,message,feedback};}
export function forgeReducer(state:ForgeState,action:ForgeAction):ForgeState{
 const inventory=inventoryOf(state);
 switch(action.type){
  case 'deck':{const deck=advanceDeck(state.deck,action.action,skillIds.length);return deck===state.deck?state:{...state,deck,message:deck.mode==='expanded'?'Inventory unlocked. Select a skill and fill a project responsibility.':state.message};}
  case 'activate':return {...state,deck:{mode:'expanded',front:skillIds.length-1,cycle:'idle'},selectedSkill:null,message:'Choose a card for its responsibility.',feedback:'info'};
  case 'project':return projectById[action.projectId]?{...state,activeProjectId:action.projectId,selectedSkill:null,message:'',feedback:'info'}:state;
  case 'select':if(action.skillId!==null&&!isSkillId(action.skillId))return state;return action.skillId===null?{...state,selectedSkill:null}:state.deck.mode!=='expanded'?notice(state,'Discover all twelve cards first.'):inventory[action.skillId]<1?notice(state,`${skillById[action.skillId].name} has no available copies. Replenish it in the terminal.`):{...state,selectedSkill:action.skillId,message:`${skillById[action.skillId].name} selected. Choose a responsibility.`,feedback:'info'};
  case 'assign':{
   if(state.deck.mode!=='expanded')return notice(state,'Open the toolkit by discovering all twelve cards before assigning tokens.');
   const slot=projectById[action.projectId]?.requiredSlots.find(s=>s.id===action.slotId);
   if(!slot)return notice(state,'Choose a responsibility in this challenge.');
   if(slot.skillId!==action.skillId)return notice(state,challenges[action.projectId].roles[slot.skillId]!.clue);
   if(state.assignments[action.projectId]?.[slot.id])return notice(state,'This slot already has a card. Remove it before assigning another.');
   if(inventory[action.skillId]<1)return notice(state,`No ${skillById[action.skillId].name} copies available. Return to the terminal to forge one.`);
   const next={...state,assemblyVersions:{...state.assemblyVersions,[action.projectId]:(state.assemblyVersions[action.projectId]??0)+1},assignments:{...state.assignments,[action.projectId]:{...state.assignments[action.projectId],[slot.id]:action.skillId}},selectedSkill:null};
   return notice(next,projectComplete(next,action.projectId)?'Solution assembled. View the pipeline.':`${skillById[action.skillId].name} assigned. One token used.`,'success');
  }
  case 'pipeline-viewed':return projectComplete(state,action.projectId)&&(state.assemblyVersions[action.projectId]??0)===action.revision?{...state,revealed:{...state.revealed,[action.projectId]:true}}:state;
  case 'remove':{
   const assignments=state.assignments[action.projectId];const skill=assignments?.[action.slotId];if(!skill)return state;
   const remaining={...assignments};delete remaining[action.slotId];
   return notice({...state,revealed:{...state.revealed,[action.projectId]:false},assemblyVersions:{...state.assemblyVersions,[action.projectId]:(state.assemblyVersions[action.projectId]??0)+1},assignments:{...state.assignments,[action.projectId]:remaining}},`${skillById[skill].name} returned to inventory.`,'success');
  }
  case 'forge':{
   if(state.deck.mode!=='expanded')return notice(state,'Open the toolkit by discovering all twelve cards before forging tokens.');
   if(!isSkillId(action.skillId)||!Number.isSafeInteger(action.quantity)||action.quantity<1||action.quantity>MAX_FORGE_QUANTITY)return notice(state,`Quantity must be a whole number from 1 to ${MAX_FORGE_QUANTITY}.`);
   if(state.supply[action.skillId]+action.quantity>MAX_SKILL_SUPPLY)return notice(state,`Supply limit reached: at most ${MAX_SKILL_SUPPLY} tokens per technology.`);
   return notice({...state,supply:{...state.supply,[action.skillId]:state.supply[action.skillId]+action.quantity},lastForged:action.skillId},`${skillById[action.skillId].name} replenished. ${action.quantity} new token${action.quantity===1?'':'s'} available.`,'success');
  }
  case 'terminal':{const slot=projectById[action.target.projectId]?.requiredSlots.find(s=>s.id===action.target.slotId);return slot?{...state,activeProjectId:action.target.projectId,returnTarget:action.target,terminalRequest:state.terminalRequest+1,lastForged:null}:state;}
  case 'return':return state.returnTarget?{...state,activeProjectId:state.returnTarget.projectId,focusTarget:state.returnTarget,focusRequest:state.focusRequest+1,returnTarget:null}:state;
  case 'reset':return {...initialForgeState(),storageUnavailable:state.storageUnavailable,message:'Project Forge reset. Discover the toolkit again.'};
  case 'notice':return notice(state,action.message,action.feedback??'info');
 }
}
const record=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
export function serializeForge(state:ForgeState){
 const deck=state.deck.mode==='transitioning'?{mode:'expanded',front:skillIds.length-1}: {mode:state.deck.mode,front:Math.min(skillIds.length-1,state.deck.front+(state.deck.cycle==='sending'?1:0))};
 return JSON.stringify({version:1,supply:state.supply,assignments:state.assignments,revealed:forgeProjects.filter(p=>projectRevealed(state,p.id)).map(p=>p.id),deck,activeProjectId:state.activeProjectId,returnTarget:state.returnTarget});
}
export function restoreForge(raw:string|null):ForgeState{
 const fresh=initialForgeState();if(!raw)return fresh;
 try{
  const saved:unknown=JSON.parse(raw);if(!record(saved)||saved.version!==1||!record(saved.supply))return fresh;
  for(const id of skillIds){const count=saved.supply[id];if(typeof count!=='number'||!Number.isSafeInteger(count)||count<1||count>MAX_SKILL_SUPPLY)return fresh;fresh.supply[id]=count;}
  if(record(saved.deck)&&Number.isInteger(saved.deck.front)&&Number(saved.deck.front)>=0&&Number(saved.deck.front)<skillIds.length){fresh.deck={mode:saved.deck.mode==='expanded'?'expanded':'stacked',front:Number(saved.deck.front),cycle:'idle'};}
  const available={...fresh.supply};
  if(fresh.deck.mode==='expanded'&&record(saved.assignments))for(const p of forgeProjects){const assignments=saved.assignments[p.id];if(!record(assignments))continue;for(const slot of p.requiredSlots){if(assignments[slot.id]===slot.skillId&&available[slot.skillId]>0){(fresh.assignments[p.id]??={})[slot.id]=slot.skillId;available[slot.skillId]--;}}}
  if(typeof saved.activeProjectId==='string'&&projectById[saved.activeProjectId])fresh.activeProjectId=saved.activeProjectId;
  if(Array.isArray(saved.revealed))for(const p of forgeProjects){if(saved.revealed.includes(p.id)&&projectComplete(fresh,p.id))fresh.revealed[p.id]=true;}
  const target=saved.returnTarget;
  if(record(target)&&typeof target.projectId==='string'&&typeof target.slotId==='string'&&projectById[target.projectId]?.requiredSlots.some(s=>s.id===target.slotId))fresh.returnTarget={projectId:target.projectId,slotId:target.slotId};
  fresh.message=fresh.deck.mode==='expanded'?'Your Project Forge progress is restored.':'Continue exploring your toolkit.';return fresh;
 }catch{return fresh;}
}
export function normalizeSkill(value:string):SkillId|undefined{
 const aliases:Record<string,SkillId>={py:'python',python:'python',sql:'sql',kafka:'apachekafka',apachekafka:'apachekafka',spark:'apachespark',pyspark:'apachespark',apachespark:'apachespark',airflow:'apacheairflow',apacheairflow:'apacheairflow',dbt:'dbt',docker:'docker',postgres:'postgresql',postgresql:'postgresql',git:'git',aws:'amazonwebservices',amazonwebservices:'amazonwebservices',azure:'microsoftazure',microsoftazure:'microsoftazure','c++':'cplusplus',cpp:'cplusplus',cplusplus:'cplusplus'};
 const key=value.toLowerCase().replace(/[\s_-]/g,'');return Object.hasOwn(aliases,key)?aliases[key]:undefined;
}
export function createForgeStore(initial=initialForgeState(),persist?:(state:ForgeState)=>void){
 let state=initial;const listeners=new Set<()=>void>();
 const dispatch=(action:ForgeAction)=>{const next=forgeReducer(state,action);if(next===state)return state;state=next;try{persist?.(state);}catch{state={...state,storageUnavailable:true};}listeners.forEach(fn=>fn());return state;};
 const execute=(raw:string)=>{
  const args=raw.trim().split(/\s+/);const verb=args.shift()?.toLowerCase();const before=inventoryOf(state);
  if(verb==='inventory'){if(args.length)return 'Usage: inventory';return `PROJECT FORGE — SKILL INVENTORY\n\n${skillIds.map(id=>`${skillById[id].name.padEnd(13)} x${before[id]}`).join('\n')}\n\nTotal Available Tokens: ${Object.values(before).reduce((a,b)=>a+b,0)}${state.deck.mode!=='expanded'?'\nOpen Project Forge to activate assembly.':''}`;}
  if(verb!=='forge')return 'Unknown Project Forge command.';
  if(args.length<2)return `Usage: forge <skill> <quantity>\nExample: forge kafka 1\nWhole quantities: 1–${MAX_FORGE_QUANTITY} per command.`;
  const quantityText=args.pop()!;const id=normalizeSkill(args.join(' '));
  if(!id)return 'Unknown technology. Type inventory to see all 12 supported skills.';
  if(!/^[1-9]\d*$/.test(quantityText)||!Number.isSafeInteger(Number(quantityText))||Number(quantityText)>MAX_FORGE_QUANTITY)return `Quantity must be a whole number from 1 to ${MAX_FORGE_QUANTITY}.`;
  const next=dispatch({type:'forge',skillId:id,quantity:Number(quantityText)});
  if(next.feedback==='error')return next.message;
  return `[FORGE] ${skillById[id].name} recognized.\n[FORGE] Creating ${quantityText} skill token${quantityText==='1'?'':'s'}...\n\nSUCCESS: ${skillById[id].name} inventory updated.\nPrevious: x${before[id]}\nCurrent:  x${inventoryOf(next)[id]}`;
 };
 return {getSnapshot:()=>state,subscribe:(listener:()=>void)=>{listeners.add(listener);return()=>{listeners.delete(listener);};},dispatch,execute};
}
export type ForgeStore=ReturnType<typeof createForgeStore>;
