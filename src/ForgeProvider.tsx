import { createContext, useContext, useState, useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';
import { createForgeStore, FORGE_STORAGE_KEY, initialForgeState, restoreForge, serializeForge } from './forgeState';
import type { ForgeStore } from './forgeState';
export const FORGE_DRAG_TYPE='application/x-project-forge-skill';
const ForgeContext=createContext<ForgeStore|null>(null);
export function ForgeProvider({children}:{children:ReactNode}){
 const [store]=useState(()=>{
  let state=initialForgeState();
  try{if(typeof window!=='undefined')state=restoreForge(localStorage.getItem(FORGE_STORAGE_KEY));}catch{state.storageUnavailable=true;}
  return createForgeStore(state,s=>{localStorage.setItem(FORGE_STORAGE_KEY,serializeForge(s));});
 });
 return <ForgeContext.Provider value={store}>{children}</ForgeContext.Provider>;
}
export function useForgeStore(){const store=useContext(ForgeContext);if(!store)throw new Error('Project Forge requires its shared provider.');return store;}
export function useForge(){const store=useForgeStore();return {store,state:useSyncExternalStore(store.subscribe,store.getSnapshot,store.getSnapshot)};}
