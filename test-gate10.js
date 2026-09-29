const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

const window = {
  __REINAS_TEST__: true,
  localStorage: {
    _v: '[]',
    getItem(){ return this._v; },
    setItem(_k,v){ this._v=v; }
  }
};
window.window = window;
window.document = {
  querySelector(){ return null; },
  querySelectorAll(){ return []; }
};
const context = vm.createContext({ window, document: window.document, localStorage: window.localStorage, console, Math, JSON, Set, Array, String, Number, Object, Date, encodeURIComponent, decodeURIComponent, URL });
vm.runInContext(fs.readFileSync('data.js','utf8'), context, {filename:'data.js'});
vm.runInContext(fs.readFileSync('app.js','utf8'), context, {filename:'app.js'});
const DATA = context.window.ARCHIVE_DATA;
const E = context.window.REINAS_ENGINE;

function test(name, fn){
  try { fn(); console.log('PASS', name); }
  catch(err){ console.error('FAIL', name, '\n ', err.message); process.exitCode=1; }
}

test('cobertura de años 2010–2026 en ambos niveles', ()=>{
  const years = Array.from({length:17},(_,i)=>2010+i);
  assert.equal(JSON.stringify(DATA.national.map(r=>r.year)), JSON.stringify(years));
  assert.equal(JSON.stringify(DATA.jujuy.map(r=>r.year)), JSON.stringify(years));
});

test('2020 es no-election y no persona', ()=>{
  for (const arr of [DATA.national, DATA.jujuy]) {
    const r=arr.find(x=>x.year===2020);
    assert.equal(r.status,'no-election');
    assert.equal(r.name,null);
  }
});

test('sin IDs duplicados', ()=>{
  const ids=[...DATA.national,...DATA.jujuy].map(r=>r.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('todas las fuentes referenciadas existen y no hay URLs vacías', ()=>{
  const known=new Set(DATA.sources.map(s=>s.id));
  for(const r of [...DATA.national,...DATA.jujuy]){
    assert(r.sourceIds.length>0, `${r.id} sin fuentes`);
    r.sourceIds.forEach(id=>assert(known.has(id), `${r.id} -> ${id} inexistente`));
  }
});

test('único campo escolar deliberadamente no confirmado', ()=>{
  const unresolved=DATA.jujuy.filter(r=>r.status==='elected' && !r.school);
  assert.equal(JSON.stringify(unresolved.map(r=>r.id)), JSON.stringify(['j2010']));
});

test('no hay fotografías verificadas colgando de records inexistentes', ()=>{
  const ids=new Set([...DATA.national,...DATA.jujuy].map(r=>r.id));
  for(const img of DATA.imageCatalog){
    assert(ids.has(img.recordId), `${img.id} recordId inválido`);
    assert(DATA.sources.some(s=>s.id===img.sourceId), `${img.id} sourceId inválido`);
  }
});

test('estadística base consistente', ()=>{
  const all=[...DATA.national,...DATA.jujuy];
  const s=E.statsFor(all);
  assert.equal(s.elections,32);
  assert.equal(s.years,17);
  assert.equal(s.breaks,2);
});

const games=['missing-year','connect','hidden-year','mystery-province','mystery-department','mystery-school','two-queens','intruder','seconds','clues','lost-archive','photo-chronology','photo-memory','hidden-coronation'];
test('todos los juegos de datos generan una pregunta con respuesta', ()=>{
  for(const id of games){
    for(let i=0;i<10;i++){
      const q=E.generateGame(id);
      assert(q && (q.recordId || id==='photo-chronology'), `${id} no devuelve recordId`);
      assert(q.title && q.prompt, `${id} incompleto`);
      assert(typeof q.ui==='function', `${id} no devuelve UI`);
      const html=q.ui();
      if(id==='connect'){ assert(/data-match-left=/.test(html), `${id} sin columna de representantes`); assert(/data-match-right=/.test(html), `${id} sin columna de colegios`); assert(/data-action="check-connections"/.test(html), `${id} sin comprobación`); }
      else if(id==='photo-chronology'){ assert(/data-photo-order/.test(html), `${id} sin interfaz de ordenamiento`); assert(/data-action="check-photo-order"/.test(html), `${id} sin comprobación`); } else if(id==='hidden-year'){ assert(/data-hidden-year/.test(html), `${id} sin línea temporal deslizante`); assert(/data-action="check-hidden-year"/.test(html), `${id} sin comprobación`); } else { assert(/answer-btn/.test(html), `${id} sin botones de respuesta`); assert(/data-correct=/.test(html), `${id} sin respuesta correcta codificada`); assert((html.match(/class="answer-btn/g)||[]).length>=2, `${id} tiene menos de 2 opciones`); }
    }
  }
});

test('los juegos escolares no usan a María Sol 2010', ()=>{
  for(let i=0;i<20;i++){
    const q=E.generateGame('mystery-school');
    assert.notEqual(q.recordId,'j2010');
  }
});

test('fuente canónica de variantes clave conservada', ()=>{
  const n2015=DATA.national.find(r=>r.year===2015);
  assert.equal(n2015.name,'Valentina Oller Brezina');
  assert(n2015.variants.includes('Valentina Oller'));
  const n2024=DATA.national.find(r=>r.year===2024);
  assert(n2024.variants.includes('Martina Rauschemberger'));
  const j2026=DATA.jujuy.find(r=>r.year===2026);
  assert(j2026.variants.includes('Morella Kiara Gira López'));
});

test('ninguna fuente de producción apunta sólo al dominio raíz sin ruta específica', ()=>{
  const used = new Set([...DATA.national,...DATA.jujuy].flatMap(r=>r.sourceIds||[]));
  const roots = DATA.sources.filter(s=>used.has(s.id)).filter(s=>{
    try { const u=new URL(s.url); return u.pathname==='/' || u.pathname===''; } catch { return true; }
  });
  if(roots.length) throw new Error(`${roots.length} fuentes son de entrada general: ${roots.map(x=>x.id).join(', ')}`);
});


test('cada registro expone estado de verificación coherente', ()=>{
  for(const r of [...DATA.national,...DATA.jujuy]){
    assert(['VERIFIED','PARTIALLY_VERIFIED'].includes(r.recordStatus), `${r.id} recordStatus inválido`);
    if(r.id==='j2010') assert.equal(r.recordStatus,'PARTIALLY_VERIFIED');
  }
});

test('cartografía centralizada y fuentes cartográficas presentes', ()=>{
  assert(DATA.geography && Array.isArray(DATA.geography.nationalProvinces) && DATA.geography.nationalProvinces.length===24, 'faltan provincias en geography');
  assert(DATA.geography && Array.isArray(DATA.geography.jujuyDepartments) && DATA.geography.jujuyDepartments.length===16, 'faltan departamentos de Jujuy');
  assert(DATA.maps?.national?.imageUrl && DATA.maps?.jujuy?.imageUrl, 'faltan mapas');
  for(const sid of DATA.geography.sourceIds) assert(DATA.sources.some(s=>s.id===sid), `fuente cartográfica inexistente: ${sid}`);
  for(const sid of [DATA.maps.national.sourceId,DATA.maps.jujuy.sourceId]) assert(DATA.sources.some(s=>s.id===sid), `fuente de mapa inexistente: ${sid}`);
});

test('todos los juegos fotográficos consumen fotografías verificadas', ()=>{
  const photoIds=new Set(DATA.imageCatalog.filter(i=>i.verified).map(i=>i.id));
  assert(photoIds.size>=3,'se necesitan al menos tres fotografías verificadas');
  const src=fs.readFileSync('app.js','utf8');
  assert(src.includes('photo-chronology')&&src.includes('photo-memory')&&src.includes('hidden-coronation'),'faltan juegos fotográficos');
});
test('60 segundos implementa contador y métricas requeridas', ()=>{ const src=fs.readFileSync('app.js','utf8'); assert(src.includes('60000'),'falta ventana de 60000 ms'); assert(src.includes('game-time'),'falta contador visible'); assert(src.includes('state.hits')&&src.includes('state.errors')&&src.includes('state.streak'),'faltan métricas'); });

process.exit(process.exitCode || 0);
