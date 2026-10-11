# Comparativa de 3 activos — DeepAgents

## Comparativa a 1 año — AAPL, MSFT y S&P 500

**Datos:** Yahoo Finance, cierre del 09/10/2026 (16:00 ET para las acciones de Nasdaq, 21:29 UTC para el índice). Son precios de cierre; pueden llevar retardo. Ventana de 251 sesiones diarias.

| Métrica | **AAPL** | **MSFT** | **^GSPC (S&P 500)** |
|---|---|---|---|
| Precio actual | 336,64 USD | 535,07 USD | 7.811,54 pts |
| Variación 1 año | **+37,25%** | **+4,72%** | **+19,21%** |
| Volatilidad anualizada | **24,48%** | **32,84%** | **12,76%** |
| Mínimo 1 año | 245,27 USD | 352,83 USD | 6.343,72 pts |
| Máximo 1 año | 341,07 USD | 542,07 USD | 7.818,93 pts |
| Rango 52 sem. (actual) | 243,42 – 345,34 | 349,20 – 553,72 | 6.316,91 – 7.844,52 |
| Retorno/riesgo (retorno ÷ vol.) | **1,52** | **0,14** | **1,51** |

*Fuente: Yahoo Finance (series históricas y cotizaciones). Variación = cierre del último día vs. primer cierre de la ventana de 1 año. Volatilidad = desviación típica de retornos diarios logarítmicos × √252.*

### Lectura de los números

- **Mejor inversión: AAPL (+37,25%)**, muy por encima del índice y de MSFT. Además lo consiguió con **menos volatilidad que MSFT** (24,5% vs 32,8%), así que gana en retorno *y* en eficiencia (retorno/riesgo 1,52 vs 0,14).
- **Peor combinación: MSFT.** Es la paradoja clásica: el activo **más volátil del grupo (32,8%)** fue el que **menos rentó (+4,7%)**. Pagó el precio del riesgo sin cobrar la prima. Además cotiza a ~535 USD frente a un máximo de 542 y un mínimo anual de 353, así que ha pasado buena parte del año devolviendo parte de su rally anterior.
- **S&P 500: el más eficiente y el menos arriesgado.** +19,2% con solo 12,8% de volatilidad. Su retorno/riesgo (1,51) es casi idéntico al de AAPL, pero con la mitad de volatilidad y sin riesgo de concentración en un solo valor.
- **AAPL cotiza cerca de máximos** (336,6 vs máx. 52 sem. de 345,3), mientras que MSFT está a un ~3% del suyo. En ambos casos el punto de entrada importa.

### ¿Quién asumiría más riesgo?

**MSFT**, sin discusión, en términos de volatilidad realizada, y ese riesgo **no se compensó** en este periodo. AAPL fue el segundo más volátil, pero con rentabilidad muy superior. El índice fue el más estable.

Matiz importante: la volatilidad **pasada no predice la futura** y un año es una muestra corta. Que AAPL haya ganado no significa que sea la mejor opción a futuro; su múltiplo y sus expectativas ya incorporan parte de ese buen comportamiento.

### Advertencias metodológicas

- Estas cifras son **retorno de precio, no retorno total**: **no incluyen dividendos**. AAPL y MSFT reparten dividendo y el índice también (~1,3–1,5% anual de media), así que el retorno total de los tres sería algo superior; el orden no cambiaría.
- **No hay ajuste por riesgo de divisa**: los tres están en USD, así que un inversor en EUR asume además riesgo EUR/USD.
- Las gráficas de las series se han guardado en `generated/chart-AAPL-*.svg`, `generated/chart-MSFT-*.svg` y `generated/chart-_GSPC-*.svg`.

⚠️ Esto es información educativa, no asesoramiento financiero. Haz tu propia investigación (DYOR).