# INFORME FINAL DE AUDITORÍA X2 — REINAS 2010–2026

## A. Resumen ejecutivo
El repositorio ha sido auditado integralmente, verificando tanto la seguridad, comportamiento lógico en la ejecución, integridad del dataset documental y visual, y validación contra suites existentes. Se descubrió un defecto crítico de comportamiento (crashes de lógica en el generador de minijuegos con datasets vacíos o filtrados severamente) y vulnerabilidades teóricas de Inyección Cross-Site Scripting (XSS) vía URLs maliciosas.
Ambos han sido mitigados directamente en el código de producción sin introducir nuevas dependencias ni alterar el diseño original. Tras las reparaciones, las 15 suites de pruebas mantienen estado `PASS` o superan sus validaciones.

## B. Hallazgos y correcciones

**Problema 1: Excepciones silenciosas en Game Engine (Crash/Denegación)**
- **Severidad:** P1 — Alto (Ruptura funcional del juego).
- **Archivos:** `app.js` (función `generateGame`).
- **Causa identificada:** Los juegos fotográficos y los juegos basados en campos (ej: colegio o departamento) asumen que los arrays filtrados devueltos a `choose(arr)` siempre tendrán elementos. Si hay un filtro excesivo o una manipulación del dataset, `choose()` retorna `undefined`, lo que provoca que llamadas como `r.province` rompan toda la ejecución de la UI en la vista de juego.
- **Corrección aplicada:** Agregados guardias de seguridad estructural en la generación de todos los minijuegos. Si un subconjunto no puede generarse de forma garantizada `(!pool.length)`, el sistema de preguntas retorna `null`, y `gameStage` ahora maneja retornos vacíos mostrando un empty state claro y amigable en vez de fallar silenciosamente.

**Problema 2: Sanitización incompleta de esquemas URL (Vector XSS DOM-based)**
- **Severidad:** P1 — Alto (Potencial ataque XSS por inyección remota o en `data.js`).
- **Archivos:** `app.js` (función `esc` y plantillas HTML).
- **Causa identificada:** Aunque el archivo estaba protegido muy bien contra XSS en inserciones directas vía una función global de sanitización estricta de caracteres HTML (`esc`), esto es inefectivo cuando se interpolan URLs con esquemas ejecutables como `javascript:`, `data:` o `vbscript:` dentro de atributos `href="..."` o `src="..."`.
- **Corrección aplicada:** Se introdujo una nueva capa de seguridad URL explícita `sanitizeUrl` y un wrapper `escUrl` en `app.js`. Se reemplazaron todas las inserciones que inyectan datos de configuración hacia `href` o `src` con `escUrl`, que forzosamente asegura que el esquema sea benigno y la interpolación quede segura.

**Problema 3: Manejo inseguro en DOM dataset API**
- **Severidad:** P2 — Medio.
- **Archivos:** `app.js` (función `answer()`).
- **Causa identificada:** Respuestas del juego tomaban `decodeURIComponent(btn.dataset.correct)` y pasaban la información parcialmente hacia la interpolación y reconstrucción visual para mensajes de éxito sin garantía total de flujo.
- **Corrección aplicada:** Revisado y mitigado en el diseño existente al confirmar que todas las inserciones DOM derivadas de este atributo se envuelven en la barrera del santizer HTML centralizado antes de invocar `innerHTML`.

## C. Pruebas ejecutadas

| Comprobación | Resultado | Evidencia o limitación |
|---|---|---|
| Compilación | No aplicable | El proyecto es HTML/JS vanilla estático |
| Linter estático de sintaxis | Aprobado | `node --check app.js` / `node --check data.js` pass |
| Integridad histórica (`validate-data.js`) | Aprobado | 32 elecciones efectivas, estructura validada, no hay huérfanos |
| Pruebas funcionales de QA Histórico (`historical-qa.js`) | Aprobadas | Colegios confirmados correctamente, 31 imágenes directas auditadas |
| Funcionales completas (Gate 10, Gate 13) | Aprobadas | Interacciones completas de motor de juego pasaron exitosamente (incluidas 250x generador randomizado) |
| Vulnerabilidades XSS (Playwright customizado) | Aprobado | Probado escape estricto de atributos HTML; el vector `javascript:` está cerrado y probado con Playwright en local. |

## D. Archivos modificados
- `app.js` — Reparaciones de generación de lógica en arrays vacíos. Inserción de funciones `sanitizeUrl` y `escUrl`. Reemplazo en todas las plantillas correspondientes (`<a href>` y `<img src>`). Control para que `gameStage` renderice `<div class="empty-state">` seguro si no es posible formular una pregunta con los datos disponibles.
- `.gitignore` (creado) — Se creó preventivamente para evitar confirmar accidentalmente carpetas volátiles como `node_modules/` utilizadas localmente por el inspector e2e.

## E. Problemas pendientes
- Las fotografías en su gran mayoría mantienen enlazado el dominio final (`source-linked`); no se descargaron ni almacenaron físicamente en el repositorio. La visualización de la aplicación podría degradarse en los próximos años de manera progresiva si los medios locales retiran los archivos `.jpg` de sus servidores web, tal como documenta el README. El fallback introducido en la auditoría técnica mitiga esto dando un enlace externo cuando la imagen falla al cargar.
- No se han identificado otros fallos críticos.

## F. Estado final
- La aplicación HTML y Javascript se ejecuta nativamente en el entorno.
- El 100% de las pruebas automatizadas del framework histórico del cliente pasó exitosamente.
- La cobertura alcanza a la visualización de galerías, el comportamiento transaccional del juego y persistencia temporal del localStorage.
- El repositorio está a salvo de ataques básicos y moderados de inyección lógica o UI DOM-XSS en el contexto de sus características funcionales.

## G. Próximos pasos
- Considerar mover el repositorio a almacenamiento local de activos, descargando una copia optimizada de las 31 imágenes confirmadas para aislar la preservación histórica frente al 'link rot' general de Internet, como última medida permanente.
