# QA — Gate 10

Fecha: 2026-09-29

## Resultado del núcleo

- `node --check app.js` → PASS
- `node --check data.js` → PASS
- `node validate-data.js` → PASS
- `node test-gate10.js` → PASS

## Controles automatizados

1. Cobertura 2010–2026 en Nacional y Jujuy → PASS
2. 2020 como `no-election` sin persona → PASS
3. IDs de registros únicos → PASS
4. Todas las fuentes referenciadas existen → PASS
5. Jujuy 2010 como único colegio no confirmado → PASS
6. Catálogo de imágenes sin referencias huérfanas → PASS
7. Estadística base: 32 elecciones / 17 años / 2 interrupciones → PASS
8. 10 juegos de datos generan preguntas con respuesta → PASS
9. Juego de colegio nunca selecciona Jujuy 2010 sin colegio confirmado → PASS
10. Variantes nominales críticas conservadas → PASS
11. Fuentes usadas ya no apuntan sólo a portadas generales → PASS

## Fuente y trazabilidad

Los registros ahora apuntan a URLs específicas de artículos o coberturas. Cada record mantiene `fieldEvidence` para los campos estructurales actualmente documentados.

Las páginas de entrada generales quedan fuera de la vista de evidencia de las fichas.

## Fotografía

`imageCatalog` contiene 6 imágenes verificadas y enlazadas a sus coberturas originales. Se mantienen como referencias externas.

Por diseño, los juegos fotográficos permanecen bloqueados y la interfaz no sustituye fotografías reales por imágenes sintéticas.

## Prueba E2E

Se dispone de Chromium en el entorno, pero la ejecución headless anterior no terminó de forma confiable. No se marca como PASS. Se mantiene como pendiente de una ejecución E2E estable.

## Estado

**Gate 10 — núcleo automatizado: APROBADO.**

**Gate 10 — E2E/visual completo: PENDIENTE.**

No se declara todavía aprobación total del Gate 10 porque faltan una ejecución de navegador reproducible y la auditoría visual final.
