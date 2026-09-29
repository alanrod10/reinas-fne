# QA — Gate 11 · Auditoría histórica

Fecha: 2026-09-29

## Resultado

`node historical-qa.js` → PASS

La regresión verifica que el dataset no haya cambiado accidentalmente durante la ampliación funcional.

### Controles

- Secuencia Nacional 2010–2026 → PASS
- Secuencia Jujuy 2010–2026 → PASS
- 2020 sin elección en ambos niveles → PASS
- Único colegio no confirmado: María Sol Gutiérrez Mora 2010 → PASS
- 32 elecciones efectivas → PASS
- 31 fotografías directas verificadas con record existente → PASS
- `fieldEvidence` presente en registros elegidos → PASS
- Fuentes de producción con URL específica → PASS
- Variantes nominales críticas preservadas → PASS
- Estructura regional de Jujuy 2017–2019 y 2021–2026 → PASS

## Estado fotográfico

Se incorporaron 6 fotografías remotas reales, cada una enlazada con su cobertura original y marcada `rightsStatus: source-linked`. No se descargaron localmente ni se presentó una copia como material propio.

La foto se clasifica como `post-coronation` + `strong-contextual`; no se afirma que muestre el segundo exacto de colocación de la corona.

## Pendientes no falsificados

- ✅ atlas nacional + Jujuy integrado con referencias cartográficas externas;
- catálogo fotográfico ampliado a 10 imágenes remotas verificadas;
- ✅ smoke test de renderizado de 9 secciones;
- E2E estable en navegador en este entorno;
- auditoría visual responsive final;
- ampliación progresiva del catálogo hacia los registros aún sin fotografía verificada.

Gate 11 queda **APROBADO para continuar hacia la fase final de integración**, no declarado como entrega definitiva.
