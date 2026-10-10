# Mastra vs DeepAgents — el mismo agente financiero, dos frameworks

Se ha portado el agente de análisis financiero de [mastra-agent-review](https://github.com/santos-sanz/mastra-agent-review) (Mastra) a **LangChain DeepAgents** (este repo) manteniendo paridad funcional: mismo modelo (`deepseek-v4-flash` vía gateway NaN), mismas 18 tools, mismas fuentes de datos, mismos 5 sub-agentes y mismos casos de uso.

Este documento compara qué cambia al cambiar de framework, no qué producto es "mejor" en abstracto.

## TL;DR

| | Mastra | DeepAgents |
|---|---|---|
| **Filo** | Framework completo de agentes (agents + workflows + storage + deploy) | "Harness" opinado sobre LangGraph (planificación, filesystem, sub-agentes out-of-the-box) |
| **Código de la app** | ~3.000 LOC (`src/mastra`) | ~1.900 LOC |
| **Lo que escribes tú** | Casi todo: memoria, storage, vector, workflows, processors, schedules | Solo tools + prompts: lo demás es harness |
| **Lo que te da hecho** | Playground, deploy a Cloudflare, memoria persistente lista | Task tool, todo-list, filesystem virtual, context quarantine |
| **Ideal para** | Productos de agente con workflows deterministas y deploy serverless | Agentes conversacionales complejos con delegación y menos infraestructura |

## 1. Modelo mental

- **Mastra** es un *framework* al estilo Next.js: registras agentes, workflows, storage y schedulers en un objeto `mastra`, y te despliega un servidor con playground y API. El código gira alrededor de `new Agent({...})` con muchas capacidades acopladas (memoria, processors, scorers como propiedades del agente).
- **DeepAgents** es un *harness* construido sobre LangGraph (`createDeepAgent`): un único agente con un loop de razonamiento + un conjunto de capacidades pre-instaladas (filesystem virtual, `task` para delegar, `write_todos` para planificar, resumen de contexto). Todo lo demás son tools y middleware que tú añades.

Consecuencia práctica: **en Mastra el agente es una pieza de una aplicación mayor; en DeepAgents el agente ES la aplicación.**

## 2. Arquitectura equivalente, concepto a concepto

| Concepto | Mastra (mastra-agent-review) | DeepAgents (este repo) |
|---|---|---|
| Orquestador | `new Agent({ instructions, tools, agents, memory, outputProcessors, scorers })` | `createDeepAgent({ systemPrompt, tools, subagents, middleware })` |
| Sub-agentes | `agents: { marketAnalyst, ... }` (routing interno del agente) | `subagents: [{ name, description, systemPrompt, tools }]` → se invocan con la tool `task` |
| Registro de app | `Mastra` (index.ts con agentes, workflows, storage) | No existe: el grafo compilado es la app |
| Workflows deterministas | `createWorkflow` con steps tipados + `suspend()/resume()` (human-in-the-loop) | No hay workflows: la planificación es `write_todos` y la matemática determinista vive en tools (`fire_plan`, `portfolio_recommendation`) |
| Memoria | `Memory` + `LibSQLStore`, `lastMessages: 10`, working memory por usuario | Estado del grafo en LangGraph; en este port, historial de texto en `.sessions/*.json` (sin persistencia built-in de larga duración) |
| RAG | `LibSQLVector` + embeddings + rerank del gateway | Vector store local en JSON (embeddings + coseno + rerank del gateway) — mismo enfoque, cero infra |
| Output processor | `outputProcessors: [financialDisclaimerProcessor]` (a nivel de agente) | No existe: `ensureDisclaimer()` en la capa de aplicación tras cada respuesta |
| Scorers/evals | `scorers: { financialQuality }` (LLM-judge integrado) | No hay equivalente built-in: evals fuera del framework |
| Schedules (cron) | `schedules/morning-briefing.ts` (`0 9 * * 1-5`) | No hay equivalente: cron externo (cron job que invoque al agente) |
| API server + playground | `mastra dev` (rutas custom `/custom/*`, playground UI) | No hay servidor: en este port, REPL CLI |
| Structured output | `structuredOutput: { schema, jsonPromptInjection: 'auto' }` | `responseFormat: toolStrategy(schema)` (igual limitación: el modelo no soporta `json_schema`) |
| Human-in-the-loop | `suspend()/resume()` en workflows | `interruptOn` por tool (requiere checkpointer) — no usado en este port |

## 3. Dónde gana DeepAgents

1. **Sub-agentes con aislamiento de contexto gratis.** En Mastra los sub-agentes comparten la conversación vía el routing del agente; en DeepAgents cada `task` lanza un contexto *aislado* que solo devuelve el resultado final. Para herramientas con salidas grandes (búsquedas web, series históricas) esto protege la ventana de contexto del orquestador.
2. **Filesystem virtual y planificación incluidos.** `ls/read_file/write_file/glob/grep` y `write_todos` vienen de serie; en Mastra tendrías que montarlo a mano con tools custom. Para un agente que "escribe informes" es un acelerón real.
3. **Menos superficie propia.** Sin registro de agentes, sin storage que configurar, sin deployer: ~1.900 LOC frente a ~3.000 (y buena parte del ahorro es justo memoria/storage/workflows).
4. **Modelo de extensión uniforme.** Middleware de LangChain (`todoListMiddleware`, summarization, HITL…) se compone con el agente; en Mastra cada capacidad tiene su propia API (`outputProcessors`, `scorers`, `memory`…).

## 4. Dónde gana Mastra

1. **Workflows deterministas con HITL.** `analysis`, `compare`, `briefing` y `portfolio` son grafos tipados con `suspend()/resume()`. En DeepAgents el flujo lo decide el LLM (con todos), y reproducir "paso 3 espera aprobación humana" requiere checkpointer + interrupts.
2. **Memoria persistente de producto.** `Memory` con LibSQL + working memory por usuario funciona en producción con una línea de config. En DeepAgents la persistencia de larga duración es tarea del integrador (checkpointer/backends).
3. **Plataforma incluida.** `mastra dev` da playground, API REST custom y schedules; el deploy a Cloudflare Workers está integrado (`@mastra/deployer-cloudflare`). Con DeepAgents despliegas tú el servidor (p. ej. LangGraph Platform o tu propio endpoint).
4. **Evals integrados.** El scorer LLM-judge (`financial-quality`) se registra en el agente y se ejecuta con cada respuesta. En DeepAgents esto vive fuera.
5. **Garantías de salida por código.** El output processor impone el disclaimer a nivel de framework. En DeepAgents lo hemos replicado en la capa de app: funciona, pero es "tu código", no un contrato del framework.

## 5. La parte que NO cambia (y es la mayoría)

- **Las 18 tools son idénticas**: mismas URLs, mismos parsers, mismos fallbacks keyless → Tavily, mismo crumb de Yahoo, mismo filtrado de filings. Ni Mastra ni DeepAgents aportan nada aquí: las tools son funciones con schema Zod en ambos.
- **El gateway NaN** se consume igual: en Mastra vía `@ai-sdk/openai`, aquí vía `@langchain/openai`. Mismas limitaciones (Chat Completions, sin `json_schema`).
- **La matemática determinista** (FIRE, asignación de cartera, catálogo) se portó sin cambios: en ambos frameworks vive *fuera* del LLM, como debe ser.

## 6. Experiencia de desarrollo

| Aspecto | Mastra | DeepAgents |
|---|---|---|
| Setup inicial | `npm install` + `.env` + `rag:index` | Igual (el RAG es local, ni LibSQL) |
| Iterar el agente | Editas el agente y usas playground/scripts | Editas prompt/tools y corres scripts; streaming de updates muy legible en CLI |
| Testing | `npm run test:suite` (30 casos end-to-end con informe HTML) | No portado en este repo (el suite es del proyecto Mastra); verificamos con scripts de humo |
| Curva de aprendizaje | Más API propia que aprender (Memory, Workflows, Processors, Scorers, Deployer) | Menos API, pero asume LangGraph y LangChain como sustrato |
| Ecosistema | Mastra-specific (Cloudflare deployer, LibSQL, playground) | LangChain/LangGraph (MCP, middleware, providers, LangSmith) |

## 7. Riesgos y observaciones del port

- **El REPL sustituye al playground** pero no a un producto: sin `mastra dev`, no hay API HTTP ni UI; tocaría montar un endpoint (LangGraph Platform encaja aquí).
- **Sin memoria de larga duración built-in**, el "recuérdame que…" multi-sesión queda en manos del integrador. Para un producto con usuarios, este es el mayor hueco respecto a Mastra.
- **Los sub-agentes aislados repiten contexto**: cada `task` re-envía la instrucción y los resultados de tools que necesite; con muchos pasos puede gastar más tokens que el routing interno de Mastra (a cambio de un contexto del orquestador mucho más limpio).
- **Workflows → prompts**: el briefing/comparativa "determinista" de Mastra aquí es el LLM siguiendo `write_todos`; más flexible, menos reproducible. La parte realmente determinista (matemática, catálogo) sigue siendo código en ambos.

## 8. Test real de contraste: análisis de la IPO de Anthropic

Mismo prompt contra ambos agentes (`npm run test:ipo`, resultados en [`test-results/ipo-anthropic/report.md`](test-results/ipo-anthropic/report.md)). El caso es deliberadamente "difícil": Anthropic es privada, así que no hay datos estructurados y todo depende de investigación web con citas.

| | Mastra | DeepAgents |
|---|---|---|
| Duración | **82,5 s** | 1.316 s (~16×) |
| Tool calls (top-level) | 26 (marketNews×5, quote×5, secFilings, webFetch, agent-macroAnalyst…) | 31 (task(researcher-agent), task(market-analyst), market_news×6, web_search×6, write_todos×3, write_file) |
| Tokens totales | 120.953 | **55.377 (–54%)** |
| Respuesta | Informe completo con fuentes y fechas | Informe completo con fuentes y fechas + guardado en disco (`write_file`) |
| Disclaimer | ✅ | ✅ |

Lecturas del test:

1. **Calidad comparable**, caminos distintos. Ambos entregan un informe con financiación, valoraciones, condiciones de mercado, riesgos y veredicto toro/oso. Mastra trabajo "en línea" (orquestador + sub-agentes en el mismo hilo); DeepAgents planificó con `write_todos`, delegó a `researcher-agent` y `market-analyst` en contextos aislados y guardó el informe final en disco.
2. **El aislamiento de contexto ahorró la mitad de tokens** pese a hacer más llamadas: los resultados pesados de web quedaron en los contextos de los sub-agentes (y los resultados de tools grandes, descargados al filesystem), no en el hilo del orquestador. El coste: ~16× más de wall-time, porque cada sub-agente encadena sus propias generaciones largas con un modelo lento.
3. **El `maxSteps` de Mastra es un parámetro crítico**: con su default, el análisis se corta a mitad y llega solo meta-comentarios ("voy a verificar…"). El test lo sube a 24 para una comparación justa.
4. **Corrección que destiló el test**: el informe "guardado" por DeepAgents vivía en un filesystem virtual efímero; ahora el agente usa `FilesystemBackend` con `virtualMode: true` jaulado a `.agent-fs/` y el fichero existe de verdad en disco.

## 9. Conclusión

- Si el producto es **un agente conversacional experto que investiga, delega y escribe informes** → DeepAgents llega con más capacidades de serie y menos código propio (este repo es la prueba: paridad funcional en ~60% del código).
- Si el producto necesita **workflows con aprobación humana, memoria multi-usuario y despliegue gestionado** → Mastra resuelve hoy lo que en DeepAgents es integración manual.
- Ambos comparten la capa que de verdad importa a largo plazo: **tools bien diseñadas y matemática fuera del LLM**. Cambiar de framework tocó ~40% del código (capa de agente), el 60% restante (tools, fuentes, catálogo) se portó tal cual.
