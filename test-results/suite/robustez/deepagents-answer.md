# Robustez ante datos inexistentes — DeepAgents

## Respuesta corta

**Ninguno de los dos activos tiene cotización bursátil, y no es un problema de falta de datos: es que no existen como valores cotizados.**

---

### 1. TikTok: no cotiza en bolsa

**No hay cotización que consultar**, y esto no es un vacío de datos ni un fallo de la herramienta. Razones verificadas:

| Punto | Detalle | Fuente |
|---|---|---|
| Quién es el dueño | TikTok es una filial de **ByteDance**, compañía **privada** (no listada) con sede en China | Perfil societario / prensa |
| Búsqueda de ticker | `asset_search("TikTok")` y `asset_search("ByteDance")` → **0 resultados** en Yahoo Finance | Yahoo Finance, consulta de hoy |
| Perfil de mercado | `company_profile("TikTok")` devuelve `exchange: "privada / no listada"` | Fuente: web |
| Situación IPO | Hay titulares sobre una eventual **salida a bolsa de la filial estadounidense** (TikTok Global / TikTok US) y sobre subastas privadas de acciones de ByteDance, pero **no hay una IPO ejecutada ni un ticker asignado** | Google News (titulares de nov. 2025 – jun. 2026, fechas no verificadas una a una) |

**Lo que sí existe son valoraciones de mercado secundario, no cotizaciones:** los titulares apuntan a valoraciones de ByteDance en el entorno de **~480.000 M$** en subastas privadas de acciones (Yahoo Finanzas, nov. 2025). Eso es una **transacción OTC/privada entre inversores**, no un precio de bolsa: no hay mercado continuo, ni liquidez pública, ni cierre diario.

⚠️ Aviso: el resultado de `web_search` para verificación adicional devolvió resultados pobres y no relacionados (Wikipedia, GitHub), así que **no doy por confirmado ningún detalle de la estructura de la posible IPO**. Si quieres certeza sobre ese punto, puedo encargar una investigación web más profunda.

---

### 2. XYZABC123: no existe

**No hay precio porque el símbolo no corresponde a ningún activo.**

- `asset_search("XYZABC123")` → **sin resultados**.
- `quote("XYZABC123")` → **error HTTP 404 de Yahoo Finance**: *"No data found, symbol may be delisted"*.

Ese mensaje de Yahoo es genérico: significa "no encuentro este símbolo", no que haya existido y se haya deslistado. `XYZABC123` tiene toda la pinta de ser un identificador de relleno o de ejemplo, no un ticker real.

---

### Por qué no puedo darte cifras aquí

Mi regla es no inventar números. Podría escribirte "TikTok cotiza a X$" con una valoración secundaria sacada de un titular, y sería **una cifra falsa presentada como cotización**. No lo voy a hacer: una valoración en subasta privada, una estimación de banco de inversión y un precio de bolsa son tres cosas distintas y mezclarlas lleva a decisiones malas.

Si te interesa la exposición a este sector, las vías reales son:
- **Empresas comparables cotizadas** (Meta, Alphabet, Snap, Reddit, Kuaishou en HK, Tencent) — todas con datos de mercado fiables.
- **Fondos con participación en ByteDance** en su cartera a través de mercados secundarios (algunos vehículos de capital privado), que **no cotizan a NAV público diario**.
- **Esperar a la IPO**, si finalmente se ejecuta.

Dime qué te interesa (comparables cotizados de redes sociales, o seguimiento de la IPO) y te lo preparo con datos verificados.

⚠️ Esto es información educativa, no asesoramiento financiero. Haz tu propia investigación (DYOR).