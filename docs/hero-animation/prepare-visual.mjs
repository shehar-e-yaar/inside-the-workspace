// Converts the verified Figma context into scoped, framework-independent scene data.
// Run manually when refreshing the Figma handoff; never part of the website runtime.
import fs from 'node:fs';
import ts from 'typescript';
const base = 'docs/hero-animation/';
const assets = new Map();
const unknown = new Set();
function styles(classes) {
  const s = {};
  for (const c of classes.split(' ')) {
    const fixed = {absolute:{position:'absolute'},relative:{position:'relative'},'size-full':{width:'100%',height:'100%'},block:{display:'block'},'inset-0':{inset:0},'left-0':{left:0},'top-0':{top:0},'max-w-none':{maxWidth:'none'},'overflow-clip':{overflow:'clip'},border:{borderWidth:1},'border-solid':{borderStyle:'solid'},'font-normal':{fontWeight:400},'w-px':{width:1},'h-px':{height:1},'opacity-0':{opacity:0},'opacity-25':{opacity:.25},'mb-0':{marginBottom:0},'[word-break:break-word]':{overflowWrap:'break-word'}};
    if(fixed[c]) {Object.assign(s,fixed[c]);continue;}
    const m=c.match(/^([\w-]+)-\[(.*)\]$/); if(!m){unknown.add(c);continue;}
    let [,p,v]=m; v=v.replaceAll('_',' ');
    const names={h:'height',w:'width',left:'left',top:'top',bg:'background',rounded:'borderRadius',border:'borderColor',leading:'lineHeight',inset:'inset'};
    if(names[p])s[names[p]]=v;
    else if(p==='size')Object.assign(s,{width:v,height:v});
    else if(p==='text')s[v.endsWith('px')?'fontSize':'color']=v;
    else if(p==='font')s.fontFamily=v.includes('JetBrains')?'"JetBrains Mono", monospace':'"Space Grotesk", sans-serif';
    else if(p==='drop-shadow')s.filter=`drop-shadow(${v})`;
    else unknown.add(c);
  }
  return s;
}
function scene(id) {
  const code=fs.readFileSync(base+`context-71-${id}.txt`,'utf8');
  const prefix=code.match(/assetPathPrefix = "([^"]+)"/)?.[1];
  const urls={};
  for(const m of code.matchAll(/const (\w+) = `\$\{assetPathPrefix\}\/([^`]+)`/g)) {
    const local='/hero-flow/'+m[2]; urls[m[1]]=local; assets.set(local,prefix+'/'+m[2]);
  }
  const source=ts.createSourceFile('scene.tsx',code,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  function convert(n) {
    if(ts.isJsxText(n)){const text=n.text.replace(/\s+/g,' ').trim();return text||null;}
    if(!ts.isJsxElement(n)&&!ts.isJsxSelfClosingElement(n))return null;
    const opening=n.openingElement||n;const result={tag:opening.tagName.getText(source).replace('motion.',''),style:{},children:[]};
    for(const a of opening.attributes.properties){
      const name=a.name?.text;const value=a.initializer;
      if(name==='className')result.style=styles(value.text);
      if(name==='data-node-id')result.id=value.text;
      if(name==='data-name')result.name=value.text;
      if(name==='src')result.src=urls[value.expression.getText(source)];
      if(name==='style'&&value?.expression){let e=value.expression;if(ts.isAsExpression(e))e=e.expression;
        // Only static backgroundImage literals are needed; motion transforms come from motion-context.
        for(const prop of e.properties||[])if(prop.name?.text==='backgroundImage'&&ts.isStringLiteral(prop.initializer))result.style.backgroundImage=prop.initializer.text;
      }
    }
    if(n.children)result.children=n.children.map(convert).filter(Boolean);
    // Figma's front-to-back layer list is the reverse of DOM paint order.
    if(result.children.some(c=>typeof c==='object' && c.style.position==='absolute'))result.children.reverse();
    if(result.tag==='img'){delete result.style.width;delete result.style.height;delete result.style.maxWidth;}
    return result;
  }
  let root;function visit(n){if(ts.isReturnStatement(n)&&n.expression){let e=n.expression;if(ts.isParenthesizedExpression(e))e=e.expression;root=convert(e);}ts.forEachChild(n,visit);}visit(source);
  return root;
}
const scenes={pipeline:scene('5718'),timeline:scene('5396'),grid:scene('5054'),dots:scene('4713'),mobile:scene('6137')};
// Figma snippets are literal objects. Preserve their values and easing; only normalize
// transform property names and map the original 4/8/10-second boundaries to 3/6/9.
const sourceMotion=JSON.parse(fs.readFileSync(base+'motion-context.json','utf8'));
const rename={'--motion-translate-x':'x','--motion-translate-y':'y','--motion-scale-x':'scaleX','--motion-scale-y':'scaleY'};
const remap=t=>t<=1/3?t*.75:t<=2/3?.25+(t-1/3)*.75:t<=5/6?.5+(t-2/3)*1.5:.75+(t-5/6)*1.5;
const tracks={};
for(const node of sourceMotion.nodes){
  let snippet=node.codeSnippets?.motionDev;
  if(snippet?.startsWith('// Identical')){
    const original=snippet.match(/\((\d+:\d+)\)/)?.[1];
    snippet=sourceMotion.nodes.find(n=>n.nodeId===original)?.codeSnippets?.motionDev;
  }
  if(!snippet?.includes('animate={{'))continue;
  const read=key=>Function('return ('+snippet.match(new RegExp(key+'=\\{(\\{.*?\\})\\}'))[1]+')')();
  const values=read('animate'),transitions=read('transition');
  const animation={},options={};
  for(const [key,value]of Object.entries(values)){
    const prop=rename[key]||key;animation[prop]=value;
    options[prop]={...transitions[key],times:transitions[key].times.map(remap)};
  }
  tracks[node.nodeId]={values:animation,options};
}
if(unknown.size)throw Error('Unmapped classes: '+[...unknown]);
fs.mkdirSync('public/hero-flow',{recursive:true});
fs.writeFileSync('src/heroFlowDesign.json',JSON.stringify({scenes,tracks}));
fs.writeFileSync(base+'asset-manifest.json',JSON.stringify([...assets].map(([path,url])=>({path,url})),null,2));
// These exports bake the initial hidden state into the SVG. Keep the files intact;
// inline them so the component can apply opacity at the animated wrapper instead.
const inline={};
for(const path of assets.keys()){
  const file='public'+path;
  if(fs.existsSync(file)){
    const svg=fs.readFileSync(file,'utf8');
    if(svg.includes('opacity="0"'))inline[path]=svg;
  }
}
fs.writeFileSync('src/heroFlowSvg.json',JSON.stringify(inline));
console.log({assets:assets.size,tracks:Object.keys(tracks).length});
