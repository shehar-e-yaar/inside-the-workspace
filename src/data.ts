export const profile = {
  name: 'Muhammad Sheheryar', github: 'https://github.com/shehar-e-yaar',
  email: 'ssshery4946849@gmail.com', linkedin: 'https://www.linkedin.com/in/muhammad-sheheryar-2b7627384',
};
export const skills = [
  {name:'Python',icon:'python',symbol:'Py',category:'THE FOUNDATION',status:'Hands-on',description:'Turning messy inputs into useful, repeatable data workflows.',context:'Pandas · ETL · automation',color:'#f2cc84'},
  {name:'SQL',icon:'sql',symbol:'SQL',category:'THE LANGUAGE',status:'Certified',description:'Asking better questions of data. Joins, transformations, and analytical schemas.',context:'HackerRank SQL (Intermediate)',color:'#a6cffa'},
  {name:'Kafka',icon:'apachekafka',symbol:'K',category:'THE STREAM',status:'Exploring',description:'Learning how events move through real-time data pipeline experiments.',context:'Stock market streaming project',color:'#dfc2ef'},
  {name:'PySpark',icon:'apachespark',symbol:'✦',category:'THE ENGINE',status:'Exploring',description:'Experimenting with distributed transformations and streaming data processing.',context:'Spark · structured streaming',color:'#f0bda0'},
  {name:'Airflow',icon:'apacheairflow',symbol:'A',category:'THE CONDUCTOR',status:'Hands-on',description:'Giving data workflows a schedule, a dependency graph, and a repeatable run.',context:'NYC Taxi · weather pipeline',color:'#a2e3d7'},
  {name:'dbt',icon:'dbt',symbol:'dbt',category:'THE TRANSFORMER',status:'Hands-on',description:'Transforming raw e-commerce data into an analytics-ready star schema.',context:'SQL · dimensional modeling',color:'#efb7ab'},
  {name:'Docker',icon:'docker',symbol:'D',category:'THE ENVIRONMENT',status:'Hands-on',description:'Packaging pipeline services into reproducible development environments.',context:'Docker Compose · ETL services',color:'#a8c7f4'},
  {name:'PostgreSQL',icon:'postgresql',symbol:'Pg',category:'THE STORE',status:'Hands-on',description:'Modeling relational data and loading cleaned datasets for SQL analysis.',context:'NYC Taxi · relational modeling',color:'#a8d2e9'},
  {name:'Git',icon:'git',symbol:'git',category:'THE HISTORY',status:'Hands-on',description:'Tracking changes and sharing the learning process through public repositories.',context:'GitHub · version control',color:'#edbbad'},
  {name:'AWS',icon:'amazonwebservices',symbol:'aws',category:'THE CLOUD',status:'Learning',description:'Exploring cloud services and preparing this portfolio for Amplify Hosting.',context:'Cloud hosting · agent experiments',color:'#f2cc84'},
  {name:'Azure',icon:'microsoftazure',symbol:'Az',category:'THE CLOUD',status:'Exploring',description:'Experimenting with cloud storage as part of orchestrated weather ingestion.',context:'Azure Blob · Airflow',color:'#abcdf5'},
  {name:'C++',icon:'cplusplus',symbol:'C++',category:'THE BUILDER',status:'Hands-on',description:'Practicing computer science fundamentals through application projects.',context:'Intelligent Text Editor',color:'#c6c0f1'},
];
const de = `${profile.github}/Data_Engineering_Projects/tree/main/`;
export const projects = [
  {name:'HeatShield',category:'GEOSPATIAL INTELLIGENCE',tags:'Python · Urban heat risk',url:`${profile.github}/HeatShield`,note:'Hackathon project'},
  {name:'Real-Time Stock Pipeline',category:'STREAMING EXPERIMENT',tags:'Kafka · Spark',url:de+'Real_Time_Stock_Pipeline',note:'Learning project'},
  {name:'NYC Taxi ETL',category:'DATA ENGINEERING',tags:'Airflow · PostgreSQL · Docker',url:de+'NYC_Taxi_ETL',note:'Learning project'},
  {name:'E-Commerce Warehouse',category:'ANALYTICS ENGINEERING',tags:'dbt · Snowflake · SQL',url:de+'e_commerce_dbt',note:'Learning project'},
  {name:'OmbudsAI',category:'AGENTIC AI',tags:'Python · Safety guardrails',url:`${profile.github}/Ombuds-AI`,note:'Hackathon prototype'},
  {name:'Research Reproductions',category:'APPLIED ML EXPLORATION',tags:'DDoS detection · Snake detection',url:`${profile.github}/RESEARCH_WORK`,note:'Reproductions, not publications'},
  {name:'Intelligent Text Editor',category:'COMPUTER SCIENCE',tags:'C++ · Application development',url:`${profile.github}/Intelligent-Text-Editor`,note:'Learning project'},
];
export const certificates = [
  {title:'Associate Data Engineer',issuer:'DataCamp',date:'September 18, 2026',image:'/certificates/data-engineer.png',id:'DEA0019769159002'},
  {title:'SQL (Intermediate)',issuer:'HackerRank',date:'September 26, 2026',image:'/certificates/sql.png',id:'EDA92E6F00A8'},
  {title:'Introduction to Git',issuer:'DataCamp',date:'September 17, 2026',image:'/certificates/git.png',id:'#49,939,015'},
  {title:'HeatShield — Demonstrated Excellence',issuer:'FortyGuard Hackathon ’26',date:'August 18–30, 2026',image:'/certificates/heatshield.jpg',id:'Completion recognition'},
];
