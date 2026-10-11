# Comparativa de 3 activos — Mastra

Voy a obtener los datos históricos de los tres activos para calcular rendimiento y volatilidad a 1 año.Déjame confirmar la fecha de referencia de los datos con las cotizaciones actuales.## Comparativa a 1 año: AAPL vs MSFT vs S&P 500

**Datos de Yahoo Finance a cierre del 9-oct-2026** (última vela diaria disponible; las cotizaciones pueden ir con retardo de hasta 15 min). Periodo analizado: últimos 12 meses, 251 sesiones diarias.

| Métrica | **AAPL** | **MSFT** | **S&P 500 (^GSPC)** |
|---|---|---|---|
| Precio actual | 336,64 $ | 535,07 $ | 7.811,54 |
| **Rendimiento 1 año** | **+37,25 %** | **+4,72 %** | **+19,21 %** |
| **Volatilidad anualizada** | **24,48 %** | **32,84 %** | **12,76 %** |
| Mínimo del periodo | 245,27 $ | 352,83 $ | 6.343,72 |
| Máximo del periodo | 341,07 $ | 542,07 $ | 7.818,93 |
| Rango 52 semanas (low / high) | 243,42 / 345,34 $ | 349,20 / 553,72 $ | 6.316,91 / 7.844,52 |
| Variación del día | −1,11 % | +2,38 % | +0,59 % |

**Fuente:** Yahoo Finance (series históricas diarias y cotización actual), datos a 9-oct-2026. Volatilidad calculada como desviación típica de retornos diarios anualizada (×√252).

---

### Lectura en riesgo-retorno

- **Mejor inversión en retorno absoluto: AAPL (+37,25 %)**. Superó al índice por ~18 puntos porcentuales y a MSFT por más de 32 pp, con un recorrido alcista sostenido (mínimo del periodo en 245 $, máximos cerca de 341 $).
- **MSFT: retorno pobre con la mayor volatilidad de la tabla (+4,72 % y 32,84 %)**. Es el peor binomio riesgo-retorno del grupo: apenas batió a un depósito, pero con oscilaciones anualizadas de casi 33 % —un rango de 52 semanas enorme (349 $ a 554 $). Aquí el ratio retorno/riesgo es claramente el más desfavorable.
- **S&P 500: la referencia de eficiencia (+19,21 % con solo 12,76 % de volatilidad)**. Es, con diferencia, el activo que logró más retorno por unidad de riesgo (ratio ≈ 1,5 vs ≈ 1,5 en AAPL... en realidad MSFT sale ≈ 0,14). El índice ofrece diversificación y una volatilidad muy inferior a la de las dos acciones individuales.

### ¿Quién asumió más riesgo?

1. **MSFT** — mayor volatilidad (32,84 %), el activo que más osciló.
2. **AAPL** — volatilidad intermedia (24,48 %), pero compensada con creces por un retorno muy superior; mejor *sharpe* bruto del grupo.
3. **S&P 500** — el más estable (12,76 %) y un retorno decente; la opción con mejor perfil riesgo-retorno y menor riesgo idiosincrático (no depende de una sola empresa).

### Veredicto

- **Si priorizas retorno absoluto:** ganó **AAPL**.
- **Si priorizas retorno ajustado a riesgo:** ganó el **S&P 500** (retorno sólido con la mitad de volatilidad que las acciones individuales).
- **El caso más flojo:** **MSFT**, que asumió el mayor riesgo sin traducirlo en retorno en este periodo concreto.

⚠️ Nota metodológica: un solo año es una ventana corta y muy sensible al punto de partida y final. Las volatilidades y retornos pasados no predicen los futuros.

⚠️ Esto es información educativa, no asesoramiento financiero. Haz tu propia investigación (DYOR).