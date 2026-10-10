import 'dotenv/config';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, copyFileSync, writeFileSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createAnalystAgent } from '../agent';
import { msgText } from '../disclaimer';
import { assertNanConfig } from '../nan';

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
 */

const PROMPT =
  'Analiza la posible salida a bolsa (IPO) de Anthropic: situación actual de la compañía, ' +
  'financiación y valoraciones conocidas, condiciones de mercado, riesgos y qué habría que vigilar. ' +
  'Sé directo, cita fuentes con fecha y recuerda que es una empresa privada (análisis cualitativo).';

const OUT_DIR = join(process.cwd(), 'test-results', 'ipo-anthropic');

type ToolStat = { name: string; count: number };
type AgentResult = {
  framework: string;
  text: string;
  durationMs: number;
  toolCalls: ToolStat[];
  usage?: Record<string, number>;
  error?: string;
};

function asRepo(): string {
  // El clon de mastra vive fuera del repo: se clona bajo .tmp/ si hace falta
  if (!existsSync('.tmp')) mkdirSync('.tmp', { recursive: true });
  return join(process.cwd(), '.tmp', 'mastra-agent-review');
}

function prepareMastra(dir: string): void {
  if (!existsSync(dir)) {
    console.log(`> Clonando mastra-agent-review en ${dir} ...`);
    execFileSync('git', ['clone', '--depth', '1', 'https://github.com/santos-sanz/mastra-agent-review.git', dir], { stdio: 'inherit' });
  }
  if (!existsSync(join(dir, 'node_modules'))) {
    console.log('> npm install en mastra-agent-review ...');
    execFileSync('npm', ['install', '--no-audit', '--no-fund'], { cwd: dir, stdio: 'inherit' });
  }
  if (!existsSync(join(dir, '.env'))) {
    copyFileSync(join(process.cwd(), '.env'), join(dir, '.env'));
  }
}

/** Runner que se escribe dentro del clon de Mastra y se ejecuta con su propio tsx */
function mastraRunnerSource(prompt: string, outPath: string): string {
  const escapedPrompt = JSON.stringify(prompt);
  return `
import 'dotenv/config';
import { writeFileSync } from 'node:fs';
import { mastra } from './src/mastra';

const start = Date.now();
const agent = mastra.getAgent('analystAgent');
const res = await agent.generate(${escapedPrompt}, {
  memory: { thread: 'ipo-anthropic-' + Date.now(), resource: 'ipo-test-runner' },
  // Paridad con DeepAgents (sin tope de pasos): el default de Mastra corta el análisis a mitad
  maxSteps: 24,
});

const toolCounts = new Map();
for (const m of res.response?.messages ?? []) {
  // Mastra v1: AI messages llevan el contenido como array de parts { type: 'tool-call', toolName }
  const parts = Array.isArray(m?.content) ? m.content : (m?.content?.parts ?? []);
  for (const p of parts) {
    const name = p?.toolName ?? p?.toolInvocation?.toolName;
    if (name && (p?.type === 'tool-call' || p?.type === 'tool-invocation')) {
      toolCounts.set(name, (toolCounts.get(name) ?? 0) + 1);
    }
  }
}

writeFileSync(${JSON.stringify(outPath)}, JSON.stringify({
  framework: 'mastra',
  text: res.text ?? '',
  durationMs: Date.now() - start,
  toolCalls: [...toolCounts.entries()].map(([name, count]) => ({ name, count })),
  usage: res.usage ? { totalTokens: res.usage.totalTokens } : undefined,
}, null, 2));
`;
}

function runMastra(mastraDir: string): AgentResult {
  prepareMastra(mastraDir);
  const outPath = resolve(join(OUT_DIR, 'mastra-result.json'));
  const runnerPath = join(mastraDir, 'ipo-runner.ts');
  writeFileSync(runnerPath, mastraRunnerSource(PROMPT, outPath));

  console.log('> Ejecutando agente Mastra (esto puede tardar varios minutos) ...');
  const proc = spawnSync('npx', ['tsx', 'ipo-runner.ts'], { cwd: mastraDir, stdio: 'inherit', timeout: 20 * 60_000 });
  if (proc.status !== 0 || !existsSync(outPath)) {
    return { framework: 'mastra', text: '', durationMs: 0, toolCalls: [], error: `runner falló (status ${proc.status})` };
  }
  const parsed = JSON.parse(readFileSync(outPath, 'utf8')) as AgentResult;
  return { ...parsed, framework: 'mastra' };
}

function formatToolCalls(calls: ToolStat[]): string {
  if (calls.length === 0) return 'ninguna';
  return calls.map(c => (c.count > 1 ? `${c.name}×${c.count}` : c.name)).join(', ');
}

async function runDeepAgents(): Promise<AgentResult> {
  const agent = await createAnalystAgent();
  const messages: any[] = [{ role: 'user', content: PROMPT }];
  const toolCounts = new Map<string, number>();
  let finalText = '';
  let usage: Record<string, number> | undefined;
  const start = Date.now();

  const stream = await agent.stream({ messages }, { streamMode: 'updates' });
  for await (const update of stream) {
    for (const value of Object.values(update) as any[]) {
      for (const m of value?.messages ?? []) {
        if (m?.getType?.() === 'ai') {
          for (const tc of m.tool_calls ?? []) {
            const label = tc.name === 'task' ? `task(${tc.args?.subagent_type ?? '?'})` : tc.name;
            toolCounts.set(label, (toolCounts.get(label) ?? 0) + 1);
          }
          const txt = msgText(m).trim();
          if (txt) finalText = txt;
          const um = m.usage_metadata;
          if (um) {
            usage = {
              inputTokens: um.input_tokens ?? 0,
              outputTokens: um.output_tokens ?? 0,
              totalTokens: um.total_tokens ?? 0,
            };
          }
        }
      }
    }
  }

  return {
    framework: 'deepagents',
    text: finalText,
    durationMs: Date.now() - start,
    toolCalls: [...toolCounts.entries()].map(([name, count]) => ({ name, count })),
    usage,
  };
}

function minutes(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`;
}

function renderReport(mastraRes: AgentResult, deepRes: AgentResult): string {
  const rows = [
    ['Framework', 'Mastra', 'DeepAgents'],
    ['Duración', minutes(mastraRes.durationMs), minutes(deepRes.durationMs)],
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
  El aislado es más lento (más generaciones largas secuenciales) pero protege la ventana del orquestador.
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

const mastraDir = process.argv[2] ?? process.env.MASTRA_DIR ?? asRepo();

console.log('=== Test IPO Anthropic: Mastra vs DeepAgents ===\n');
const mastraRes = runMastra(mastraDir);
console.log('');
const deepRes = await runDeepAgents();

writeFileSync(join(OUT_DIR, 'mastra-answer.md'), `# Mastra\n\n> ${PROMPT}\n\n${mastraRes.text}`, 'utf8');
writeFileSync(join(OUT_DIR, 'deepagents-answer.md'), `# DeepAgents\n\n> ${PROMPT}\n\n${deepRes.text}`, 'utf8');
writeFileSync(join(OUT_DIR, 'report.md'), renderReport(mastraRes, deepRes), 'utf8');

console.log('\n=== Resumen ===');
console.log(`Mastra:      ${minutes(mastraRes.durationMs)} · tools: ${formatToolCalls(mastraRes.toolCalls)}`);
console.log(`DeepAgents:  ${minutes(deepRes.durationMs)} · tools: ${formatToolCalls(deepRes.toolCalls)}`);
console.log(`\nResultados en ${OUT_DIR}/`);
