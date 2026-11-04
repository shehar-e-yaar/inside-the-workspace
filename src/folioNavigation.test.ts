import { describe,it,expect } from 'vitest';
import { pageDragProgress,commitsPageTurn,turnDestination } from './folioNavigation';
import { createForgeStore,inventoryOf } from './forgeState';
describe('cursor-controlled book navigation',()=>{
 it('goes back to the cover and stops at the final project',()=>{expect(turnDestination(0,-1,7)).toBe(-1);expect(turnDestination(6,1,7)).toBeNull();expect(turnDestination(2,1,7)).toBe(3);expect(turnDestination(2,-1,7)).toBe(1);});
 it('tracks leftward turns on the right page and rightward turns on the left page',()=>{expect(pageDragProgress(400,300,400,1)).toBe(.25);expect(pageDragProgress(100,200,400,-1)).toBe(.25);});
 it('clamps reversed and excessive drags and handles zero width safely',()=>{expect(pageDragProgress(100,300,400,1)).toBe(0);expect(pageDragProgress(500,0,100,1)).toBe(1);expect(pageDragProgress(100,0,0,1)).toBe(1);});
 it('accepts a corner click, commits an intentional pull, and cancels an incomplete drag',()=>{expect(commitsPageTurn(0,2)).toBe(true);expect(commitsPageTurn(.2,80)).toBe(true);expect(commitsPageTurn(.08,32)).toBe(false);});
 it('opening the cover activates project cards without resetting existing assignments or supply',()=>{const store=createForgeStore();store.dispatch({type:'activate'});expect(store.getSnapshot().deck.mode).toBe('expanded');store.execute('forge python 2');store.dispatch({type:'activate'});expect(inventoryOf(store.getSnapshot()).python).toBe(3);});
});
