import 'dotenv/config';
import { createAnalystAgent } from './agent';
import { ensureDisclaimer, msgText } from './disclaimer';
import { assertNanConfig } from './nan';

/**
 * Prueba de memoria multi-turno, equivalente a src/test-agent.ts de mastra-agent-review:
 * en Mastra la memoria vive en LibSQL (Memory + working memory por usuario);
 * aquí el hilo es el array de mensajes que se pasa a cada invoke().
 */

assertNanConfig();
const agent = await createAnalystAgent();

const messages: any[] = [];

async function turno(texto: string): Promise<void> {
  messages.push({ role: 'user', content: texto });
  const res = await agent.invoke({ messages });
  messages.length = 0;
  messages.push(...res.messages);
  const last = res.messages[res.messages.length - 1];
  console.log(`${ensureDisclaimer(msgText(last)).trim()}\n`);
}

console.log('--- Turno 1 ---');
await turno(
  'Me llamo Andrés, trabajo en NaN y estoy construyendo un agente con DeepAgents. ¿Qué herramientas tienes disponibles? Resume en 2 líneas.',
);

console.log('\n--- Turno 2 (prueba de memoria) ---');
await turno('¿Cómo me llamo, a qué me dedico y qué framework estoy usando?');
