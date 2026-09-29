const fs=require('fs'); const vm=require('vm'); const assert=require('assert');
const ctx={console,URL,Date,Math,JSON,Set,Map,Array,Object,String,Number,Boolean,decodeURIComponent,encodeURIComponent,localStorage:{getItem(){return '[]'},setItem(){}},document:{querySelector(){return null},querySelectorAll(){return[]},addEventListener(){}},window:null,__REINAS_TEST__:true};ctx.window=ctx;vm.createContext(ctx);
vm.runInContext(fs.readFileSync('data.js','utf8'),ctx,{filename:'data.js'});vm.runInContext(fs.readFileSync('app.js','utf8'),ctx,{filename:'app.js'});
const E=ctx.REINAS_ENGINE;
for(let i=0;i<20;i++){
  const q=E.generateGame('clues'); assert(q.clues.length===5,'clues not progressive'); assert(q.ui().includes('reveal-clue'),'clues missing reveal control');
  const l=E.generateGame('lost-archive'); assert(l.revealStep===0,'lost archive must start hidden'); assert(l.ui().includes('reveal-photo'),'lost archive missing reveal control');
}
const src=fs.readFileSync('app.js','utf8');
assert(src.includes('style="filter:blur('),'lost archive lacks visual masking');
assert(src.includes('cluePts'),'clue scoring not differentiated');
console.log('PASS Gate 15: pistas progresivas + archivo perdido con revelado por etapas');
