# Cartera educativa + plan FIRE — DeepAgents

He guardado el informe completo en `.agent-fs/informe-cartera-fire-espana.md`. Aquí va el resumen.

---

# 1. Cartera educativa (riesgo 4/5, horizonte 25 años)

| Sleeve | Peso | Producto | ISIN / Ticker | TER |
|---|---|---|---|---|
| RV global (núcleo) | 64% | Vanguard Global Stock Index Fund EUR Acc | IE00B03HD191 | 0,17% |
| RV emergentes (satélite) | 10% | iShares Core MSCI EM UCITS ETF Acc | IE00B0M62X26 (EIMI) | 0,18% |
| Renta fija global EUR cubierta | 16% | Vanguard Global Bond Index Fund EUR Hedged Acc | IE00B18GC888 | 0,15% |
| Oro físico (ETC) | 5% | iShares Physical Gold ETC | IE00B579F325 (SGLN) | 0,12% |
| Liquidez remunerada (€STR) | 5% | Xtrackers II EUR Overnight Rate Swap | LU0290358497 (XEON) | 0,10% |

**TER medio ponderado ≈ 0,16%** → unos 32 €/año con 20.000 €, ~1.300 €/año con 800.000 €.

Decisiones deliberadas:
- **Núcleo y renta fija en FONDO, satélites en ETF/ETC.** No es capricho: en España los fondos traspasan sin peaje fiscal, los ETFs no. Pones ahí el peso que querrás rotar con los años.
- **Versiones de acumulación** en todo lo posible: difieres el impuesto de dividendos/cupones hasta la venta.
- **Los 1.000 € de liquidez (5%) son colchón operativo, no fondo de emergencia.** Tu fondo de emergencia (3-6 meses de gastos) va aparte, en cuenta remunerada.
- Sobre los 20.000 €: reparte en 4-6 entradas si te incomoda el lump-sum. Estadísticamente invertir de golpe gana ~2 de cada 3 veces, pero el DCA evita que vendas en el peor momento por pánico.

# 2. Plan FIRE para 2.500 €/mes netos

Motor: retorno real 5%, regla de retirada 4%, impuesto del ahorro aplicado **solo a la fracción de ganancia**.

| Escenario | Aportación anual | Edad | Corpus alcanzado | Necesario | ¿Llega? |
|---|---|---|---|---|---|
| Conservador | 6.000 € | 55 | 329.857 € | 819.298 € | No (gap 489k) |
| Moderado | 12.000 € | 60 | 913.177 € | 828.745 € | **Sí** |
| Ambicioso | 18.000 € | 55 | 805.045 € | 816.227 € | No (por 11k) |
| Ambicioso + | 18.800 € | 55 | 831.497 € | 816.279 € | **Sí** (por 15k) |
| Agresivo | 18.000 € | 50 | 508.935 € | 801.576 € | No (gap 293k) |
| Retorno 4% | 12.000 € | 55 | 547.831 € | 803.544 € | No (gap 256k) |

**Los cuatro mensajes que importan:**

1. **Tu número está en ~800-840k €**, no en los 750k que sugiere el cálculo naive. Para que te queden 2.500 € netos hay que **retirar en bruto 2.717-3.173 €/mes**.
2. **La aportación pesa más que el retorno.** Duplicar de 6.000 a 12.000 €/año mueve el resultado de 330k a 913k. Bajar del 5% al 4% real te cuesta 256k. Optimiza tu tasa de ahorro antes que tu cartera.
3. **FIRE a los 50 con este perfil es matemáticamente muy duro**: harían falta ~2.600 €/mes de aportación (31k/año) o un 7% real sostenido. Realista: **pleno hacia los 55-60**, o **coast FIRE** (dejar de aportar a los ~45 y dejar que componga solo).
4. **El drag fiscal es bajo**: con DCA continuado la fracción de ganancia es 31-51% del corpus → impuesto efectivo por retirada de solo **6,4-10,6%**, muy lejos del 19-28% nominal.

Riesgo a vigilar: **la secuencia de retornos**. Una caída fuerte en los primeros 5 años de retirada puede romper el plan aunque el promedio a 20 años sea bueno. Mitigación: 2 años de gastos en liquidez + flexibilidad para vender menos en años malos.

# 3. Fiscalidad española relevante

**Escala del ahorro (IRPF 2026, verificar tramos vigentes):** 19% hasta 6.000 €; 21% de 6.000 a 50.000 €; 23% hasta 200.000 €; 27% hasta 300.000 €; 28% por encima. Se aplica **solo a la ganancia**, así que repartir ventas entre años mantiene el tipo bajo.

**Fondos vs ETFs.** El privilegio fiscal español: los **fondos UCITS traspasan sin peaje** (rotas sin declarar ni pagar). Los **ETFs tributan como acciones** y no traspasan ni con fondos ni entre sí. Además, las pérdidas de acciones/ETFs solo compensan con esa categoría, y las de fondos con fondos: compartimentos estancos.

**Planes de pensiones y FIRE: mala combinación.** Deduces al marginal actual (límite 1.500 €/año individual; 10.000 € en planes de empresa), pero **tributan a la retirada como rendimiento del trabajo** (progresivo) y están **bloqueados hasta la jubilación ordinaria**. Para jubilación anticipada el vehículo es la cartera traspasable de fondos; el plan de pensiones solo como complemento o si tu marginal hoy es muy alto.

**Otros puntos:** rendimientos de dividendos/cupones/intereses tributan cada año → otra razón para clases de acumulación. Sin impuesto de patrimonio relevante hasta ~700k € por persona (con variaciones autonómicas). Posible exit tax solo en supuestos de patrimonios muy altos (>1M €), que no es tu caso hoy.

---

**Caveats honestos:** los ISIN/TER vienen del catálogo educativo, verifica antes de comprar en tu broker y confirma que no haya comisión de suscripción. La cartera recomendada es generada por reglas deterministas sobre tu perfil, no asesoramiento personalizado. Cotización de referencia BCE (2026-10-09): 1 EUR = 1,1206 USD; oro y emergentes llevan riesgo divisa sin cubrir.

⚠️ Esto es información educativa, no asesoramiento financiero. Haz tu propia investigación (DYOR).

¿Quieres que profundice en alguna vía? Puedo, por ejemplo: (a) simular **coast FIRE** (dejar de aportar a los 45), (b) añadir un plan de pensiones al mix y calcular el neto post-67, o (c) detallar la mecánica de retiradas por tramos para minimizar impuestos año a año.