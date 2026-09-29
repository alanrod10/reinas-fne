const fs=require('fs'),vm=require('vm'),assert=require('assert');
let appEl={innerHTML:''};
const doc={
  querySelector(sel){ if(sel==='#app') return appEl; if(sel==='#modal-root') return {innerHTML:''}; return null; },
  querySelectorAll(){return[]},
  addEventListener(){}
};
const ctx={console,URL,Date,Math,JSON,Set,Map,Array,Object,String,Number,Boolean,decodeURIComponent,encodeURIComponent,localStorage:{getItem(){return '[]'},setItem(){}},document:doc,window:null,__REINAS_TEST__:true,setTimeout,clearTimeout};
ctx.window=ctx; vm.createContext(ctx);
vm.runInContext(fs.readFileSync('data.js','utf8'),ctx,{filename:'data.js'});
vm.runInContext(fs.readFileSync('app.js','utf8'),ctx,{filename:'app.js'});
const D=ctx.ARCHIVE_DATA, api=ctx.REINAS_TEST_API;
assert(api);
const state=()=>ctx.REINAS_TEST_API.state();
// Canonical historical nomenclature semantics
assert.equal(D.national.find(r=>r.year===2019).titleHistorical,'Reina Nacional de los Estudiantes');
assert.equal(D.national.find(r=>r.year===2021).titleHistorical,'Representante Nacional de los Estudiantes');
assert.equal(D.national.find(r=>r.year===2020).titleHistorical,'Interrupción histórica');
assert.equal(D.jujuy.find(r=>r.year===2017).titleHistorical,'Reina Provincial de los Estudiantes');
assert.equal(D.jujuy.find(r=>r.year===2021).titleHistorical,'Representante de la Provincia de Jujuy');
assert.equal(D.jujuy.find(r=>r.year===2022).titleHistorical,'Representante Provincial de Jujuy');
// Image metadata exact fields and rights semantics
assert(D.imageCatalog.every(i=>i.imageSource && i.imageSourceUrl && i.imageSourceTitle));
assert.equal(D.imageCatalog.filter(i=>i.imageVerified===true).length,31); assert.equal(D.imageCatalog.filter(i=>i.sourcePreviewUrl&&!i.imageVerified).length,1); assert(D.imageCatalog.filter(i=>i.imageVerified===true).every(i=>i.rightsStatus==='unknown')); assert(D.imageCatalog.filter(i=>i.sourcePreviewUrl&&!i.imageVerified).every(i=>i.rightsStatus==='unknown'));
const srcWithTitle=D.sources.filter(s=>s.title);
assert(srcWithTitle.length>=10);
// Mobile navigation exists and is closed by default
api.setSection('home');
assert(appEl.innerHTML.includes('mobile-nav-btn'));
assert(appEl.innerHTML.includes('aria-expanded="false"'));
// Open menu state is rendered through test API state object mutation not exposed; emulate by clicking via source impossible, but markup template is validated.
// Jujuy filters are present
api.setSection('jujuy');
assert(appEl.innerHTML.includes('data-jujuy-school'));
assert(appEl.innerHTML.includes('data-jujuy-department'));
assert(appEl.innerHTML.includes('data-jujuy-locality'));
// Gallery filters are present
api.setSection('gallery');
assert(appEl.innerHTML.includes('data-gallery-province'));
assert(appEl.innerHTML.includes('data-gallery-department'));
assert(appEl.innerHTML.includes('data-gallery-school'));
// 60-second generation challenge is real and varied
const qs=new Set(); for(let i=0;i<100;i++){const q=ctx.REINAS_ENGINE.generateGame('seconds'); qs.add(q.prompt.split(' · Modo: ')[1].replace(/\.$/,''));}
assert(qs.size>=2);
// Intruder always describes a specific province and has a different answer record
for(let i=0;i<100;i++){
  const q=ctx.REINAS_ENGINE.generateGame('intruder');
  assert(q.prompt.includes('comparten la provincia'));
  const bad=D.national.find(r=>r.id===q.recordId);
  assert(bad);
  // The generated bad record must come from a province different from the three-good group.
  const m=q.prompt.match(/provincia (.+?)\./);
  assert(m&&m[1]);
  assert.notEqual(bad.province,m[1]);
}
console.log('PASS DEEP FINAL: semantics + metadata + mobile + filters + game invariants');
