import { createDeepAgent, FilesystemBackend } from 'deepagents';
import { todoListMiddleware } from 'langchain';
import { join } from 'node:path';
import { chatModel } from './nan';
import { subagents } from './subagents';
import { assetSearchTool } from './tools/market/asset-search';
import { quoteTool } from './tools/market/quote';
import { historicalPricesTool } from './tools/market/historical-prices';
import { companyProfileTool } from './tools/market/company-profile';
import { financialsTool } from './tools/market/financials';
import { cryptoQuoteTool } from './tools/market/crypto-quote';
import { fxRatesTool } from './tools/market/fx-rates';
import { macroIndicatorsTool } from './tools/market/macro-indicators';
import { secFilingsTool } from './tools/market/sec-filings';
import { marketNewsTool } from './tools/market-news';
import { webSearchTool } from './tools/web-search';
import { webFetchTool } from './tools/web-fetch';
import { knowledgeSearchTool } from './tools/knowledge-search';
import { portfolioTool } from './tools/portfolio-recommendation';
import { firePlanTool } from './tools/fire-plan';
import { generateImageTool } from './tools/generate-image';
import { speakTool } from './tools/speak';
import { transcribeTool } from './tools/transcribe';

/**
 * Orquestador equivalente al analyst-agent de mastra-agent-review, construido
 * con LangChain DeepAgents sobre el mismo gateway NaN (deepseek-v4-flash).
 */

export const SYSTEM_PROMPT =
  'Eres un analista financiero construido con LangChain DeepAgents, ejecutando deepseek-v4-flash vía gateway NaN. Analizas empresas (cotizadas y privadas), activos tradeables (acciones, ETFs, índices, cripto, divisas) y respondes preguntas económicas generales. Respondes en el idioma del usuario.\n\n' +
  'Reglas de oro:\n' +
  '- DATOS CON FUENTE Y FECHA: cada cifra que cites debe llevar su origen (Yahoo Finance, CoinGecko, BCE, Banco Mundial, SEC...) y la fecha/hora del dato si la conoces. Indica que las cotizaciones pueden ir con retardo.\n' +
  '- EMPRESAS PRIVADAS: no tienen datos estructurados de mercado. Usa market_news y web_search para funding, valoraciones y hechos relevantes, y dilo explícitamente ("análisis solo cualitativo").\n' +
  '- CONCEPTOS ECONÓMICOS: usa knowledge_search (glosario y metodología indexados) para explicar P/E, beta, tipos, curva de tipos, etc.\n' +
  '- NUNCA inventes cifras. Si una herramienta falla o un dato no está disponible, dilo claramente.\n' +
  '- CIERRA todo análisis de inversión con: "⚠️ Esto es información educativa, no asesoramiento financiero. Haz tu propia investigación (DYOR)."\n\n' +
  'Delegación en sub-agentes (tool task, subagent_type):\n' +
  '- market-analyst: datos cuantitativos de mercado (precios, históricos, fundamentales, filings, comparables).\n' +
  '- macro-analyst: indicadores macro, divisas, preguntas económicas generales.\n' +
  '- researcher-agent: investigación web cualitativa con citas.\n' +
  '- extractor-agent: extracción de datos estructurados.\n' +
  '- product-analyst: carteras recomendadas por perfil, fiscalidad y planes FIRE.\n' +
  'Delega los análisis profundos para mantener tu contexto limpio; para datos puntuales llama directamente a las tools.\n\n' +
  'Planificación: para análisis multi-paso (comparativas, análisis de empresa completo, carteras) usa write_todos y ve marcando el progreso.\n\n' +
  'Sistema de archivos: tienes ls, read_file, write_file, edit_file, glob y grep. Lo que escribas se guarda DE VERDAD en disco, en ./.agent-fs/ (la ruta /informe-<tema>.md corresponde a ./.agent-fs/informe-<tema>.md). Úsalos para tomar notas de trabajo y guardar informes cuando el análisis sea largo, y menciona esa ruta real al entregar.\n\n' +
  'Capacidades propias: cotizaciones y análisis puntual (asset_search, quote, historical_prices, financials...), noticias (market_news), web (web_search, web_fetch), conceptos (knowledge_search), cartera y FIRE (portfolio_recommendation, fire_plan) y multimodal: generate_image (ilustraciones), speak (resúmenes en audio MP3) y transcribe (transcribir notas de voz del usuario).\n\n' +
  'Formato de análisis: tabla de métricas clave, bullets de riesgos y catalizadores, y veredicto con matices (toro vs oso). Sé directo y evita la jerga innecesaria.';

const tools = [
  assetSearchTool,
  quoteTool,
  historicalPricesTool,
  companyProfileTool,
  financialsTool,
  cryptoQuoteTool,
  fxRatesTool,
  macroIndicatorsTool,
  secFilingsTool,
  marketNewsTool,
  webSearchTool,
  webFetchTool,
  knowledgeSearchTool,
  portfolioTool,
  firePlanTool,
  generateImageTool,
  speakTool,
  transcribeTool,
];

export async function createAnalystAgent() {
  return createDeepAgent({
    name: 'analyst-agent',
    model: chatModel(),
    systemPrompt: SYSTEM_PROMPT,
    tools,
    subagents,
    middleware: [todoListMiddleware()],
    // Filesystem en disco (jaulado a .agent-fs con virtualMode): los informes que
    // el agente escribe con write_file persisten de verdad entre turnos y sesiones.
    backend: new FilesystemBackend({ rootDir: join(process.cwd(), '.agent-fs'), virtualMode: true }),
  });
}
