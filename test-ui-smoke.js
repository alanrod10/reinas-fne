const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

const root = { innerHTML: '' };
const modal = { innerHTML: '' };
const document = {
  querySelector(selector){
    if(selector === '#app') return root;
    if(selector === '#modal-root') return modal;
    return null;
  },
  querySelectorAll(){ return []; }
};
const storage = new Map();
const localStorage = {
  getItem(k){ return storage.has(k) ? storage.get(k) : null; },
  setItem(k,v){ storage.set(k,String(v)); }
};
const ctx = {
  console,
  URL,
  Date,
  Math,
  JSON,
  Set,
  Map,
  Array,
  Object,
  String,
  Number,
  Boolean,
  decodeURIComponent,
  encodeURIComponent,
  localStorage,
  document,
  scrollTo() {},
  window: null,
  __REINAS_TEST__: true
};
ctx.window = ctx;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('./data.js','utf8'),ctx,{filename:'data.js'});
vm.runInContext(fs.readFileSync('./app.js','utf8'),ctx,{filename:'app.js'});

assert(ctx.REINAS_TEST_API, 'no se expuso API de smoke test');
const sections = [
  ['home','REINAS'],
  ['discover','Archivo general'],
  ['jujuy','Representantes, colegios y departamentos'],
  ['gallery','Fotografías documentales'],
  ['coronations','Momentos de consagración'],
  ['maps','Territorio de las elecciones'],
  ['play','El archivo convertido en experiencia'],
  ['collection','Tu archivo desbloqueable'],
  ['sources','Proveniencia']
];
for(const [section, needle] of sections){
  ctx.REINAS_TEST_API.setSection(section);
  assert(root.innerHTML.includes(needle), `${section} no renderiza el encabezado esperado`);
  assert(!root.innerHTML.includes('undefined'), `${section} contiene undefined`);
}
ctx.REINAS_TEST_API.setSection('maps');
assert(root.innerHTML.includes('data-map-tab="jujuy"'), 'atlas no presenta selector Jujuy');
assert(root.innerHTML.includes('Seleccioná una provincia o departamento'), 'atlas no presenta instrucción de interacción');
ctx.REINAS_TEST_API.setSection('discover');
assert(root.innerHTML.includes('Archivo general'), 'discover no renderiza');
console.log('PASS smoke UI de renderizado: 9 secciones navegables sin excepción');
