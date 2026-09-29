const fs=require('fs'),vm=require('vm'),assert=require('assert');
const root={innerHTML:''},modal={innerHTML:''};
const document={querySelector(s){if(s==='#app')return root;if(s==='#modal-root')return modal; if(s==='.guess-year')return null; return null;},querySelectorAll(){return[];},addEventListener(){}};
const localStorage={getItem(){return '[]'},setItem(){}};
const ctx={console,URL,Date,Math,JSON,Set,Map,Array,Object,String,Number,Boolean,decodeURIComponent,encodeURIComponent,document,localStorage,scrollTo(){},window:null,__REINAS_TEST__:true};ctx.window=ctx;
vm.createContext(ctx);vm.runInContext(fs.readFileSync('data.js','utf8'),ctx,{filename:'data.js'});vm.runInContext(fs.readFileSync('app.js','utf8'),ctx,{filename:'app.js'});
const out={sections:{},games:{}};
for(const section of ['home','discover','jujuy','gallery','coronations','maps','statistics','play','collection','sources']){
  ctx.REINAS_TEST_API.setSection(section); out.sections[section]=root.innerHTML;
}
for(const id of ['missing-year','connect','hidden-year','mystery-province','mystery-department','mystery-school','two-queens','intruder','seconds','clues','lost-archive','photo-chronology','photo-memory','hidden-coronation']){
  const q=ctx.REINAS_ENGINE.generateGame(id); out.games[id]=q.ui();
}
fs.writeFileSync('research/verification/ui-render-samples.json',JSON.stringify(out,null,2));
console.log('WROTE ui-render-samples.json');
