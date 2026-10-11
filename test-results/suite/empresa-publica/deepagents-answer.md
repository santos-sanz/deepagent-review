# Análisis cuantitativo de empresa cotizada — DeepAgents

He recogido todos los datos en paralelo. Aquí va el análisis.

---

# 🍎 Apple Inc. (AAPL) — Análisis

**Fuente de datos:** Yahoo Finance (cotización con posible retardo de hasta 15 min) · **Fecha/hora del dato de mercado: 09-oct-2026, 20:00 UTC** (cierre del Nasdaq)

## 1. Cotización actual

| Métrica | Valor | Fuente |
|---|---|---|
| Precio | **336,64 USD** | Yahoo Finance (09-oct-2026 20:00 UTC) |
| Variación día | **−1,11 %** (−4,08 USD) | Yahoo Finance |
| Cierre anterior | 340,42 USD | Yahoo Finance |
| Rango del día | 330,70 – 338,61 USD | Yahoo Finance |
| Volumen | 37,88 M | Yahoo Finance |
| Rango 52 semanas | 243,42 – **345,34 USD** | Yahoo Finance |
| Capitalización | **4,91 B USD** (~4,9 billones) | Yahoo Finance |

Cotiza a ~2,5 % de su máximo de 52 semanas.

## 2. Fundamentales clave

| Métrica | Valor | Lectura |
|---|---|---|
| P/E trailing | **38,6×** | Caro en absoluto |
| P/E forward | **35,1×** | Se espera ligera mejora de beneficios |
| EV | 4,99 B USD | Yahoo Finance |
| Margen bruto | **48,7 %** | Nivel históricamente alto |
| Margen operativo | **32,6 %** | Excelente |
| Margen neto | **27,6 %** | Excelente |
| ROE | **148,8 %** | Distorsionado por recompras agresivas (equity contable muy reducido) — no usar como señal de eficiencia pura |
| Crecimiento de ingresos | **+16,4 %** | Muy sólido para una empresa de este tamaño |
| Deuda/Equity | 78,4 % | Caja 62,4 B USD vs. deuda 84,3 B USD → **deuda neta ≈ 21,9 B USD**, perfectamente manejable |
| Beta | 1,07 | Ligeramente más volátil que el mercado |
| Precio objetivo medio | **328,09 USD** | ⚠️ **Por debajo** del precio actual (≈ −2,5 %) |
| Recomendación consenso | *buy* | Yahoo Finance |

**Paradoja a señalar:** el consenso recomienda "compra" pero su precio objetivo medio está *por debajo* de la cotización. Eso sugiere objetivos ya revisados a la baja mientras la acción ha seguido subiendo.

## 3. Rendimiento y volatilidad a 1 año

| Métrica | Valor | Fuente |
|---|---|---|
| Rentabilidad 1 año | **+37,25 %** | Yahoo Finance, serie diaria |
| Rango del periodo | 245,27 – 341,07 USD | Yahoo Finance |
| **Volatilidad anualizada** | **24,48 %** | Cálculo sobre serie diaria (251 sesiones) |
| Puntos de la serie | 251 | Yahoo Finance |

Gráfico generado en: `./generated/chart-AAPL-1791754101518.svg`

Un +37 % anual con 24,5 % de volatilidad implica un ratio rentabilidad/riesgo de aproximadamente **1,5** — bueno, aunque la volatilidad es superior a la media histórica del S&P 500.

## 4. Últimos filings SEC relevantes

| Form | Fecha presentación | Periodo | Enlace |
|---|---|---|---|
| **10-Q** | 31-jul-2026 | Trimestre cerrado 27-jun-2026 | [sec.gov](https://www.sec.gov/Archives/edgar/data/320193/000032019326000020/aapl-20260627.htm) |
| **8-K** | 30-jul-2026 | Resultados Q3 FY26 | [sec.gov](https://www.sec.gov/Archives/edgar/data/320193/000032019326000018/aapl-20260730.htm) |
| 10-Q | 01-may-2026 | Trimestre cerrado 28-mar-2026 | [sec.gov](https://www.sec.gov/Archives/edgar/data/320193/000032019326000013/aapl-20260328.htm) |
| 8-K/A | 01-sep-2026 | Enmienda (evento de 17-abr-2026) | [sec.gov](https://www.sec.gov/Archives/edgar/data/320193/000114036126035325/ef20081427_8ka.htm) |

Cronología coherente con un calendario fiscal cuyo Q4/FY26 se cierra a finales de septiembre y se reportará previsiblemente a finales de octubre. El 10-Q del 31-jul es el documento más fresco con cuentas auditadas/trimestrales.

## 5. Noticias recientes (Google News RSS)

1. **"Apple Stock Drops After Reports of Reduced iPhone 18 Production Orders"** — TIKR.com, 11-oct-2026. El detonante directo de la caída.
2. **"Apple (AAPL) cae; los pedidos del 18 Pro se reducen 15 %; plazos de entrega dispares"** — TradingView, 10-oct-2026. Cifra concreta: **recorte del 15 % en pedidos del iPhone 18 Pro**.
3. **"Las acciones de Apple (AAPL) parecen estar sobrevaloradas tras su subida del 145 % en los últimos cinco años"** — Simply Wall Street, 08-oct-2026. Debate de valoración.
4. *(contexto positivo)* **"Key facts: Apple Inc. cuts iPhone 18 Pro orders; Q3 $109.4B; Ives $400"** — TradingView, 09-oct-2026. Ingresos trimestrales de **109,4 B USD** y objetivo de 400 USD de Dan Ives (Wedbush), frente a un consenso de 328 USD → **dispersión enorme entre analistas**.

## 6. Riesgos y catalizadores

**Riesgos (oso)**
- Múltiplo exigente: **38,6× trailing / 35,1× forward**. Poco margen de error.
- **Recorte del 15 % en pedidos del iPhone 18 Pro** → riesgo de estimaciones a la baja para el próximo ciclo de producto.
- Precio objetivo medio del consenso (328 USD) **ya por debajo** del precio actual.
- Dependencia extrema del iPhone y de China en la cadena de suministro.
- ROE del 148 % es artefacto contable por recompras, no señal de calidad diferencial.

**Catalizadores (toro)**
- Crecimiento de ingresos del **+16,4 %** con márgenes operativos del 32,6 %: combinación poco frecuente.
- Expansión en IA *on-device* en Mac y servicios de mayor margen (incluido contenido deportivo, p. ej. F1 exclusivo en Apple TV en EE. UU.).
- Generación de caja y recompras sostenidas que apuntalan el BPA.
- Caída del día del −1,1 % es modesta para un titular negativo: el mercado no lo está tratando como un colapso de la tesis.

---

## 🎯 Veredicto: **NEUTRAL con sesgo toro de largo plazo, cautela táctica**

**Toro:** negocio excepcional, crecimiento de doble dígito en ingresos con márgenes récord, caja neta controlada y beta contenida. Un inversor de largo plazo con horizonte >3 años tiene argumentos sólidos.

**Oso:** a 38,6× beneficios y con el precio objetivo medio del consenso por debajo de la cotización, **el precio ya descuenta buena parte de las buenas noticias**. El recorte de pedidos del iPhone 18 Pro es un aviso de que la estimación de crecimiento puede revisarse a la baja.

**En una frase:** gran empresa, cotización exigente y momento de corto plazo frágil — no es momento de comprar con urgencia, pero tampoco de tesis rota.

⚠️ Esto es información educativa, no asesoramiento financiero. Haz tu propia investigación (DYOR).