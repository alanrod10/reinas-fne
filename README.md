# REINAS — Archivo Histórico Interactivo 2010–2026

## Paquete final auditado — cobertura fotográfica 32/32

Aplicación web estática, responsive y data-driven para explorar la historia nacional y provincial de Jujuy del certamen 2010–2026.

### Cobertura histórica
- Historia nacional 2010–2026.
- Historia provincial de Jujuy 2010–2026.
- 2020 representado como interrupción histórica, sin persona ficticia.
- 32 elecciones efectivas entre ambos niveles.
- Variantes nominales documentales preservadas.
- Evidencia y trazabilidad por campo.
- Único campo estructural deliberadamente no confirmado: colegio de María Sol Gutiérrez Mora (Jujuy, 2010).

### Cobertura fotográfica
- **32/32 registros efectivos tienen una fotografía/fuente fotográfica asociada en la ficha.**
- **31/32 tienen una URL de imagen directa marcada como verificada.**
- **1/32 (María Sol Gutiérrez Mora, Jujuy 2010) tiene una vista dinámica obtenida desde la imagen principal/metadata de su fuente periodística o institucional.** Esta ficha se muestra explícitamente como `POR VALIDAR` y no alimenta los juegos fotográficos hasta una validación manual.
- 2020 no genera fotografía de reina porque no hubo elección.
- No se utilizan fotografías históricas generadas por IA.
- No se presenta una fotografía post-coronación como si fuera necesariamente el instante exacto de colocación de la corona.

Los registros y estados individuales están detallados en `PHOTO-AUDIT-32.json` y `PHOTO-COVERAGE-32.md`.

### Experiencia
- Línea temporal y doble historia por año.
- Buscador global y filtros.
- Fichas históricas con fuentes y trazabilidad.
- Galería y sección de coronaciones.
- Atlas de Argentina y Jujuy con conteos derivados del dataset.
- Estadísticas históricas derivadas en tiempo real.
- Colección persistente mediante localStorage.
- 14 juegos, con generación dinámica y exclusión de datos no confirmados cuando una mecánica lo requiere.
- Contrarreloj real de 60 segundos con reinicio.
- Revelado progresivo y pistas progresivas.

### QA actual
- `node --check app.js` → PASS
- `node --check data.js` → PASS
- `validate-data.js` → PASS
- `historical-qa.js` → PASS
- `photo-completeness.js` → PASS
- `photo-audit.js` → PASS
- `test-final.js` → PASS
- `test-gate10.js` → PASS
- `test-gate13.js` → PASS
- `test-gate15.js` → PASS
- `test-deep.js` → PASS
- `test-ui-smoke.js` → PASS
- `test-release.js` → PASS
- `static-ui-audit.js` → PASS
- `audit-final.js` → PASS

La batería histórica/funcional actual pasa sin errores. El entorno de ejecución no permitió una prueba E2E estable mediante Chromium/Playwright; no se declara esa prueba como aprobada.

### Recursos fotográficos externos
Las fotografías se sirven desde sus URLs de origen o, para la ficha marcada `source-preview` (j2010), se resuelve en el navegador la imagen principal/metadata de la página fuente. La disponibilidad futura depende del servidor de origen y del resolver externo.

### Arquitectura
La versión ejecutable final es HTML/CSS/JavaScript estático y no requiere un build step obligatorio. Los informes de Gate 8 documentan la arquitectura propuesta; la implementación final priorizó portabilidad y ejecución inmediata.
