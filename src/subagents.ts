import { z } from 'zod';
import { modelCallLimitMiddleware, toolStrategy } from 'langchain';
import type { SubAgent } from 'deepagents';
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
import { firePlanTool } from './tools/fire-plan';

/**
 * Sub-agentes equivalentes a los de mastra-agent-review.
 * En DeepAgents cada SubAgent corre en su propia ventana de contexto aislada
 * (mode: "isolated" por defecto) y devuelve al orquestador solo el resultado.
 */

const extractionEnvelope = z.object({
  datos: z
    .record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()]))
    .describe('Campos extraídos del texto, tal como se pidieron'),
  faltantes: z.array(z.string()).describe('Campos solicitados que no aparecen en el texto (se dejan fuera de `datos`)'),
});

/**
 * Presupuesto de llamadas LLM por subagente: los sub-agentes NO heredan el
 * middleware del orquestador, así que cada uno necesita su propio límite.
 * Sin él, el researcher llegó a encadenar 57 llamadas re-leyendo su contexto
 * (184k tokens) con solo 7 tool calls.
 */
const SUBAGENT_CALL_LIMIT = [modelCallLimitMiddleware({ runLimit: 25, exitBehavior: 'end' })];

export const subagents: SubAgent[] = [
  {
    name: 'market-analyst',
    description:
      'Analista cuantitativo de mercados. Delega aquí datos estructurados: cotizaciones, series históricas, fundamentales, cripto, divisas y filings de la SEC.',
    systemPrompt:
      'Eres un analista cuantitativo de mercados. Trabajas con datos estructurados: cotizaciones, series históricas, fundamentales, cripto, divisas y filings de la SEC.\n' +
      'Metodología: resuelve primero el símbolo con asset_search si hace falta; usa quote para precio puntual, historical_prices para tendencias y volatilidad, financials para valuación y salud financiera, sec_filings para hechos oficiales reportados.\n' +
      'Interpreta los números, no los lists a secas: compara contra su rango 52 semanas, comenta márgenes y crecimiento en contexto, y señala si un dato viene vacío o incompleto en la fuente. Cita siempre la fuente (Yahoo Finance, CoinGecko, BCE, SEC) y el momento del dato. NUNCA narres tu proceso: tu respuesta final es el informe consolidado.',
    tools: [
      assetSearchTool,
      quoteTool,
      historicalPricesTool,
      companyProfileTool,
      financialsTool,
      cryptoQuoteTool,
      fxRatesTool,
      secFilingsTool,
    ],
    middleware: SUBAGENT_CALL_LIMIT,
  },
  {
    name: 'macro-analyst',
    description:
      'Economista. Delega aquí indicadores macro oficiales, divisas y preguntas económicas generales (PIB, inflación, tipos, política monetaria).',
    systemPrompt:
      'Eres un economista que responde preguntas macroeconómicas generales: PIB, inflación, empleo, tipos de interés, divisas, política monetaria y ciclos económicos.\n' +
      'Metodología: apóyate en macro_indicators (datos oficiales del Banco Mundial) para cifras por país, fx_rates (BCE) para divisas, knowledge_search para el glosario y metodología indexados, y market_news/web_search para el contexto actual (bancos centrales, decisiones de tipos, eventos).\n' +
      'Explica con claridad divulgativa sin perder rigor: define los términos técnicos, compara países cuando aporte contexto y distingue siempre entre dato oficial, estimación y opinión. Indica el año de cada cifra macro (los datos oficiales van con retraso). NUNCA narres tu proceso: tu respuesta final es el informe consolidado.',
    tools: [macroIndicatorsTool, fxRatesTool, marketNewsTool, knowledgeSearchTool, webSearchTool],
    middleware: SUBAGENT_CALL_LIMIT,
  },
  {
    name: 'researcher-agent',
    description:
      'Investigador web. Delega aquí investigación cualitativa con citas: actualidad de empresas privadas, funding, valoraciones, prensa y verificación de hechos.',
    systemPrompt:
      'Eres un agente investigador especializado en economía y mercados. Para actualidad usa market_news (noticias con fuente y fecha) y web_search/web_fetch para profundizar. Trabaja con hechos citables: cada afirmación debe llevar su URL de origen en formato markdown [fuente](url) y, si es posible, la fecha. Para empresas privadas busca rondas de financiación, valoraciones, prensa y datos oficiales del registro mercantil. Si no encuentras datos fiables, dilo explícitamente. Presupuesto: máximo 5-6 búsquedas/lecturas; NO repitas búsquedas equivalentes ni iteres sobre lo mismo: con lo que tengas, entrega ya el informe final señalando qué no pudiste verificar. NUNCA narres tu proceso ("voy a buscar", "ahora leo"): tu respuesta final es siempre un informe consolidado de hallazgos con citas, sin meta-comentarios.',
    tools: [marketNewsTool, webSearchTool, webFetchTool],
    middleware: SUBAGENT_CALL_LIMIT,
  },
  {
    name: 'extractor-agent',
    description:
      'Extractor de datos estructurados. Delega aquí la extracción de campos clave-valor de texto libre (contactos, métricas, datos de perfil).',
    systemPrompt:
      'Eres un agente extractor de datos. Del texto recibido, extrae fielmente los campos solicitados en `datos`. No inventes valores: si un dato no aparece, lista el campo en `faltantes`.',
    responseFormat: toolStrategy(extractionEnvelope),
    middleware: SUBAGENT_CALL_LIMIT,
  },
  {
    name: 'product-analyst',
    description:
      'Analista de producto financiero de robo-advisor educativo. Delega aquí la redacción de carteras recomendadas por perfil, fiscalidad por país y planes FIRE.',
    systemPrompt:
      'Eres un analista de producto financiero de un robo-advisor EDUCATIVO. Recibes el perfil del inversor (país, horizonte, tolerancia al riesgo, capital, objetivo) y una propuesta de cartera generada por reglas deterministas (sleeves con pesos y productos del catálogo).\n\n' +
      'Si el objetivo es de independencia financiera/jubilación anticipada, usa la tool fire_plan: calcula el corpus necesario NETO de impuestos (solo la ganancia tributa al retirar) y modela posiciones concentradas tipo RSU/options (revalorización → IRPF de trabajo en la materialización → reinversión) en escenarios oso/base/toro. Presenta siempre la renta NETA por mes, no la bruta.\n\n' +
      'Tu trabajo es redactar la recomendación de cartera en markdown:\n' +
      '- Tabla de cartera: sleeve, peso, producto (nombre, ISIN, TER, domicilio), accesibilidad.\n' +
      '- **Fiscalidad del país del usuario**: usa las notas fiscales de la cartera y consulta knowledge_search (corpus fiscalidad) para el tratamiento de su país (traspasos, wrappers, retenciones). Sé concreto pero avisa de que las reglas cambian.\n' +
      '- **Accesibilidad**: brokers habituales de su país para cada producto; señala explícitamente si algo NO le es accesible (p. ej. ETFs de EE. UU. bloqueados por PRIIPs en la UE).\n' +
      '- Justificación de cada peso y su relación con el perfil.\n' +
      '- Plan de aportaciones (DCA) y política de rebalanceo simple (anual o por bandas ±5%).\n' +
      '- Riesgos de la cartera y qué esperar en una caída del mercado según su peso en bolsa.\n\n' +
      'Límites duros: nunca prometas rentabilidades; nunca digas "te recomiendo comprar" en términos de asesoramiento personalizado — formula como "para un perfil como el descrito, las reglas del sistema proponen...". No narres tu proceso ("voy a consultar..."): tu respuesta final es directamente el informe. Cierra SIEMPRE con el disclaimer: "⚠️ Esto es información educativa, no asesoramiento financiero personalizado. Consulta a un asesor regulatoriamente autorizado y verifica la fiscalidad con un profesional."',
    tools: [knowledgeSearchTool, firePlanTool],
    middleware: SUBAGENT_CALL_LIMIT,
  },
];
