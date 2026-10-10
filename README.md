# deepagent-review — Agente de análisis financiero con DeepAgents

Mismo agente de análisis financiero que [mastra-agent-review](https://github.com/santos-sanz/mastra-agent-review) —empresas (públicas y privadas), activos tradeables, preguntas económicas, carteras educativas y FIRE— pero construido con [LangChain DeepAgents](https://docs.langchain.com/oss/javascript/deepagents/overview) en lugar de [Mastra](https://mastra.ai). Mismo gateway de modelos [NaN](https://nan.builders) (`deepseek-v4-flash`), mismas fuentes de datos, mismos casos de uso.

> ⚠️ **Disclaimer**: toda la salida del agente es información **educativa**, no asesoramiento financiero. Los datos pueden ir con retardo. Haz tu propia investigación (DYOR).

La comparación detallada entre ambos frameworks está en [**COMPARISON.md**](./COMPARISON.md).

## Qué puede hacer (paridad con la versión Mastra)

- **Análisis de empresas**: cotizadas (perfil, quote, fundamentales, histórico con gráfico SVG, filings SEC, noticias) y privadas (investigación web cualitativa con citas).
- **Activos tradeables**: acciones, ETFs, índices, cripto (CoinGecko), divisas (BCE) y materias primas vía futuros.
- **Preguntas macro**: indicadores oficiales del Banco Mundial, tipos de cambio BCE y glosario económico indexado (RAG).
- **Robo-advisor educativo**: asignación por reglas deterministas + catálogo curado de fondos/ETFs/ETCs UCITS con fiscalidad por país.
- **FIRE**: calculadora de independencia financiera neta de impuestos, con modelado de posiciones concentradas (RSU/options).
- **Multimodal**: generación de imágenes, TTS (kokoro) y transcripción (whisper).

## Features de DeepAgents en uso

- **`createDeepAgent`** como orquestador único (sin registro de agentes ni workflows)
- **Sub-agentes** declarativos (`subagents: [...]`): market-analyst, macro-analyst, researcher-agent, extractor-agent y product-analyst, cada uno con su prompt, sus tools y su propia ventana de contexto aislada (`mode: "isolated"`)
- **Salida estructurada** vía `toolStrategy(schema)` en el extractor
- **Sistema de archivos en disco** (`FilesystemBackend` con `virtualMode: true` jaulado a `.agent-fs/`): los informes que el agente escribe con `write_file` persisten de verdad
- **Planificación** con `todoListMiddleware()` (`write_todos`) para análisis multi-paso
- **Streaming** de updates (tool calls visibles en el REPL)

## Arquitectura

```
src/
├── agent.ts                 → createDeepAgent: orquestador + system prompt + 18 tools
├── subagents.ts             → 5 sub-agentes (equivale a agents/ de Mastra)
├── index.ts                 → REPL interactivo con thread persistente (.sessions/)
├── test-agent.ts            → demo de memoria multi-turno (npm run chat)
├── test-extract.ts          → extracción estructurada (npm run extract)
├── tests/ipo-anthropic.ts   → test comparativo Mastra vs DeepAgents (npm run test:ipo)
├── nan.ts                   → cliente gateway NaN (ChatOpenAI + embeddings/rerank/TTS/STT/imágenes)
├── disclaimer.ts            → disclaimer garantizado en la capa de app (equivale al output processor)
├── rag/
│   └── store.ts             → vector store local JSON (embeddings + cosine + rerank del gateway)
├── products/                → catálogo curado + reglas deterministas de cartera (copiado de mastra)
└── tools/                   → 18 tools, mismas fuentes que Mastra
    ├── market/              → asset-search, quote, historical-prices (+SVG), company-profile,
    │                          financials (crumb Yahoo), crypto-quote, fx-rates, macro-indicators, sec-filings
    ├── web-search.ts        → keyless (DDG/Wikipedia/GitHub/HN) → Tavily si pobre
    ├── web-fetch.ts         → HTML → texto
    ├── market-news.ts       → Google News RSS → Tavily
    ├── knowledge-search.ts  → RAG local con rerank del gateway
    ├── fire-plan.ts         → matemática FIRE determinista
    ├── portfolio-recommendation.ts
    └── generate-image.ts, speak.ts, transcribe.ts
```

## Fuentes de datos

Idénticas a mastra-agent-review: Yahoo Finance, CoinGecko, Frankfurter (BCE), Banco Mundial, SEC EDGAR, Google News RSS — todas keyless — y Tavily opcional.

## Setup

```bash
npm install
cp .env.example .env   # y rellena NAN_API_KEY
npm run rag:index -- docs/conocimiento   # indexa el corpus económico en .rag/
```

Variables de entorno (`.env`, no versionado):

| Variable | Requerida | Descripción |
|---|---|---|
| `NAN_API_KEY` | ✅ | clave del gateway NaN |
| `NAN_URL` | ✅ | `https://api.nan.builders/v1` |
| `TAVILY_API_KEY` | opcional | mejora búsqueda web y noticias |

## Comandos

```bash
npm run chat            # demo de memoria multi-turno (2 turnos)
npm run repl            # conversación interactiva (equivalente al playground de mastra dev)
npm run repl -- --thread andres   # sesión persistente en .sessions/
npm run extract         # demo de extracción estructurada
npm run rag:index -- docs/conocimiento   # reindexar conocimiento
npm run rag:search -- "qué es el beta de una acción"
npm run test:ipo        # test comparativo: mismo prompt a Mastra y DeepAgents (IPO de Anthropic)
npm run typecheck       # tsc --noEmit
```

El test comparativo (`npm run test:ipo`) clona mastra-agent-review en `.tmp/` si no existe, ejecuta ambos agentes con el mismo prompt ("análisis de la IPO de Anthropic", un caso 100% cualitativo al ser empresa privada) y escribe en `test-results/ipo-anthropic/`: la respuesta de cada framework y un `report.md` con duración, tool calls y observaciones. Requiere solo `NAN_API_KEY`.

## Notas técnicas

- Modelo vía `ChatOpenAI` de `@langchain/openai` apuntando al gateway NaN (Chat Completions, como en Mastra).
- Extracción estructurada con `toolStrategy(schema)`: `deepseek-v4-flash` no soporta `json_schema` nativo, igual que en la versión Mastra (`jsonPromptInjection: 'auto'`).
- El disclaimer legal se garantiza en dos capas: instrucción del system prompt + post-proceso `ensureDisclaimer()` en la app (DeepAgents no tiene output processors).
- RAG local: embeddings `qwen3-embedding` + similitud coseno + `rerank` del gateway, persistido en `.rag/knowledge.json` (sin LibSQL ni BD externa).
- El vector store/estado del agente es efímero por defecto; el REPL persiste el historial de texto en `.sessions/`.
