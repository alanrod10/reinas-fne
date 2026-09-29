const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

// 1. Sandbox setup
let modalHtml = '';
const doc = {
  querySelector(sel) {
    if (sel === '#modal-root') return { set innerHTML(val) { modalHtml = val; }, get innerHTML() { return modalHtml; } };
    if (sel === '#app') return { innerHTML: '', addEventListener() {} };
    return { innerHTML: '', addEventListener() {}, querySelector() { return null; } };
  },
  querySelectorAll() { return []; },
  addEventListener() {}
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
  localStorage: { getItem() { return '[]'; }, setItem() {} },
  document: doc,
  window: null,
  __REINAS_TEST__: true,
  setTimeout,
  clearTimeout
};
ctx.window = ctx;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('data.js', 'utf8'), ctx, { filename: 'data.js' });
const appCode = fs.readFileSync('app.js', 'utf8').replace('window.REINAS_ENGINE={', 'window.REINAS_ENGINE={openRecord,photoTaxonomyLabel,');
vm.runInContext(appCode, ctx, { filename: 'app.js' });

const D = ctx.window.ARCHIVE_DATA;
const E = ctx.window.REINAS_ENGINE;
const ALL = [...D.national, ...D.jujuy];

const errors = [];
function check(label, cond, detail = '') {
  if (!cond) errors.push(`${label}${detail ? ' — ' + detail : ''}`);
}

// 2. Audit ceremony evidence invariants on dataset
const nationalCases = ['n2010','n2012','n2013','n2015','n2016','n2017','n2018','n2019','n2021','n2022','n2023','n2026'];

for (const r of ALL) {
  if (r.ceremonyEvidencePresent) {
    const c = r.ceremonyEvidence;
    check(`${r.id}: tiene ceremonyEvidence`, !!c);
    check(`${r.id}: ceremonyEvidenceVerified debe ser true`, r.ceremonyEvidenceVerified === true);
    check(`${r.id}: evidencia tiene tipo`, !!c.type);
    check(`${r.id}: evidencia tiene título de fuente`, !!(c.sourceTitle || c.source));
    check(`${r.id}: categoría es coronation`, c.category === 'coronation');
    check(`${r.id}: persona coincide`, c.persona === r.name);
    check(`${r.id}: año coincide`, c.year === r.year);

    if (c.sourceUrl) {
      try {
        const u = new URL(c.sourceUrl);
        check(`${r.id}: URL específica`, u.pathname !== '/' && u.pathname.length > 1);
      } catch (err) {
        check(`${r.id}: URL válida`, false, err.message);
      }
    }

    if (c.timestamp !== null) {
      check(`${r.id}: timestamp formato HH:MM:SS o MM:SS`, /^\d{2}:\d{2}(:\d{2})?$/.test(c.timestamp));
    }

    if (c.type === 'exact-photo') {
      check(`${r.id}: exact-photo tiene foto coronation`, r.photoType === 'coronation');
    }
    if (c.type === 'video-frame') {
      check(`${r.id}: video-frame no convierte foto principal a coronation`, r.photoType !== 'coronation');
    }
  } else {
    check(`${r.id}: ceremonyEvidence nulo`, r.ceremonyEvidence === null);
    check(`${r.id}: ceremonyEvidenceVerified falso`, r.ceremonyEvidenceVerified === false);
    check(`${r.id}: ceremonyEvidenceType nulo`, r.ceremonyEvidenceType === null);
    check(`${r.id}: ceremonyEvidenceSource nulo`, r.ceremonyEvidenceSource === null);
  }
}

const withCeremony = ALL.filter(r => r.ceremonyEvidencePresent).map(r => r.id);
check('Exactamente 12 casos con evidencia ceremonial', withCeremony.length === 12);
check('Casos nacionales autorizados', JSON.stringify(withCeremony.sort()) === JSON.stringify(nationalCases.sort()));

// 3. UI checks via openRecord
for (const id of nationalCases) {
  modalHtml = '';
  E.openRecord(id);
  const r = ALL.find(x => x.id === id);
  check(`${id} UI: contiene MOMENTO DE LA CORONACIÓN`, modalHtml.includes('MOMENTO DE LA CORONACIÓN'));
  check(`${id} UI: contiene FOTOGRAFÍA PRINCIPAL`, modalHtml.includes('FOTOGRAFÍA PRINCIPAL'));
  check(`${id} UI: contiene etiqueta visual`, modalHtml.includes('CLASIFICACIÓN VISUAL'));
  check(`${id} UI: contiene estado verificado`, modalHtml.includes('✓ EVIDENCIA VERIFICADA'));
  if (r.ceremonyEvidence.sourceUrl) {
    check(`${id} UI: contiene enlace a fuente`, modalHtml.includes('Ver fuente ceremonial'));
  } else {
    check(`${id} UI: contiene limitación sin enlace roto`, modalHtml.includes('source-limitation') && !modalHtml.includes('href="null"'));
  }
}

for (const id of ['n2014', 'n2020', 'j2012']) {
  modalHtml = '';
  E.openRecord(id);
  check(`${id} UI: NO contiene MOMENTO DE LA CORONACIÓN`, !modalHtml.includes('MOMENTO DE LA CORONACIÓN'));
  check(`${id} UI: NO contiene botones rotos de ceremonial`, !modalHtml.includes('Ver fuente ceremonial'));
}

modalHtml = '';
E.openRecord('j2010');
const j2010 = ALL.find(r => r.id === 'j2010');
check('j2010: colegio nulo', j2010.school === null);
check('j2010: parcialmente verificado', j2010.recordStatus === 'PARTIALLY_VERIFIED');
check('j2010: foto source-preview', j2010.photoType === 'source-preview');
check('j2010: NO muestra MOMENTO DE LA CORONACIÓN', !modalHtml.includes('MOMENTO DE LA CORONACIÓN'));
check('j2010: muestra EVIDENCIA DOCUMENTAL SECUNDARIA', modalHtml.includes('EVIDENCIA DOCUMENTAL SECUNDARIA'));

const j2011 = ALL.find(r => r.id === 'j2011');
check('j2011: photoType es official-event', j2011.photoType === 'official-event');

if (errors.length) {
  console.error(`FAIL: ${errors.length} errores detectados en la auditoría ceremonial:`);
  errors.forEach(e => console.error('  - ' + e));
  process.exit(1);
} else {
  console.log('PASS AUDITORÍA CEREMONIAL: 12 casos auditados, separación fotográfica estricta, URLs validadas y UI verificada.');
}
