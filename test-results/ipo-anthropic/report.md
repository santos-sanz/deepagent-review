# Test: análisis de la IPO de Anthropic — Mastra vs DeepAgents

Fecha: 2026-10-10T21:34:32.232Z

## Prompt (idéntico para ambos)

> Analiza la posible salida a bolsa (IPO) de Anthropic: situación actual de la compañía, financiación y valoraciones conocidas, condiciones de mercado, riesgos y qué habría que vigilar. Sé directo, cita fuentes con fecha y recuerda que es una empresa privada (análisis cualitativo).

## Resultados

| Framework | Mastra | DeepAgents |
| --- | --- | --- |
| Duración | 82.5s | 1316.2s |
| Tool calls | marketNewsTool×5, secFilingsTool, quoteTool×5, webFetchTool, agent-macroAnalyst, updateWorkingMemory | write_todos×3, market_news×6, web_search×6, web_fetch×4, task(researcher-agent), task(market-analyst), write_file |
| Tokens | 120953 | 55377 |
| Longitud respuesta | 8707 chars | 8322 chars |
| Disclaimer presente | sí | sí |
| Error | — | — |

## Observaciones del test

- **Justicia del test**: el agente Mastra se ejecuta con `maxSteps: 24` (el default corta el análisis
  a mitad de investigación y devolvería meta-comentarios sin informe). DeepAgents no tiene tope de pasos.
- **Sub-agentes**: en DeepAgents los `task(...)` son sub-agentes con contexto aislado que ejecutan su
  propio loop de tools; en Mastra los `agent-*Tool` son llamadas al sub-agente dentro del mismo hilo.
  El aislado es más lento (más generaciones largas secuenciales) pero protege la ventana del orquestador.
- **Sistema de archivos**: en DeepAgents los ficheros escritos con `write_file` persisten en disco
  (`.agent-fs/`, backend FilesystemBackend con `virtualMode: true`).
- Latencias medidas con el gateway NaN (deepseek-v4-flash) y las fuentes keyless; varían entre ejecuciones.

## Respuesta Mastra



# Anthropic y su posible IPO — análisis a 10-oct-2026

**Aviso metodológico:** Anthropic es una *public benefit corporation* **privada**. No cotiza, no tiene múltiplos de mercado ni estados auditados públicos. Todo lo que sigue es **análisis cualitativo** basado en prensa financiera y filtraciones del registro, **no en datos oficiales de mercado**.

---

## 1. Situación actual de la operación

| Elemento | Dato | Fuente / fecha |
|---|---|---|
| Estado | Privada, preparando la mayor OPV de la historia si sale a 2 T$ | — |
| Ventana objetivo | **Noviembre 2026**, "pre-Thanksgiving"; debut a mediados de mes | Bloomberg / Quartz / Chosunbiz, 1-2-oct-2026 |
| Roadshow | Apunta a la semana del **9-nov-2026** | WSJ, 18-sep-2026 |
| **Investor day** | **14-oct-2026** ← próximo hito | Futu, 1-oct-2026 |
| Bancos colocadores | Morgan Stanley y Goldman Sachs | 8-sep-2026 |
| **S-1 confidencial** | Presentado 1-jun-2026 | NYT (Mike Isaac) |
| **S-1 público en EDGAR** | **AÚN NO disponible (verificado hoy)** | SEC EDGAR / Yahoo Finance, 4-oct-2026 |

Esto es un punto capital: **el registro oficial sigue sin ser público**, y todo lo que circula sobre sus cuentas es prensa filtrada (Reuters 28-29-sep-2026). Sin S-1 público, no hay verificación posible.

---

## 2. Financiación y valoraciones conocidas

| Ronda / hito | Valoración | Fecha |
|---|---|---|
| Serie E | 61.500 M$ post-money | mar-2025 |
| Serie G | 380.000 M$ (ronda de 30.000 M$) | 12-feb-2026 |
| **Serie H (última privada)** | **965.000 M$** | may-2026 |
| **Objetivo OPV** | **~2.000.000 M$ (2 T$)** | oct-2026 |

Múltiplos implícitos (calculados por mí, no publicados): 2 T$ sobre el run-rate de ~65.000 M$ ≈ **31x ventas**; sobre los ingresos 2025 reportados (~4.600 M$) sería **~435x ventas** — sin precedentes en software a esta escala. El salto de 965.000 M$ (may-2026) a 2 T$ en seis meses es el 2x más discutido del año.

---

## 3. Las cuentas: el problema del caso

Según el prospectus filtrado (**Reuters, 28-29-sep-2026**, no verificado):

| Métrica 2025 | Valor |
|---|---|
| Ingresos | ~4.600 M$ (crecimiento ~12x) |
| Pérdida neta | **42.000 M$** (incluye *writedowns* de pasivos de financiación previa) |
| Pérdida operativa | >8.000 M$ ex-writedowns (≈8.060 M$) |
| Coste para facturar ~5.000 M$ | ~13.000 M$ |
| **Compromisos de compute/cloud** | **518.000 M$** ⚠️ |
| Concentración de clientes | ~25% de ingresos en 2 clientes, sin contratos largos; **~50% de las ventas fluyen vía Amazon y Google** (TradingView, 30-sep-2026) |

Y en paralelo, cifras muy agresivas: **run-rate >65.000 M$** (Bloomberg, 17-ago-2026), ingresos Q2-2026 >11.500 M$ (CNBC, 15-ago-2026) y un beneficio Q3-2026 **proyectado** >1.000 M$ (Yellow.com/SemiAnalysis, 7-8-oct-2026 — rumor, y Daring Fireball lo cuestiona abiertamente).

⚠️ **Inconsistencia clave a vigilar:** de ~4.600 M$ anuales (2025) a un run-rate de 65.000 M$ hay un salto de >14x en meses. O cambia la definición de "ingresos" (run-rate vs. base anual, bruto vs. neto), o la credibilidad de las filtraciones está en duda. El S-1 público zanjaría el debate.

---

## 4. Condiciones de mercado

**A favor 🐂**
- Índices en zona de récords: S&P 500 **7.811,54** (+0,59%) y VIX **14,84** (-3,7%) a cierre del 9-oct-2026 (Yahoo Finance) → volatilidad contenida.
- Apetito por IA intacto: Dan Ives (Yahoo Finance, 8-oct-2026) cree que la demanda por las OPV de Anthropic y OpenAI será fuerte pese a los titulares.
- Escasez de activos: es prácticamente la única IA de frontera "pura" disponible en bolsa si OpenAI espera a 2027.

**En contra 🐻**
- **Bono a 10 años de EE.UU. en 5,244% (^TNX, 9-oct-2026)**, con máximo de 52 semanas en 5,364% y ~5,36% el 1-oct — máximo desde 2002. Pimco ve riesgo de 6% (Reuters, 9-oct-2026). Una tasa de descuento así castiga exactamente a los activos de *duration* larga.
- **Fed endureciendo**: +25 pb el 16-sep-2026, actas del 7-8-oct apuntan a otra subida antes de fin de año; reunión clave el **28-oct-2026**. Se entraría en la ventana de la OPV con política monetaria apretando.
- **Ventana selectiva, no abierta**: Renaissance Capital (9-oct-2026) constata que el nerviosismo ha dejado candidatos fuera; Oura pospuso una OPV de 2.100 M$ (29-sep), Holtec se aplazó (18-sep) y **Firmus —respaldada por Nvidia— canceló su salida de 5.000 M$ (TradingView, 9-oct-2026)**.
- **Precedentes de daño post-debut (9-oct-2026)**: SpaceX (SPCX) debutó el 12-jun a 135 $ y hoy cotiza a 162,57 $ tras haber caído ~50% desde su máximo de 225,64 $; Cerebras (CBRS) hizo +68% el primer día y hoy está muy por debajo de su techo de 386,34 $; CoreWeave (CRWV) a 82,08 $ desde un máximo de 150,4 $. Comprar OPV de IA en 2026 ha funcionado solo el primer día.
- **Exclusión de índices**: el S&P 500 exige rentabilidad GAAP (último trimestre y suma de 4). Con pérdidas operativas de 8.000 M$, no sería elegible → sin flujos pasivos automáticos post-IPO.

---

## 5. Riesgos

- **Valuación**: brecha de ~13x entre el techo pedido (2 T$) y la valoración del analista escéptico (**150.000 M$**, CNBC 7-oct-2026, que la llamó *"la IPO más ridícula del año"* y *"una prueba sin precedentes de credulidad del inversor"*). Un inversor billonario llega a prever un **recorte del 50%** del precio, "$1 billón o menos" (TIKR, 1-oct-2026).
- **Necesidad recurrente de capital**: 518.000 M$ de compromisos de compute (TPUs de Google, Azure/Nvidia, y ~1.250 M$/mes con xAI/SpaceX desde 6-may-2026) frente a ingresos de un dígito de miles de millones.
- **Dependencia de Big Tech y concentración de clientes**: Reuters (29-sep-2026) tituló que el registro *"expone una profunda dependencia de los socios de Big Tech"*, con ~50% de ventas vía Amazon y Google.
- **Guerra de precios**: recorte del ~75% en Claude (8-oct-2026) → presión directa sobre márgenes futuros.
- **Legal y político**: demandas de copyright (acuerdo de 1.500 M$ en 2025); disputa con el DoD y con la Casa Blanca (feb-2026); el propio prospecto lista al Gobierno de EE.UU. como riesgo de negocio y admite posible "riesgo existencial" de la IA (FT, 28-sep-2026).
- **Gobernanza**: PBC con misión declarada; el CEO cobró ~18 M$ en 2025 según el filing (6-oct-2026); la estructura accionarial sigue sin conocerse.

---

## 6. Catalizadores

- **14-oct-2026**: investor day (primer termómetro real de expectativas).
- **Publicación del S-1 público** en EDGAR: único documento que valida o desmiente las cifras filtradas.
- **Fijación del rango de precios**: si sale muy por debajo de 2 T$, el mercado habrá ganado la negociación.
- Confirmación (o no) de beneficio en Q3-2026.
- Movimientos en las reglas de inclusión de índices (Nasdaq ya flexibilizó; el S&P 500 no).

---

## 7. Qué vigilar (checklist)

1. **EDGAR**: aparición del S-1 público y del folleto definitivo (424B); fecha de auditoría de las cuentas.
2. **Tamaño real** de la operación vs. los ~100.000 M$ apuntados por prensa.
3. **Rango de precios y *float* libre**: float pequeño = buen primer día, malos 6 meses.
4. **28-oct-2026 (Fed)** y el bono a 10 años: si el 10y se va a 6%, la ventana se cierra para múltiplos de crecimiento.
5. **Lock-up**: cuándo vencen las restricciones de venta de empleados y VC.
6. **Cómo cotizan SpaceX y Cerebras en noviembre**, no cómo debutaron.
7. **OpenAI** (ronda de 30.000 M$ a ~1,2-1,4 T$, OPV a 2027): si espera, Anthropic asume sola el "riesgo de ser la primera".

---

## 8. Veredicto

**Toro 🐂** — El activo más escaso del ciclo de IA, con run-rate real declarado (65.000 M$, Bloomberg 17-ago-2026) y una ventana aún abierta antes de Navidad. Si el precio se fija en la parte baja del rango, hay demanda institucional obligada a tener exposición a IA pura.

**Oso 🐻** — Las cifras no encajan entre sí; el bono a 10 años en máximos de 24 años es el peor entorno posible para descontar beneficios lejanos; la Fed sube; los precedentes de 2026 (SpaceX, Cerebras) han castigado al inversor post-debut; no habrá inclusión en índices por falta de rentabilidad GAAP; hay 518.000 M$ de compromisos de compute exigiendo capital nuevo; y varias OPV de IA se han cancelado o aplazado este mismo mes.

**Mi lectura:** la ventana está abierta para **emitir** (índices en máximos, apetito por IA) y es claramente **hostil para mantener**. Es un escenario de "vendedor en posición de fuerza": conviene preguntarse por qué se vende ahora y a este precio. Dicho esto, separo dato de opinión: las cifras que maneja el mercado son **filtraciones de prensa no verificadas**, y el registro oficial sigue sin ser público.

⚠️ Esto es información educativa, no asesoramiento financiero. Haz tu propia investigación (DYOR). Las cotizaciones citadas son de Yahoo Finance a cierre del 9-oct-2026 y pueden ir con retardo.

## Respuesta DeepAgents



# Anthropic y su posible IPO — análisis cualitativo

**Anthropic NO cotiza.** No hay precio, múltiplos ni datos estructurados de mercado (Yahoo no la resuelve como activo). Todo lo que sigue es **análisis cualitativo** basado en prensa de referencia, filings filtrados y comunicados oficiales. Datos con fuente y fecha; lo especulativo va marcado como tal. Corte: **10 de octubre de 2026**.

---

## 1. Situación actual

- **Fundada en enero de 2021** por 7 ex-empleados de OpenAI (Dario y Daniela Amodei entre ellos). Sede en San Francisco, **~2.500 empleados** (2026), estructura de *public benefit corporation*. Producto: **Claude** (Fable/Opus/Sonnet/Haiku) + agentes Claude Code, Cowork, Design, Science. Últimos modelos: **Opus 5.5 (22-sep-2026)** y **Sonnet 5.5 (28-sep-2026)**, ambos con recortes de precio notables. *(Wikipedia/Anthropic; Reuters 22-sep; CNBC 28-sep)*
- **El hecho clave: el 1-jun-2026 presentó el registro confidencial (S-1) ante la SEC** y desde entonces se prepara la salida. *(NYT / Axios / CNBC, 1-jun-2026)*

## 2. Financiación y valoraciones conocidas

| Ronda | Fecha | Importe | Valoración post-money | Notas |
|---|---|---|---|---|
| Serie E | mar-2025 | 3.500 M$ | **61.500 M$** | Lightspeed, Fidelity, General Catalyst |
| Serie F | sep-2025 | 13.000 M$ | **183.000 M$** | ICONIQ, Fidelity, Lightspeed, Qatar IA |
| Term sheet | 31-dic-2025 | 10.000 M$ | **350.000 M$** | Coatue, GIC |
| Serie G | 12-feb-2026 | 30.000 M$ | **380.000 M$** | — |
| **Serie H** | **28-may-2026** | **65.000 M$** | **965.000 M$** | Altimeter, Dragoneer, Greenoaks, Sequoia, MGX, Temasek |

*(Anthropic Newsroom 28-may-2026; Reuters 29-may; CNBC)* → Con la Serie H **superó a OpenAI como startup de IA más valiosa**.

- **Ventaja estructural Big Tech:** Amazon (compromiso de +100.000 M$ a 10 años y hasta 5 GW con Trainium), Google (hasta 40.000 M$), Microsoft/Nvidia (hasta 15.000 M$), AMD (hasta 5.000 M$). *(Anthropic, abr-jul 2026)*
- **Bandera amarilla: financiación circular.** Broadcom **presta hasta 42.000 M$** a Anthropic para que arriende sus chips; Anthropic acumula **518.000 M$ en compromisos de cómputo** en varios proveedores. *(Reuters 1-oct-2026 y 29-sep-2026)*

## 3. Ingresos: la historia que sostiene (o no) la valoración

| Fecha | Métrica | Cifra |
|---|---|---|
| 2025 (año completo) | Ingresos | **4.600 M$** |
| 2025 (año completo) | Pérdida neta | **-42.000 M$** (pérdida operativa >8.000 M$ ex-writedowns) |
| abr-2026 | Run-rate | >30.000 M$ |
| Q2 2026 | Ingresos trimestrales | **>11.500 M$ (+14x a/a)**, resultado operativo ajustado **positivo** |
| jul-2026 | Run-rate | **65.000 M$ (7x a/a)** |
| 2028 (previsión interna) | Ingresos | 190.000–200.000 M$ |

*(Reuters vía Daring Fireball 30-sep-2026; Bloomberg vía CNBC 15-ago-2026; FT/Bloomberg 4/17-sep-2026; Reuters 17-ago-2026)*

Crecimiento espectacular, pero con **dos aristas**: el 25% de los ingresos de 2025 venía de **solo dos clientes**, y el prospecto admite que muchos grandes clientes **no tienen contratos de largo plazo**.

## 4. Estado de la IPO

- **Confidencial (1-jun-2026)** → **Morgan Stanley (lead left) y Goldman Sachs** lideran; después entran Citi, JPMorgan y Barclays. *(Bloomberg 3-jun y 20-ago-2026)*
- **Nasdaq elegido como bolsa** (13-sep-2026). *(Reuters/Business Insider)*
- **Objetivo reportado: levantar hasta 100.000 M$ a una valoración de ~2 billones (trillones US) de dólares.** *(WSJ, 8-sep-2026)* Sería la mayor IPO de la historia, por delante de **SpaceX (1,77 billones, 12-jun-2026)**.
- **Pero hay retraso:** WSJ situó el debut en **noviembre de 2026**, y **a 4-oct-2026 el S-1 público seguía sin aparecer en EDGAR**. Los mercados de predicción descuentan más demora. *(WSJ 18-sep; Forkast/Yahoo 4-oct-2026)*
- **Riesgo explícito en el prospecto:** el **gobierno de EEUU** como riesgo de negocio (ver abajo). *(Reuters 28-sep-2026)*

## 5. Condiciones de mercado: ventana abierta pero muy exigente

| Indicador | Nivel | Var. 12m (9-oct-2026) |
|---|---|---|
| Nasdaq Composite | 27.366 (−1,3% del máximo) | +23,2% |
| S&P 500 | 7.811 (−0,4% del máximo) | +19,2% |
| VIX | 14,84 | −31,5% |
| **Bono EEUU 10 años** | **5,24%** | **+29,4%** |
| P/E S&P 500 | ~25x (Nasdaq-100 ~31x) | — |
| Renaissance IPO ETF | +7,6% (vs +23% Nasdaq) | — |

*(Yahoo Finance)*

**El dato incómodo:** la cohorte post-IPO 2025-26 ha sido un cementerio — **Figma −63%, Klarna −64%, Gemini −81%, Cerebras −41%, CoreWeave −41%**; solo Chime (+54%) destaca. Hay dinero para calidad probada, pero el mercado **castiga sin piedad a los emisores caros y no rentables**, y los tipos largos en máximos del año (10a 5,24%) encarecen el descuento de flujos lejanos. Los múltiplos altos de IA adyacente ya se están normalizando (ORCL −56% desde máximos, ARM −41%; **Palantir cotiza por encima de su propio precio objetivo*).

## 6. Riesgos y catalizadores

**Riesgos**
- **DoD/geopolítico:** el Pentágono la designó "riesgo de cadena de suministro" y **ha cesado el uso de sus productos (oct-2026)**; una cautelar y un fallo favorable no han revertido el daño. *(BBC 5-oct-2026; AP 28-feb-2026)*
- **Legal:** acuerdo de **1.500 M$ con autores** por copias piratas (firme en jul-2026); demandas de Reddit y de sellos musicales.
- **Valoración:** New Constructs la valora en ~150.000 M$ y llama a la IPO de 2 billones "la más ridícula de 2026". *(CNBC 7-oct-2026)*
- **Competencia:** OpenAI recuperó cuota (de <25% a casi 50% en OpenRouter, sep-2026) y tiene run-rate ~70.000 M$, por encima de Anthropic.
- **Concentración de clientes** y ausencia de contratos largos.

**Catalizadores**
- Publicación del **S-1 público** y rango de precios → señal de inminencia.
- Confirmación del calendario de noviembre y **roadshow**.
- Ya alcanzó **rentabilidad operativa ajustada positiva** en Q2 2026.
- **Ser la única vía cotizada a Claude en 2026**, dado que OpenAI descartó cotizar este año.

## 7. Qué vigilar (checklist)

1. **EDGAR**: aparición del S-1 público y del rango de precios.
2. **Valoración final**: el *last mark* de la última ronda es 965.000 M$; la aspiración es ~2 billones → **gap del ~100%**.
3. **Márgenes**: sostenibilidad del beneficio operativo ajustado positivo en Q3/Q4.
4. **Concentración de clientes** y firma de contratos largos.
5. **Disputa con el gobierno de EEUU**: consecuencias comerciales y legales.
6. **Cuota vs OpenAI** en APIs/enterprise.
7. **Tipos largos**: con el 10a al 5,24%, cada decepción de crecimiento se paga cara.
8. **Estructura financiera**: préstamos de proveedores (42.000 M$ Broadcom) y 518.000 M$ de compromisos de cómputo.

## Veredicto (con matices)

**Toro:** ingresos creciendo a triple dígito (run-rate 65.000 M$ en jul-2026), ya en beneficio operativo ajustado positivo, respaldo de prácticamente toda la industria (Amazon, Google, Microsoft, Nvidia, AMD), Nasdaq confirmado, bancos de primer nivel y un mercado en máximos con volatilidad mínima. Existe un club de megacaps del billón de dólares (NVDA, MSFT, GOOGL, AMZN y la recién listada SpaceX) que demuestra tolerancia del mercado a esas escalas.

**Oso:** pedir **2 billones** implica ~30x el run-rate actual y asume la previsión de 190-200.000 M$ de ingresos en 2028; en 2025 perdió 42.000 M$ netos; un 25% de los ingresos viene de dos clientes sin contratos largos; el gobierno de EEUU aparece como riesgo de negocio; hay financiación circular por 42.000 M$ y compromisos de 518.000 M$; el mercado de IPOs va muy por detrás del índice y ha castigado brutalmente a los emisores caros; y el bono a 10 años en máximos anuales eleva el listón del múltiplo.

**Mi lectura:** la IPO es **muy probable**, pero **el binomio 2 billones + noviembre es lo frágil, no la salida en sí**. La probabilidad de un retraso o de un recorte de valoración respecto a la aspiración es alta; el S-1 público sigue sin publicarse a 4-oct-2026. No hay forma de "invertir antes de la IPO" sin asumir riesgos graves: Anthropic **ha declarado no autorizadas** plataformas secundarias tipo Forge, Hiive o Unicorns Exchange (12-may-2026) y los productos tokenizados pre-IPO tipo OKX **no dan propiedad de acciones reales**.

He guardado el informe completo con todas las fuentes y fechas en `./.agent-fs/informe-anthropic-ipo.md`.

⚠️ Esto es información educativa, no asesoramiento financiero. Haz tu propia investigación (DYOR).
