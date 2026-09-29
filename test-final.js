const fs=require('fs'), vm=require('vm'), assert=require('assert');
const ctx={console,URL,Date,Math,JSON,Set,Map,Array,Object,String,Number,Boolean,decodeURIComponent,encodeURIComponent,localStorage:{getItem(){return '[]'},setItem(){}},document:{querySelector(){return null},querySelectorAll(){return[]},addEventListener(){}},window:null,__REINAS_TEST__:true};
ctx.window=ctx; vm.createContext(ctx);
vm.runInContext(fs.readFileSync('data.js','utf8'),ctx,{filename:'data.js'});
vm.runInContext(fs.readFileSync('app.js','utf8'),ctx,{filename:'app.js'});
const D=ctx.ARCHIVE_DATA,E=ctx.REINAS_ENGINE,N=D.national,J=D.jujuy;
assert.equal(N.length,17); assert.equal(J.length,17);
assert.equal([...N,...J].filter(r=>r.status==='elected').length,32);
assert.equal(N.find(r=>r.year===2020).status,'no-election');
assert.equal(J.find(r=>r.year===2020).status,'no-election');
assert.equal(J.find(r=>r.year===2010).school,null);
assert.equal(D.imageCatalog.filter(i=>i.verified).length,31); assert.equal(D.imageCatalog.length,32); assert.equal([...N,...J].filter(r=>r.status==='elected').filter(r=>(r.imageIds||[]).length).length,32); assert.equal(D.imageCatalog.filter(i=>i.sourcePreviewUrl).length,1);
for(let i=0;i<50;i++){
 const q=E.generateGame('two-queens'); const ys=[...(q.prompt.matchAll(/\((\d{4})\)/g))].map(m=>m[1]); if(ys.length===2) assert.notEqual(ys[0],ys[1]);
 const c=E.generateGame('connect'); assert.equal(c.pairs.length,4); assert(c.ui().includes('data-match-left=')&&c.ui().includes('data-match-right='));
 const h=E.generateGame('hidden-coronation'); assert.equal(h.revealStep,0); assert(h.ui().includes('reveal-photo'));
}
console.log('PASS FINAL: dataset + integrity + 50x game generation');
