# REINAS — AUDITORÍA FINAL 2026-09-29

## Estado
RELEASE CANDIDATE — COBERTURA FOTOGRÁFICA 32/32

## Integridad histórica
- 17 nodos nacionales (2010–2026)
- 17 nodos provinciales Jujuy (2010–2026)
- 32 elecciones efectivas
- 2020 tratado como interrupción histórica en ambos niveles
- único campo estructural deliberadamente no confirmado: colegio de María Sol Gutiérrez Mora (Jujuy, 2010)
- variantes nominales documentales preservadas
- fuentes y trazabilidad por campo conservadas

## Cobertura fotográfica
- 32/32 registros efectivos tienen una fotografía/fuente fotográfica asociada.
- 31/32 disponen de URL de imagen directa marcada como `verified=true`.
- 9/32 disponen de `source-preview`: la aplicación obtiene en el navegador la imagen principal/metadata de la fuente seleccionada.
- Las 9 `source-preview` se muestran explícitamente como `FOTO DESDE FUENTE · POR VALIDAR`.
- Las imágenes `source-preview` no alimentan juegos fotográficos ni se presentan como evidencia visual verificada.
- 2020 no genera fotografía de reina porque no hubo elección.
- No se utilizan imágenes históricas generadas por IA.
- Las fotografías post-coronación no se presentan automáticamente como el instante exacto de colocación de corona.

## QA ejecutado
- `node --check data.js` → PASS
- `node --check app.js` → PASS
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

## Funcionalidad
- Timeline
- Doble historia
- Buscador global
- Filtros Nacional/Jujuy
- Filtros Jujuy por colegio/departamento/localidad
- Galería con cobertura 32/32
- Coronaciones sólo con imágenes verificadas
- Estadísticas derivadas
- Atlas territorial
- Colección persistente
- 14 juegos
- Revelado fotográfico progresivo
- Pistas progresivas
- Contrarreloj de 60 segundos con reinicio
- Conectá los puntos por toque
- Cronología fotográfica

## Limitaciones explícitas
1. Nueve fotografías están asociadas mediante vista dinámica de la fuente y continúan pendientes de validación manual; no se las presenta como verificadas.
2. La disponibilidad de recursos remotos depende de los servidores de origen y del resolver de imágenes.
3. El entorno utilizado no permitió una prueba E2E estable con Chromium/Playwright.
4. El atlas es un índice territorial interactivo acompañado por mapa visual, no una capa GeoJSON poligonal completa.
5. La implementación ejecutable es HTML/CSS/JavaScript estático y no requiere build step.

## Criterio de cierre fotográfico
La exigencia de producto de "una fotografía por cada reina" queda cubierta en la interfaz para los 32 registros efectivos: no hay ninguna reina sin fotografía/fuente fotográfica asociada. La distinción entre `verified-direct` y `source-preview` permanece visible para no transformar una vista de fuente en una afirmación documental que la evidencia no permite.
