// Run through Figma MCP use_figma. Original, editable portfolio foundations.
const page=figma.currentPage;
if(page.children.length) return {status:'Existing canvas detected; inspect before running creation again',nodes:page.children.map(n=>({id:n.id,name:n.name}))};
page.name='Inside the Workspace';
await Promise.all([{family:'Space Grotesk',style:'Regular'},{family:'Space Grotesk',style:'Medium'},{family:'Space Grotesk',style:'Bold'},{family:'JetBrains Mono',style:'Regular'}].map(f=>figma.loadFontAsync(f)));
const hex=h=>({r:parseInt(h.slice(1,3),16)/255,g:parseInt(h.slice(3,5),16)/255,b:parseInt(h.slice(5,7),16)/255});
// Collection creation and bindings follow the bundled createVariableCollection /
// bindVariablesToComponent helpers; values are the implemented CSS design system.
const collection=figma.variables.createVariableCollection('Workspace / Foundations');
collection.renameMode(collection.defaultModeId,'Midnight');
const vars={};
for(const [name,value,scopes] of [
 ['bg','#080a0e',['FRAME_FILL','SHAPE_FILL']],['surface','#13171e',['FRAME_FILL','SHAPE_FILL']],['card','#252c38',['FRAME_FILL','SHAPE_FILL']],
 ['text','#f0f1f3',['TEXT_FILL']],['muted','#939aa8',['TEXT_FILL']],['cyan','#b0eced',['TEXT_FILL','FRAME_FILL','SHAPE_FILL','STROKE_COLOR']],['lavender','#bcb7df',['TEXT_FILL','FRAME_FILL','SHAPE_FILL']],['border','#35404d',['STROKE_COLOR']],
 ['space-sm',12,['GAP']],['space-md',24,['GAP']],['space-lg',56,['GAP']],['radius-card',19,['CORNER_RADIUS']],['radius-control',24,['CORNER_RADIUS']]
]){
 const type=typeof value==='number'?'FLOAT':'COLOR';
 const primitive=figma.variables.createVariable('primitive/'+name,collection,type);primitive.scopes=[];
 primitive.setValueForMode(collection.defaultModeId,type==='FLOAT'?value:hex(value));
 const variable=figma.variables.createVariable(name,collection,type);variable.scopes=scopes;
 variable.setValueForMode(collection.defaultModeId,{type:'VARIABLE_ALIAS',id:primitive.id});
 variable.setVariableCodeSyntax('WEB','var(--'+name+')');vars[name]=variable;
}
const paints=name=>[figma.variables.setBoundVariableForPaint({type:'SOLID',color:hex('#ffffff')},'color',vars[name])];
const styles={};
for(const [name,size,family,style] of [['Display',56,'Space Grotesk','Regular'],['Heading',40,'Space Grotesk','Regular'],['Body',16,'Space Grotesk','Regular'],['Label',10,'JetBrains Mono','Regular'],['Terminal',13,'JetBrains Mono','Regular']]){
 const s=figma.createTextStyle();s.name='Workspace / '+name;s.fontName={family,style};s.fontSize=size;s.lineHeight={unit:'PERCENT',value:140};styles[name]=s.id;
}
const glass=figma.createEffectStyle();glass.name='Workspace / Glass';glass.effects=[{type:'BACKGROUND_BLUR',radius:24,visible:true},{type:'DROP_SHADOW',color:{r:0,g:0,b:0,a:.35},offset:{x:0,y:18},radius:32,spread:0,visible:true,blendMode:'NORMAL'}];
function text(parent,name,value,width,size=16,color='text',mono=false){const n=figma.createText();parent.appendChild(n);n.name=name;n.fontName={family:mono?'JetBrains Mono':'Space Grotesk',style:'Regular'};n.fontSize=size;n.lineHeight={unit:'PERCENT',value:140};n.characters=value;n.textAutoResize='HEIGHT';n.resize(width,n.height);n.fills=paints(color);return n;}
function panel(name,width,height,x,y){const f=figma.createAutoLayout();f.name=name;f.layoutMode='VERTICAL';f.resize(width,height);f.primaryAxisSizingMode='FIXED';f.counterAxisSizingMode='FIXED';f.paddingTop=f.paddingBottom=f.paddingLeft=f.paddingRight=32;f.itemSpacing=20;f.fills=paints('surface');page.appendChild(f);f.x=x;f.y=y;return f;}
const foundation=panel('Foundations / Tokens & typography',1100,670,100,100);
text(foundation,'Title','Inside the Workspace',1000,48);text(foundation,'Subtitle','Muhammad Sheheryar · A portfolio to explore',1000,19,'muted');
const swatches=figma.createAutoLayout();foundation.appendChild(swatches);swatches.layoutMode='HORIZONTAL';swatches.fills=[];swatches.itemSpacing=16;
for(const name of ['bg','surface','card','cyan','lavender']){const s=figma.createAutoLayout();swatches.appendChild(s);s.layoutMode='VERTICAL';s.resize(182,110);s.primaryAxisSizingMode='FIXED';s.counterAxisSizingMode='FIXED';s.paddingLeft=s.paddingTop=16;s.cornerRadius=12;s.fills=paints(name);text(s,'Swatch name',name,150,12,name==='cyan'||name==='lavender'?'bg':'text',true);}
text(foundation,'Typography','Space Grotesk — ideas, made readable.',1000,32);text(foundation,'Monospace specimen','sheheryar@portfolio:~$  help',1000,20,'cyan',true);
text(foundation,'Spacing','SPACE 12 / 24 / 56       CARD RADIUS 19       GLASS BLUR 24',1000,11,'muted',true);
text(foundation,'Motion','Native scroll → CSS perspective. Card spring: stiffness 190 / damping 22.\nClick → 180° flip. Reduced motion → static scene and immediate state changes.',1000,15,'muted');
const variants=[];
for(const [i,state] of ['Front','Hover','Selected','Back','Mobile'].entries()){
 const c=figma.createComponent();c.name='State='+state;c.resize(236,306);c.layoutMode='VERTICAL';c.primaryAxisSizingMode='FIXED';c.counterAxisSizingMode='FIXED';c.paddingTop=c.paddingBottom=c.paddingLeft=c.paddingRight=20;c.itemSpacing=8;c.fills=paints('card');c.strokes=paints('border');c.setBoundVariable('cornerRadius',vars['radius-card']);c.setBoundVariable('itemSpacing',vars['space-sm']);c.effectStyleId=glass.id;
 text(c,'Category','THE STREAM',196,8,'cyan',true);
 if(state!=='Back'){
  const art=figma.createAutoLayout();c.appendChild(art);art.name='Technology artwork';art.resize(196,125);art.primaryAxisSizingMode='FIXED';art.counterAxisSizingMode='FIXED';art.primaryAxisAlignItems='CENTER';art.counterAxisAlignItems='CENTER';art.fills=[];text(art,'Icon','K',60,66,'lavender');
 }
 const title=text(c,'Technology','Kafka',196,27);const prop=c.addComponentProperty('Technology','TEXT','Kafka');title.componentPropertyReferences={characters:prop};
 if(state==='Back'){text(c,'Description','Learning how events move through real-time data pipeline experiments.',196,15,'text');text(c,'Context','Stock market streaming project',196,11,'muted');}
 const spacer=figma.createFrame();spacer.name='Flexible spacer';spacer.fills=[];spacer.resize(1,1);c.appendChild(spacer);spacer.layoutGrow=1;
 text(c,'Skill status',state==='Back'?'Exploring · Tap to return':'Exploring                     ↗',196,9,'muted',true);
 variants.push(c);
}
const set=figma.combineAsVariants(variants,page);set.name='Workspace / SkillCard';set.description='Collectible skill card. Front, hover, selected, reverse and touch states. React SkillDeck supplies scroll, spring and flip behavior.';
set.x=100;set.y=900;set.resize(1350,390);set.children.forEach((c,i)=>{c.x=24+i*260;c.y=40;});
await variants[0].setReactionsAsync([{trigger:{type:'ON_CLICK'},actions:[{type:'NODE',destinationId:variants[3].id,navigation:'CHANGE_TO',transition:{type:'SMART_ANIMATE',easing:{type:'EASE_IN_AND_OUT'},duration:.72},resetVideoPosition:false}]}]);
await variants[3].setReactionsAsync([{trigger:{type:'ON_CLICK'},actions:[{type:'NODE',destinationId:variants[0].id,navigation:'CHANGE_TO',transition:{type:'SMART_ANIMATE',easing:{type:'EASE_IN_AND_OUT'},duration:.72},resetVideoPosition:false}]}]);
return {createdNodeIds:page.findAll(()=>true).map(n=>n.id),mutatedNodeIds:[page.id],collectionId:collection.id,variables:Object.fromEntries(Object.entries(vars).map(([k,v])=>[k,v.id])),textStyles:styles,effectStyle:glass.id,componentSetId:set.id,variants:variants.map(c=>({id:c.id,name:c.name})),foundationId:foundation.id};
