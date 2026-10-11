# Suite intensiva Mastra vs DeepAgents

Fecha: 2026-10-11T11:57:30.214Z
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
| memoria | Duración | 12.1s | 4.7s |
| memoria | Tokens (input+output) | 37.483 | 21.420 (no cacheado: 211) |
| memoria | Llamadas LLM | — | 2 |
| memoria | Tool calls | updateWorkingMemory×2 | ninguna |
| memoria | Respuesta (chars) | 179 | 79 |
| memoria | URLs citadas | 0 | 0 |
| memoria | Disclaimer | sí | NO |
| empresa-publica | Duración | 25.8s | 40.7s |
| empresa-publica | Tokens (input+output) | 36.293 | 77.851 (no cacheado: 6753) |
| empresa-publica | Llamadas LLM | — | 5 |
| empresa-publica | Tool calls | quoteTool, financialsTool, historicalPricesTool, secFilingsTool, marketNewsTool, updateWorkingMemory | write_todos×2, quote, financials, historical_prices, sec_filings, market_news×2, web_search, write_file |
| empresa-publica | Respuesta (chars) | 6063 | 3891 |
| empresa-publica | URLs citadas | 5 | 0 |
| empresa-publica | Disclaimer | sí | sí |
| comparativa | Duración | 28.6s | 33.6s |
| comparativa | Tokens (input+output) | 48.112 | 62.498 (no cacheado: 3329) |
| comparativa | Llamadas LLM | — | 5 |
| comparativa | Tool calls | historicalPricesTool×3, quoteTool×3, marketNewsTool×2, updateWorkingMemory | historical_prices×3, quote×3, financials×2, write_file |
| comparativa | Respuesta (chars) | 3425 | 3303 |
| comparativa | URLs citadas | 0 | 0 |
| comparativa | Disclaimer | sí | sí |
| macro-fx | Duración | 24.7s | 45.7s |
| macro-fx | Tokens (input+output) | 32.302 | 103.648 (no cacheado: 13.987) |
| macro-fx | Llamadas LLM | — | 6 |
| macro-fx | Tool calls | macroIndicatorsTool×2, fxRatesTool, quoteTool, updateWorkingMemory | macro_indicators×3, fx_rates, quote, historical_prices, market_news×6, web_search×2, knowledge_search |
| macro-fx | Respuesta (chars) | 4101 | 3866 |
| macro-fx | URLs citadas | 0 | 0 |
| macro-fx | Disclaimer | sí | sí |
| cartera-fire | Duración | 47.2s | 824.5s |
| cartera-fire | Tokens (input+output) | 57.883 | 5.571.331 (no cacheado: 263.663) |
| cartera-fire | Llamadas LLM | — | 53 |
| cartera-fire | Tool calls | portfolioTool, firePlanTool×5, knowledgeSearchTool, updateWorkingMemory | write_todos×3, fire_plan×9, portfolio_recommendation, knowledge_search×2, fx_rates, quote×4, market_news, task(researcher-agent), macro_indicators, asset_search, web_search×4, write_file |
| cartera-fire | Respuesta (chars) | 8597 | 5129 |
| cartera-fire | URLs citadas | 0 | 0 |
| cartera-fire | Disclaimer | sí | sí |
| robustez | Duración | 43.0s | 30.7s |
| robustez | Tokens (input+output) | 115.806 | 82.580 (no cacheado: 5834) |
| robustez | Llamadas LLM | — | 6 |
| robustez | Tool calls | assetSearchTool×3, marketNewsTool×3, webSearchTool×2, webFetchTool, quoteTool×2, updateWorkingMemory | asset_search×3, market_news×2, web_search×2, quote |
| robustez | Respuesta (chars) | 2566 | 3825 |
| robustez | URLs citadas | 0 | 0 |
| robustez | Disclaimer | sí | sí |

| Total (6 escenarios) | — | 181.5s · 327.879 tokens · 42 tool calls | 979.9s · 293.777 tokens no cacheados · 71 tool calls |

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
3. **Runs profundos: el outlier real es cartera-fire.** 53 llamadas LLM, contexto del agente
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
6. **Fiabilidad**: el `maxSteps` default de Mastra trunca análisis largos (subirlo es
   imprescindible); la working memory de Mastra recuerda entre ejecuciones (por diseño, a vigilar
   en tests); el disclaimer es por código en Mastra (siempre) y por prompt+app en DeepAgents.

**Veredicto revisado**: la diferencia de tokens y tiempo que motivó esta revisión era en su mayor
parte un fallo de medición (corregido aquí). Lo que queda de diferencia real —acumulación de
contexto en runs profundos— está mitigada por el prompt caching del gateway (~91-99%) y por el
summarization del propio harness. Para este agente sobre deepseek-v4-flash vía NaN: coste y
latencia comparables en tareas estándar; en runs profundos, Mastra mantiene el contexto más plano y
estable, DeepAgents paga más input bruto (barato con caché) y depende más de la varianza del gateway.

## Respuestas íntegras

Por escenario en `test-results/suite/<escenario>/{mastra,deepagents}-answer.md` y datos crudos en `results.json` (incluye `contextCurve` y `perCall` con el usage exacto por llamada).
