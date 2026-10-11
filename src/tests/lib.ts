import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, copyFileSync, writeFileSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { BaseCallbackHandler } from '@langchain/core/callbacks/base';
import { createAnalystAgent } from '../agent';
import { msgText } from '../disclaimer';
import { assertNanConfig } from '../nan';

/**
 * Librería compartida para tests comparativos Mastra vs DeepAgents.
 * Ejecuta el mismo prompt (o secuencia de turnos) contra ambos agentes y
 * devuelve métricas homogéneas: duración, tokens, tool calls y texto final.
 */

export type ToolStat = { name: string; count: number };

export type TurnMetrics = { durationMs: number; usage?: Record<string, number> };

export type AgentResult = {
  framework: string;
  text: string;
  durationMs: number;
  toolCalls: ToolStat[];
  usage?: Record<string, number>;
  llmCalls?: number;
  error?: string;
};

export class TokenCounter extends BaseCallbackHandler {
  name = 'token-counter';
  input = 0;
  output = 0;
  calls = 0;

  handleLLMEnd(output: any) {
    this.calls++;
    const msg = output?.generations?.[0]?.[0]?.message;
    const um = msg?.usage_metadata ?? output?.llmOutput?.tokenUsage;
    if (um) {
      this.input += um.input_tokens ?? um.promptTokens ?? 0;
      this.output += um.output_tokens ?? um.completionTokens ?? 0;
    }
  }

  get usage(): Record<string, number> {
    return { inputTokens: this.input, outputTokens: this.output, totalTokens: this.input + this.output, llmCalls: this.calls };
  }
}

export function prepareMastra(dir: string, repoEnvPath: string): void {
  if (!existsSync(dir)) {
    console.log(`> Clonando mastra-agent-review en ${dir} ...`);
    execFileSync('git', ['clone', '--depth', '1', 'https://github.com/santos-sanz/mastra-agent-review.git', dir], { stdio: 'inherit' });
  }
  if (!existsSync(join(dir, 'node_modules'))) {
    console.log('> npm install en mastra-agent-review ...');
    execFileSync('npm', ['install', '--no-audit', '--no-fund'], { cwd: dir, stdio: 'inherit' });
  }
  if (!existsSync(join(dir, '.env'))) {
    copyFileSync(repoEnvPath, join(dir, '.env'));
  }
}

function mastraRunnerSource(prompts: string[], thread: string, outPath: string): string {
  const escaped = JSON.stringify(prompts);
  const escapedThread = JSON.stringify(thread);
  return `
import 'dotenv/config';
import { writeFileSync } from 'node:fs';
import { mastra } from './src/mastra';

const prompts = ${escaped};
const threadId = ${escapedThread};
const start = Date.now();
const agent = mastra.getAgent('analystAgent');

const toolCounts = new Map();
let text = '';
let usage;
const turnMetrics = [];

for (const prompt of prompts) {
  const t0 = Date.now();
  const res = await agent.generate(prompt, {
    memory: { thread: threadId, resource: threadId },
    // Paridad con DeepAgents (sin tope de pasos): el default corta análisis largos a mitad
    maxSteps: 24,
  });
  const partsOf = (m) => Array.isArray(m?.content) ? m.content : (m?.content?.parts ?? []);
  for (const m of res.response?.messages ?? []) {
    for (const p of partsOf(m)) {
      const name = p?.toolName ?? p?.toolInvocation?.toolName;
      if (name && (p?.type === 'tool-call' || p?.type === 'tool-invocation')) {
        toolCounts.set(name, (toolCounts.get(name) ?? 0) + 1);
      }
    }
  }
  text = res.text ?? '';
  if (res.usage) {
    usage = usage ?? { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
    usage.totalTokens += res.usage.totalTokens ?? 0;
  }
  turnMetrics.push({ durationMs: Date.now() - t0 });
}

writeFileSync(${JSON.stringify(outPath)}, JSON.stringify({
  framework: 'mastra',
  text,
  durationMs: Date.now() - start,
  toolCalls: [...toolCounts.entries()].map(([name, count]) => ({ name, count })),
  usage,
  turnMetrics,
}, null, 2));
`;
}

export function runMastra(
  mastraDir: string,
  repoRoot: string,
  scenarioId: string,
  prompts: string[],
  outDir: string,
): AgentResult {
  prepareMastra(mastraDir, join(repoRoot, '.env'));
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(join(outDir, 'mastra-result.json'));
  const runnerPath = join(mastraDir, 'suite-runner.ts');
  // Thread único por run (mismo hilo para los turnos del run: así funciona la
  // memoria del escenario de memoria) para no contaminar con ejecuciones previas
  const thread = `suite-${scenarioId}-${Date.now()}`;
  writeFileSync(runnerPath, mastraRunnerSource(prompts, thread, outPath));

  console.log(`  > Ejecutando Mastra (${scenarioId}) ...`);
  const proc = spawnSync('npx', ['tsx', 'suite-runner.ts'], { cwd: mastraDir, stdio: 'inherit', timeout: 30 * 60_000 });
  if (proc.status !== 0 || !existsSync(outPath)) {
    return { framework: 'mastra', text: '', durationMs: 0, toolCalls: [], error: `runner falló (status ${proc.status})` };
  }
  const parsed = JSON.parse(readFileSync(outPath, 'utf8')) as AgentResult;
  return { ...parsed, framework: 'mastra' };
}

export async function runDeepAgents(prompts: string[], outDir: string): Promise<AgentResult> {
  mkdirSync(outDir, { recursive: true });
  const counter = new TokenCounter();
  const agent = await createAnalystAgent();
  // Entre turnos solo sobreviven los mensajes de texto (user/assistant): mismo
  // patrón que el REPL. El loop de tools ocurre dentro de cada stream.
  let messages: any[] = [];
  const toolCounts = new Map<string, number>();
  let finalText = '';
  const start = Date.now();

  try {
    for (const prompt of prompts) {
      messages.push({ role: 'user', content: prompt });
      const stream = await agent.stream({ messages }, { streamMode: 'updates', callbacks: [counter] });
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
            }
          }
        }
      }
      if (!finalText) throw new Error('el turno terminó sin texto del asistente');
      messages.push({ role: 'assistant', content: finalText });
    }
  } catch (e: any) {
    return {
      framework: 'deepagents',
      text: finalText,
      durationMs: Date.now() - start,
      toolCalls: [...toolCounts.entries()].map(([name, count]) => ({ name, count })),
      usage: counter.usage,
      error: e?.message ?? String(e),
    };
  }

  return {
    framework: 'deepagents',
    text: finalText,
    durationMs: Date.now() - start,
    toolCalls: [...toolCounts.entries()].map(([name, count]) => ({ name, count })),
    usage: counter.usage,
  };
}

export function countUrls(text: string): number {
  return (text.match(/https?:\/\/[^\s)\]]+/g) ?? []).length;
}

export function hasDisclaimer(text: string): boolean {
  return /educativa|dyor/i.test(text);
}

export function formatToolCalls(calls: ToolStat[]): string {
  if (calls.length === 0) return 'ninguna';
  return calls.map(c => (c.count > 1 ? `${c.name}×${c.count}` : c.name)).join(', ');
}

export function seconds(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`;
}
