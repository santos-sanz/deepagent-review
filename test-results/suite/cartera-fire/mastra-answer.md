# Cartera educativa + plan FIRE — Mastra

Nota: es la cuarta vez que me llega esta misma petición. He vuelto a ejecutar el motor de cartera y el de FIRE desde cero y **las cifras salen idénticas** a las anteriores (son deterministas, no improvisadas). Te lo dejo consolidado otra vez, con las fuentes de cada dato.

---

## 1) Cartera educativa (perfil ES · 35 años · riesgo 4/5 · horizonte 19 años · 20.000 €)

Fuente: motor de asignación `portfolio-tool` (reglas deterministas + catálogo UCITS filtrado por accesibilidad ES y preferencia fiscal de traspaso).

| Clase de activo | Peso | € de 20.000 | Producto | ISIN | TER |
|---|---|---|---|---|---|
| RV global (núcleo) | 64% | 12.800 € | Vanguard Global Stock Index Fund EUR Acc | IE00B03HD191 | 0,17% |
| RV emergentes (satélite) | 10% | 2.000 € | iShares Core MSCI EM UCITS ETF Acc (EIMI) | IE00B0M62X26 | 0,18% |
| Renta fija global cubierta EUR | 16% | 3.200 € | Vanguard Global Bond Index Fund EUR Hedged Acc | IE00B18GC888 | 0,15% |
| Oro físico (ETC) | 5% | 1.000 € | iShares Physical Gold ETC (SGLN) | IE00B579F325 | 0,12% |
| Liquidez remunerada | 5% | 1.000 € | Xtrackers II EUR Overnight Rate Swap (XEON) | LU0290358497 | 0,10% |

**TER medio ponderado ≈ 0,16%** → sobre 20.000 € son ~32 €/año; sobre un corpus de 800.000 €, ~1.280 €/año.

**Lógica del diseño**
- Núcleo global: miles de empresas en una sola posición (diversificación máxima al menor coste).
- Emergentes: sobreponderación deliberada vs. su peso en el MSCI World (~10-11%), asumiendo más volatilidad.
- Renta fija **cubierta a EUR**: sin la cobertura, un 16% en bonos globales sería en realidad una apuesta divisa.
- Oro vía ETC físico: cobertura de cola, no generador de rentas.
- Liquidez: colchón para aportaciones graduales (DCA) y para evitar vender en caídas.

**Advertencia fiscal clave (la más importante de todo el documento)**
El traspaso sin peaje fiscal español funciona **solo entre fondos de inversión**. Los ETFs (EIMI, XEON) y los ETCs (SGLN) tributan como **acciones**: venderlos materializa plusvalía, siempre. Si quieres maximizar la ventaja del traspaso, la parte "traspasable" de esta cartera son solo los dos fondos Vanguard (80% de la cartera). Fuente: `docs/conocimiento/fiscalidad.md`.

---

## 2) Plan FIRE neto de impuestos (objetivo: 2.500 €/mes netos)

Fuente: calculadora FIRE determinista. Supuestos: retorno real **6%** (después de inflación), regla de retirada **SWR 4%**, edad objetivo de independencia **54 años** (19 años de acumulación), escala del ahorro con tipo medio de retirada ~21% aplicada **solo a la fracción de ganancia**.

**Corpus objetivo**
- Retirada bruta necesaria: **2.719 €/mes**
- Impuesto efectivo de retirada: **~9%** (porque con DCA ~43% del corpus es ganancia, y solo eso tributa)
- Renta neta resultante: **2.473 €/mes** → prácticamente tus 2.500 €
- **Corpus requerido ≈ 824.541 €**

**Escenarios según tu ahorro anual (con aportaciones crecientes)**

| Escenario | Aportación inicial | +anual | Corpus a los 54 | Base de coste | Renta neta/mes | Gap vs. objetivo |
|---|---|---|---|---|---|---|
| A | 12.000 €/año | +400 €/año | 564.032 € | 316.400 € | 1.707 € | −262.140 € |
| B | 18.000 €/año | +600 €/año | 815.792 € | 464.600 € | 2.473 € | −8.749 € (**casi**) |
| C | 24.000 €/año | +800 €/año | 1.067.552 € | 612.800 € | 3.240 € | **objetivo superado** |

**Lecturas**
- El **punto de equilibrio** está en torno a **1.550-1.600 €/mes de aportación sostenida** (~18.600-19.200 €/año).
- En el escenario B te quedas a un pelo: subir la aportación un 3-4% o retrasar 6-12 meses la fecha cierra el gap. El escenario C te da colchón y flexibilidad para recortar aportaciones si la vida se complica.
- El retorno real del 6% es la variable más frágil: si en vez de 6% es 4%, el corpus objetivo no cambia, pero la aportación necesaria sube de forma notable. Trátalo como escenario, no como promesa.

---

## 3) Fiscalidad española relevante

Fuente: `docs/conocimiento/fiscalidad.md` (base de conocimiento indexada). **Las reglas cambian: verifica con tu asesor y tu broker.**

**a) Base del ahorro (tramos vigentes 2025-2026)**
| Tramo | Tipo |
|---|---|
| 0 – 6.000 € | 19% |
| 6.000 – 50.000 € | 21% |
| 50.000 – 200.000 € | 23% |
| 200.000 – 300.000 € | 27% |
| > 300.000 € | 28% |

**b) Solo tributa la ganancia, no el importe retirado.** En FIRE esto es enorme: no vendes 800.000 €, vendes participaciones cuya base de coste es ~57% del valor. De ahí que el impuesto efectivo de retirada sea ~9% y no 21%.

**c) Traspasos.** Entre **fondos** de inversión: sin peaje fiscal, se hereda la antigüedad de la base. **No aplica** a ETFs, ETCs ni entre fondo y ETF.

**d) Compensación de pérdidas.** Fondos compensan con fondos; acciones/ETFs entre sí. **Las dos bolsas no son intercambiables** (error clásico al rebalancear).

**e) PRIIPs/KID.** Un retail europeo no puede comprar ETFs domiciliados en EE. UU. (no publican KID). Operamos UCITS irlandeses/luxemburgueses. Ventaja: un UCITS irlandés sufre **15% de retención** sobre dividendos de acciones US en vez del 30% estándar.

**f) Acumulación vs. distribución.** Los vehículos de acumulación difieren el peaje fiscal; los de distribución te obligan a tributar el dividendo cada año aunque lo reinviertas. Para FIRE, acumulación.

**g) Planes de pensiones: cuidado.** Deducen a tipo marginal, pero (1) están **bloqueados hasta la jubilación reglamentaria** y (2) al rescatarlos tributan como **rendimiento del trabajo** (progresivo). Es un conflicto estructural con jubilarse a los 54. Úsalos solo por la deducción, no como vehículo FIRE.

**h) RSU / stock options** (si algún día aplica en tu caso). Tributan como rendimiento del trabajo en el **vesting**, a tipo marginal 24-47%. Después son activo patrimonial y su revalorización tributa en la base del ahorro.

**i) Cripto.** Plusvalía del ahorro; obligación del **modelo 721** si superas 50.000 € en exchanges extranjeros.

**j) Patrimonio.** Exento ~700.000 € + 300.000 € de vivienda habitual, con diferencias fuertes por CCAA (Madrid bonifica al 100%). Relevante si el plan FIRE sale muy bien.

---

## 4) Riesgos y catalizadores

**Riesgos**
- Secuencia de retornos adversa: dos años malos al inicio de la fase de retirada hacen mucho más daño que en la acumulación.
- Retorno real por debajo del 6% → el escenario B se desangra.
- Concentración en una cartera 64% RV global: es un activo correlacionado consigo mismo (todo EE. UU./tecnología por capitalización).
- Disciplina: el mayor destructor de rentabilidad es vender en pánico, no el TER.

**Catalizadores**
- Ahorro anual creciente (subidas de sueldo → +aportación).
- Horizonte de 19 años: el interés compuesto hace el trabajo pesado a partir del año 12-14.
- Eficiencia fiscal ya internalizada (0,16% TER + acumulación + traspaso de fondos).

## Veredicto
**Toro**: con 18.000 €/año crecientes estás a 9.000 € del corpus objetivo y el plan es alcanzable a los 54 sin heroicidades. **Oso**: el margen es nulo, así que el plan depende de mantener la aportación y el retorno real; cualquier recorte del ahorro anual del 10% te empuja hacia el escenario A (1.707 €/mes).

**Para afinar las cifras necesito**: tu CCAA (fiscalidad autonómica de patrimonio y tramos), tu ahorro anual real (no el hipotético) y si tienes RSU/stock options. Con eso recalculo el plan exacto en vez de por escenarios.

⚠️ Esto es información educativa, no asesoramiento financiero. Haz tu propia investigación (DYOR).