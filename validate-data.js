const fs = require('fs');
const vm = require('vm');
const data = fs.readFileSync('./data.js','utf8');
const ctx = {URL}; ctx.window = ctx; vm.createContext(ctx); vm.runInContext(data,ctx);
const D = ctx.ARCHIVE_DATA;
const errors=[], warnings=[];
const all=[...D.national,...D.jujuy];
const ids=all.map(r=>r.id);
if(D.national.length!==17) errors.push(`Nacional: ${D.national.length} registros; esperado 17`);
if(D.jujuy.length!==17) errors.push(`Jujuy: ${D.jujuy.length} registros; esperado 17`);
if(new Set(ids).size!==ids.length) errors.push('Hay IDs de registros duplicados.');
for(const r of all){
  if(!D.sources.length && r.sourceIds?.length) errors.push(`${r.id}: tiene sourceIds pero no hay fuentes`);
  for(const sid of r.sourceIds||[]) if(!D.sources.some(s=>s.id===sid)) errors.push(`${r.id}: fuente inexistente ${sid}`);
  if(!Number.isInteger(r.year)||r.year<2010||r.year>2026) errors.push(`${r.id}: año inválido`);
  if(r.status==='elected' && !r.name) errors.push(`${r.id}: elegido sin nombre`);
  if(r.level==='jujuy-provincial' && r.year!==2020 && r.status==='elected' && !r.department) errors.push(`${r.id}: Jujuy elegido sin departamento`);
  if(r.level==='national' && r.school) errors.push(`${r.id}: nacional no debería tener school`);
}
const j2020=D.jujuy.find(r=>r.year===2020), n2020=D.national.find(r=>r.year===2020);
if(!j2020 || j2020.status!=='no-election') errors.push('Jujuy 2020 no está marcado como no-election.');
if(!n2020 || n2020.status!=='no-election') errors.push('Nacional 2020 no está marcado como no-election.');
if(D.jujuy.find(r=>r.year===2010)?.school) errors.push('Jujuy 2010: el colegio de María Sol no debería estar completado.');
if(all.filter(r=>r.status==='elected').length!==32) errors.push(`Elecciones efectivas: ${all.filter(r=>r.status==='elected').length}; esperado 32`);
const usedSourceIds=new Set(all.flatMap(r=>r.sourceIds||[]));
for(const sid of usedSourceIds){
  const src=D.sources.find(s=>s.id===sid);
  if(!src) continue;
  try { const u=new URL(src.url); if(u.pathname==='/'||u.pathname==='') errors.push(`Fuente ${sid}: URL demasiado general`); } catch { errors.push(`Fuente ${sid}: URL inválida`); }
}
for(const r of all){
  if(r.status==='elected' && !r.fieldEvidence) errors.push(`${r.id}: falta fieldEvidence`);
  if(r.fieldEvidence){
    for(const [field,sids] of Object.entries(r.fieldEvidence)){
      if(!Array.isArray(sids)||!sids.length) errors.push(`${r.id}: fieldEvidence.${field} vacío`);
      for(const sid of sids||[]) if(!usedSourceIds.has(sid)) errors.push(`${r.id}: fieldEvidence.${field} apunta a fuente no usada`);
    }
  }
}

const imgIds=(D.imageCatalog||[]).map(i=>i.id);
if(new Set(imgIds).size!==imgIds.length) errors.push('Hay imageIds duplicados.');
for(const img of D.imageCatalog||[]) if(!all.some(r=>r.id===img.recordId)) errors.push(`Imagen ${img.id}: recordId inexistente`);
console.log(JSON.stringify({ok:errors.length===0,errors,warnings,counts:{national:D.national.length,jujuy:D.jujuy.length,elections:all.filter(r=>r.status==='elected').length,images:(D.imageCatalog||[]).length}},null,2));
process.exitCode=errors.length?1:0;
