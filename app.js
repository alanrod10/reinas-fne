(() => {
  const DATA = window.ARCHIVE_DATA;
  const NATIONAL = DATA.national;
  const JUJUY = DATA.jujuy;
  const ALL = [...NATIONAL, ...JUJUY];
  const YEARS = Array.from({length:17},(_,i)=>2010+i);
  const state = {
    section:'home', level:'all', query:'', year:'all', selectedYear:null, galleryLevel:'all', galleryYear:'all', galleryType:'all', galleryProvince:'all', galleryDepartment:'all', gallerySchool:'all', jujuySchool:'all', jujuyDepartment:'all', jujuyLocality:'all', mapTab:'national', mapProvince:null, mapDepartment:null,
    mobileNav:false, game:null, gameQuestion:null, score:0, gameDone:false, hits:0, errors:0, streak:0, gameStartedAt:null, gameEndsAt:null, timerId:null, collection:loadCollection()
  };
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmtTitle=s=>s||'';
  const sourceById=id=>DATA.sources.find(s=>s.id===id);
  const recordStatus=r=>r.status==='no-election'?'NO ELECCIÓN':'REGISTRO';
  const levelLabel=r=>r.level==='national'?'NACIONAL':'JUJUY';
  const verifiedImage=r=>(r.imageIds||[]).map(id=>DATA.imageCatalog.find(i=>i.id===id)).find(x=>x&&x.verified);
  const sourcePreviewImage=r=>(r.imageIds||[]).map(id=>DATA.imageCatalog.find(i=>i.id===id)).find(x=>x&&x.sourcePreviewUrl);
  const anyImage=r=>verifiedImage(r)||sourcePreviewImage(r);
  const photoStatusLabel=r=>r?.status==='no-election'?'NO APLICA':(r?.photoStatus==='verified-direct'?'FOTO VERIFICADA':(r?.photoStatus==='source-preview'?'FOTO DESDE FUENTE · POR VALIDAR':'FOTO PENDIENTE'));
  const photoTaxonomyLabel=type=>{
    switch(type){
      case 'coronation': return 'CORONACIÓN EXACTA';
      case 'award': return 'PREMIACIÓN';
      case 'election': return 'ELECCIÓN';
      case 'post-coronation': return 'POST-CORONACIÓN';
      case 'official-event': return 'EVENTO OFICIAL';
      case 'source-preview': return 'PREVIEW DE FUENTE DOCUMENTAL';
      default: return type ? type.toUpperCase() : 'SIN FOTOGRAFÍA';
    }
  };
  function photoMarkup(r, cls='card-photo'){
    if(!r || r.status==='no-election') return `<div class="${cls} no-photo"><span>2020</span></div>`;
    const v=verifiedImage(r);
    if(v) return `<div class="${cls} has-photo"><img src="${esc(v.url)}" alt="${esc(v.alt||r.name)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.closest('.${cls}').classList.remove('has-photo');this.remove();this.parentElement.innerHTML='<span>FOTOGRAFÍA EXTERNA NO DISPONIBLE</span>'"></div>`;
    const p=sourcePreviewImage(r);
    if(p) return `<div class="${cls} source-photo" data-source-photo="${esc(p.sourcePreviewUrl)}" data-record-id="${esc(r.id)}"><span>Buscando fotografía de la fuente…</span></div>`;
    return `<div class="${cls} no-photo"><span>FOTOGRAFÍA<br>NO INCORPORADA</span></div>`;
  }

  function loadCollection(){ try{return JSON.parse(localStorage.getItem('reinas-unlocked')||'[]')}catch{return[]}}
  function saveCollection(){try{localStorage.setItem('reinas-unlocked',JSON.stringify(state.collection))}catch{}}
  function unlock(r){ if(r?.status==='elected'&&!state.collection.includes(r.id)){state.collection.push(r.id);saveCollection();} }

  function filtered(mode='all'){
    return ALL.filter(r=>{
      if(mode==='jujuy' && r.level!=='jujuy-provincial') return false;
      if(mode==='national' && r.level!=='national') return false;
      if(state.level!=='all' && r.level!==state.level) return false;
      if(state.year!=='all' && r.year!==Number(state.year)) return false;
      if(mode==='jujuy'){
        if(state.jujuySchool!=='all' && r.school!==state.jujuySchool) return false;
        if(state.jujuyDepartment!=='all' && r.department!==state.jujuyDepartment) return false;
        if(state.jujuyLocality!=='all' && r.locality!==state.jujuyLocality) return false;
      }
      const q=state.query.trim().toLowerCase();
      if(!q) return true;
      const hay=[r.name,...(r.variants||[]),r.year,r.province,r.school,r.department,r.locality,r.region,r.titleOfficial,r.event,...(r.notes||[])].filter(Boolean).join(' ').toLowerCase();
      return hay.includes(q);
    }).sort((a,b)=>a.year-b.year || a.level.localeCompare(b.level));
  }

  function render(){
    document.querySelector('#app').innerHTML=`<div class="shell">
      ${topbar()}
      <main id="main">${page()}</main>
      ${footer()}
    </div><div id="modal-root"></div>`;
    bind();
    hydrateSourcePhotos();
  }

  function topbar(){const mobileItems=[['discover','Descubrir'],['jujuy','Jujuy'],['gallery','Galería'],['coronations','Coronaciones'],['maps','Mapas'],['statistics','Estadísticas'],['play','Jugar'],['collection','Colección'],['sources','Fuentes']];return `<header class="topbar">
    <button class="brand" data-section="home" aria-label="Ir al inicio"><span class="brand-mark">R</span><span><strong>REINAS</strong><small>archivo histórico</small></span></button>
    <nav class="topnav" aria-label="Secciones">
      ${mobileItems.map(([k,l])=>nav(k,l)).join('')}
    </nav>
    <div class="topbar-actions"><button class="mobile-nav-btn" data-action="toggle-mobile-nav" aria-label="Abrir navegación" aria-expanded="${state.mobileNav?'true':'false'}">☰</button><button class="icon-btn" data-action="focus-search" aria-label="Buscar en el archivo">⌕</button></div>
    <nav class="mobile-nav-panel ${state.mobileNav?'open':''}" aria-label="Navegación móvil">${mobileItems.map(([k,l])=>`<button class="mobile-nav-link ${state.section===k?'active':''}" data-section="${k}">${esc(l)}</button>`).join('')}</nav>
  </header>`}
  function nav(key,label){return `<button class="nav-link ${state.section===key?'active':''}" data-section="${key}">${label}</button>`}
  function footer(){return `<footer class="footer"><span>REINAS · Archivo Histórico 2010–2026</span><span>Revisión técnica final</span></footer>`}

  function page(){
    switch(state.section){
      case 'jujuy': return jujuyPage();
      case 'gallery': return galleryPage();
      case 'coronations': return coronationsPage();
      case 'maps': return mapsPage();
      case 'statistics': return statisticsPage();
      case 'play': return gamesPage();
      case 'collection': return collectionPage();
      case 'sources': return sourcesPage();
      case 'discover': return discoverPage();
      default: return homePage();
    }
  }

  function hero(){
    const stats=statsFor(ALL);
    return `<section class="hero">
      <div class="hero-copy">
        <div class="kicker">MUSEO DIGITAL · 2010 — 2026</div>
        <h1>La historia no se responde.<br><em>Se descubre.</em></h1>
        <p>Un archivo vivo que conecta las elecciones nacionales con la historia provincial de Jujuy: nombres, territorios, instituciones, eventos, evidencia y variantes documentales.</p>
        <div class="hero-actions"><button class="btn primary" data-section="discover">Recorrer el archivo</button><button class="btn ghost" data-section="play">Entrar al juego</button></div>
        <div class="hero-meta"><span><b>${stats.elections}</b> elecciones efectivas</span><span><b>${ALL.length}</b> nodos históricos</span><span><b>2020</b> interrupción</span></div>
      </div>
      <div class="hero-art"><div class="seal">👑</div><div class="hero-track"></div><div class="hero-years">${YEARS.map((y,i)=>`<button class="hero-year ${y===2020?'break':''}" data-year="${y}">${i%4===0||y===2020||y===2026?y:'·'}</button>`).join('')}</div><div class="hero-note"><span class="dot"></span> Archivo construido desde datos y evidencia trazables.</div></div>
    </section>`;
  }

  function homePage(){return `<div class="page home">${hero()}<section class="section-block compact-intro"><div class="eyebrow">DOS HISTORIAS, UNA MISMA LÍNEA</div><div class="home-grid"><button class="feature-tile" data-section="discover"><span>01</span><strong>Historia nacional</strong><small>2010–2026 · provincias · resultados · nomenclatura</small><em>Explorar →</em></button><button class="feature-tile" data-section="jujuy"><span>02</span><strong>Historia de Jujuy</strong><small>2010–2026 · colegios · departamentos · regiones</small><em>Entrar →</em></button><button class="feature-tile" data-section="maps"><span>03</span><strong>Atlas del archivo</strong><small>Argentina + Jujuy · provincias · departamentos · distribución</small><em>Abrir mapas →</em></button></div></section>${timelineSection()}${periodSection()}${methodNote()}</div>`}

  function timelineSection(){return `<section class="section-block"><div class="section-head"><div><div class="eyebrow">LÍNEA HISTÓRICA</div><h2>Diecisiete años. Una memoria fragmentada.</h2></div><span class="section-note">Tocá un año para cruzar Nacional + Jujuy.</span></div><div class="timeline-wrap"><div class="timeline-line"></div><div class="timeline-scroll">${YEARS.map(y=>{const n=NATIONAL.find(r=>r.year===y),j=JUJUY.find(r=>r.year===y);return `<button class="year-node ${(n?.status==='no-election'||j?.status==='no-election')?'interrupted':''}" data-year="${y}"><span>${y}</span><i></i><small>${y===2020?'interrupción':esc(n?.name||'')}</small></button>`}).join('')}</div></div></section>`}
  function periodSection(){return `<section class="section-block"><div class="section-head"><div><div class="eyebrow">PERIODIZACIÓN</div><h2>El certamen también cambió su lenguaje.</h2></div></div><div class="period-grid">${DATA.periods.map((p,i)=>`<article class="period-card"><span>0${i+1}</span><strong>${p.label}</strong><small>${p.from===p.to?p.from:`${p.from}–${p.to}`}</small><p>${esc(p.description)}</p></article>`).join('')}</div></section>`}
  function methodNote(){return `<section class="method-note"><div><div class="eyebrow">REGLA DEL ARCHIVO</div><h3>Lo que no está confirmado no se completa.</h3><p>La aplicación diferencia evidencia histórica, variantes documentales y fotografía. Un campo no confirmado permanece visible como tal y no alimenta juegos que requieran ese dato.</p></div><span class="method-seal">QA</span></section>`}

  function discoverPage(){return `<div class="page"><section class="section-block page-header"><div><div class="eyebrow">DESCUBRIR</div><h1>Archivo general</h1><p>Recorré las dos capas históricas desde un mismo buscador.</p></div></section>${controls()}<section class="section-block"><div class="archive-grid">${filtered('all').map(card).join('')||emptyState()}</div></section></div>`}
  function jujuyPage(){const schools=[...new Set(JUJUY.map(r=>r.school).filter(Boolean))].sort();const depts=[...new Set(JUJUY.map(r=>r.department).filter(Boolean))].sort();const localities=[...new Set(JUJUY.map(r=>r.locality).filter(Boolean))].sort();return `<div class="page"><section class="section-block page-header"><div><div class="eyebrow">HISTORIA DE JUJUY</div><h1>Representantes, colegios y departamentos</h1><p>La secuencia provincial se mantiene separada de la historia nacional, pero conectada por año.</p></div><div class="page-stat"><b>${statsFor(JUJUY).elections}</b><span>elecciones efectivas</span></div></section>${controls('jujuy')}<section class="section-block archive-filters"><div class="filter-label">EXPLORAR JUJUY POR</div><div class="control-row"><select data-jujuy-school><option value="all">Todos los colegios</option>${schools.map(v=>`<option value="${esc(v)}" ${state.jujuySchool===v?'selected':''}>${esc(v)}</option>`).join('')}</select><select data-jujuy-department><option value="all">Todos los departamentos</option>${depts.map(v=>`<option value="${esc(v)}" ${state.jujuyDepartment===v?'selected':''}>${esc(v)}</option>`).join('')}</select><select data-jujuy-locality><option value="all">Todas las localidades verificadas</option>${localities.map(v=>`<option value="${esc(v)}" ${state.jujuyLocality===v?'selected':''}>${esc(v)}</option>`).join('')}</select></div></section><section class="section-block"><div class="archive-grid">${filtered('jujuy').map(card).join('')||emptyState()}</div></section></div>`}
  function statisticsPage(){
    const n=statsFor(NATIONAL), j=statsFor(JUJUY);
    const byProvince=[...new Set(NATIONAL.filter(r=>r.name).map(r=>r.province))].map(name=>({name,count:NATIONAL.filter(r=>r.name&&r.province===name).length,years:NATIONAL.filter(r=>r.name&&r.province===name).map(r=>r.year)})).sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name));
    const byDept=[...new Set(JUJUY.filter(r=>r.name&&r.department).map(r=>r.department))].map(name=>({name,count:JUJUY.filter(r=>r.name&&r.department===name).length,years:JUJUY.filter(r=>r.name&&r.department===name).map(r=>r.year)})).sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name));
    const noElection=[...new Set(ALL.filter(r=>r.status==='no-election').map(r=>r.year))].sort((a,b)=>a-b);
    const regional={Puna:JUJUY.filter(r=>r.region==='Puna').length,Quebrada:JUJUY.filter(r=>r.region==='Quebrada').length,Valles:JUJUY.filter(r=>r.region==='Valles').length,Yungas:JUJUY.filter(r=>r.region==='Yungas').length};
    const verifiedPhotos=DATA.imageCatalog.filter(i=>i.verified).length;
    const ceremonyCount=ALL.filter(r=>r.ceremonyEvidencePresent).length;
    const postCoronationCount=DATA.imageCatalog.filter(i=>i.imageType==='post-coronation').length;
    const coronationCount=DATA.imageCatalog.filter(i=>i.imageType==='coronation').length;
    const sourcePreviewCount=DATA.imageCatalog.filter(i=>i.imageType==='source-preview').length;
    return `<div class="page"><section class="section-block page-header"><div><div class="eyebrow">ESTADÍSTICAS HISTÓRICAS</div><h1>El archivo, leído como datos</h1><p>Todos los conteos se calculan en tiempo real a partir del dataset auditado. No hay cifras cargadas manualmente.</p></div><div class="page-stat"><b>${n.elections+j.elections}</b><span>elecciones efectivas en ambos niveles</span></div></section>
      <section class="section-block stat-overview"><article><span>NACIONAL</span><b>${n.elections}</b><small>elecciones efectivas</small></article><article><span>JUJUY</span><b>${j.elections}</b><small>elecciones efectivas</small></article><article><span>INTERRUPCIONES</span><b>${new Set(noElection).size}</b><small>años sin elección</small></article><article><span>FOTOGRAFÍAS</span><b>${DATA.imageCatalog.length}</b><small>fichas con foto · ${verifiedPhotos} verificadas</small></article></section>
      <section class="section-block stat-panels"><article class="stat-panel"><div class="section-head"><div><div class="eyebrow">NACIONAL</div><h2>Reinas por provincia</h2></div></div><div class="rank-list">${byProvince.map((x,i)=>`<div class="rank-row"><span>${String(i+1).padStart(2,'0')}</span><strong>${esc(x.name)}</strong><b>${x.count}</b><small>${x.years.join(' · ')}</small></div>`).join('')}</div></article>
      <article class="stat-panel"><div class="section-head"><div><div class="eyebrow">JUJUY</div><h2>Representantes por departamento</h2></div></div><div class="rank-list">${byDept.map((x,i)=>`<div class="rank-row"><span>${String(i+1).padStart(2,'0')}</span><strong>${esc(x.name)}</strong><b>${x.count}</b><small>${x.years.join(' · ')}</small></div>`).join('')}</div></article></section>
      <section class="section-block"><div class="section-head"><div><div class="eyebrow">CURADURÍA VISUAL Y CEREMONIAL</div><h2>Evidencia y clasificación documental</h2></div></div><div class="stat-overview curation-overview"><article><span>FOTOS VERIFICADAS</span><b>${verifiedPhotos}</b><small>imágenes directas auditadas</small></article><article><span>EVIDENCIA CEREMONIAL</span><b>${ceremonyCount}</b><small>registros con momento ceremonial</small></article><article><span>POST-CORONACIÓN</span><b>${postCoronationCount}</b><small>fotografías posteriores al acto</small></article><article><span>CORONACIÓN EXACTA</span><b>${coronationCount}</b><small>fotografía en acto de coronación</small></article><article><span>PREVIEW DOCUMENTAL</span><b>${sourcePreviewCount}</b><small>en proceso de validación</small></article></div></section>
      <section class="section-block"><div class="section-head"><div><div class="eyebrow">SISTEMA REGIONAL</div><h2>Jujuy · regiones desde 2017</h2></div></div><div class="regional-grid">${Object.entries(regional).map(([name,count])=>`<article><span>${esc(name)}</span><b>${count}</b><small>registros con región confirmada</small></article>`).join('')}</div></section>
      <section class="section-block method-note"><div><div class="eyebrow">NOTA METODOLÓGICA</div><h3>Los campos no confirmados no alimentan cálculos que los necesiten.</h3><p>Por ejemplo, María Sol Gutiérrez Mora (Jujuy, 2010) permanece fuera de cualquier estadística por colegio porque su institución secundaria no pudo verificarse. El registro sí participa en estadísticas que dependen de nombre, año o departamento.</p></div><span class="method-seal">DATA</span></section>
    </div>`;
  }

  function mapsPage(){
    const tab=state.mapTab||'national';
    const isNational=tab==='national';
    const map=DATA.maps[tab];
    const names=isNational?DATA.geography.nationalProvinces:DATA.geography.jujuyDepartments;
    const counts=names.map(name=>({name,count:(isNational?NATIONAL:JUJUY).filter(r=>r.status==='elected' && (isNational?r.province:r.department)===name).length}));
    const selectedName=isNational?state.mapProvince:state.mapDepartment;
    const selectedRecordSet=(isNational?NATIONAL:JUJUY).filter(r=>r.status==='elected' && (isNational?r.province:r.department)===selectedName);
    return `<div class="page"><section class="section-block page-header"><div><div class="eyebrow">ATLAS DEL ARCHIVO</div><h1>Territorio de las elecciones</h1><p>El mapa es una referencia geográfica; los conteos provienen exclusivamente del dataset histórico auditado.</p></div><div class="page-stat"><b>${selectedRecordSet.length}</b><span>${selectedName?`elecciones asociadas a ${esc(selectedName)}`:'seleccioná un territorio'}</span></div></section>
      <section class="section-block map-switch"><div class="seg"><button class="filter ${isNational?'active':''}" data-map-tab="national">Argentina</button><button class="filter ${!isNational?'active':''}" data-map-tab="jujuy">Jujuy</button></div><span class="section-note">Seleccioná una provincia o departamento en el índice.</span></section>
      <section class="section-block map-layout">
        <figure class="map-figure"><div class="map-frame"><img src="${esc(map.imageUrl)}" alt="${esc(map.alt)}" loading="eager" referrerpolicy="no-referrer"></div><figcaption>${esc(map.title)} · <a href="${esc(sourceById(map.sourceId)?.url||'#')}" target="_blank" rel="noopener">fuente cartográfica ↗</a></figcaption></figure>
        <aside class="map-index" aria-label="Selector territorial"><div class="eyebrow">${isNational?'PROVINCIAS':'DEPARTAMENTOS DE JUJUY'}</div><div class="map-list">${counts.map(x=>`<button class="map-item ${selectedName===x.name?'active':''}" data-map-name="${esc(x.name)}"><span>${esc(x.name)}</span><b>${x.count}</b></button>`).join('')}</div></aside>
      </section>
      <section class="section-block map-result">${selectedName?mapResult(tab,selectedName,selectedRecordSet):`<div class="visual-holding compact-holding"><div class="holding-mark">◎</div><h2>Elegí un territorio</h2><p>La aplicación mostrará los años y representantes asociados sin alterar el dataset histórico.</p></div>`}</section>
    </div>`;
  }
  function mapResult(tab,name,records){
    return `<div class="section-head"><div><div class="eyebrow">SELECCIÓN</div><h2>${esc(name)}</h2><span class="section-note">${records.length} ${tab==='national'?'elecciones nacionales':'elecciones provinciales registradas'}</span></div></div><div class="map-records">${records.length?records.map(r=>`<button class="map-record" data-open="${r.id}"><span>${r.year}</span><div><strong>${esc(r.name)}</strong><small>${esc(r.school||r.titleOfficial||'')} ${r.department?`· ${esc(r.department)}`:''}</small></div><b>→</b></button>`).join(''):`<div class="empty-state"><strong>Sin elección registrada</strong><span>El dataset no contiene una elección efectiva para este territorio en 2010–2026.</span></div>`}</div>`;
  }
  function controls(mode='all'){return `<section class="section-block controls-block"><div class="control-row"><div class="seg"><button class="filter ${state.level==='all'?'active':''}" data-level="all">Todo</button><button class="filter ${state.level==='national'?'active':''}" data-level="national">Nacional</button><button class="filter ${state.level==='jujuy-provincial'?'active':''}" data-level="jujuy">Jujuy</button></div><select id="year-filter"><option value="all">Todos los años</option>${YEARS.map(y=>`<option value="${y}" ${String(state.year)===String(y)?'selected':''}>${y}</option>`).join('')}</select></div><div class="searchbar"><span>⌕</span><input id="search" value="${esc(state.query)}" placeholder="Buscar nombre, año, provincia, colegio, departamento…"/><button data-action="clear-search">Limpiar</button></div></section>`}

  function card(r){
    if(r.status==='no-election') return `<article class="archive-card no-election"><button class="card-inner" data-open="${r.id}"><div class="card-index">${r.year} · ${levelLabel(r)}</div><div class="card-photo no-photo"><span>2020</span></div><div class="card-body"><div class="mini-label">INTERRUPCIÓN HISTÓRICA</div><h3>Sin elección</h3><div class="facts"><span>Pandemia</span><span>FNE virtual/conmemorativa</span></div></div><div class="card-footer"><span>VER CONTEXTO</span><span>→</span></div></button></article>`;
    return `<article class="archive-card"><button class="card-inner" data-open="${r.id}"><div class="card-index">${r.year} · ${levelLabel(r)}</div>${photoMarkup(r)}<div class="card-body"><div class="mini-label">${esc(r.titleOfficial)} · ${esc(photoStatusLabel(r))}</div><h3>${esc(r.name)}</h3><div class="facts">${r.province?`<span>${esc(r.province)}</span>`:''}${r.school?`<span>${esc(r.school)}</span>`:''}${r.department?`<span>${esc(r.department)}</span>`:''}${r.region?`<span>${esc(r.region)}</span>`:''}</div></div><div class="card-footer"><span>${state.collection.includes(r.id)?'COLECCIONADA':'ABRIR FICHA'}</span><span>→</span></div></button></article>`;
  }
  function initials(name){return String(name||'—').split(/\s+/).filter(Boolean).slice(0,3).map(x=>x[0]).join('').toUpperCase()}
  function emptyState(){return `<div class="empty-state"><strong>No hay coincidencias.</strong><span>Probá otro año o término de búsqueda.</span></div>`}

  function galleryPage(){
    const allImgs=DATA.imageCatalog.filter(i=>i.verified||i.sourcePreviewUrl); const verifiedCount=allImgs.filter(i=>i.verified).length; const previewCount=allImgs.filter(i=>!i.verified&&i.sourcePreviewUrl).length;
    const types=[...new Set(allImgs.map(i=>i.imageType).filter(Boolean))];
    const recordsWithImages=allImgs.map(i=>ALL.find(x=>x.id===i.recordId)).filter(Boolean);
    const provinces=[...new Set(recordsWithImages.map(r=>r.province).filter(Boolean))].sort();
    const departments=[...new Set(recordsWithImages.map(r=>r.department).filter(Boolean))].sort();
    const schools=[...new Set(recordsWithImages.map(r=>r.school).filter(Boolean))].sort();
    const imgs=allImgs.filter(i=>{
      const r=ALL.find(x=>x.id===i.recordId); if(!r) return false;
      if(state.galleryLevel==='national' && r.level!=='national') return false;
      if(state.galleryLevel==='jujuy' && r.level!=='jujuy-provincial') return false;
      if(state.galleryYear!=='all' && r.year!==Number(state.galleryYear)) return false;
      if(state.galleryType!=='all' && i.imageType!==state.galleryType) return false;
      if(state.galleryProvince!=='all' && r.province!==state.galleryProvince) return false;
      if(state.galleryDepartment!=='all' && r.department!==state.galleryDepartment) return false;
      if(state.gallerySchool!=='all' && r.school!==state.gallerySchool) return false;
      return true;
    });
    return `<div class="page"><section class="section-block page-header"><div><div class="eyebrow">GALERÍA</div><h1>Fotografías documentales</h1><p>El archivo visual prioriza imágenes verificadas. Cuando una ficha aún no tiene una foto directamente verificada, muestra la fotografía principal de su fuente como vista documental pendiente de validación.</p></div><div class="page-stat"><b>${allImgs.length}</b><span>fichas con fotografía asociada · ${verifiedCount} verificadas · ${previewCount} desde fuente</span></div></section>
      <section class="section-block gallery-controls"><div class="seg"><button class="filter ${state.galleryLevel==='all'?'active':''}" data-gallery-level="all">Todo</button><button class="filter ${state.galleryLevel==='national'?'active':''}" data-gallery-level="national">Nacional</button><button class="filter ${state.galleryLevel==='jujuy'?'active':''}" data-gallery-level="jujuy">Jujuy</button></div><select data-gallery-year><option value="all">Todos los años</option>${YEARS.map(y=>`<option value="${y}" ${String(state.galleryYear)===String(y)?'selected':''}>${y}</option>`).join('')}</select><select data-gallery-type><option value="all">Todos los tipos</option>${types.map(t=>`<option value="${esc(t)}" ${state.galleryType===t?'selected':''}>${esc(t)}</option>`).join('')}</select><select data-gallery-province><option value="all">Todas las provincias</option>${provinces.map(v=>`<option value="${esc(v)}" ${state.galleryProvince===v?'selected':''}>${esc(v)}</option>`).join('')}</select><select data-gallery-department><option value="all">Todos los departamentos</option>${departments.map(v=>`<option value="${esc(v)}" ${state.galleryDepartment===v?'selected':''}>${esc(v)}</option>`).join('')}</select><select data-gallery-school><option value="all">Todos los colegios</option>${schools.map(v=>`<option value="${esc(v)}" ${state.gallerySchool===v?'selected':''}>${esc(v)}</option>`).join('')}</select></section>
      <section class="section-block image-grid">${imgs.length?imgs.map(imageCard).join(''):`<div class="empty-state"><strong>No hay imágenes con estos filtros.</strong><span>El catálogo no inventa fotografías para completar resultados.</span></div>`}</section></div>`;
  }
  function imageCard(img){const r=ALL.find(x=>x.id===img.recordId);const source=sourceById(img.sourceId);return `<article class="image-card"><div class="image-frame" data-source-photo="${esc(img.sourcePreviewUrl||'')}" data-record-id="${esc(img.recordId||'')}">${img.url?`<img src="${esc(img.url)}" alt="${esc(img.alt||r?.name)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.parentElement.innerHTML='<div class=\"image-empty\">Fuente visual externa no disponible</div>'">`:(img.sourcePreviewUrl?'<div class="image-empty source-loading">Buscando fotografía…</div>':'<div class="image-empty">Sin imagen</div>')}</div><div><div class="mini-label">${esc(img.imageType)} · ${esc(img.imageMomentConfidence||'')} · ${img.verified?'VERIFICADA':'POR VALIDAR'}</div><h3>${esc(r?.name||'')}</h3><p>${r?.year} · ${esc(r?.province||r?.department||'')} ${r?.department?`· ${esc(r.department)}`:''}</p><p class="image-evidence-note">${esc(img.verificationNotes||'')}</p><a class="source-link" href="${esc(source?.url||'#')}" target="_blank" rel="noopener">Fuente de la imagen ↗</a></div></article>`}
    function coronationsPage(){
    const images=DATA.imageCatalog.filter(i=>i.verified && ['coronation','award','official-event','post-coronation'].includes(i.imageType));
    return `<div class="page"><section class="section-block page-header"><div><div class="eyebrow">CORONACIONES</div><h1>Momentos de consagración</h1><p>Esta sección muestra sólo imágenes que el archivo puede vincular a una elección, coronación, premiación o ceremonia documentada. No se confunde una corona visible con una prueba del instante de coronación.</p></div><div class="page-stat"><b>${images.length}</b><span>imágenes documentales elegibles</span></div></section><section class="section-block coronation-photo-grid">${images.length?images.map(img=>{const r=ALL.find(x=>x.id===img.recordId);return `<button class="coronation-photo" data-open="${r?.id||''}"><div class="coronation-photo-frame"><img src="${esc(img.url)}" alt="${esc(img.alt||r?.name||'Fotografía histórica')}" loading="lazy" referrerpolicy="no-referrer" onerror="this.parentElement.innerHTML='<span>Fuente visual externa no disponible</span>'"><span>${esc(img.imageMomentConfidence||'')}</span></div><div class="mini-label">${r?.year} · ${esc(levelLabel(r||{}))}</div><strong>${esc(r?.name||'')}</strong><small>${esc(img.imageType)} · ${esc(img.imageContext||'')} · Fuente: ${esc(img.imageSource||'fuente original')}</small></button>`}).join(''):`<div class="empty-state"><strong>Aún no hay imágenes elegibles.</strong><span>La sección nunca rellena este espacio con fotografías no verificadas.</span></div>`}</section></div>`;
  }

  const GAME_META=[
    ['missing-year','¿Qué año falta?','Cronología'],['connect','Conectá los puntos','Asociaciones'],['hidden-year','El año escondido','Línea temporal'],['mystery-province','La provincia misteriosa','Nacional'],['mystery-department','El departamento misterioso','Jujuy'],['mystery-school','¿Qué colegio representó?','Jujuy'],['two-queens','Dos reinas, una historia','Comparación'],['intruder','Intrusa en la línea','Relaciones'],['seconds','60 segundos de historia','Contrarreloj'],['clues','Adiviná con pistas','Pistas'],['lost-archive','El archivo perdido','Foto'],['photo-chronology','Fotografía + cronología','Foto'],['photo-memory','Memoria fotográfica','Foto'],['hidden-coronation','Coronación oculta','Foto']
  ];
  function gamesPage(){const photoCount=DATA.imageCatalog.filter(i=>i.verified).length; return `<div class="page"><section class="section-block page-header"><div><div class="eyebrow">JUGAR</div><h1>El archivo convertido en experiencia.</h1><p>Los desafíos se generan desde los registros históricos elegibles. Las mecánicas fotográficas usan exclusivamente imágenes verificadas del archivo.</p></div><div class="page-stat"><b>${photoCount}</b><span>fotografías verificadas disponibles</span></div></section><section class="section-block game-grid">${GAME_META.map(([id,t,sub])=>{const needs=id==='photo-chronology'?3:id.startsWith('photo')||id==='lost-archive'||id==='hidden-coronation'?1:0;const locked=photoCount<needs;const stateText=locked?`Bloqueado: requiere ${needs} foto${needs>1?'s':''}`:'Disponible';return `<article class="game-card ${locked?'locked':''}"><div class="game-num">${String(GAME_META.findIndex(x=>x[0]===id)+1).padStart(2,'0')}</div><div><div class="mini-label">${esc(sub)}</div><h3>${esc(t)}</h3><small>${esc(stateText)}</small></div><button class="game-launch" data-game="${id}" ${locked?'disabled':''}>${locked?'Bloqueado':'Jugar →'}</button></article>`}).join('')}</section>${state.game?gameStage():''}</div>`}

  function resetSecondsGame(){stopTimer();state.game='seconds';state.gameQuestion=null;state.score=0;state.hits=0;state.errors=0;state.streak=0;state.gameDone=false;state.gameStartedAt=Date.now();state.gameEndsAt=Date.now()+60000;render()}
  function stopTimer(){if(state.timerId){clearInterval(state.timerId);state.timerId=null}}
  function ensureTimer(){if(state.game!=='seconds'||state.gameDone)return; if(state.timerId)return; state.timerId=setInterval(()=>{const left=Math.max(0,state.gameEndsAt-Date.now()); const el=$('#game-time'); if(el)el.textContent=`${Math.ceil(left/1000)}s`; if(left<=0){state.gameDone=true;stopTimer();const stage=$('.active-game');if(stage){stage.classList.add('game-ended');stage.querySelectorAll('.answer-btn,[data-action="next-question"]').forEach(b=>b.disabled=true);const end=stage.querySelector('.timer-status');if(end)end.textContent='TIEMPO TERMINADO';if(!stage.querySelector('[data-action="retry-game"]')){stage.insertAdjacentHTML('beforeend','<div class="timer-final-actions"><button class="btn primary" data-action="retry-game">Nueva partida</button></div>');const retry=stage.querySelector('[data-action="retry-game"]');if(retry)retry.addEventListener('click',resetSecondsGame);}}}},250)}
  function gameStage(){if(state.game==='seconds')ensureTimer(); if(!state.gameQuestion) state.gameQuestion=generateGame(state.game); const q=state.gameQuestion; const timer=state.game==='seconds'?`<div class="speed-metrics"><span><small>TIEMPO</small><b id="game-time">${Math.max(0,Math.ceil(((state.gameEndsAt||Date.now())-Date.now())/1000))}s</b></span><span><small>ACIERTOS</small><b>${state.hits}</b></span><span><small>ERRORES</small><b>${state.errors}</b></span><span><small>RACHA</small><b>${state.streak}</b></span></div>`:''; return `<section class="section-block active-game"><div class="game-top"><div><div class="eyebrow">DESAFÍO ACTIVO</div><h2>${esc(q.title)}</h2><p>${esc(q.prompt)}</p></div><div class="game-score"><span>PUNTOS</span><b>${state.score}</b></div></div>${timer}${state.gameDone?'<div class="warning-box timer-status">TIEMPO TERMINADO</div>':''}${q.ui()}${state.game==='seconds'&&state.gameDone?'<button class="btn primary" data-action="retry-game">Nueva partida</button>':''}</section>`}

  function generateGame(id){
    const years=YEARS.filter(y=>y!==2020);
    const choose=(arr)=>arr[Math.floor(Math.random()*arr.length)];
    const electedN=NATIONAL.filter(r=>r.name), electedJ=JUJUY.filter(r=>r.name), elected=ALL.filter(r=>r.name);
    const shuffle=a=>a.slice().sort(()=>Math.random()-0.5);
    const buttons=(opts, correct, field)=>`<div class="answer-grid">${shuffle(opts).map(v=>`<button class="answer-btn" data-answer="${encodeURIComponent(v)}" data-correct="${encodeURIComponent(correct)}" data-field="${field}">${esc(v)}</button>`).join('')}</div>`;
    if(id==='missing-year'){
      let y=choose(years.filter(v=>v>2010&&v<2020&&v!==2020)); const prev=NATIONAL.find(r=>r.year===y-1),next=NATIONAL.find(r=>r.year===y+1); let opts=[y,y-1,y+1,y+2].filter(v=>v!==2020&&years.includes(v)); for(const v of years){if(opts.length>=4)break;if(!opts.includes(v)&&v!==2020)opts.push(v)} return {recordId:NATIONAL.find(r=>r.year===y)?.id,title:'¿Qué año falta?',prompt:`Completá la secuencia: ${prev?.name||prev?.year} → ???? → ${next?.name||next?.year}`,ui:()=>buttons(opts.map(String),String(y),'year')};
    }
    if(id==='hidden-year'){
      const r=choose(elected); const q={recordId:r.id,title:'El año escondido',prompt:`¿En qué año fue elegida ${r.name}?`,guessYear:2010,correctYear:r.year,result:null}; q.ui=()=>hiddenYearUI(q); return q;
    }
    if(id==='mystery-province'){
      const r=choose(electedN); const opts=[r.province,...shuffle([...new Set(electedN.map(x=>x.province).filter(Boolean))]).filter(x=>x!==r.province).slice(0,3)]; return {recordId:r.id,title:'La provincia misteriosa',prompt:`${r.name} · ${r.year}. ¿Qué provincia representó?`,ui:()=>`<div class="game-map-card"><img src="${esc(DATA.maps.national.imageUrl)}" alt="Mapa político de Argentina"><span>Mapa de referencia. Elegí una provincia entre las opciones verificadas.</span></div>${buttons(opts,r.province,'province')}`};
    }
    if(id==='mystery-department'){
      const r=choose(electedJ.filter(x=>x.department)); const vals=[...new Set(electedJ.map(x=>x.department).filter(Boolean))]; const opts=[r.department,...shuffle(vals.filter(x=>x!==r.department)).slice(0,3)]; return {recordId:r.id,title:'El departamento misterioso',prompt:`${r.name} · ${r.year} · ${r.school||'colegio no confirmado'}. ¿Qué departamento?`,ui:()=>`<div class="game-map-card"><img src="${esc(DATA.maps.jujuy.imageUrl)}" alt="Mapa departamental de Jujuy"><span>Mapa de referencia. Elegí un departamento entre las opciones verificadas.</span></div>${buttons(opts,r.department,'department')}`};
    }
    if(id==='mystery-school'){
      const r=choose(electedJ.filter(x=>x.school)); const vals=[...new Set(electedJ.map(x=>x.school).filter(Boolean))]; const opts=[r.school,...shuffle(vals.filter(x=>x!==r.school)).slice(0,3)]; return {recordId:r.id,title:'¿Qué colegio representó?',prompt:`${r.name} · ${r.year} · ${r.department}. ¿Qué institución?`,ui:()=>buttons(opts,r.school,'school')};
    }
    if(id==='two-queens'){
      const a=choose(elected); const b=choose(elected.filter(x=>x.id!==a.id && x.year!==a.year));
      if(!b) return generateGame('hidden-year');
      const correct=a.year<b.year?a.name:b.name;
      return {recordId:a.id,title:'Dos reinas, una historia',prompt:`¿Quién fue elegida primero: ${a.name} (${a.year}) o ${b.name} (${b.year})?`,ui:()=>buttons([a.name,b.name],correct,'person')};
    }
    if(id==='intruder'){
      const eligibleProvinces=[...new Set(electedN.map(r=>r.province))].filter(p=>electedN.filter(r=>r.province===p).length>=3);
      if(!eligibleProvinces.length) return generateGame('two-queens');
      const province=choose(eligibleProvinces); const group=electedN.filter(r=>r.province===province); const good=shuffle(group).slice(0,3); const bad=choose(electedN.filter(r=>r.province!==province)); const opts=[...good.map(r=>r.name),bad.name]; return {recordId:bad.id,title:'Intrusa en la línea',prompt:`Tres comparten la provincia ${province}. ¿Cuál es la intrusa?`,ui:()=>buttons(opts,bad.name,'person')};
    }
    if(id==='connect'){
      const pool=shuffle(electedJ.filter(x=>x.school&&x.department));
      const picks=[];
      for(const r of pool){ if(!picks.some(x=>x.school===r.school||x.department===r.department)){ picks.push(r); if(picks.length===4) break; } }
      if(picks.length<4) return generateGame('mystery-school');
      const q={recordId:picks[0].id,title:'Conectá los puntos',prompt:'Relacioná cada representante con su colegio. En móvil, tocá primero una persona y luego su institución.',pairs:picks.map(r=>({left:r.name,right:r.school,id:r.id})),connections:[],selectedLeft:null,result:null,startedAt:Date.now(),elapsedMs:null,precision:null};
      q.ui=()=>connectUI(q); return q;
    }
    if(id==='clues'){
      const r=choose(elected); const clues=[
        `Año: ${r.year}`,
        r.level==='national'?`Provincia: ${r.province||'NO CONFIRMADO'}`:`Jujuy · ${r.department||'Departamento no confirmado'}`,
        r.level==='jujuy-provincial'?`Colegio: ${r.school||'NO CONFIRMADO'}`:`Título: ${r.titleOfficial||'Representante Nacional'}`,
        `Inicial del apellido: ${((r.name||'?').trim().split(/\s+/).filter(Boolean).slice(-1)[0]||'?').slice(0,1).toUpperCase()}`,
        `Inicial del nombre: ${(r.name||'?').trim().split(/\s+/)[0].slice(0,1)}`
      ];
      const q={recordId:r.id,title:'Adiviná con pistas',prompt:'Usá la menor cantidad de pistas posible. Cada pista reduce el valor del acierto.',clues,hintsUsed:0,correct:r.name};
      q.ui=()=>clueUI(q,elected,r); return q;
    }
    if(id==='seconds'){
      const r=choose(elected);
      const modes = r.level==='national'
        ? [['name','nombre',r.name,`¿Quién fue elegida en ${r.year}?`],['year','año',String(r.year),`¿En qué año fue elegida ${r.name}?`],['province','provincia',r.province,`¿Qué provincia representó ${r.name}?`]]
        : [['name','nombre',r.name,`¿Quién fue representante de Jujuy en ${r.year}?`],['year','año',String(r.year),`¿En qué año fue elegida ${r.name}?`],['department','departamento',r.department,`¿Qué departamento representó ${r.name}?`],['school','colegio',r.school,`¿Qué colegio representó ${r.name}?`]].filter(x=>x[2]);
      const [field,label,correct,prompt]=choose(modes);
      const pool=[...new Set(elected.filter(x=>x[field]).map(x=>String(x[field])))].filter(v=>v!==String(correct));
      const opts=[String(correct),...shuffle(pool).slice(0,3)];
      return {recordId:r.id,title:'60 segundos de historia',prompt:`${prompt} · Modo: ${label}.`,ui:()=>buttons(opts,String(correct),field)};
    }
    const verifiedImgs=DATA.imageCatalog.filter(i=>i.verified&&ALL.some(r=>r.id===i.recordId));
    const photoOptions=(img, field, correct, title, prompt)=>()=>{
      const r=ALL.find(x=>x.id===img.recordId);
      const sourceValue=x=>String(x[field]??'');
      const pool=[...new Set(elected.filter(x=>sourceValue(x)).map(sourceValue))].filter(v=>v!==String(correct));
      const opts=[String(correct),...shuffle(pool).slice(0,3)];
      return `<div class="photo-question"><div class="game-photo"><img src="${esc(img.url)}" alt="${esc(img.alt||r?.name||'Fotografía histórica')}"></div><div class="photo-caption"><span>MEMORIA · ${esc(field)}</span><strong>${esc(title)}</strong><p>${esc(prompt)}</p></div></div>${buttons(opts,String(correct),field)}`;
    };
    if(id==='lost-archive'&&verifiedImgs.length){const img=choose(verifiedImgs); const r=ALL.find(x=>x.id===img.recordId); const q={recordId:r.id,title:'El archivo perdido',prompt:'La fotografía está parcialmente oculta. Revelala por etapas y descubrí la identidad.',revealStep:0,img,r}; q.ui=()=>lostArchiveUI(q,elected); return q;}
    if(id==='photo-memory'&&verifiedImgs.length){
      const img=choose(verifiedImgs); const r=ALL.find(x=>x.id===img.recordId);
      const modes=r.level==='national'
        ? [['name','nombre',r.name,'¿Quién aparece en la fotografía?'],['year','año',String(r.year),'¿Qué año corresponde?'],['province','provincia',r.province,'¿Qué provincia representó?']]
        : [['name','nombre',r.name,'¿Quién aparece en la fotografía?'],['year','año',String(r.year),'¿Qué año corresponde?'],['department','departamento',r.department,'¿Qué departamento corresponde?'],['school','colegio',r.school,'¿Qué colegio corresponde?']].filter(x=>x[2]);
      const [field,label,correct,question]=choose(modes);
      return {recordId:r.id,title:'Memoria fotográfica',prompt:`${question} · Modo: ${label}.`,ui:photoOptions(img,field,String(correct),question,'Esta imagen pertenece a un registro histórico verificado.')};
    }
    if(id==='hidden-coronation'&&verifiedImgs.length){const img=choose(verifiedImgs); const r=ALL.find(x=>x.id===img.recordId); const q={recordId:r.id,title:'Coronación oculta',prompt:'Revelá la fotografía por etapas y después identificá a la representante.',revealStep:0,img,r}; q.ui=()=>hiddenCoronationUI(q,elected); return q;}
    if(id==='photo-chronology'&&verifiedImgs.length>=3){
      const uniqueYears=[];
      for(const img of shuffle(verifiedImgs)){ const y=ALL.find(r=>r.id===img.recordId)?.year; if(y!=null&&!uniqueYears.includes(y)){ uniqueYears.push(y); if(uniqueYears.length===3) break; } }
      const picks=uniqueYears.map(y=>verifiedImgs.find(i=>ALL.find(r=>r.id===i.recordId)?.year===y)).filter(Boolean);
      if(picks.length<3) return generateGame('lost-archive');
      const correct=picks.slice().sort((a,b)=>ALL.find(r=>r.id===a.recordId).year-ALL.find(r=>r.id===b.recordId).year).map(i=>i.id); const q={recordId:picks[0].recordId,title:'Fotografía + cronología',prompt:'Ordená las tres fotografías de la más antigua a la más reciente. Arrastrá en escritorio o tocá dos fotografías para intercambiarlas.',order:shuffle(picks.map(i=>i.id)),correctOrder:correct,selected:null}; q.ui=()=>photoOrderUI(q); return q;}
    return generateGame('missing-year');
  }

  const gameButtons=(opts,correct,field)=>`<div class="answer-grid">${opts.slice().sort(()=>Math.random()-0.5).map(v=>`<button class="answer-btn" data-answer="${encodeURIComponent(v)}" data-correct="${encodeURIComponent(correct)}" data-field="${field}">${esc(v)}</button>`).join('')}</div>`;

  function connectUI(q){
    const leftById=new Map(q.pairs.map(p=>[p.id,p]));
    const connectionForLeft=id=>q.connections.find(c=>c.left===id);
    const connectionForRight=id=>q.connections.find(c=>c.right===id);
    const left=q.pairs.map(p=>{const c=connectionForLeft(p.id);return `<button class="match-left ${q.selectedLeft===p.id?'selected':''} ${c?'matched':''}" data-match-left="${p.id}">${esc(p.left)}${c?`<small>→ ${esc(leftById.get(c.right)?.right||'seleccionado')}</small>`:''}</button>`}).join('');
    const right=q.pairs.slice().sort(()=>Math.random()-0.5).map(p=>{const c=connectionForRight(p.id);return `<button class="match-right ${c?'matched':''}" data-match-right="${p.id}">${esc(p.right)}</button>`}).join('');
    return `<div class="match-grid"><div><div class="mini-label">REPRESENTANTES</div>${left}</div><div><div class="mini-label">COLEGIOS</div>${right}</div></div><div class="clue-actions"><span class="clue-value">Conexiones: ${q.connections.length}/4</span><button class="btn primary" data-action="check-connections" ${q.connections.length<4?'disabled':''}>Comprobar conexiones</button></div>${q.result?`<div class="result ${q.result==='correct'?'good':'bad'}"><strong>${q.result==='correct'?'Correcto':'Revisá las conexiones'}</strong><span>${q.result==='correct'?'+100 puntos':`Relaciones correctas: ${q.precision?.correct||0}/4`}</span><span>Tiempo: ${q.elapsedMs!=null?`${(q.elapsedMs/1000).toFixed(1)} s`:'—'} · Precisión: ${q.precision?`${q.precision.percent}%`:'—'}</span><button class="btn ${q.result==='correct'?'primary':'ghost'}" data-action="next-question">Siguiente</button></div>`:''}`;
  }
  function hiddenCoronationUI(q,elected){
    const blur=[18,11,5,0][Math.min(q.revealStep,3)];
    const opacity=[.4,.6,.82,1][Math.min(q.revealStep,3)];
    const opts=[q.r.name,...elected.filter(x=>x.id!==q.r.id).map(x=>x.name).sort(()=>Math.random()-0.5).slice(0,3)];
    return `<div class="photo-question"><div class="game-photo reveal-stage"><img src="${esc(q.img.url)}" alt="Fotografía histórica parcialmente revelada" style="filter:blur(${blur}px);transform:scale(${blur?1.07:1});opacity:${opacity}" referrerpolicy="no-referrer" onerror="this.parentElement.innerHTML='<span>Fuente visual externa no disponible</span>'"><span class="reveal-badge">${q.revealStep===3?'IMAGEN REVELADA':`ETAPA ${q.revealStep+1}/4`}</span></div><div class="photo-caption"><span>CONTEXTO DE ELECCIÓN / CORONACIÓN</span><strong>¿Quién fue?</strong><p>Revelá la imagen antes de responder. El archivo confirma su vínculo documental con el evento; no implica que la imagen muestre el instante exacto de colocación de la corona.</p>${q.revealStep<3?`<button class="btn ghost" data-action="reveal-photo">Revelar más</button>`:''}</div></div>${gameButtons(opts,q.r.name,'name')}`;
  }

  function hiddenYearUI(q){
    const guessed=Number(q.guessYear||2010);
    return `<div class="hidden-year-game"><div class="timeline-guess"><div class="guess-year">${guessed}</div><input type="range" min="2010" max="2026" step="1" value="${guessed}" data-hidden-year aria-label="Año estimado"><div class="guess-scale"><span>2010</span><span>2026</span></div></div></div>${q.result?`<div class="result ${q.result==='correct'?'good':'bad'}"><strong>${q.result==='correct'?'Correcto':'No esta vez'}</strong><span>Año elegido: ${guessed} · Año correcto: ${q.correctYear} · Diferencia: ${Math.abs(guessed-q.correctYear)} año${Math.abs(guessed-q.correctYear)===1?'':'s'}</span><button class="btn ${q.result==='correct'?'primary':'ghost'}" data-action="next-question">Siguiente</button></div>`:`<button class="btn primary" data-action="check-hidden-year">Comprobar año</button>`}`;
  }
  function checkHiddenYear(){const q=state.gameQuestion;if(!q||q.result)return; const diff=Math.abs(Number(q.guessYear)-q.correctYear); const good=diff===0; state.hits+=good?1:0;state.errors+=good?0:1;state.streak=good?state.streak+1:0;state.score+=Math.max(0,100-(diff*10));if(good){const r=ALL.find(x=>x.id===q.recordId);if(r)unlock(r);q.result='correct';}else{q.result='wrong';}render()}
  function clueUI(q,elected,r){
    const visible=q.clues.slice(0,q.hintsUsed+1).map((c,i)=>`<div class="clue-row"><span>PISTA ${i+1}</span><strong>${esc(c)}</strong></div>`).join('');
    const opts=[r.name,...elected.filter(x=>x.id!==r.id).map(x=>x.name).sort(()=>Math.random()-0.5).slice(0,3)];
    return `<div class="clue-panel">${visible}</div><div class="clue-actions">${q.hintsUsed<q.clues.length-1?`<button class="btn ghost" data-action="reveal-clue">Revelar otra pista</button>`:''}<span class="clue-value">Valor actual: ${[100,75,50,25,10][Math.min(q.hintsUsed,4)]} pts</span></div>${gameButtons(opts,r.name,'name')}`;
  }

  function lostArchiveUI(q,elected){
    const blur=[14,8,3,0][Math.min(q.revealStep,3)];
    const opacity=[.48,.68,.86,1][Math.min(q.revealStep,3)];
    const r=q.r;
    const opts=[r.name,...elected.filter(x=>x.id!==r.id).map(x=>x.name).sort(()=>Math.random()-0.5).slice(0,3)];
    return `<div class="photo-question"><div class="game-photo reveal-stage"><img src="${esc(q.img.url)}" alt="${esc(q.img.alt||r.name)}" style="filter:blur(${blur}px);transform:scale(${blur?1.06:1});opacity:${opacity}" referrerpolicy="no-referrer" onerror="this.parentElement.innerHTML='<span>Fuente visual externa no disponible</span>'"><span class="reveal-badge">${q.revealStep===3?'IMAGEN REVELADA':`ETAPA ${q.revealStep+1}/4`}</span></div><div class="photo-caption"><span>ARCHIVO FOTOGRÁFICO</span><strong>¿Quién aparece?</strong><p>La revelación es progresiva. La identidad de la fotografía está verificada en el archivo.</p>${q.revealStep<3?`<button class="btn ghost" data-action="reveal-photo">Revelar más</button>`:''}</div></div>${gameButtons(opts,r.name,'name')}`;
  }

  function photoOrderUI(q){const imgs=q.order.map(id=>DATA.imageCatalog.find(i=>i.id===id)).filter(Boolean);const feedback=q.result?`<div class="result ${q.result==='correct'?'good':'bad'}"><strong>${q.result==='correct'?'¡Orden cronológico correcto!':'Orden incorrecto'}</strong><span>${q.result==='correct'?'+100 puntos':'Observá los años y detalles de cada consagración'}</span><button class="btn ${q.result==='correct'?'primary':'ghost'}" data-action="next-question">Siguiente</button></div>`:'<button class="btn primary" data-action="check-photo-order">Comprobar orden</button>';return `<div class="photo-order-grid" data-photo-order>${imgs.map((img,i)=>{const r=ALL.find(x=>x.id===img.recordId);return `<button class="photo-sort-item ${q.selected===img.id?'selected':''}" draggable="true" data-photo-id="${img.id}"><span>${i+1}</span><img src="${esc(img.url)}" alt="Fotografía ${r?.year||''}" referrerpolicy="no-referrer" onerror="this.parentElement.innerHTML='<span>Fuente visual externa no disponible</span>'"><small>${r?.year||''}</small></button>`}).join('')}</div>${feedback}`}
  function photoOrderSwap(a,b){const q=state.gameQuestion;if(!q)return;const ia=q.order.indexOf(a),ib=q.order.indexOf(b);if(ia<0||ib<0)return;[q.order[ia],q.order[ib]]=[q.order[ib],q.order[ia]];q.selected=null;render()}
  function checkPhotoOrder(){const q=state.gameQuestion;if(!q||state.gameDone)return;const good=JSON.stringify(q.order)===JSON.stringify(q.correctOrder);state.hits+=good?1:0;state.errors+=good?0:1;state.streak=good?state.streak+1:0;if(good){state.score+=100;q.result='correct';q.correctOrder.forEach(id=>{const img=DATA.imageCatalog.find(i=>i.id===id);const r=ALL.find(x=>x.id===img?.recordId);if(r)unlock(r)})}else q.result='wrong';render()}

  function answer(ev){if(state.game==='seconds'&&state.gameDone)return; const btn=ev.currentTarget; const good=decodeURIComponent(btn.dataset.answer)===decodeURIComponent(btn.dataset.correct); $$('.answer-btn').forEach(b=>b.disabled=true); btn.classList.add(good?'correct':'wrong'); const q=state.gameQuestion; const cluePts=state.game==='clues'?[100,75,50,25,10][Math.min(q?.hintsUsed||0,4)]:100; const gained=good?cluePts:0; let explanation=''; if(q?.recordId){const rec=ALL.find(x=>x.id===q.recordId);if(rec){if(good)unlock(rec);const explText=rec.ceremonyEvidence?.notes||rec.notes?.[0]||'';if(explText){const loc=rec.province||(rec.department?`${rec.department} · Jujuy`:'Jujuy');explanation=`<div class="result-explanation"><strong>${esc(rec.name)} (${rec.year} · ${esc(loc)})</strong><p>${esc(explText)}</p></div>`;}}} const r=document.createElement('div');r.className=`result ${good?'good':'bad'}`;r.innerHTML=`<div><strong>${good?'Correcto':'No esta vez'}</strong><span>${good?`+${gained} puntos`:'La respuesta correcta era '+esc(decodeURIComponent(btn.dataset.correct))}</span>${explanation}</div><button class="btn ${good?'primary':'ghost'}" data-action="next-question">Siguiente</button>`; const nextBtn=r.querySelector('[data-action="next-question"]'); if(nextBtn){nextBtn.addEventListener('click',()=>{if(state.game==='seconds'&&state.gameDone)return;state.gameQuestion=null;render();});} btn.closest('.answer-grid').after(r); if(good){state.score+=gained;state.hits++;state.streak++;} else {state.errors++;state.streak=0;} }

  function collectionPage(){const unlocked=state.collection.map(id=>ALL.find(r=>r.id===id)).filter(Boolean); return `<div class="page"><section class="section-block page-header"><div><div class="eyebrow">COLECCIÓN</div><h1>Tu archivo desbloqueable</h1><p>Cada acierto puede incorporar una pieza real del dataset. 2020 nunca se cuenta como reina desbloqueable.</p></div><div class="page-stat"><b>${unlocked.length}</b><span>piezas desbloqueadas</span></div></section><section class="section-block"><div class="collection-grid">${ALL.filter(r=>r.status==='elected').map(r=>{const isUnlocked=state.collection.includes(r.id);return `<button class="collection-item ${isUnlocked?'unlocked':''}" data-open="${r.id}"><span>${isUnlocked?'✓':'○'}</span><strong>${r.year}</strong><small>${esc(isUnlocked?r.name:'Pieza bloqueada')}</small>${isUnlocked?`<div class="collection-badges" aria-label="Indicadores de verificación"><span class="badge-item ${r.photoVerified?'active':''}">FOTO <b>${r.photoVerified?'✓':'—'}</b></span><span class="badge-item active">IDENTIDAD <b>✓</b></span><span class="badge-item ${r.ceremonyEvidencePresent?'active':''}">CEREMONIAL <b>${r.ceremonyEvidencePresent?'✓':'—'}</b></span></div>`:''}</button>`;}).join('')}</div><button class="btn ghost" data-action="reset-collection">Reiniciar colección</button></section></div>`}

  function sourcesPage(){const used=new Set([...ALL.flatMap(r=>r.sourceIds||[]),...(DATA.geography?.sourceIds||[]),DATA.maps?.national?.sourceId,DATA.maps?.jujuy?.sourceId].filter(Boolean));const sources=DATA.sources.filter(s=>used.has(s.id));return `<div class="page"><section class="section-block page-header"><div><div class="eyebrow">FUENTES Y CRÉDITOS</div><h1>Proveniencia</h1><p>Cada ficha apunta a fuentes específicas de la investigación. Las fuentes de entrada generales no se muestran como evidencia histórica.</p></div></section><section class="section-block source-grid">${sources.map(s=>`<a class="source-item" href="${esc(s.url)}" target="_blank" rel="noopener"><span>${esc(s.type)}</span><strong>${esc(s.publisher)}</strong><small>${esc(s.title||s.url)}</small><b>Visitar ↗</b></a>`).join('')}</section></div>`}

  function statsFor(records){return {elections:records.filter(r=>r.status==='elected').length,years:new Set(records.map(r=>r.year)).size,breaks:records.filter(r=>r.status==='no-election').length}}

  function openRecord(id){
    const r=ALL.find(x=>x.id===id); if(!r)return;
    const srcs=(r.sourceIds||[]).map(sourceById).filter(Boolean);
    const cross=r.level==='jujuy-provincial'?[`Colegio: ${r.school||'NO CONFIRMADO'}`,`Departamento: ${r.department||'NO CONFIRMADO'}`,...(r.region?[`Región: ${r.region}`]:[])]:[`Provincia: ${r.province||'NO CONFIRMADO'}`];
    const m=document.querySelector('#modal-root');
    if(m){
      m.innerHTML=`<div class="modal-backdrop" data-action="close-modal"><section class="modal" role="dialog" aria-modal="true" aria-label="Ficha histórica"><button class="modal-close" data-action="close-modal" aria-label="Cerrar">×</button><div class="modal-kicker">${r.year} · ${levelLabel(r)}</div><h2>${esc(r.name||'Sin elección')}</h2><div class="modal-subtitle">${esc(r.titleOfficial||'Interrupción histórica')} · ${esc(r.recordStatus||'VERIFICADO')}</div><div class="modal-layout"><div class="modal-visual-col"><div class="modal-visual-header"><span class="eyebrow">FOTOGRAFÍA PRINCIPAL</span></div><div class="modal-visual ${r.status==='no-election'?'break-visual':''}">${r.status==='no-election'?'<span>2020</span>':photoMarkup(r,'modal-photo')}</div>${r.status!=='no-election'&&r.photoType?`<div class="modal-photo-caption"><span class="photo-category-label">CLASIFICACIÓN VISUAL</span><strong class="photo-type-tag">${esc(photoTaxonomyLabel(r.photoType))}</strong></div>`:''}</div><div><div class="fact-list">${cross.map(x=>`<div>${esc(x)}</div>`).join('')}</div>${r.status==='no-election'?`<div class="warning-box">${esc(r.notes?.[0]||'No hubo elección.')}</div>`:''}${r.notes?.filter(Boolean).map(n=>`<div class="note-box">${esc(n)}</div>`).join('')}<div class="evidence-block"><div class="eyebrow">EVIDENCIA</div><div class="evidence-grid">${Object.entries(r.evidence).filter(([k])=>typeof r.evidence[k]==='number').map(([k,v])=>`<span><b>${v}/3</b>${k}</span>`).join('')}</div></div>${r.event?`<div class="event-meta"><div class="eyebrow">EVENTO</div><p>${esc(r.event)}</p></div>`:''}${anyImage(r)?`<div class="photo-provenance"><div class="eyebrow">FUENTE FOTOGRÁFICA</div><p>${esc((anyImage(r).imageSourceTitle||anyImage(r).imageSource||'Fuente original'))} · ${esc(anyImage(r).imageCredit||anyImage(r).credit||'Crédito no identificado')} · ${esc(photoStatusLabel(r))}</p>${anyImage(r).sourcePreviewUrl?`<a class="source-link" href="${esc(anyImage(r).sourcePreviewUrl)}" target="_blank" rel="noopener">Abrir fuente ↗</a>`:''}</div>`:''}${r.ceremonyEvidence?`<div class="ceremony-box" role="region" aria-label="Momento de la coronación"><div class="eyebrow">MOMENTO DE LA CORONACIÓN</div><div class="ceremony-tag">${r.ceremonyEvidence.type==='exact-photo'?'CORONACIÓN EXACTA · FOTOGRAFÍA':'EVIDENCIA AUDIOVISUAL · VIDEO'} · ${r.ceremonyEvidence.verified?'✓ EVIDENCIA VERIFICADA':'NO CONFIRMADA'}</div><p>${esc(r.ceremonyEvidence.notes||'')}</p><div class="ceremony-source"><strong>Fuente ceremonial:</strong> ${esc(r.ceremonyEvidence.sourceTitle||r.ceremonyEvidence.source||'')}${r.ceremonyEvidence.timestamp?` · <span class="ceremony-timestamp">Tiempo: ${esc(r.ceremonyEvidence.timestamp)}</span>`:''}</div>${(r.ceremonyEvidence.sourceUrl||r.ceremonyEvidence.url)?`<a class="source-link" href="${esc(r.ceremonyEvidence.sourceUrl||r.ceremonyEvidence.url)}" target="_blank" rel="noopener" aria-label="Ver fuente ceremonial: ${esc(r.ceremonyEvidence.sourceTitle||'')} (abre en nueva pestaña)">Ver fuente ceremonial ↗</a>`:`<div class="source-limitation"><span>Fuente de archivo audiovisual sin enlace individual persistente disponible.${r.ceremonyEvidence.limitation?` · ${esc(r.ceremonyEvidence.limitation)}`:''}</span></div>`}</div>`:''}${r.secondaryEvidence?`<div class="ceremony-box secondary-evidence-box" role="region" aria-label="Evidencia documental secundaria"><div class="eyebrow">EVIDENCIA DOCUMENTAL SECUNDARIA</div><div class="ceremony-tag">EVENTO OFICIAL · FOTOGRAFÍA GRUPAL · ${r.secondaryEvidence.verified?'✓ ARCHIVO VERIFICADO':'POR VALIDAR'}</div><p>${esc(r.secondaryEvidence.notes||'')}</p><div class="ceremony-source"><strong>Fuente de archivo:</strong> ${esc(r.secondaryEvidence.sourceTitle||r.secondaryEvidence.source||'')}</div>${(r.secondaryEvidence.sourceUrl||r.secondaryEvidence.url)?`<a class="source-link" href="${esc(r.secondaryEvidence.sourceUrl||r.secondaryEvidence.url)}" target="_blank" rel="noopener" aria-label="Ver registro documental secundario: ${esc(r.secondaryEvidence.sourceTitle||'')} (abre en nueva pestaña)">Ver registro de archivo ↗</a>`:`<div class="source-limitation"><span>${esc(r.secondaryEvidence.limitation||'Registro documental de archivo.')}</span></div>`}</div>`:''}<div class="sources-list"><div class="eyebrow">FUENTES</div>${srcs.map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener" title="${esc(s.title||s.publisher)}">${esc(s.publisher)} ↗</a>`).join('')}</div>${r.variants?.length?`<div class="variants"><div class="eyebrow">VARIANTES DOCUMENTALES</div><p>${r.variants.map(esc).join(' · ')}</p></div>`:''}${r.fieldEvidence?`<div class="trace-block"><div class="eyebrow">TRAZABILIDAD POR CAMPO</div><div class="trace-list">${Object.entries(r.fieldEvidence).map(([field,ids])=>`<div><span>${esc(field)}</span><p>${ids.map(id=>{const s=sourceById(id);return s?`<a href="${esc(s.url)}" target="_blank" rel="noopener" title="${esc(s.title||s.publisher)}">${esc(s.publisher)} ↗</a>`:''}).join(' · ')}</p></div>`).join('')}</div></div>`:''}<button class="btn primary" data-action="unlock-record" data-id="${r.id}">${state.collection.includes(r.id)?'En colección':'Añadir a colección'}</button></div></div></section></div>`;
      bind();
      hydrateSourcePhotos();
    }
  }


  let sourcePhotoObserver;
  function hydrateSourcePhotos(){
    const nodes=$$('[data-source-photo]').filter(el=>el.dataset.sourcePhoto);
    if(!nodes.length) return;
    const resolve=async(el)=>{
      if(el.dataset.sourceResolved==='1') return;
      el.dataset.sourceResolved='1';
      const src=el.dataset.sourcePhoto;
      try{
        const ctl=new AbortController(); const t=setTimeout(()=>ctl.abort(),7000);
        const res=await fetch(`https://api.microlink.io/?url=${encodeURIComponent(src)}&meta=true`,{signal:ctl.signal,headers:{Accept:'application/json'}}); clearTimeout(t);
        if(!res.ok) throw new Error('metadata');
        const json=await res.json(); const imageUrl=json?.data?.image?.url;
        if(!imageUrl) throw new Error('no-image');
        const img=document.createElement('img'); img.src=imageUrl; img.alt=`Fotografía histórica — fuente ${src}`; img.loading='lazy'; img.referrerPolicy='no-referrer';
        img.addEventListener('error',()=>{el.innerHTML='<span>FOTOGRAFÍA DE FUENTE NO DISPONIBLE</span>';},{once:true});
        el.innerHTML=''; el.appendChild(img); el.classList.add('has-photo','source-resolved');
      }catch(e){ el.innerHTML=`<div class="source-fallback"><span>Fotografía disponible en la fuente</span><a href="${esc(src)}" target="_blank" rel="noopener">Abrir fuente ↗</a></div>`; }
    };
    if('IntersectionObserver' in window){
      sourcePhotoObserver?.disconnect(); sourcePhotoObserver=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){resolve(e.target);sourcePhotoObserver.unobserve(e.target)}}),{rootMargin:'240px'}); nodes.forEach(n=>sourcePhotoObserver.observe(n));
    } else nodes.slice(0,12).forEach(resolve);
  }

  function bind(){
    $$('[data-section]').forEach(b=>b.addEventListener('click',()=>{stopTimer();state.mobileNav=false;state.section=b.dataset.section;state.game=null;state.gameQuestion=null;window.scrollTo({top:0,behavior:'smooth'});render()}));
    $$('[data-year]').forEach(b=>b.addEventListener('click',()=>{openYear(Number(b.dataset.year))}));
    $$('[data-open]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();openRecord(b.dataset.open)}));
    $$('[data-level]').forEach(b=>b.addEventListener('click',()=>{state.level=b.dataset.level==='jujuy'?'jujuy-provincial':b.dataset.level;render()}));
    const search=$('#search'); if(search){let t;search.addEventListener('input',e=>{clearTimeout(t);t=setTimeout(()=>{state.query=e.target.value;render();const s=$('#search');if(s){s.focus();s.setSelectionRange(s.value.length,s.value.length);}},160)})}
    const yf=$('#year-filter'); if(yf) yf.addEventListener('change',e=>{state.year=e.target.value;render()});
    $$('[data-game]').forEach(b=>b.addEventListener('click',()=>{stopTimer();state.game=b.dataset.game;state.gameQuestion=null;state.score=0;state.hits=0;state.errors=0;state.streak=0;state.gameDone=false;state.gameStartedAt=state.game==='seconds'?Date.now():null;state.gameEndsAt=state.game==='seconds'?Date.now()+60000:null;render()}));
    $$('.answer-btn').forEach(b=>b.addEventListener('click',answer));
    const orderBox=$('[data-photo-order]'); if(orderBox && typeof orderBox.querySelectorAll==='function'){let dragId=null; orderBox.querySelectorAll('[data-photo-id]').forEach(el=>{el.addEventListener('dragstart',()=>dragId=el.dataset.photoId);el.addEventListener('dragover',e=>e.preventDefault());el.addEventListener('drop',e=>{e.preventDefault();if(dragId)photoOrderSwap(dragId,el.dataset.photoId);});el.addEventListener('click',()=>{const q=state.gameQuestion;if(!q)return;if(!q.selected){q.selected=el.dataset.photoId;render()}else if(q.selected===el.dataset.photoId){q.selected=null;render()}else photoOrderSwap(q.selected,el.dataset.photoId);});});}
    const hiddenRange=$('[data-hidden-year]'); if(hiddenRange)hiddenRange.addEventListener('input',e=>{if(state.gameQuestion&&!state.gameQuestion.result){state.gameQuestion.guessYear=Number(e.target.value);const label=$('.guess-year');if(label)label.textContent=e.target.value;}});
    const checkHidden=$('[data-action="check-hidden-year"]'); if(checkHidden)checkHidden.addEventListener('click',checkHiddenYear);
    const checkOrder=$('[data-action="check-photo-order"]'); if(checkOrder)checkOrder.addEventListener('click',checkPhotoOrder);
    const revealClue=$('[data-action="reveal-clue"]'); if(revealClue)revealClue.addEventListener('click',()=>{if(state.gameQuestion?.hintsUsed < state.gameQuestion?.clues.length-1){state.gameQuestion.hintsUsed++;render();}});
    const revealPhoto=$('[data-action="reveal-photo"]'); if(revealPhoto)revealPhoto.addEventListener('click',()=>{if(state.gameQuestion?.revealStep < 3){state.gameQuestion.revealStep++;render();}});
    $$('[data-action="next-question"]').forEach(next=>next.addEventListener('click',()=>{if(state.game==='seconds'&&state.gameDone)return;state.gameQuestion=null;render()}));
    $$('[data-match-left]').forEach(b=>b.addEventListener('click',()=>{const q=state.gameQuestion;if(!q||q.result)return;const id=b.dataset.matchLeft;q.selectedLeft=q.selectedLeft===id?null:id;render()}));
    $$('[data-match-right]').forEach(b=>b.addEventListener('click',()=>{const q=state.gameQuestion;if(!q||q.result||!q.selectedLeft)return;const rid=b.dataset.matchRight; q.connections=q.connections.filter(c=>c.left!==q.selectedLeft&&c.right!==rid); q.connections.push({left:q.selectedLeft,right:rid}); q.selectedLeft=null; render()}));
    const checkConnections=$('[data-action="check-connections"]'); if(checkConnections) checkConnections.addEventListener('click',()=>{const q=state.gameQuestion;if(!q||q.connections.length!==4||q.result)return; const correctCount=q.connections.filter(c=>c.left===c.right).length; q.elapsedMs=Date.now()-(q.startedAt||Date.now()); q.precision={correct:correctCount,percent:Math.round(correctCount/4*100)}; const good=correctCount===4; q.result=good?'correct':'wrong'; if(good){state.score+=100;state.hits++;state.streak++;q.pairs.forEach(p=>{const r=ALL.find(x=>x.id===p.id);if(r)unlock(r)})}else{state.errors++;state.streak=0} render();});
    const retry=$('[data-action="retry-game"]'); if(retry) retry.addEventListener('click',resetSecondsGame);
    $$('[data-action="close-modal"]').forEach(b=>b.addEventListener('click',e=>{if(e.target===b||e.currentTarget===b){const m=document.querySelector('#modal-root');if(m)m.innerHTML=''}}));
    const modalRoot=$('#modal-root');
    if(modalRoot && typeof modalRoot.addEventListener === 'function' && !modalRoot.__bound){
      modalRoot.__bound=true;
      modalRoot.addEventListener('click',e=>{
        if(e.target.closest('[data-action="close-modal"]') || e.target===modalRoot.firstElementChild){
          modalRoot.innerHTML='';
        }
      });
    }
    if(!window.__REINAS_ESC_BOUND && typeof document.addEventListener==='function'){window.__REINAS_ESC_BOUND=true;document.addEventListener('keydown',e=>{if(e.key==='Escape'){const m=document.querySelector('#modal-root');if(m)m.innerHTML=''; if(state.mobileNav){state.mobileNav=false;render();}}})}
    const unlockBtn=$('[data-action="unlock-record"]'); if(unlockBtn) unlockBtn.addEventListener('click',()=>{const r=ALL.find(x=>x.id===unlockBtn.dataset.id);unlock(r);unlockBtn.textContent='En colección'});
    const clear=$('[data-action="clear-search"]');if(clear)clear.addEventListener('click',()=>{state.query='';render()});
    const reset=$('[data-action="reset-collection"]');if(reset)reset.addEventListener('click',()=>{state.collection=[];saveCollection();render()});
    $$('[data-gallery-level]').forEach(b=>b.addEventListener('click',()=>{state.galleryLevel=b.dataset.galleryLevel;render()}));
    const gy=$('[data-gallery-year]'); if(gy)gy.addEventListener('change',e=>{state.galleryYear=e.target.value;render()});
    const gt=$('[data-gallery-type]'); if(gt)gt.addEventListener('change',e=>{state.galleryType=e.target.value;render()});
    const gp=$('[data-gallery-province]'); if(gp)gp.addEventListener('change',e=>{state.galleryProvince=e.target.value;render()});
    const gd=$('[data-gallery-department]'); if(gd)gd.addEventListener('change',e=>{state.galleryDepartment=e.target.value;render()});
    const gs=$('[data-gallery-school]'); if(gs)gs.addEventListener('change',e=>{state.gallerySchool=e.target.value;render()});
    const js=$('[data-jujuy-school]'); if(js)js.addEventListener('change',e=>{state.jujuySchool=e.target.value;render()});
    const jd=$('[data-jujuy-department]'); if(jd)jd.addEventListener('change',e=>{state.jujuyDepartment=e.target.value;render()});
    const jl=$('[data-jujuy-locality]'); if(jl)jl.addEventListener('change',e=>{state.jujuyLocality=e.target.value;render()});
    $$('[data-map-tab]').forEach(b=>b.addEventListener('click',()=>{state.mapTab=b.dataset.mapTab;state.mapProvince=null;state.mapDepartment=null;render()}));
    $$('[data-map-name]').forEach(b=>b.addEventListener('click',()=>{if(state.mapTab==='national')state.mapProvince=b.dataset.mapName;else state.mapDepartment=b.dataset.mapName;render()}));
    const mobileToggle=$('[data-action="toggle-mobile-nav"]');if(mobileToggle)mobileToggle.addEventListener('click',()=>{state.mobileNav=!state.mobileNav;render();});
    const focus=$('[data-action="focus-search"]');if(focus)focus.addEventListener('click',()=>{stopTimer();state.mobileNav=false;state.section='discover';render();setTimeout(()=>$('#search')?.focus(),50)});
  }

  function openYear(year){
    const n=NATIONAL.find(r=>r.year===year),j=JUJUY.find(r=>r.year===year);
    document.querySelector('#modal-root').innerHTML=`<div class="modal-backdrop" data-action="close-modal"><section class="modal year-modal" role="dialog" aria-modal="true"><button class="modal-close" data-action="close-modal">×</button><div class="modal-kicker">AÑO ${year}</div><h2>Dos historias, una misma noche</h2><div class="dual-grid">${dualCard(n,'NACIONAL')}${dualCard(j,'JUJUY')}</div><button class="btn ghost" data-action="close-modal">Cerrar</button></section></div>`;
    bind();
  }
  function dualCard(r,label){return `<article class="dual-card"><div class="mini-label">${label}</div>${r?.name?photoMarkup(r,'dual-photo'):''}<h3>${esc(r?.name||'Sin elección')}</h3>${r?.name?`<p>${esc(r.province||'')}${r.school?` · ${esc(r.school)}`:''}${r.department?` · ${esc(r.department)}`:''}</p>`:`<div class="warning-box">${esc(r?.notes?.[0]||'Sin elección registrada.')}</div>`}<button class="source-link" ${r?'data-open="'+r.id+'"':''}>Ver ficha →</button></article>`}

  window.REINAS_ENGINE={generateGame,statsFor,filtered,sourceById,verifiedImage,openRecord};
  if(window.__REINAS_TEST__) {
    window.REINAS_TEST_API={
      render,
      openRecord,
      openYear,
      setSection:(section)=>{state.section=section;state.game=null;state.gameQuestion=null;render();},
      setLevel:(level)=>{state.level=level;render();},
      state:()=>JSON.parse(JSON.stringify({...state,timerId:null}))
    };
  } else render();
})();
