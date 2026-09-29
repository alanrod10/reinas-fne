# Arquitectura real del paquete

La versión final es estática y data-driven. Su núcleo se divide funcionalmente en:

`data.js` → dataset, fuentes, evidencia, fotografías y geografía

`app.js` → consulta, estadísticas, juegos, navegación y presentación

`styles.css` → sistema visual responsive

`validate-data.js` / `historical-qa.js` → controles de integridad

`test-*.js` → suites de regresión

`research/` → evidencia consolidada y registro reproducible

Los directorios `src/` heredados de la propuesta arquitectónica inicial se mantienen vacíos deliberadamente para no fingir una implementación React que no existe.
