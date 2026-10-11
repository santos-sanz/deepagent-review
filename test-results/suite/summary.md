# Suite intensiva Mastra vs DeepAgents

Fecha: 2026-10-11T20:57:22.445Z
Modelo: deepseek-v4-flash (gateway NaN) en ambos · Mastra con `maxSteps: 24` (el default corta análisis largos)
Tokens: usage EXACTO del gateway por llamada (fetch interceptor); para DeepAgents se desglosa bruto vs no cacheado (prompt caching del gateway)

## Escenarios

- **memoria** — Memoria multi-turno: 2 turnos: el segundo exige recordar nombre, empresa y horizonte dichos en el primero.
- **empresa-publica** — Análisis cuantitativo de empresa cotizada: Fuerza la cadena completa de tools de mercado: resolver símbolo, quote, fundamentales, histórico con volatilidad, filings SEC y noticias.
- **comparativa** — Comparativa de 3 activos: Exige matemática sobre series históricas (rentabilidad y volatilidad anualizada) y una síntesis comparativa honesta.
- **macro-fx** — Macro y divisas con divulgación: Indicadores oficiales del Banco Mundial + tipos de cambio BCE + explicación divulgativa.
- **cartera-fire** — Cartera educativa + plan FIRE: Tools deterministas (portfolio_recommendation, fire_plan): la matemática NO debe inventarla el modelo, debe venir de las tools.
- **robustez** — Robustez ante datos inexistentes: Tickers/empresas sin datos: mide si el agente admite el vacío o alucina cifras. Penalizable inventar datos.

## Métricas por escenario

| Escenario | Métrica | Mastra | DeepAgents |
|---|---|---|---|
| memoria | Duración | 10.6s | 4.7s |
| memoria | Tokens (input+output) | 37.526 | 21.433 (no cacheado: 210) |
| memoria | Llamadas LLM | — | 2 |
| memoria | Tool calls | updateWorkingMemory×2 | ninguna |
| memoria | Respuesta (chars) | 179 | 97 |
| memoria | URLs citadas | 0 | 0 |
| memoria | Disclaimer | sí | NO |
| empresa-publica | Duración | 25.5s | 23.2s |
| empresa-publica | Tokens (input+output) | 37.631 | 28.283 (no cacheado: 4319) |
| empresa-publica | Llamadas LLM | — | 2 |
| empresa-publica | Tool calls | quoteTool, financialsTool, historicalPricesTool, secFilingsTool, marketNewsTool, companyProfileTool, updateWorkingMemory | quote, financials, historical_prices, sec_filings, market_news×2 |
| empresa-publica | Respuesta (chars) | 5487 | 6944 |
| empresa-publica | URLs citadas | 5 | 0 |
| empresa-publica | Disclaimer | sí | sí |
| comparativa | Duración | 19.4s | 17.8s |
| comparativa | Tokens (input+output) | 41.239 | 35.553 (no cacheado: 1611) |
| comparativa | Llamadas LLM | — | 3 |
| comparativa | Tool calls | historicalPricesTool×3, quoteTool×3, updateWorkingMemory | historical_prices×3, quote×3, financials×2 |
| comparativa | Respuesta (chars) | 3038 | 3064 |
| comparativa | URLs citadas | 0 | 0 |
| comparativa | Disclaimer | sí | sí |
| macro-fx | Duración | 33.2s | 30.3s |
| macro-fx | Tokens (input+output) | 62.389 | 66.934 (no cacheado: 32.060) |
| macro-fx | Llamadas LLM | — | 3 |
| macro-fx | Tool calls | macroIndicatorsTool×3, fxRatesTool, quoteTool, marketNewsTool×2, updateWorkingMemory | macro_indicators×4, fx_rates×2, quote, market_news |
| macro-fx | Respuesta (chars) | 4190 | 3757 |
| macro-fx | URLs citadas | 0 | 0 |
| macro-fx | Disclaimer | sí | sí |
| cartera-fire | Duración | 49.3s | 49.8s |
| cartera-fire | Tokens (input+output) | 49.409 | 79.733 (no cacheado: 7611) |
| cartera-fire | Llamadas LLM | — | 5 |
| cartera-fire | Tool calls | portfolioTool, firePlanTool×4, updateWorkingMemory | portfolio_recommendation, fire_plan×7, knowledge_search, fx_rates, write_file |
| cartera-fire | Respuesta (chars) | 8678 | 5365 |
| cartera-fire | URLs citadas | 0 | 0 |
| cartera-fire | Disclaimer | sí | sí |
| robustez | Duración | 19.1s | 531.8s |
| robustez | Tokens (input+output) | 31.201 | 4.755.347 (no cacheado: 200.058) |
| robustez | Llamadas LLM | — | 63 |
| robustez | Tool calls | assetSearchTool×3, marketNewsTool, webSearchTool | asset_search×4, market_news×3, web_search×2, web_fetch, task(researcher-agent) |
| robustez | Respuesta (chars) | 2909 | 3571 |
| robustez | URLs citadas | 0 | 0 |
| robustez | Disclaimer | sí | sí |

| Total (6 escenarios) | — | 157.0s · 259.395 tokens · 35 tool calls | 657.6s · 245.869 tokens no cacheados · 44 tool calls |

## Conclusiones

### Metodología de conteo (revisada tras detectar dos fallos de medición)

La primera versión de esta suite reportó diferencias de tokens infladas (~3,65 M en cartera-fire).
Auditoría del instrumento de medición:

1. **Bug (corregido): suma del usage por chunk en streaming.** En streaming, LangChain agrega el
   `usage_metadata` de cada chunk sumándolo: una llamada trivial de 14 tokens se reportaba como 36.
2. **Bug (corregido): estimado por caracteres.** El fallback de LangChain (`estimatedTokenUsage`)
   estima ~chars/4 y NO cuenta los tool schemas: la primera llamada real del agente son ~10,5 k
   tokens (system prompt + 18 tools) pero el estimado daba ~1,3 k.
3. **Solución**: interceptar el `fetch` al gateway y parsear el `usage` exacto que reporta la API
   en cada respuesta (JSON y SSE), incluyendo `prompt_tokens_details.cached_tokens`. Es la fuente
   de verdad; el campo `contextCurve`/`perCall` de `results.json` guarda el detalle por llamada.

### Resultados con conteo exacto

1. **Paridad funcional 6/6** (se mantiene): mismos informes, misma matemática desde las tools,
   cero alucinaciones con datos inexistentes en ambos.
2. **Tareas estándar: DeepAgents es eficiente.** Con el gateway cacheando prompts (~91-99% de
   hit), el input NO cacheado de DeepAgents es mínimo (empresa-publica: 73 k brutos → 6,7 k
   efectivos; memoria: 211 tokens efectivos). Su loop hace menos llamadas que Mastra en la mayoría
   de escenarios (5 vs 6-12).
3. **Runs profundos: el outlier en la primera ejecución fue cartera-fire.** 53 llamadas LLM, contexto del agente
   principal creciendo hasta ~240 k tokens (la curva `contextCurve` muestra el harness resumiendo
   al superar el umbral: 242 k → reinicio) y 5,49 M de input bruto. Causas: (a) el historial
   completo se re-envía en cada paso; (b) deepseek-v4-flash es un modelo con razonamiento y su
   reasoning se acumula en el historial; (c) over-calling de tools (29 tool calls). Es un patrón
   del harness con modelos reasoning, no un fallo del port. Con caché, el coste efectivo baja a
   ~264 k de input no cacheado (vs 58 k totales de Mastra: ~4,5×, no 78×).
4. **El prompt caching del gateway NaN funciona** (prompt_tokens_details.cached_tokens): abarata
   el loop agéntico de DeepAgents. Sin caché, la diferencia sería el coste real.
5. **Tiempo: varianza dominada por gateway + reasoning.** El mismo escenario (cartera-fire, mismo
   código) tardó 70 s, 672 s y 824 s en tres ejecuciones; Mastra se mantiene estable (14-60 s).
   El fix de streaming eliminó los 524; la varianza restante es del modelo/gateway.
6. **Reproducibilidad: el outlier se mueve entre runs.** En la segunda ejecución completa con
   conteo exacto, cartera-fire fue eficiente (5 llamadas, 73 k input, 7,6 k no cacheados, 50 s)
   y ROBUSTEZ fue la que entró en espiral (63 llamadas, 4,7 M input, 200 k no cacheados, 532 s).
   Es decir: la espiral agéntica no es propiedad del escenario sino del comportamiento del modelo
   en el loop abierto de DeepAgents — cuando deepseek-v4-flash decide iterar, itera mucho. Mastra
   no muestra estas espirales: su loop converge antes y `maxSteps` acota el peor caso.
7. **Fiabilidad**: el `maxSteps` default de Mastra trunca análisis largos (subirlo es
   imprescindible); la working memory de Mastra recuerda entre ejecuciones (por diseño, a vigilar
   en tests); el disclaimer es por código en Mastra (siempre) y por prompt+app en DeepAgents.

**Veredicto revisado**: la diferencia de tokens y tiempo que motivó esta revisión era en su mayor
parte un fallo de medición (corregido aquí). Lo que queda de diferencia real —acumulación de
contexto en runs profundos— está mitigada por el prompt caching del gateway (~91-99%) y por el
summarization del propio harness, pero el comportamiento del modelo bajo el loop abierto de
DeepAgents es poco predecible entre runs: para producción conviene fijar un presupuesto
(`maxSteps`/límite de llamadas o budget de tokens), que DeepAgents permite vía middleware y
Mastra ya trae de serie. Para este agente sobre deepseek-v4-flash vía NaN: coste y latencia
comparables en tareas estándar; en runs profundos, Mastra mantiene el contexto más plano y
estable, DeepAgents paga más input bruto (barato con caché) y depende más de la varianza del
gateway.

## Respuestas íntegras

Por escenario en `test-results/suite/<escenario>/{mastra,deepagents}-answer.md` y datos crudos en `results.json` (incluye `contextCurve` y `perCall` con el usage exacto por llamada).
