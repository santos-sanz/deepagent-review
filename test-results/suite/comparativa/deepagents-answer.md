# Comparativa de 3 activos — DeepAgents

## Comparativa a 1 año — AAPL vs MSFT vs S&P 500

**Datos a 9-oct-2026 (Yahoo Finance), ventana de 12 meses con 251 sesiones diarias**

| Métrica | AAPL | MSFT | S&P 500 (^GSPC) |
|---|---|---|---|
| **Rendimiento 1 año** | **+37,25%** | **+4,72%** | **+19,21%** |
| **Volatilidad anualizada** | 24,48% | **32,84%** | **12,76%** |
| Rentabilidad/riesgo | **1,52** | 0,14 | 1,51 |
| Mínimo / máximo 12m | 245,27 / 341,07 USD | 352,83 / 542,07 USD | 6.343,72 / 7.818,93 pts |
| Precio actual | 336,64 USD | 535,07 USD | 7.811,54 pts |
| Distancia a máximo 12m | −1,5% | −1,3% | −0,4% |
| Beta | 1,07 | 1,10 | 1,00 (ref.) |
| P/E trailing / forward | 38,6 / 35,1 | 29,8 / 22,6 | — |
| Consenso | buy (328,09 USD) | **strong_buy** (587,63 USD) | — |

*Fuente: Yahoo Finance (histórico diario y ficha fundamental). Volatilidad = desv. típica de retornos diarios × √252. Cotizaciones con posible retardo de hasta 15 min.*

### Lectura
- **Mejor retorno absoluto: AAPL (+37,25%)**, casi el doble que el índice y con la segunda volatilidad más baja de las acciones → mejor perfil rentabilidad/riesgo.
- **Empate técnico ajustado a riesgo: AAPL (1,52) vs S&P 500 (1,51)**. El índice logra lo mismo con menos de la mitad de volatilidad. Eso es lo difícil de batir de forma sostenida.
- **Más riesgo: MSFT**, con 32,84% de volatilidad (2,6× el índice, +34% sobre AAPL) y solo +4,72% de retorno. Su recorrido 12m implica un drawdown de ~35% desde máximos intradía.
- **Matiz importante sobre MSFT**: hoy cotiza a −1,3% de su máximo de 52 semanas y con "strong_buy" y objetivo medio 587,63 USD (+10%). El mal año se concentró en la primera mitad del periodo; el punto de partida actual es el opuesto al de hace 12 meses.
- **AAPL es el más caro**: P/E forward 35,1x y su precio objetivo medio (328,09) está **por debajo** del precio actual. El mercado ya descuenta mucho.
- Recuerda que la volatilidad mide magnitud de movimientos, no dirección: beta alta no implica pérdida, pero aquí MSFT sí la materializó.

### Riesgos y catalizadores
- **AAPL** — a favor: ingresos +16,4%, margen operativo 32,6%, mix de servicios. En contra: múltiplo exigente, consenso por debajo del precio, ROE inflado por recompras/apalancamiento.
- **MSFT** — a favor: ingresos +17,7%, margen operativo 45,1%, recuperación ya en curso, recorrido al consenso. En contra: volatilidad, beta y dependencia del retorno del capex en IA.
- **S&P 500** — a favor: diversificación y 12,8% de volatilidad. En contra: concentración en megacaps tech, es decir, llevas parte del mismo riesgo de AAPL/MSFT en dosis menor.

### Conclusión
**Mejor inversión: Apple** en términos absolutos (+37,25%); ajustada a riesgo, **Apple y el S&P 500 empatan** (1,52 vs 1,51), pero el índice lo consigue con mucha menos volatilidad, lo que lo hace más consistente. **Más riesgo: Microsoft** (32,84% de volatilidad, beta 1,10). Y si el criterio es "más sobrevalorada", esa etiqueta es para Apple, con 35x forward y analistas ya por debajo del precio.

Cautela: 251 sesiones son una muestra corta; la volatilidad realizada cambia bastante de un año a otro.

Informe guardado en **`./.agent-fs/informe-comparativa-aapl-msft-sp500.md`** y gráficos SVG en `./generated/`.

⚠️ Esto es información educativa, no asesoramiento financiero. Haz tu propia investigación (DYOR).