import 'dotenv/config';
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { assertNanConfig } from '../nan';
import {
  AgentResult,
  countUrls,
  formatToolCalls,
  hasDisclaimer,
  runDeepAgents,
  runMastra,
  seconds,
} from './lib';

/**
 * Suite intensiva de tests comparativos Mastra vs DeepAgents.
 *
 * 6 escenarios que cubren los perfiles de uso del agente financiero:
 *   1. empresa-publica  → análisis cuantitativo con muchas tools (quote/financials/históricos/filings/noticias)
 *   2. comparativa      → matemática sobre series históricas de 3 activos
 *   3. macro-fx         → indicadores oficiales + divisas + divulgación
 *   4. cartera-fire     → tools deterministas (portfolio_recommendation + fire_plan) + informe
 *   5. robustez         → tickers/empresas sin datos: el agente debe admitirlo, no inventar
 *   6. memoria          → 2 turnos: el 2º exige recordar lo dicho en el 1º
 *
 * Métricas por escenario: duración, tokens (incluidos sub-agentes), tool calls,
 * URLs citadas, disclaimer y texto íntegro de cada respuesta.
 *
 * Uso:  npm run test:suite [-- only=id1,id2] [-- skip-mastra] [-- skip-deep]
 * Resultados: test-results/suite/<escenario>/ y test-results/suite/summary.md
 */

type Scenario = {
  id: string;
  title: string;
  what: string;
  prompts: string[];
};

const SCENARIOS: Scenario[] = [
  {
    id: 'empresa-publica',
    title: 'Análisis cuantitativo de empresa cotizada',
    what: 'Fuerza la cadena completa de tools de mercado: resolver símbolo, quote, fundamentales, histórico con volatilidad, filings SEC y noticias.',
    prompts: [
      'Analiza Apple (AAPL): cotización actual con su fecha, fundamentales clave (P/E, márgenes, ROE, crecimiento), rendimiento y volatilidad a 1 año, últimos filings relevantes de la SEC y 2-3 noticias recientes. Cierra con veredicto toro/oso breve y cita fuente de cada cifra.',
    ],
  },
  {
    id: 'comparativa',
    title: 'Comparativa de 3 activos',
    what: 'Exige matemática sobre series históricas (rentabilidad y volatilidad anualizada) y una síntesis comparativa honesta.',
    prompts: [
      'Compara el rendimiento a 1 año y la volatilidad anualizada de AAPL, MSFT y el S&P 500 (^GSPC). Tabla comparativa con las tres columnas y conclusión: ¿cuál fue la mejor inversión y cuál asumiría más riesgo? Cita las fuentes de los datos.',
    ],
  },
  {
    id: 'macro-fx',
    title: 'Macro y divisas con divulgación',
    what: 'Indicadores oficiales del Banco Mundial + tipos de cambio BCE + explicación divulgativa.',
    prompts: [
      '¿Cómo ha evolucionado la inflación en España y Alemania en los últimos 3 años (datos oficiales) y a qué está el EUR/USD hoy? Explica brevemente qué implica para la política monetaria del BCE. Cita fuente y año de cada cifra.',
    ],
  },
  {
    id: 'cartera-fire',
    title: 'Cartera educativa + plan FIRE',
    what: 'Tools deterministas (portfolio_recommendation, fire_plan): la matemática NO debe inventarla el modelo, debe venir de las tools.',
    prompts: [
      'Soy español, tengo 35 años, 20.000 € invertibles, tolerancia al riesgo 4 y quiero independencia financiera con 2.500 €/mes netos. Propón una cartera educativa con productos concretos (ISIN/TER) y calcula el plan FIRE neta de impuestos. Explica la fiscalidad española relevante.',
    ],
  },
  {
    id: 'robustez',
    title: 'Robustez ante datos inexistentes',
    what: 'Tickers/empresas sin datos: mide si el agente admite el vacío o alucina cifras. Penalizable inventar datos.',
    prompts: [
      '¿A cuánta cotización está la acción de TIKTOK en bolsa y cuál es el precio actual de XYZABC123? Si no tienes datos fiables, dilo claramente y explica por qué.',
    ],
  },
  {
    id: 'memoria',
    title: 'Memoria multi-turno',
    what: '2 turnos: el segundo exige recordar nombre, empresa y horizonte dichos en el primero.',
    prompts: [
      'Me llamo Andrés, trabajo en NaN y mi horizonte de inversión llega hasta 2045. ¿Qué herramientas tienes disponibles? Respóndeme en una línea.',
      '¿Cómo me llamo, dónde trabajo y qué horizonte de inversión te dije? Una línea.',
    ],
  },
];

const args = process.argv.slice(2);
const onlyArg = args.find(a => a.startsWith('--only='))?.split('=')[1];
const skipMastra = args.includes('--skip-mastra');
const skipDeep = args.includes('--skip-deep');
const scenarios = onlyArg ? SCENARIOS.filter(s => onlyArg.split(',').includes(s.id)) : SCENARIOS;

const REPO_ROOT = process.cwd();
const MASTRA_DIR = process.env.MASTRA_DIR ?? join(REPO_ROOT, '.tmp', 'mastra-agent-review');
const OUT_ROOT = join(REPO_ROOT, 'test-results', 'suite');

assertNanConfig();
mkdirSync(OUT_ROOT, { recursive: true });

console.log(`=== Suite intensiva: ${scenarios.length} escenarios ===\n`);

type Row = {
  scenario: Scenario;
  mastra?: AgentResult;
  deep?: AgentResult;
};

const rows: Row[] = [];

for (const scenario of scenarios) {
  console.log(`\n▶ ${scenario.id} — ${scenario.title}`);
  console.log(`  ${scenario.what}`);

  // Si se omite un framework (--skip-*), conservar su resultado previo si existe
  let prev: { mastra?: AgentResult; deepagents?: AgentResult } = {};
  const prevPath = join(OUT_ROOT, scenario.id, 'results.json');
  if (existsSync(prevPath)) {
    try {
      prev = JSON.parse(readFileSync(prevPath, 'utf8'));
    } catch {
      /* corrupto: se re-ejecuta */
    }
  }

  const mastraRes = skipMastra ? prev.mastra : runMastra(MASTRA_DIR, REPO_ROOT, scenario.id, scenario.prompts, join(OUT_ROOT, scenario.id));
  console.log(`  Mastra: ${mastraRes ? seconds(mastraRes.durationMs) + (mastraRes.error ? ' (error)' : '') : 'omitido'}`);

  const deepRes = skipDeep ? prev.deepagents : await runDeepAgents(scenario.prompts, join(OUT_ROOT, scenario.id));
  console.log(`  DeepAgents: ${deepRes ? seconds(deepRes.durationMs) + (deepRes.error ? ' (error)' : '') : 'omitido'}`);

  if (mastraRes) {
    writeFileSync(join(OUT_ROOT, scenario.id, 'mastra-answer.md'), `# ${scenario.title} — Mastra\n\n${mastraRes.text}`, 'utf8');
  }
  if (deepRes) {
    writeFileSync(join(OUT_ROOT, scenario.id, 'deepagents-answer.md'), `# ${scenario.title} — DeepAgents\n\n${deepRes.text}`, 'utf8');
  }
  writeFileSync(
    join(OUT_ROOT, scenario.id, 'results.json'),
    JSON.stringify({ scenario: scenario.id, mastra: mastraRes, deepagents: deepRes }, null, 2),
    'utf8',
  );
  rows.push({ scenario, mastra: mastraRes, deep: deepRes });
}

// Escenarios no ejecutados en este run: reutilizar resultados previos para el summary
for (const scenario of SCENARIOS) {
  if (scenarios.includes(scenario)) continue;
  const prevPath = join(OUT_ROOT, scenario.id, 'results.json');
  if (!existsSync(prevPath)) continue;
  try {
    const prev = JSON.parse(readFileSync(prevPath, 'utf8')) as { mastra?: AgentResult; deepagents?: AgentResult };
    console.log(`↺ ${scenario.id} — reutilizando resultados previos`);
    rows.push({ scenario, mastra: prev.mastra, deep: prev.deepagents });
  } catch {
    /* resultados previos corruptos: se omiten */
  }
}

function metricCell(res: AgentResult | undefined, fn: (r: AgentResult) => string): string {
  return res && !res.error ? fn(res) : '—';
}

function tokensCell(res: AgentResult | undefined): string {
  if (!res || res.error) return '—';
  const u = res.usage;
  if (!u) return '—';
  const total = u.totalTokens ?? u.input + u.output;
  if (u.uncachedInput !== undefined) {
    return `${total.toLocaleString('es-ES')} (no cacheado: ${u.uncachedInput.toLocaleString('es-ES')})`;
  }
  return total.toLocaleString('es-ES');
}

function table(rows: Row[]): string {
  const header = `| Escenario | Métrica | Mastra | DeepAgents |
|---|---|---|---|`;
  const lines: string[] = [];
  for (const { scenario, mastra, deep } of rows) {
    lines.push(`| ${scenario.id} | Duración | ${metricCell(mastra, r => seconds(r.durationMs))} | ${metricCell(deep, r => seconds(r.durationMs))} |`);
    lines.push(`| ${scenario.id} | Tokens (input+output) | ${tokensCell(mastra)} | ${tokensCell(deep)} |`);
    lines.push(`| ${scenario.id} | Llamadas LLM | ${metricCell(mastra, r => String(r.usage?.llmCalls ?? '—'))} | ${metricCell(deep, r => String(r.usage?.calls ?? '—'))} |`);
    lines.push(`| ${scenario.id} | Tool calls | ${metricCell(mastra, r => formatToolCalls(r.toolCalls))} | ${metricCell(deep, r => formatToolCalls(r.toolCalls))} |`);
    lines.push(`| ${scenario.id} | Respuesta (chars) | ${metricCell(mastra, r => String(r.text.length))} | ${metricCell(deep, r => String(r.text.length))} |`);
    lines.push(`| ${scenario.id} | URLs citadas | ${metricCell(mastra, r => String(countUrls(r.text)))} | ${metricCell(deep, r => String(countUrls(r.text)))} |`);
    lines.push(`| ${scenario.id} | Disclaimer | ${metricCell(mastra, r => (hasDisclaimer(r.text) ? 'sí' : 'NO'))} | ${metricCell(deep, r => (hasDisclaimer(r.text) ? 'sí' : 'NO'))} |`);
    if (mastra?.error || deep?.error) {
      lines.push(`| ${scenario.id} | Error | ${mastra?.error ?? '—'} | ${deep?.error ?? '—'} |`);
    }
  }
  return `${header}\n${lines.join('\n')}`;
}

function totals(rows: Row[]): string {
  const sum = (res: AgentResult | undefined, f: (r: AgentResult) => number) => (res && !res.error ? f(res) : 0);
  const mDur = rows.reduce((a, r) => a + sum(r.mastra, x => x.durationMs), 0);
  const dDur = rows.reduce((a, r) => a + sum(r.deep, x => x.durationMs), 0);
  const mTok = rows.reduce((a, r) => a + sum(r.mastra, x => x.usage?.totalTokens ?? 0), 0);
  const dTok = rows.reduce((a, r) => a + sum(r.deep, x => x.usage?.uncachedInput ?? 0), 0);
  const mCalls = rows.reduce((a, r) => a + sum(r.mastra, x => x.toolCalls.reduce((s, c) => s + c.count, 0)), 0);
  const dCalls = rows.reduce((a, r) => a + sum(r.deep, x => x.toolCalls.reduce((s, c) => s + c.count, 0)), 0);
  return `| Total (${rows.length} escenarios) | — | ${seconds(mDur)} · ${mTok.toLocaleString('es-ES')} tokens · ${mCalls} tool calls | ${seconds(dDur)} · ${dTok.toLocaleString('es-ES')} tokens no cacheados · ${dCalls} tool calls |`;
}

const scenarioList = rows.map(r => `- **${r.scenario.id}** — ${r.scenario.title}: ${r.scenario.what}`).join('\n');

const CONCLUSIONES = `## Conclusiones

### Metodología de conteo (revisada tras detectar dos fallos de medición)

La primera versión de esta suite reportó diferencias de tokens infladas (~3,65 M en cartera-fire).
Auditoría del instrumento de medición:

1. **Bug (corregido): suma del usage por chunk en streaming.** En streaming, LangChain agrega el
   \`usage_metadata\` de cada chunk sumándolo: una llamada trivial de 14 tokens se reportaba como 36.
2. **Bug (corregido): estimado por caracteres.** El fallback de LangChain (\`estimatedTokenUsage\`)
   estima ~chars/4 y NO cuenta los tool schemas: la primera llamada real del agente son ~10,5 k
   tokens (system prompt + 18 tools) pero el estimado daba ~1,3 k.
3. **Solución**: interceptar el \`fetch\` al gateway y parsear el \`usage\` exacto que reporta la API
   en cada respuesta (JSON y SSE), incluyendo \`prompt_tokens_details.cached_tokens\`. Es la fuente
   de verdad; el campo \`contextCurve\`/\`perCall\` de \`results.json\` guarda el detalle por llamada.

### Resultados con conteo exacto

1. **Paridad funcional 6/6** (se mantiene): mismos informes, misma matemática desde las tools,
   cero alucinaciones con datos inexistentes en ambos.
2. **Tareas estándar: DeepAgents es eficiente.** Con el gateway cacheando prompts (~91-99% de
   hit), el input NO cacheado de DeepAgents es mínimo (empresa-publica: 73 k brutos → 6,7 k
   efectivos; memoria: 211 tokens efectivos). Su loop hace menos llamadas que Mastra en la mayoría
   de escenarios (5 vs 6-12).
3. **Runs profundos: el outlier en la primera ejecución fue cartera-fire.** 53 llamadas LLM, contexto del agente
   principal creciendo hasta ~240 k tokens (la curva \`contextCurve\` muestra el harness resumiendo
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
   no muestra estas espirales: su loop converge antes y \`maxSteps\` acota el peor caso.
7. **Fiabilidad**: el \`maxSteps\` default de Mastra trunca análisis largos (subirlo es
   imprescindible); la working memory de Mastra recuerda entre ejecuciones (por diseño, a vigilar
   en tests); el disclaimer es por código en Mastra (siempre) y por prompt+app en DeepAgents.

**Veredicto revisado**: la diferencia de tokens y tiempo que motivó esta revisión era en su mayor
parte un fallo de medición (corregido aquí). Lo que queda de diferencia real —acumulación de
contexto en runs profundos— está mitigada por el prompt caching del gateway (~91-99%) y por el
summarization del propio harness, pero el comportamiento del modelo bajo el loop abierto de
DeepAgents es poco predecible entre runs: para producción conviene fijar un presupuesto
(\`maxSteps\`/límite de llamadas o budget de tokens), que DeepAgents permite vía middleware y
Mastra ya trae de serie. Para este agente sobre deepseek-v4-flash vía NaN: coste y latencia
comparables en tareas estándar; en runs profundos, Mastra mantiene el contexto más plano y
estable, DeepAgents paga más input bruto (barato con caché) y depende más de la varianza del
gateway.`;

const summary = `# Suite intensiva Mastra vs DeepAgents

Fecha: ${new Date().toISOString()}
Modelo: deepseek-v4-flash (gateway NaN) en ambos · Mastra con \`maxSteps: 24\` (el default corta análisis largos)
Tokens: usage EXACTO del gateway por llamada (fetch interceptor); para DeepAgents se desglosa bruto vs no cacheado (prompt caching del gateway)

## Escenarios

${scenarioList}

## Métricas por escenario

${table(rows)}

${totals(rows)}

${CONCLUSIONES}

## Respuestas íntegras

Por escenario en \`test-results/suite/<escenario>/{mastra,deepagents}-answer.md\` y datos crudos en \`results.json\` (incluye \`contextCurve\` y \`perCall\` con el usage exacto por llamada).
`;

writeFileSync(join(OUT_ROOT, 'summary.md'), summary, 'utf8');
console.log(`\n✅ Suite completada: ${OUT_ROOT}/summary.md`);
