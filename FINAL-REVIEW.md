# REINAS — REVISIÓN FINAL AUDITADA

## Resultado
PAQUETE FINAL AUDITADO · revisión exhaustiva

## Integridad histórica
- Nacional: 17 nodos (2010–2026).
- Jujuy: 17 nodos (2010–2026).
- Elecciones efectivas: 32.
- 2020: interrupción histórica en ambos niveles.
- Colegio de María Sol Gutiérrez Mora (Jujuy 2010): `NO CONFIRMADO`.
- Fotografías verificadas integradas: 10.

## Correcciones comprobadas en esta auditoría
- `Intrusa en la línea`: la intrusa procede de otra provincia, por lo que la relación objetiva es única.
- `60 segundos`: genera aleatoriamente desafíos de nombre, año, provincia, departamento o colegio según disponibilidad.
- `Memoria fotográfica`: utiliza modos nombre/año/provincia/departamento/colegio cuando el dato está confirmado.
- `Adiviná con pistas`: la pista de apellido usa la inicial del último token del nombre.
- `Fotografía + cronología`: evita empates de año.
- Al abandonar una partida, el cronómetro de 60 segundos se detiene.
- El modelo expone también `type`, `jurisdiction`, `titleHistorical`, `dataSources` e `imageSource*`/`imageVerified` compatibles con el esquema documental.

## Pruebas
Se ejecutaron las suites existentes y la auditoría ampliada `audit-final.js`. Todos los controles reportaron PASS.

## Límites deliberados
1. No todas las reinas tienen una fotografía histórica verificada integrada.
2. Las fotografías integradas son remotas; no se garantiza su disponibilidad offline.
3. El atlas utiliza una representación cartográfica externa y un índice territorial interactivo; no hay todavía polígonos GeoJSON clickeables dentro del mapa.
4. El entorno de esta revisión no permitió ejecutar un E2E de navegador reproducible.
5. La arquitectura real es estática HTML/CSS/JavaScript, no React/TypeScript.

Ningún límite se rellena con datos o fotografías inventadas.
