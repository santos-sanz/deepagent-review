import 'dotenv/config';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { assertNanConfig } from '../nan';
import { AgentResult, formatToolCalls, runDeepAgents, runMastra, seconds } from './lib';

/**
 * Test comparativo: mismo prompt contra el agente Mastra (mastra-agent-review)
 * y el agente DeepAgents (este repo), analizando la IPO de Anthropic.
 *
 * Anthropic es una empresa PRIVADA: el caso fuerza análisis cualitativo con
 * investigación web, citas, y el disclaimer obligatorio en ambos frameworks.
 *
 * Uso:  npm run test:ipo [-- /ruta/a/mastra-agent-review]
 *   - MASTRA_DIR (env) o argumento: clon local de mastra-agent-review
 *   - Si no existe, se clona en .tmp/mastra-agent-review y se instala
 * Resultados: test-results/ipo-anthropic/{mastra,deepagents}-answer.md + report.md
 *
 * Métricas: la librería compartida (./lib) cuenta tokens de TODAS las llamadas
 * LLM (incluidos sub-agentes) vía callback handler; en versiones previas solo se
 * registraba el último mensaje y el gasto de DeepAgents quedaba infravalorado.
 */

const PROMPT =
  'Analiza la posible salida a bolsa (IPO) de Anthropic: situación actual de la compañía, ' +
  'financiación y valoraciones conocidas, condiciones de mercado, riesgos y qué habría que vigilar. ' +
  'Sé directo, cita fuentes con fecha y recuerda que es una empresa privada (análisis cualitativo).';

const OUT_DIR = join(process.cwd(), 'test-results', 'ipo-anthropic');

function renderReport(mastraRes: AgentResult, deepRes: AgentResult): string {
  const rows = [
    ['Framework', 'Mastra', 'DeepAgents'],
    ['Duración', seconds(mastraRes.durationMs), seconds(deepRes.durationMs)],
    ['Tool calls', formatToolCalls(mastraRes.toolCalls), formatToolCalls(deepRes.toolCalls)],
    ['Tokens', String(mastraRes.usage?.totalTokens ?? '—'), String(deepRes.usage?.totalTokens ?? '—')],
    ['Longitud respuesta', `${mastraRes.text.length} chars`, `${deepRes.text.length} chars`],
    ['Disclaimer presente', /educativa|dyor/i.test(mastraRes.text) ? 'sí' : 'NO', /educativa|dyor/i.test(deepRes.text) ? 'sí' : 'NO'],
    ['Error', mastraRes.error ?? '—', deepRes.error ?? '—'],
  ];
  const table = rows.map(r => `| ${r.join(' | ')} |`).join('\n');

  return `# Test: análisis de la IPO de Anthropic — Mastra vs DeepAgents

Fecha: ${new Date().toISOString()}

## Prompt (idéntico para ambos)

> ${PROMPT}

## Resultados

| ${rows[0].join(' | ')} |
| ${rows[0].map(() => '---').join(' | ')} |
${table.slice(table.indexOf('\n') + 1)}

## Observaciones del test

- **Justicia del test**: el agente Mastra se ejecuta con \`maxSteps: 24\` (el default corta el análisis
  a mitad de investigación y devolvería meta-comentarios sin informe). DeepAgents no tiene tope de pasos.
- **Sub-agentes**: en DeepAgents los \`task(...)\` son sub-agentes con contexto aislado que ejecutan su
  propio loop de tools; en Mastra los \`agent-*Tool\` son llamadas al sub-agente dentro del mismo hilo.
- **Tokens**: contados vía callback handler sobre todas las llamadas LLM (incluidos sub-agentes).
- **Sistema de archivos**: en DeepAgents los ficheros escritos con \`write_file\` persisten en disco
  (\`.agent-fs/\`, backend FilesystemBackend con \`virtualMode: true\`).
- Latencias medidas con el gateway NaN (deepseek-v4-flash) y las fuentes keyless; varían entre ejecuciones.

## Respuesta Mastra

${mastraRes.error ?? ''}

${mastraRes.text}

## Respuesta DeepAgents

${deepRes.error ?? ''}

${deepRes.text}
`;
}

assertNanConfig();
mkdirSync(OUT_DIR, { recursive: true });

const mastraDir = process.argv[2] ?? process.env.MASTRA_DIR ?? join(process.cwd(), '.tmp', 'mastra-agent-review');

console.log('=== Test IPO Anthropic: Mastra vs DeepAgents ===\n');
const mastraRes = runMastra(mastraDir, process.cwd(), 'ipo-anthropic', [PROMPT], OUT_DIR);
console.log('');
const deepRes = await runDeepAgents([PROMPT], OUT_DIR);

writeFileSync(join(OUT_DIR, 'mastra-answer.md'), `# Mastra\n\n> ${PROMPT}\n\n${mastraRes.text}`, 'utf8');
writeFileSync(join(OUT_DIR, 'deepagents-answer.md'), `# DeepAgents\n\n> ${PROMPT}\n\n${deepRes.text}`, 'utf8');
writeFileSync(join(OUT_DIR, 'report.md'), renderReport(mastraRes, deepRes), 'utf8');

console.log('\n=== Resumen ===');
console.log(`Mastra:      ${seconds(mastraRes.durationMs)} · tools: ${formatToolCalls(mastraRes.toolCalls)}`);
console.log(`DeepAgents:  ${seconds(deepRes.durationMs)} · tools: ${formatToolCalls(deepRes.toolCalls)}`);
console.log(`\nResultados en ${OUT_DIR}/`);
