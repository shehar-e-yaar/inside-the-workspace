import {projectById,forgeProjects} from './forgeData';
import type {SkillId} from './forgeData';
import {projectRevealed} from './forgeState';
import type {ForgeState} from './forgeState';
export const roles:Record<SkillId,string>={python:'Data logic',sql:'Queries',apachekafka:'Events',apachespark:'Processing',apacheairflow:'Scheduling',dbt:'Models',docker:'Environment',postgresql:'Storage',git:'History',amazonwebservices:'Cloud',microsoftazure:'Cloud',cplusplus:'Core logic'};
export const clues:Record<string,string>={venomlink:'Compare nearby facilities using geographic records and local image classification.','stock-pipeline':'Continuously arriving quotes become a durable stream for analysis.','nyc-taxi':'Clean batches of city trip records on a repeatable schedule.','ecommerce-warehouse':'Turn generated transactions into an analytics-ready star schema.',ombudsai:'Check an agent’s actions and escalate uncertain cases for human review.','research-reproductions':'Audit file-based micro-batches and query the processed rows.','text-editor':'Edit a console buffer and reverse previous typing actions.'};
export function mysteryLabel(state:ForgeState,id:string){return projectRevealed(state,id)?projectById[id].title:'PROJECT ???';}

export function slotDomId(id:string|undefined){for(let p=0;p<forgeProjects.length;p++){const i=forgeProjects[p].requiredSlots.findIndex(s=>s.id===id);if(i>=0)return `forge-slot-${p+1}-${i+1}`;}return "forge-slot-unknown";}
