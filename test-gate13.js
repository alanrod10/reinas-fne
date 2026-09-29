const fs=require('fs'); const vm=require('vm'); const assert=require('assert');
const files=['index.html','app.js','data.js','styles.css','manifest.webmanifest','sw.js'];
for(const f of files) assert(fs.existsSync(f),`falta ${f}`);
const root={innerHTML:''}; const modal={innerHTML:''};
const document={
  querySelector(s){if(s==='#app')return root;if(s==='#modal-root')return modal;return null},
  querySelectorAll(){return[]},
  addEventListener(){}
};
const storage=new Map();
const localStorage={getItem(k){return storage.get(k)||null},setItem(k,v){storage.set(k,String(v))}};
const ctx={console,URL,Date,Math,JSON,Set,Map,Array,Object,String,Number,Boolean,decodeURIComponent,encodeURIComponent,localStorage,document,scrollTo(){},window:null,__REINAS_TEST__:true};
ctx.window=ctx;vm.createContext(ctx);
vm.runInContext(fs.readFileSync('data.js','utf8'),ctx,{filename:'data.js'});
vm.runInContext(fs.readFileSync('app.js','utf8'),ctx,{filename:'app.js'});
assert(ctx.REINAS_TEST_API,'missing test api');
ctx.REINAS_TEST_API.setSection('statistics');
assert(root.innerHTML.includes('ESTADÍSTICAS HISTÓRICAS'),'statistics page missing');
assert(root.innerHTML.includes('Reinas por provincia'),'national statistics missing');
assert(root.innerHTML.includes('Representantes por departamento'),'jujuy statistics missing');
assert(!root.innerHTML.includes('undefined'),'statistics contains undefined');
const html=fs.readFileSync('index.html','utf8');
assert(html.includes('manifest.webmanifest'),'manifest not linked');
assert(html.includes('serviceWorker.register'),'service worker not registered');
const manifest=JSON.parse(fs.readFileSync('manifest.webmanifest','utf8')); assert(manifest.name&&manifest.start_url&&manifest.display,'manifest incomplete');
const sw=fs.readFileSync('sw.js','utf8'); assert(sw.includes('cache')&&sw.includes('fetch'),'service worker incomplete');
const data=ctx.ARCHIVE_DATA; assert.equal(data.imageCatalog.filter(i=>i.verified).length,31); assert.equal(data.imageCatalog.length,32); assert.equal(data.imageCatalog.filter(i=>i.sourcePreviewUrl).length,1);
console.log('PASS Gate 13: estadísticas + PWA + catálogo fotográfico + render');
