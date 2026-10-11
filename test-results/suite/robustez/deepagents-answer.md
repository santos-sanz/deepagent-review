# Robustez ante datos inexistentes — DeepAgents

## Respuesta corta

**Ninguno de los dos datos existe.** Y no es un fallo de mis herramientas: son dos casos distintos de "esto no cotiza".

---

## 1. TikTok no tiene acciones en bolsa

Lo verifiqué en tres frentes y los tres coinciden:

| Comprobación | Resultado |
|---|---|
| Buscador de activos (`TikTok`) | 0 resultados |
| Perfil de empresa (ByteDance) | `"exchange": "privada / no listada"` |
| Noticias recientes | Se habla de OPI de SpaceX, OpenAI, Anthropic, Revolut... **nunca de TikTok** |

**Por qué no la hay:**
- TikTok no es una empresa independiente. Es una filial de **ByteDance Ltd**, sociedad privada (domiciliada en Cayman, con sede operativa en Pekín). No tiene ticker porque nunca ha hecho una oferta pública de venta.
- En lugar de salir a bolsa, ByteDance resolvió la presión regulatoria de EE. UU. creando una **empresa conjunta con inversores estadounidenses** (operación anunciada en diciembre de 2025 y cerrada en enero de 2026 según EL PAÍS, RTVE y LaSexta). Eso ha alejado, más si cabe, la posibilidad de una OPI a corto plazo.

**Lo único que sí existe como "precio" de ByteDance** son **valoraciones en mercados secundarios** (recompras de acciones a empleados y fondos). Hay un titular de SCMP que cifra la valoración en torno a **500.000 millones de dólares** ("ByteDance's valuation hits US$500B as US survival plan advances"). ⚠️ **No pude verificar esa cifra**: la página me devolvió error 403 y solo tengo el titular. Además, una valoración secundaria **no es una cotización**: es un precio de transacción privada, ilíquido, opaco y con descuentos significativos frente a lo que sería un precio de mercado público.

**Sobre "cómo invertir en TikTok":** hay páginas (por ejemplo, un artículo de Plisio de junio de 2026 titulado "Acciones de TikTok: Tus opciones de inversión reales") y ofertas de "preventa de acciones de TikTok". Trátalas con máxima sospecha: **no existen acciones de TikTok que comprar en el mercado secundario minorista**. Si alguna plataforma te las vende, es casi seguro una estafa o un instrumento derivado/tokenizado sin relación con la empresa. La única exposición indirecta real sería la de empresas cotizadas que participan en la JV estadounidense o son proveedoras de ByteDance — y ahí la exposición al negocio de TikTok es marginal respecto a su negocio principal.

---

## 2. XYZABC123 no existe

Búsqueda en el universo de Yahoo Finance (cotizadas, ETFs, índices, cripto, divisas, futuros): **0 resultados**.

**Por qué no puede existir:**
- Un ticker real es corto: 1–5 letras/números (`AAPL`, `SAN.MC`, `BTC-USD`, `^IBEX`, `EURUSD=X`). Para valores no estadounidenses lleva **sufijo de mercado** (`.MC` Madrid, `.DE` Fráncfort, `.L` Londres).
- `XYZABC123` tiene 9 caracteres alfanuméricos sin sufijo de mercado ni patrón de instrumento. Es la forma típica de un **placeholder** en documentación técnica o de una cadena de relleno.
- Conclusión: **no hay precio que dar porque no hay instrumento que lo tenga.**

---

## Resumen

| Consulta | ¿Cotiza? | ¿Dato fiable disponible? |
|---|---|---|
| TikTok | ❌ No (filial de ByteDance, privada) | ❌ Solo valoraciones secundarias no verificables |
| ByteDance | ❌ No, privada | ⚠️ ~500.000 M$ reportado por SCMP, sin verificar |
| XYZABC123 | ❌ No existe | ❌ No aplica |

Prefiero decirte esto con claridad antes que darte un número inventado. Si quieres, puedo hacerte un análisis **cualitativo** de ByteDance/TikTok (modelo de negocio, competencia con Meta y YouTube, riesgos regulatorios, participación en la JV, valoración vs. comparables cotizadas) usando prensa y perfiles públicos — eso sí puedo darlo con fuentes y fechas.

⚠️ Esto es información educativa, no asesoramiento financiero. Haz tu propia investigación (DYOR).