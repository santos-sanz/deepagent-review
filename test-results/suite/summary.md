# Suite intensiva Mastra vs DeepAgents

Fecha: 2026-10-11T10:07:24.010Z
Modelo: deepseek-v4-flash (gateway NaN) en ambos · Mastra con `maxSteps: 24` (el default corta análisis largos)
Tokens: contados vía callback handler en TODAS las llamadas LLM (incluidos sub-agentes de DeepAgents)

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
| memoria | Duración | 11.6s | 5.2s |
| memoria | Tokens | 38225 | 21284 |
| memoria | Tool calls | updateWorkingMemory×2 | ninguna |
| memoria | Respuesta (chars) | 179 | 79 |
| memoria | URLs citadas | 0 | 0 |
| memoria | Disclaimer | sí | NO |
| empresa-publica | Duración | 25.4s | 30.8s |
| empresa-publica | Tokens | 37190 | 42942 |
| empresa-publica | Tool calls | quoteTool, financialsTool, historicalPricesTool, secFilingsTool, marketNewsTool, updateWorkingMemory | quote, financials, historical_prices, sec_filings, market_news, write_file |
| empresa-publica | Respuesta (chars) | 4432 | 3971 |
| empresa-publica | URLs citadas | 0 | 0 |
| empresa-publica | Disclaimer | sí | sí |
| comparativa | Duración | 17.7s | 13.4s |
| comparativa | Tokens | 44698 | 35108 |
| comparativa | Tool calls | historicalPricesTool×3, quoteTool×3, updateWorkingMemory | historical_prices×3, quote×3 |
| comparativa | Respuesta (chars) | 2865 | 3081 |
| comparativa | URLs citadas | 0 | 0 |
| comparativa | Disclaimer | sí | sí |
| macro-fx | Duración | 50.9s | 36.4s |
| macro-fx | Tokens | 86241 | 120488 |
| macro-fx | Tool calls | macroIndicatorsTool×4, fxRatesTool, knowledgeSearchTool, marketNewsTool×2, quoteTool, webSearchTool×2, updateWorkingMemory | macro_indicators×2, fx_rates, quote, market_news×2, web_search |
| macro-fx | Respuesta (chars) | 3865 | 4174 |
| macro-fx | URLs citadas | 0 | 0 |
| macro-fx | Disclaimer | sí | sí |
| cartera-fire | Duración | 27.9s | 672.6s |
| cartera-fire | Tokens | 47083 | 3649056 |
| cartera-fire | Tool calls | portfolioTool, firePlanTool×3, knowledgeSearchTool, updateWorkingMemory | portfolio_recommendation, knowledge_search×2, fire_plan×4, task(macro-analyst), write_file |
| cartera-fire | Respuesta (chars) | 7416 | 3792 |
| cartera-fire | URLs citadas | 0 | 0 |
| cartera-fire | Disclaimer | sí | sí |
| robustez | Duración | 18.8s | 34.2s |
| robustez | Tokens | 32168 | 65970 |
| robustez | Tool calls | assetSearchTool×3, marketNewsTool, updateWorkingMemory | asset_search×2, company_profile, market_news×2, web_search×2, web_fetch |
| robustez | Respuesta (chars) | 3507 | 3748 |
| robustez | URLs citadas | 0 | 0 |
| robustez | Disclaimer | sí | sí |

| Total (6 escenarios) | — | 152.3s · 285605 tokens · 38 tool calls | 792.6s · 3934848 tokens · 36 tool calls |

## Conclusiones

1. **Paridad funcional: empate 6/6.** Ambos completan todos los escenarios con calidad estructural
   equivalente (tablas con fuente y fecha, veredicto toro/oso, fiscalidad correcta). La matemática
   determinista sale de las tools en ambos y las cifras coinciden (misma cartera 64% RV global,
   TER medio ~0,16%): ningún framework "inventa" la matemática si las tools existen.
2. **Velocidad**: en tareas estándar (empresa, comparativa, macro) son comparables (13-51 s). En
   runs multi-paso profundos, DeepAgents tarda 10-24× más (cartera-fire: 673 s vs 28 s): cada
   sub-agente aislado encadena sus propias generaciones largas y secuenciales.
3. **Coste en tokens: la mayor divergencia.** En runs largos, el loop agéntico de DeepAgents relee
   su contexto creciente en cada paso: 3,65 M de tokens vs 47 k de Mastra en cartera-fire (~78×).
   En runs cortos el gasto es comparable (37 k vs 43 k en empresa-publica). Con un gateway sin
   prompt caching (NaN), el coste de input del modo "deep" se dispara: es el precio del
   aislamiento de sub-agentes + filesystem + planificación.
4. **Fiabilidad**:
   - Gateway: una generación larga sin streaming provocó un 524 (proxy timeout de Cloudflare en
     api.nan.builders). Fix: `streaming: true` en el ChatOpenAI (AI-SDK ya streamea por defecto,
     por eso Mastra no lo sufre).
   - Mastra: el `maxSteps` por defecto trunca análisis largos (solo meta-comentarios); subirlo es
     imprescindible. DeepAgents no tiene techo de pasos, pero paga el precio del punto 3.
   - Mastra recuerda entre ejecuciones por diseño (working memory por resource): en el test la
     cartera salió con la nota "es la cuarta vez que me llega esta petición". Correcto en
     producción, a vigilar en tests.
5. **Robustez: ambos honestos.** Con tickers/empresas sin datos, ninguno alucinó cifras: Mastra
   fue directo ("no existe tal acción"), DeepAgents lo verificó por tres vías y explicó el porqué.
6. **Memoria: ambos recuerdan** el turno previo. Mastra lo hace con working memory estructurada
   (tool `updateWorkingMemory`); DeepAgents con el hilo de conversación, sin tools extra.
7. **Disclaimer**: Mastra lo garantiza por código en TODAS las respuestas (output processor, incluso
   en respuestas no inversoras como la prueba de memoria); DeepAgents solo lo emite cuando el modelo
   considera que aplica (más limpio, pero depende del juicio del modelo — el post-proceso
   `ensureDisclaimer()` de la app lo garantiza igualmente).
8. **Extra de DeepAgents**: los informes largos se guardan de verdad en disco (`.agent-fs/`) y las
   salidas grandes de tools se descargan del contexto (`large_tool_results/`) — gestión de
   contexto que Mastra resuelve con working memory y `lastMessages`.

**Veredicto**: para este agente financiero sobre deepseek-v4-flash vía gateway NaN, Mastra es más
eficiente en coste y latencia cuando el run es profundo, y su plataforma (memoria, workflows,
playground) evita integración. DeepAgents aporta más capacidades de serie (sub-agentes aislados,
filesystem real, planificación) con paridad de calidad, pero su loop profundo multiplica el gasto
de tokens: ideal si el gateway cachea prompts o el modelo es barato/rápido; costoso si no.

## Respuestas íntegras

Por escenario en `test-results/suite/<escenario>/{mastra,deepagents}-answer.md` y datos crudos en `results.json`.
