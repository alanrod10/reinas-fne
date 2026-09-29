const fs = require('fs');
const vm = require('vm');
const assert = require('assert');
const ctx = {URL}; ctx.window = ctx; vm.createContext(ctx); vm.runInContext(fs.readFileSync('./data.js','utf8'),ctx);
const D=ctx.ARCHIVE_DATA; const N=D.national, J=D.jujuy;
const errors=[];
function eq(label,a,b){if(JSON.stringify(a)!==JSON.stringify(b))errors.push(`${label}: esperado ${JSON.stringify(b)}; obtenido ${JSON.stringify(a)}`)}
eq('Nacional',N.map(r=>[r.year,r.name,r.province,r.status]),[
[2010,'Candela Berbel','Mendoza','elected'],[2011,'Ailén Macarena Sciutto','Misiones','elected'],[2012,'Carla Lucía Romanini','Mendoza','elected'],[2013,'Victoria Colovatti','Mendoza','elected'],[2014,'Carolina Vanesa Silva','Chubut','elected'],[2015,'Valentina Oller Brezina','Jujuy','elected'],[2016,'María Cielo Pacheco','Santiago del Estero','elected'],[2017,'Ámbar Luna Saad','Jujuy','elected'],[2018,'Victoria Telecher','Santa Fe','elected'],[2019,'Camila Iglesias','Ciudad Autónoma de Buenos Aires','elected'],[2020,null,null,'no-election'],[2021,'Pía Yécora','Jujuy','elected'],[2022,'Tiziana Vignolles','Misiones','elected'],[2023,'Josefina Astorga','Tucumán','elected'],[2024,'Martina Rauschenberger','La Pampa','elected'],[2025,'Sofía Alanís Masino','Ciudad Autónoma de Buenos Aires','elected'],[2026,'Constanza Lastra Errasti','Santiago del Estero','elected']
]);
eq('Jujuy',J.map(r=>[r.year,r.name,r.school,r.department,r.region,r.status]),[
[2010,'María Sol Gutiérrez Mora',null,'San Pedro',null,'elected'],[2011,'Iris del Valle Yáñez','Colegio Nuestra Señora de las Mercedes','El Carmen',null,'elected'],[2012,'María Macarena García Melano','Colegio Jesús Maestro','San Pedro',null,'elected'],[2013,'Valentina Mammana','E.E.T./ENET Nº 1 “Escolástico Zegada”','Dr. Manuel Belgrano',null,'elected'],[2014,'Florencia Cardarelli','Colegio Martín Pescador','Dr. Manuel Belgrano',null,'elected'],[2015,'Valentina Oller Brezina','Colegio Nueva Siembra','Dr. Manuel Belgrano',null,'elected'],[2016,'Manuela Poma','Complejo Educativo José Hernández','Dr. Manuel Belgrano',null,'elected'],[2017,'Ámbar Luna Saad','Colegio Secundario de Arte Nº 49','Tilcara','Quebrada','elected'],[2018,'Luciana Garzón Giacoppo','Colegio Nuestra Señora de las Mercedes','El Carmen','Valles','elected'],[2019,'Mikaela Viscarra','Colegio San Patricio','El Carmen','Valles','elected'],[2020,null,null,null,null,'no-election'],[2021,'Pía Yécora','Colegio Los Lapachos','Dr. Manuel Belgrano','Valles','elected'],[2022,'Rocío Montiel','Colegio Nueva Siembra','Dr. Manuel Belgrano','Valles','elected'],[2023,'María Paz Jure','Complejo Educativo José Hernández','Dr. Manuel Belgrano','Valles','elected'],[2024,'Josefina Blanco','Escuela Técnica Herminio Arrieta','Ledesma','Yungas','elected'],[2025,'María Victoria Zamar','Colegio Santa Bárbara','Dr. Manuel Belgrano','Valles','elected'],[2026,'Morella Gira López','Colegio Secundario Nº 56','El Carmen','Valles','elected']
]);
const unresolved=J.filter(r=>r.status==='elected'&&!r.school).map(r=>r.id); eq('Único colegio no confirmado',unresolved,['j2010']);
eq('Elecciones efectivas',N.concat(J).filter(r=>r.status==='elected').length,32);
eq('Imágenes verificadas directas',D.imageCatalog.filter(i=>i.verified).length,31);
const elected=[...N,...J].filter(r=>r.status==='elected');
const photoAssociated=elected.filter(r=>(r.imageIds||[]).length).length;
eq('Elecciones con fuente fotográfica asociada',photoAssociated,32);
const imageRecords=new Set(D.imageCatalog.filter(i=>i.verified).map(i=>i.recordId));
if([...imageRecords].some(id=>![...N,...J].some(r=>r.id===id))) errors.push('Hay imagen ligada a record inexistente');
for(const r of [...N,...J]){
  if(r.status==='elected' && !r.fieldEvidence)errors.push(`${r.id}: fieldEvidence ausente`);
  if((r.sourceIds||[]).some(id=>{const s=D.sources.find(x=>x.id===id); if(!s)return true; try{return new URL(s.url).pathname==='/'||new URL(s.url).pathname===''}catch{return true}})) errors.push(`${r.id}: usa fuente de portada`);
}
console.log(JSON.stringify({ok:errors.length===0,errors,summary:{national:17,jujuy:17,elections:32,verifiedImages:31,photoAssociated:32}},null,2));
process.exitCode=errors.length?1:0;
