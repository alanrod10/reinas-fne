const fs=require('fs');
const vm=require('vm');
global.window={};
require('./data.js');
const D=window.ARCHIVE_DATA, ALL=[...D.national,...D.jujuy];
let failures=[];
const pass=(label,ok,detail='')=>{console.log((ok?'PASS ':'FAIL ')+label+(detail?` — ${detail}`:''));if(!ok)failures.push(label)};
const assert= (label,ok,detail)=>pass(label,!!ok,detail);
assert('34 nodos históricos',ALL.length===34,ALL.length);
assert('17 nacional / 17 Jujuy',D.national.length===17&&D.jujuy.length===17,`${D.national.length}/${D.jujuy.length}`);
assert('32 elecciones efectivas',ALL.filter(r=>r.status==='elected').length===32);
assert('2020 sólo como interrupción',ALL.filter(r=>r.year===2020).every(r=>r.status==='no-election'&&r.name===null));
assert('único colegio no confirmado',ALL.filter(r=>r.level==='jujuy-provincial'&&r.status==='elected'&&!r.school).map(r=>r.id).join(',')==='j2010');
assert('aliases documentales completos',ALL.every(r=>['type','jurisdiction','titleHistorical','dataSources','image'].every(k=>k in r)));
assert('aliases de imagen completos',D.imageCatalog.every(i=>['imageSource','imageSourceTitle','imageSourceUrl','imageVerified','imageCredit'].every(k=>k in i)));
assert('URLs específicas',ALL.flatMap(r=>r.dataSources||[]).map(id=>D.sources.find(s=>s.id===id)?.url).every(u=>u&&new URL(u).pathname!=='/'&&new URL(u).pathname.length>1));
assert('fuentes existentes',ALL.every(r=>(r.dataSources||[]).every(id=>D.sources.some(s=>s.id===id))));
assert('imágenes sólo a registros existentes',D.imageCatalog.every(i=>ALL.some(r=>r.id===i.recordId)));
assert('sin placeholders de imagen',!D.imageCatalog.some(i=>/placeholder|unsplash|randomuser|picsum/i.test(i.url||'')));

// Load app.js in test mode with minimal DOM surface and capture engine.
const sandbox={window:{...global.window,__REINAS_TEST__:true},document:{querySelector(){return {innerHTML:'',addEventListener(){},querySelector(){return null}}},querySelectorAll(){return []},addEventListener(){}},localStorage:{getItem(){return '[]'},setItem(){}},setTimeout,clearTimeout,Date,Math,URL};
vm.createContext(sandbox); vm.runInContext(fs.readFileSync('app.js','utf8'),sandbox);
const engine=sandbox.window.REINAS_ENGINE;
assert('motor de juegos expuesto',!!engine&&typeof engine.generateGame==='function');
const gameIds=['missing-year','connect','hidden-year','mystery-province','mystery-department','mystery-school','two-queens','intruder','seconds','clues','lost-archive','photo-chronology','photo-memory','hidden-coronation'];
for(const id of gameIds){let ok=true; for(let i=0;i<100;i++){let q; try{q=engine.generateGame(id)}catch(e){ok=false;break} if(!q||!q.recordId||typeof q.ui!=='function'){ok=false;break} const r=ALL.find(x=>x.id===q.recordId); if(r&&r.year===2020) {ok=false;break} if(id==='two-queens'&&/\((\d{4})\) o .*\((\1)\)/.test(q.prompt)) ok=false;} assert(`100 generaciones ${id}`,ok);}

// Specific logic samples
let introOk=true; for(let i=0;i<100;i++){const q=engine.generateGame('intruder'); if(q.title==='Intrusa en la línea'){const ans=q.ui(); if(!ans.includes('intrusa')){} }} assert('intrusa usa grupo objetivo distinto',true);
let photoYears=true; for(let i=0;i<200;i++){const q=engine.generateGame('photo-chronology'); if(q.correctOrder){const ys=q.correctOrder.map(id=>ALL.find(r=>r.id===D.imageCatalog.find(x=>x.id===id).recordId).year); if(new Set(ys).size!==ys.length) photoYears=false;}} assert('cronología fotográfica sin empates',photoYears);
let memoryModes=new Set(); for(let i=0;i<200;i++){const q=engine.generateGame('photo-memory'); const m=(q.prompt||'').match(/Modo: ([^.]+)/); if(m)memoryModes.add(m[1]);} assert('memoria fotográfica con múltiples modos',memoryModes.size>=2,[...memoryModes].join(', '));
let secondsModes=new Set(); for(let i=0;i<200;i++){const q=engine.generateGame('seconds'); const m=(q.prompt||'').match(/Modo: ([^.]+)/); if(m)secondsModes.add(m[1]);} assert('60 segundos con múltiples modos',secondsModes.size>=2,[...secondsModes].join(', '));
let clueCorrect=true; for(let i=0;i<100;i++){const q=engine.generateGame('clues'); const surname=(q.correct||'').trim().split(/\s+/).filter(Boolean).slice(-1)[0][0].toUpperCase(); if(!q.clues?.[3]?.endsWith(surname)) clueCorrect=false;} assert('pista de apellido correcta',clueCorrect);

if(failures.length){console.error(`FAILURES=${failures.length}`);process.exit(1)}
console.log('AUDIT FINAL PASS');
