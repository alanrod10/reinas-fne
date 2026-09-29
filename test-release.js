const fs=require('fs'),vm=require('vm'),assert=require('assert');
const ctx={console,URL,Date,Math,JSON,Set,Map,Array,Object,String,Number,Boolean,decodeURIComponent,encodeURIComponent,localStorage:{getItem(){return '[]'},setItem(){}},document:{querySelector(){return null},querySelectorAll(){return[]},addEventListener(){}},window:null,__REINAS_TEST__:true,setTimeout,clearTimeout};ctx.window=ctx;vm.createContext(ctx);
vm.runInContext(fs.readFileSync('data.js','utf8'),ctx,{filename:'data.js'});vm.runInContext(fs.readFileSync('app.js','utf8'),ctx,{filename:'app.js'});
const D=ctx.ARCHIVE_DATA,E=ctx.REINAS_ENGINE;
assert.equal(D.national.length,17);assert.equal(D.jujuy.length,17);assert.equal(D.imageCatalog.length,32);
const all=[...D.national,...D.jujuy];
assert(all.every(r=>r.event));
assert(D.imageCatalog.every(i=>i.imageSourceTitle&&i.imageSourceUrl&&i.imageCredit));
assert(D.imageCatalog.every(i=>i.rightsStatus==='unknown'));
assert.equal(D.jujuy.find(r=>r.id==='j2010').school,null);
assert.equal(D.jujuy.find(r=>r.id==='j2010').recordStatus,'PARTIALLY_VERIFIED');
assert.equal(D.jujuy.find(r=>r.id==='j2020').recordStatus,'VERIFIED');
assert.equal(D.national.find(r=>r.id==='n2020').recordStatus,'VERIFIED');
assert(!D.national.find(r=>r.id==='n2019').titleHistorical.includes('Representante'));
assert(D.national.find(r=>r.id==='n2021').titleHistorical.includes('Representante'));
assert(D.jujuy.find(r=>r.id==='j2021').titleHistorical.includes('Representante'));
for(let i=0;i<250;i++){
 const q=E.generateGame('intruder'); assert(q.prompt.includes('comparten la provincia'));
 const q2=E.generateGame('photo-chronology'); assert(new Set(q2.correctOrder.map(id=>D.imageCatalog.find(x=>x.id===id).recordId)).size>=3);
}
const html=[];const appEl={innerHTML:''};const doc={querySelector(s){return s==='#app'?appEl:null},querySelectorAll(){return[]},addEventListener(){}};ctx.document=doc;vm.runInContext('window.REINAS_TEST_API.setSection("gallery")',ctx);assert(/data-gallery-province/.test(appEl.innerHTML));assert(/data-gallery-department/.test(appEl.innerHTML));assert(/data-gallery-school/.test(appEl.innerHTML));vm.runInContext('window.REINAS_TEST_API.setSection("jujuy")',ctx);assert(/data-jujuy-school/.test(appEl.innerHTML));assert(/data-jujuy-department/.test(appEl.innerHTML));assert(/data-jujuy-locality/.test(appEl.innerHTML));console.log('PASS RELEASE: final semantics, metadata, filters and 250x game invariants');
