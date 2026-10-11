import 'dotenv/config';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { createAnalystAgent } from './agent';
import { ensureDisclaimer, msgText } from './disclaimer';
import { assertNanConfig } from './nan';

/**
 * REPL interactivo con el analista financiero.
 * Equivalente al playground de Mastra (`mastra dev`): mantiene conversación
 * multi-turno. El historial vive en memoria y (con --thread) en .sessions/.
 *
 *   npm run repl                     # sesión efímera
 *   npm run repl -- --thread andres  # sesión persistente en .sessions/andres.json
 */

assertNanConfig();

const args = process.argv.slice(2);
const threadIdx = args.indexOf('--thread');
const threadId = threadIdx >= 0 && args[threadIdx + 1] ? args[threadIdx + 1] : null;

const SESSIONS_DIR = join(process.cwd(), '.sessions');

type StoredMessage = { role: 'user' | 'assistant'; content: string };

function sessionPath(id: string): string {
  return join(SESSIONS_DIR, `${id.replace(/[^a-z0-9._-]/gi, '_')}.json`);
}

function loadThread(): StoredMessage[] {
  if (!threadId) return [];
  const path = sessionPath(threadId);
  if (!existsSync(path)) return [];
  return JSON.parse(readFileSync(path, 'utf8')) as StoredMessage[];
}

function saveThread(messages: StoredMessage[]): void {
  if (!threadId) return;
  mkdirSync(SESSIONS_DIR, { recursive: true });
  writeFileSync(sessionPath(threadId), JSON.stringify(messages, null, 2), 'utf8');
}

// Últimos 20 turnos: equivalente ligero del lastMessages: 10 de Mastra
const MAX_TURNS = 20;

let messages: any[] = loadThread().slice(-MAX_TURNS).map(m =>
  m.role === 'user' ? { role: 'user', content: m.content } : { role: 'assistant', content: m.content },
);

const agent = await createAnalystAgent();

console.log(`🧠 analyst-agent (DeepAgents + ${'deepseek-v4-flash'} vía NaN)`);
console.log(`   thread: ${threadId ?? 'efímero'} · mensajes en contexto: ${messages.length}`);
console.log('   comandos: /reset limpia el hilo · /exit sale\n');

const rl = createInterface({ input: stdin, output: stdout });

while (true) {
  let input: string;
  try {
    input = (await rl.question('tú> ')).trim();
  } catch {
    break; // stdin cerrado (EOF)
  }
  if (!input) continue;
  if (input === '/exit' || input === '/quit') break;
  if (input === '/reset') {
    messages = [];
    saveThread([]);
    console.log('(hilo reiniciado)\n');
    continue;
  }

  messages.push({ role: 'user', content: input });

  try {
    let finalText = '';
    const stream = await agent.stream({ messages }, { streamMode: 'updates' });
    for await (const update of stream) {
      for (const value of Object.values(update) as any[]) {
        for (const m of value?.messages ?? []) {
          const type = m?.getType?.();
          if (type === 'ai') {
            for (const tc of m.tool_calls ?? []) {
              const label = tc.name === 'task' ? `task(${tc.args?.subagent_type ?? '?'})` : tc.name;
              console.log(`  ↳ ${label}(${JSON.stringify(tc.args ?? {}).slice(0, 140)})`);
            }
            const txt = msgText(m).trim();
            if (txt) finalText = txt;
          }
        }
      }
    }

    const answer = ensureDisclaimer(finalText || '(sin respuesta)');
    console.log(`\nagente> ${answer}\n`);

    // Persistimos solo turnos texto (user/assistant) para sesiones válidas y compactas
    const stored: StoredMessage[] = [
      ...loadThread(),
      { role: 'user', content: input },
      { role: 'assistant', content: finalText },
    ];
    saveThread(stored.slice(-MAX_TURNS));
    messages = stored.slice(-MAX_TURNS).map(m =>
      m.role === 'user' ? { role: 'user', content: m.content } : { role: 'assistant', content: m.content },
    );
  } catch (e: any) {
    console.error(`\nerror> ${e?.message ?? e}\n`);
    messages.pop();
  }
}

rl.close();
