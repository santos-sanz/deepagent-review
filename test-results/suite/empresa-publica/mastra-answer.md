# Análisis cuantitativo de empresa cotizada — Mastra

Voy a recopilar los datos de Apple desde varias fuentes en paralelo.# 🍎 Apple Inc. (AAPL) — Análisis

> Nota: `quote` y `financials` corresponden a la sesión del **9-oct-2026 20:00 UTC** (NasdaqGS, Yahoo Finance, cotización con posible retardo de hasta 15 min).

## 1. Cotización actual

| Métrica | Valor | Fuente |
|---|---|---|
| Precio | **336,64 USD** | Yahoo Finance (09-10-2026) |
| Variación diaria | **−1,11%** (cierre previo 340,42) | Yahoo Finance |
| Rango del día | 330,70 – 338,61 | Yahoo Finance |
| Rango 52 semanas | 243,42 – 345,34 | Yahoo Finance |
| Volumen | ~37,9 M | Yahoo Finance |
| Capitalización | **4,91 B$** (~4,9 billones) | Yahoo Finance |
| Valor empresa (EV) | 4,99 B$ | Yahoo Finance |

Está **a ~2,5% de su máximo de 52 semanas** y un **+38% por encima del mínimo**. Nótese el elevado volumen y el rango amplio del día: el ruido viene de las noticias de recorte de pedidos (ver punto 5).

## 2. Fundamentales clave

| Métrica | Valor | Lectura |
|---|---|---|
| P/E trailing | **38,6x** | Muy por encima de su media histórica (~25-30x) → prima de calidad ya exigente |
| P/E forward | **35,1x** | Solo ligera compresión esperada en beneficios |
| Margen bruto | **48,7%** | Sólido, mixto producto+servicios |
| Margen operativo | **32,6%** | Excelente para hardware |
| Margen neto | **27,6%** | Top del sector |
| ROE | **148,8%** | ⚠️ Distorsionado por recompras masivas (equity contable muy reducido); no lo interpretes como rentabilidad económica real |
| Crecimiento de ingresos (YoY) | **+16,4%** | Aceleración notable para el tamaño de Apple |
| Deuda/Equity | 78,4% | Caja 62,4 B$ vs deuda 84,3 B$ — apalancamiento muy manejable |
| Beta | 1,07 | Se mueve ~como el mercado |
| Consenso analistas | **"buy"**, objetivo medio **328,09 USD** | ⚠️ Precio actual **por encima** del objetivo medio |

*Todo el bloque, Fuente: Yahoo Finance (financials, 09-10-2026).*

Dato relevante: **el mercado ya paga ~38x por una acción cuyo objetivo medio de analistas está por debajo del precio**. O el consenso va rezagado, o la acción cotiza por delante de los fundamentales.

## 3. Rendimiento y riesgo a 1 año

| Métrica | Valor | Fuente |
|---|---|---|
| Rentabilidad 12 meses | **+37,25%** | Yahoo Finance (histórico 1a, 251 sesiones) |
| Mínimo del periodo | 245,27 USD | Yahoo Finance |
| Máximo del periodo | 341,07 USD | Yahoo Finance |
| Volatilidad anualizada | **24,48%** | Yahoo Finance |

Subida fuerte con volatilidad contenida para una megacap tecnológica. Gráfico generado en `./generated/chart-AAPL-1791750368926.svg`.

## 4. Últimos filings SEC (CIK 320193)

| Formulario | Fecha | Periodo | Enlace |
|---|---|---|---|
| **10-Q** | 31-07-2026 | trimestre cerrado 27-06-2026 | [ver](https://www.sec.gov/Archives/edgar/data/320193/000032019326000020/aapl-20260627.htm) |
| 8-K | 30-07-2026 | 30-07-2026 (probable results) | [ver](https://www.sec.gov/Archives/edgar/data/320193/000032019326000018/aapl-20260730.htm) |
| **10-Q** | 01-05-2026 | trimestre cerrado 28-03-2026 | [ver](https://www.sec.gov/Archives/edgar/data/320193/000032019326000013/aapl-20260328.htm) |
| 8-K | 30-04-2026 | 30-04-2026 | [ver](https://www.sec.gov/Archives/edgar/data/320193/000032019326000011/aapl-20260430.htm) |
| 8-K/A + 8-K | 01-09-2026 / 20-04-2026 | 17-04-2026 | enmiendas y comunicados |
| **10-Q** | 30-01-2026 | trimestre cerrado 27-12-2025 | [ver](https://www.sec.gov/Archives/edgar/data/320193/000032019326000006/aapl-20251227.htm) |

*Fuente: SEC EDGAR vía herramienta de filings (09-10-2026).* No hay 10-K reciente listado — el anual debería llegar en el ciclo de otoño.

## 5. Noticias recientes (Google News, oct-2026)

1. **Recorte de pedidos del iPhone 18 (~15%)** → la acción cae. Fuente: TradingView / TIKR.com (10-11 oct 2026). Es el catalizador bajista dominante ahora mismo y explica el comportamiento del día.
2. **Fórmula 1 en exclusiva en Apple TV para EE. UU.** — movimiento de contenido para reforzar el negocio de Servicios. Fuente: Simply Wall Street (09-10-2026).
3. **"Sobrevolarada tras subir 145% en 5 años"** — valoración bajo escrutinio en prensa financiera. Fuente: Simply Wall Street (08-10-2026).

## 6. Veredicto (breve)

**Sesgo: cauteloso, con más tesis de "mantener" que de "comprar a estos precios".**

🐂 **Argumentos toro**
- Crecimiento de ingresos del +16,4% con márgenes netos del 27,6%: calidad excepcional a esta escala.
- Ecosistema Servicios + disciplinado retorno de caja (recompras) sostiene el EPS.
- Beta ~1,07 y volatilidad del 24%: perfil relativamente defensivo para una tecnológica.
- Apuesta por contenido/deporte (F1) puede acelerar el segmento de mayor margen.

🐻 **Argumentos oso**
- **P/E 38,6x** con objetivo medio de analistas (**328 USD**) *por debajo* del precio: margen de seguridad escaso.
- **Recorte del 15% en pedidos del iPhone 18**: riesgo directo a la línea de ingresos más grande.
- El ROE del 149% es un artefacto de las recompras, no rentabilidad real — cuidado al comparar.
- Cotiza a un 2,5% de máximos de 52 semanas: mucho optimismo ya descontado.

**En una frase:** gran empresa, precio exigente. La calidad justifica prima, pero el recorte de pedidos del iPhone 18 llega justo cuando el múltiplo no deja margen de error. Para quien no la tenga, esperar una corrección que acerque al rango 300 USD (o al objetivo de consenso) parece más sensato que perseguir el precio actual.

⚠️ Esto es información educativa, no asesoramiento financiero. Haz tu propia investigación (DYOR).