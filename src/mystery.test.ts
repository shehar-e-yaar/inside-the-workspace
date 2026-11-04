import {describe,it,expect} from 'vitest';
import {createForgeStore,initialForgeState,projectComplete} from './forgeState';
import {mysteryLabel,clues,roles} from './mystery';
import {forgeProjects,skillIds} from './forgeData';
describe('Build to Reveal identity gate',()=>{
 it('conceals every real title before completion',()=>{const state=initialForgeState();for(const p of forgeProjects){expect(mysteryLabel(state,p.id)).toBe('PROJECT ???');expect(clues[p.id].length).toBeGreaterThan(20);}});
 it('reveals after assembly AND diagram load, and conceals again after removal',()=>{const s=initialForgeState();s.deck={mode:'expanded',front:11,cycle:'idle'};const store=createForgeStore(s),p=forgeProjects[0];for(const slot of p.requiredSlots){expect(mysteryLabel(store.getSnapshot(),p.id)).toBe('PROJECT ???');store.dispatch({type:'assign',projectId:p.id,slotId:slot.id,skillId:slot.skillId});}expect(projectComplete(store.getSnapshot(),p.id)).toBe(true);expect(mysteryLabel(store.getSnapshot(),p.id)).toBe('PROJECT ???');store.dispatch({type:'pipeline-viewed',projectId:p.id,revision:store.getSnapshot().assemblyVersions[p.id]});expect(mysteryLabel(store.getSnapshot(),p.id)).toBe(p.title);store.dispatch({type:'remove',projectId:p.id,slotId:p.requiredSlots[0].id});expect(mysteryLabel(store.getSnapshot(),p.id)).toBe('PROJECT ???');});
 it('has meaningful role clues for all actual inventory IDs',()=>{for(const id of skillIds)expect(roles[id].length).toBeGreaterThan(3);});
});
