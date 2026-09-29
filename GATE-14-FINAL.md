# GATE 14 — CANDIDATA FINAL

## Estado

La aplicación queda como candidata final de entrega tras los gates de arquitectura, desarrollo, testing y auditoría histórica.

## Dataset

- Nacional: 17 nodos, 2010–2026.
- Jujuy: 17 nodos, 2010–2026.
- Elecciones efectivas: 32.
- 2020: interrupción histórica en ambos niveles; no se crea una persona ficticia.
- Campo estructural deliberadamente no confirmado: colegio de María Sol Gutiérrez Mora (Jujuy, 2010).
- Variantes nominales históricas conservadas.

## Fotografía

- 31 fotografías directas verificadas incorporadas.
- Fuente visual asociada a cada fotografía.
- La clasificación distingue fotografía histórica/post-coronación de una coronación exacta.
- No se generaron personas reales mediante IA.
- No se atribuyen como propias fotografías cuyo crédito no pudo verificarse.

## Experiencia

- Descubrir / línea temporal.
- Doble historia Nacional + Jujuy.
- Archivo y fichas históricas.
- Galería.
- Coronaciones.
- Mapas con selección territorial y conteos derivados.
- Estadísticas históricas derivadas.
- Buscador y filtros.
- Colección persistente.
- 14 juegos dinámicos.
- Contrarreloj real de 60 segundos.
- PWA / service worker.

## Validaciones

Se ejecutan sin error:

- `node --check app.js`
- `node validate-data.js`
- `node historical-qa.js`
- `node test-gate10.js`
- `node test-gate13.js`
- `node test-ui-smoke.js`

No se afirma una prueba E2E con navegador porque el entorno disponible no permitió estabilizarla.

## Limitaciones conocidas

1. Las fotografías y cartografías externas dependen de disponibilidad de sus servidores originales.
2. La cobertura fotográfica verificada incorporada no equivale a una fotografía de coronación exacta para cada año.
3. El colegio de María Sol Gutiérrez Mora en 2010 queda sin confirmar.
4. Los mapas utilizan una imagen cartográfica con un índice territorial interactivo; no se ha incorporado un GeoJSON multirregional clickeable por geometría.

Estas limitaciones no se ocultan ni se rellenan con datos inventados.
