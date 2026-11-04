import { projects, skills } from './data';
export type SkillId = (typeof skills)[number]['icon'];
export type ArchitectureStage = { id:string; label:string; detail:string; skillId?:SkillId; branch?:boolean };
export type SkillSlot = { id:string; skillId:SkillId };
export type ForgeProject = { id:string; title:string; category:string; description:string; githubUrl:string; note:string; architecture:ArchitectureStage[]; requiredSlots:SkillSlot[]; sources:{label:string;url:string}[] };
export const skillById=Object.fromEntries(skills.map(s=>[s.icon,s])) as Record<SkillId,(typeof skills)[number]>;
export const skillIds=skills.map(s=>s.icon);
export function isSkillId(value:unknown):value is SkillId{return typeof value==='string'&&Object.hasOwn(skillById,value);}
const gh='https://github.com/shehar-e-yaar/';
const de=gh+'Data_Engineering_Projects/blob/main/';
type Manifest=Omit<ForgeProject,'title'|'category'|'githubUrl'|'note'|'requiredSlots'> & { requirements:SkillId[] };
const manifest:Record<string,Manifest>={
  VenomLink:{id:'venomlink',description:'Exploring geographic access to suitable care in Lahore, with source-linked facility records, live driving estimates and on-device snake classification. A planning prototype, not a clinically validated triage service.',requirements:['python','amazonwebservices'],architecture:[
    {id:'records',label:'Python data pipeline',detail:'Fetch, build and validate independent facility records.',skillId:'python'},
    {id:'delivery',label:'S3 → API Gateway / Lambda',detail:'Private facility data delivered by the deployed AWS backend.',skillId:'amazonwebservices'},
    {id:'map',label:'Google Maps / Routes',detail:'User-requested driving estimates and geographic comparisons; not medical suitability.'},
    {id:'model',branch:true,label:'On-device branch · ONNX Runtime Web',detail:'A separate on-device classification branch. Photographs stay local; species suggestions are unverified.'},
  ],sources:[{label:'README & implementation limits',url:gh+'venomlink/blob/main/README.md'},{label:'Architecture',url:gh+'venomlink/blob/main/ARCHITECTURE.md'}]},
  'Real-Time Stock Pipeline':{id:'stock-pipeline',description:'A learning pipeline that polls Finnhub quotes, publishes Kafka events, parses them with Spark, and loads PostgreSQL for a Streamlit dashboard.',requirements:['python','apachekafka','apachespark','postgresql','docker','sql'],architecture:[
    {id:'quotes',label:'Finnhub → Python',detail:'The producer fetches quotes and serializes stock events.',skillId:'python'},
    {id:'events',label:'Kafka',detail:'The stock_prices topic carries serialized events.',skillId:'apachekafka'},
    {id:'stream',label:'PySpark',detail:'Structured Streaming parses JSON and appends micro-batches via JDBC.',skillId:'apachespark'},
    {id:'database',label:'PostgreSQL / SQL',detail:'The dashboard queries the latest stored stock records.',skillId:'postgresql'},
    {id:'dashboard',label:'Streamlit',detail:'A separate dashboard displays records and a price trend. Docker Compose defines Kafka, PostgreSQL and Spark services.'},
  ],sources:[{label:'Producer',url:de+'Real_Time_Stock_Pipeline/producer/stock_api_producer.py'},{label:'Stream processor',url:de+'Real_Time_Stock_Pipeline/spark/stream_processor.py'},{label:'Dashboard SQL',url:de+'Real_Time_Stock_Pipeline/dashboard/app.py'},{label:'Docker services',url:de+'Real_Time_Stock_Pipeline/docker-compose.yml'}]},
  'NYC Taxi ETL':{id:'nyc-taxi',description:'An Airflow-orchestrated ETL learning project: read NYC Taxi Parquet batches, clean them in Pandas, load PostgreSQL, and explore the results in Power BI.',requirements:['python','apacheairflow','postgresql','docker'],architecture:[
    {id:'source',label:'NYC Taxi Parquet',detail:'The DAG checks for a local yellow-trip dataset.'},
    {id:'transform',label:'Python / Pandas',detail:'Read 100,000-row batches, normalize names and remove missing values.',skillId:'python'},
    {id:'orchestration',label:'Airflow',detail:'PythonOperator tasks orchestrate a daily validation-and-load workflow.',skillId:'apacheairflow'},
    {id:'load',label:'PostgreSQL',detail:'SQLAlchemy and to_sql load the cleaned batches.',skillId:'postgresql'},
    {id:'analysis',label:'Power BI',detail:'The documented dashboard explores trips, passengers and distances. Docker packages the infrastructure.'},
  ],sources:[{label:'Project README',url:de+'NYC_Taxi_ETL/Readme.md.txt'},{label:'Actual Airflow DAG',url:de+'NYC_Taxi_ETL/dags/ETL.py'},{label:'Compose infrastructure',url:de+'NYC_Taxi_ETL/docker-compose.yaml'}]},
  'E-Commerce Warehouse':{id:'ecommerce-warehouse',description:'Synthetic e-commerce transactions become an analytics-ready star schema through Python data generation, Snowflake raw tables and dbt models.',requirements:['python','sql','dbt'],architecture:[
    {id:'generate',label:'Python / Faker → CSV',detail:'Generate users, products, orders and order items.',skillId:'python'},
    {id:'raw',label:'Snowflake raw tables',detail:'Load the generated transactional data into the warehouse.'},
    {id:'models',label:'dbt transformations',detail:'Staging models feed fact_sales and user/product/date dimensions.',skillId:'dbt'},
    {id:'analytics',label:'SQL analytics',detail:'Analytical queries explore measures such as monthly revenue.',skillId:'sql'},
  ],sources:[{label:'Documented architecture',url:de+'e_commerce_dbt/Readme.md'},{label:'Analytics SQL',url:de+'e_commerce_dbt/sql/analytical_queries.sql'}]},
  OmbudsAI:{id:'ombudsai',description:'An experimental safety guardrail intercepts ticket-closing agents, checks source-of-record facts and escalates uncertain cases. Demonstrated using fictional civic data.',requirements:['python','amazonwebservices'],architecture:[
    {id:'facts',label:'Ticket facts → Python rules',detail:'Deterministic checks and an anti-injection screen run before closure.',skillId:'python'},
    {id:'classification',label:'Decider probability checks',detail:'Typed questions evaluate whether the work addresses the report; Gemini is an optional classifier backup.'},
    {id:'policy',label:'Strands intervention',detail:'Asymmetric policy thresholds allow, hold or block the tool call.'},
    {id:'memo',label:'Bedrock → human review',detail:'Bedrock generates escalation memos with Gemini failover and explicit provenance.',skillId:'amazonwebservices'},
  ],sources:[{label:'Guardrail architecture & limitations',url:gh+'Ombuds-AI/blob/main/README.md'}]},
  'Research Reproductions':{id:'research-reproductions',description:'Reproducing ML experiments and auditing streaming execution. This workflow shows the repository’s real file-based Spark audit; separate DDoS model and snake-detection experiments remain distinct. Reproductions, not publications.',requirements:['python','apachespark','sql'],architecture:[
    {id:'sample',label:'Parquet test sample',detail:'Read a held-out sample into Pandas; no production accuracy claim is made.',skillId:'python'},
    {id:'batches',label:'Incremental CSV batches',detail:'Materialize three input batches in a streaming directory.'},
    {id:'spark',label:'Spark Structured Streaming',detail:'Read the files with an explicit schema and a 500ms micro-batch trigger.',skillId:'apachespark'},
    {id:'audit',label:'Memory sink / SQL audit',detail:'Inspect recentProgress and count processed rows. This audited path does not claim a running Kafka broker.',skillId:'sql'},
  ],sources:[{label:'Real streaming execution audit',url:gh+'RESEARCH_WORK/blob/main/DDos%20Attack%20Detecting/spark_structured_streaming_real.py'},{label:'Separate ML reproduction',url:gh+'RESEARCH_WORK/blob/main/DDos%20Attack%20Detecting/DDoS-Attack-Detection-using-Machine-Learning-main/README.md'}]},
  'Intelligent Text Editor':{id:'text-editor',description:'A C++ console editor practicing linked text buffers, cursor movement and undo/redo history. A computer-science learning project.',requirements:['cplusplus'],architecture:[
    {id:'input',label:'Keyboard input',detail:'Read console keys for editing, cursor movement and undo/redo.'},
    {id:'buffer',label:'C++ text buffer',detail:'TextBufferList inserts and deletes characters and moves the cursor.',skillId:'cplusplus'},
    {id:'history',label:'Undo / redo history',detail:'Action stacks reverse and replay insert/delete operations.'},
    {id:'display',label:'Console rendering',detail:'The editor redraws the buffer in a Windows console.'},
  ],sources:[{label:'Editor implementation',url:gh+'Intelligent-Text-Editor/blob/main/main.cpp'}]},
};
export const forgeProjects:ForgeProject[]=projects.map(p=>{
  const entry=manifest[p.name];
  return {...entry,title:p.name,category:p.category,githubUrl:p.url,note:p.note,requiredSlots:entry.requirements.map((skillId,i)=>({id:`${entry.id}-${skillId}-${i+1}`,skillId}))};
});
export const projectById=Object.assign(Object.create(null),Object.fromEntries(forgeProjects.map(p=>[p.id,p]))) as Record<string,ForgeProject>;
