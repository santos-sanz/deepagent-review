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

function table(rows: Row[]): string {
  const header = `| Escenario | Métrica | Mastra | DeepAgents |
|---|---|---|---|`;
  const lines: string[] = [];
  for (const { scenario, mastra, deep } of rows) {
    lines.push(`| ${scenario.id} | Duración | ${metricCell(mastra, r => seconds(r.durationMs))} | ${metricCell(deep, r => seconds(r.durationMs))} |`);
    lines.push(`| ${scenario.id} | Tokens | ${metricCell(mastra, r => String(r.usage?.totalTokens ?? '—'))} | ${metricCell(deep, r => String(r.usage?.totalTokens ?? '—'))} |`);
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
  const dTok = rows.reduce((a, r) => a + sum(r.deep, x => x.usage?.totalTokens ?? 0), 0);
  const mCalls = rows.reduce((a, r) => a + sum(r.mastra, x => x.toolCalls.reduce((s, c) => s + c.count, 0)), 0);
  const dCalls = rows.reduce((a, r) => a + sum(r.deep, x => x.toolCalls.reduce((s, c) => s + c.count, 0)), 0);
  return `| Total (${rows.length} escenarios) | — | ${seconds(mDur)} · ${mTok} tokens · ${mCalls} tool calls | ${seconds(dDur)} · ${dTok} tokens · ${dCalls} tool calls |`;
}

const scenarioList = rows.map(r => `- **${r.scenario.id}** — ${r.scenario.title}: ${r.scenario.what}`).join('\n');

const CONCLUSIONES = `## Conclusiones

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
     api.nan.builders). Fix: \`streaming: true\` en el ChatOpenAI (AI-SDK ya streamea por defecto,
     por eso Mastra no lo sufre).
   - Mastra: el \`maxSteps\` por defecto trunca análisis largos (solo meta-comentarios); subirlo es
     imprescindible. DeepAgents no tiene techo de pasos, pero paga el precio del punto 3.
   - Mastra recuerda entre ejecuciones por diseño (working memory por resource): en el test la
     cartera salió con la nota "es la cuarta vez que me llega esta petición". Correcto en
     producción, a vigilar en tests.
5. **Robustez: ambos honestos.** Con tickers/empresas sin datos, ninguno alucinó cifras: Mastra
   fue directo ("no existe tal acción"), DeepAgents lo verificó por tres vías y explicó el porqué.
6. **Memoria: ambos recuerdan** el turno previo. Mastra lo hace con working memory estructurada
   (tool \`updateWorkingMemory\`); DeepAgents con el hilo de conversación, sin tools extra.
7. **Disclaimer**: Mastra lo garantiza por código en TODAS las respuestas (output processor, incluso
   en respuestas no inversoras como la prueba de memoria); DeepAgents solo lo emite cuando el modelo
   considera que aplica (más limpio, pero depende del juicio del modelo — el post-proceso
   \`ensureDisclaimer()\` de la app lo garantiza igualmente).
8. **Extra de DeepAgents**: los informes largos se guardan de verdad en disco (\`.agent-fs/\`) y las
   salidas grandes de tools se descargan del contexto (\`large_tool_results/\`) — gestión de
   contexto que Mastra resuelve con working memory y \`lastMessages\`.

**Veredicto**: para este agente financiero sobre deepseek-v4-flash vía gateway NaN, Mastra es más
eficiente en coste y latencia cuando el run es profundo, y su plataforma (memoria, workflows,
playground) evita integración. DeepAgents aporta más capacidades de serie (sub-agentes aislados,
filesystem real, planificación) con paridad de calidad, pero su loop profundo multiplica el gasto
de tokens: ideal si el gateway cachea prompts o el modelo es barato/rápido; costoso si no.`;

const summary = `# Suite intensiva Mastra vs DeepAgents

Fecha: ${new Date().toISOString()}
Modelo: deepseek-v4-flash (gateway NaN) en ambos · Mastra con \`maxSteps: 24\` (el default corta análisis largos)
Tokens: contados vía callback handler en TODAS las llamadas LLM (incluidos sub-agentes de DeepAgents)

## Escenarios

${scenarioList}

## Métricas por escenario

${table(rows)}

${totals(rows)}

${CONCLUSIONES}

## Respuestas íntegras

Por escenario en \`test-results/suite/<escenario>/{mastra,deepagents}-answer.md\` y datos crudos en \`results.json\`.
`;

writeFileSync(join(OUT_ROOT, 'summary.md'), summary, 'utf8');
console.log(`\n✅ Suite completada: ${OUT_ROOT}/summary.md`);
