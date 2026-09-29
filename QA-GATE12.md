# QA — Gate 12 · Integración

Fecha: 2026-09-29

## Estado

Gate 12 está **EN CURSO**. El núcleo histórico, la trazabilidad, los juegos de datos, la colección, la galería y el atlas están integrados en una implementación estática funcional.

## Controles ejecutados

- `node --check app.js` → PASS
- `node --check data.js` → PASS
- `node validate-data.js` → PASS
- `node test-gate10.js` → PASS
- `node historical-qa.js` → PASS
- `node test-ui-smoke.js` → PASS

## Inventario de integración

- 17 nodos Nacional
- 17 nodos Jujuy
- 32 elecciones efectivas
- 2 interrupciones históricas
- 31 fotografías remotas verificadas
- 24 provincias en el índice nacional
- 16 departamentos en el índice de Jujuy
- 14 juegos conectados al motor de datos

## Limitaciones todavía abiertas

1. La prueba E2E en un navegador real no pudo estabilizarse en este entorno.
2. La cobertura fotográfica todavía no alcanza a todos los registros.
3. Las imágenes permanecen enlazadas externamente (`source-linked`); no se presenta una copia propia como original.
4. El atlas utiliza cartografía de referencia con índice interactivo; todavía no es un GeoJSON con polígonos seleccionables directamente.

## Integridad histórica

`María Sol Gutiérrez Mora — Jujuy 2010` mantiene `school = NO CONFIRMADO`. No se introdujo una institución por inferencia.
