# Cartera educativa + plan FIRE — Mastra

Voy a construir la propuesta de cartera y el cálculo FIRE con las herramientas deterministas.# Tu plan: cartera educativa + ruta FIRE (España, 35 años)

**Perfil base asumido:** residente fiscal en España, 35 años, 20.000 € invertibles, riesgo 4/5, objetivo 2.500 €/mes netos. Como no me has dado tu capacidad de ahorro anual, he modelado varios escenarios (12.000 / 15.000 / 18.000 € al año) y te señalo cuál cierra el objetivo.

---

## 1. Cartera propuesta (perfil 4/5, 100% indexada)

Generada con la herramienta de carteras del catálogo (reglas deterministas + filtro de accesibilidad y fiscalidad española).

| Clase de activo | Peso | Producto | ISIN | TER | Tipo |
|---|---|---|---|---|---|
| RV global (núcleo) | **64%** | Vanguard Global Stock Index Fund EUR Acc | IE00B03HD191 | 0,17% | Fondo |
| RV emergentes | **10%** | iShares Core MSCI EM UCITS ETF Acc (EIMI) | IE00B0M62X26 | 0,18% | ETF |
| Renta fija global cubierta EUR | **16%** | Vanguard Global Bond Index Fund EUR Hedged Acc | IE00B18GC888 | 0,15% | Fondo |
| Oro físico | **5%** | iShares Physical Gold ETC (SGLN) | IE00B579F325 | 0,12% | ETC |
| Liquidez remunerada (€STR) | **5%** | Xtrackers II EUR Overnight Rate Swap (XEON) | LU0290358497 | 0,10% | ETF monetario |

**TER medio ponderado ≈ 0,16%** → coste anual de ~32 € sobre 20.000 €. Es un coste muy bajo; el enemigo aquí es la comisión de la plataforma, no el producto.

**Cómo desplegar los 20.000 €** (ejemplo, no orden de compra):
- 12.800 € → Vanguard Global Stock (núcleo, aportación periódica mensual)
- 3.200 € → Vanguard Global Bond EUR Hedged
- 2.000 € → iShares Core MSCI EM (EIMI)
- 1.000 € → iShares Physical Gold (SGLN)
- 1.000 € → Xtrackers €STR (XEON)

⚠️ **Antes de ejecutar:** deja **fuera de esta cartera** un colchón de emergencia de 3-6 meses de gastos en cuenta remunerada o monetario. El 5% de liquidez de la cartera **no** es tu fondo de emergencia, es rebalanceo. Y verifica ISIN, TER y clase (Acc/Dist) en tu bróker/gestora antes de comprar: las clases cambian y el catálogo puede quedar desactualizado.

**Dónde contratarlo (referencia, sin comisiones de esta herramienta):** los fondos Vanguard son accesibles vía MyInvestor, Openbank, Renta 4 o Indexa; los ETFs vía DeGiro, IBKR o Trade Republic. Ojo con las comisiones de custodia, que se comen el ahorro del TER bajo.

---

## 2. Plan FIRE neto de impuestos

Calculadora determinista: SWR 4% sobre el corpus objetivo, fiscalidad del ahorro solo sobre la ganancia (la devolución de tu aportación no tributa), aportaciones crecientes en euros absolutos. **Todas las cifras están en euros de hoy (retorno ya neto de inflación).**

| Escenario | Aportación anual (creciendo +500 €/año) | Edad objetivo | Corpus alcanzado | Retirada neta/mes | ¿Objetivo 2.500 €? |
|---|---|---|---|---|---|
| A | 12.000 € | 55 | 645.450 € | 1.948 € | ❌ Faltan ~183.000 € |
| B | 12.000 € | **60** | 993.082 € | **2.944 €** | ✅ Con margen |
| C | 15.000 € (+600 €/año), retorno real 5% | **57** | 834.146 € | **2.539 €** | ✅ Justo |
| D | 18.000 € | **55** | 866.163 € | **2.613 €** | ✅ Justo |

**Lecturas clave:**
- **Corpus objetivo ≈ 828.000 €** (en euros de hoy) para 2.500 €/mes netos con SWR 4%.
- El impuesto efectivo en la fase de retirada es del **~9,4%** (no el 21%): porque solo tributa la parte de ganancia del reembolso, y en tu caso esa fracción es del ~45%. En el escenario a 60 años sube al 11,1% (más ganancia acumulada).
- **Estás a ~20-25 años del objetivo**, no a 10. Con 20.000 € de partida, la palanca real no es el capital inicial: es **cuánto ahorras cada año** y **cuánto tarda en no fallar el interés compuesto**.
- El escenario A te lo digo claro: 12.000 €/año hasta los 55 no llega. O subes la aportación (18.000 €), o retrasas la edad (60), o bajas la renta objetivo.

💡 Dos palancas que mejoran el plan: (1) cada 1.000 €/año extra de aportación sostenida recorta el objetivo final aproximadamente un año; (2) rebalancear con **traspasos entre fondos** en lugar de ventas te permite ajustar cartera **sin pasar por caja**.

---

## 3. Fiscalidad española relevante (IRPF, régimen general)

**Durante la acumulación:**
- **Traspaso entre fondos sin tributar (diferimiento fiscal):** el gran activo del inversor español. Puedes cambiar de fondo (y rebalancear) sin plusvalía. **Los ETFs NO son traspasables**: vender un ETF = hecho imponible aunque reinviertas al instante. Por eso el núcleo es fondo y los satélites ETF.
- **Fondos de acumulación:** no reparten dividendos → no declaras dividendos año a año. Se difiere todo al reembolso. Los de reparto sí tributan cada año.
- **Dividendos (si los hay):** tributan en base del ahorro, con **retención del 19%** en origen. En ETFs UCITS extranjeros, la retención en origen se sufre dentro del fondo (pérdida no recuperable, ya reflejada en el precio).
- **Planes de pensiones:** aportación máxima deducible **1.500 €/año** (reducción en base general, no ahorro); en planes de empleo hasta 10.000 €. Para FIRE puro tienen un problema: el rescate tributa como rendimiento del trabajo, y si te retiras pronto con renta baja puede salir a cuenta, pero te inmoviliza el capital. No los he incluido en la cartera.
- **Regla FIFO:** en fondos, los reembolsos siguen el orden de compra.

**En la fase de retirada (base del ahorro, escala progresiva):**

| Tramo de ganancia | Tipo |
|---|---|
| Hasta 6.000 € | 19% |
| 6.001 – 50.000 € | 21% |
| 50.001 – 200.000 € | 23% |
| 200.001 – 300.000 € | 27% |
| Más de 300.000 € | 28% |

- Solo tributa la **ganancia** (valor de transmisión − valor de adquisición), no el principal.
- **No hay compensación cruzada** entre base general (trabajo) y base del ahorro; las pérdidas patrimoniales se compensan entre sí con límite del 25% de los rendimientos de capital mobiliario del ejercicio y arrastre de 4 años.
- **5.550 € de mínimo personal** ya van incluidos en la escala.
- **Patrimonio:** el mínimo exento estatal es 700.000 € (más 300.000 € de vivienda habitual), pero está cedido a las comunidades: Madrid y Andalucía bonifican al 100%. Aún estás lejos del umbral, aunque es un impuesto que conviene vigilar a medida que el corpus crezca.
- **Ejemplo práctico de tus 2.500 €/mes:** necesitas sacar ~2.750 €/mes brutos; de esos, solo ~1.239 € son ganancia → cuota ~260 €/mes (21% sobre 1.239 €). Tu retención efectiva real ≈ 9,5%.

---

## 4. Riesgos y catalizadores

**Riesgos**
- **Concentración en EE.UU.:** ~65-70% del MSCI World. No es una cartera "global" neutral en riesgo país.
- **Divisa:** emergentes y oro cotizan en USD; puedes ganar en el activo y perder en el cambio.
- **Riesgo de secuencia de retornos:** una mala racha justo al retirarte es más peligrosa que una mala rentabilidad promedio. La SWR 4% no es una garantía.
- **Cambios fiscales:** la escala del ahorro y el impuesto de patrimonio se han movido varias veces en los últimos años.
- **Comisiones ocultas de plataforma y custodia:** pueden duplicar tu coste real frente al TER.
- **Retorno real asumido del 6%:** el desglose histórico lo respalda, pero el punto de partida de valoración de la bolsa hoy es exigente. El escenario C usa un 5% más prudente.

**Catalizadores**
- Traspaso sin peaje fiscal → rebalanceo y cambios de estrategia gratis.
- Aportaciones crecientes: son el motor real del plan a 20-25 años.
- Fondos de acumulación: cero fricción fiscal anual, más efecto compuesto.
- Inflación cubierta por el núcleo de RV + oro a largo plazo.

---

## 5. Veredicto

**Toro:** la cartera es sensata, baratísima (0,16% TER) y está optimizada para el régimen fiscal español. El objetivo es alcanzable, pero **a los 55 años no; el rango realista es 57-60**, salvo que eleves la aportación por encima de 15.000 €/año.

**Oso:** con 20.000 € de partida, todo depende de tu tasa de ahorro, y no me la has dicho. Si no puedes aportar al menos ~12.000-15.000 €/año (1.000-1.250 €/mes), el objetivo de 2.500 €/mes se aleja bastante o exige trabajar más años. Y un 64% de RV global es un riesgo 4/5 coherente, pero aguantar dos crisis del -40% sin vender es el test psicológico real, no el backtest.

**Mi sugerencia operativa:** simula tu escenario real con tu aportación anual concreta y la herramienta FIRE, y dime la cifra para afinarlo. Automatiza el ahorro mensual, no toques nada y revisa una vez al año.

⚠️ Esto es información educativa, no asesoramiento financiero. Haz tu propia investigación (DYOR).

---

¿Quieres que:
1. rehaga el plan FIRE con **tu aportación anual real** (dime cuánto puedes ahorrar al mes),
2. te genere el mismo análisis en **audio** para escucharlo,
3. o simule el caso de una **posición concentrada** (RSU/stock options) si tienes acciones de tu empresa?