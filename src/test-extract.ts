import 'dotenv/config';
import { z } from 'zod';
import { toolStrategy } from 'langchain';
import { createDeepAgent } from 'deepagents';
import { chatModel, assertNanConfig } from './nan';

/**
 * Extracción estructurada, equivalente a src/test-extract.ts de mastra-agent-review.
 * En Mastra: agent.generate(texto, { structuredOutput: { schema, jsonPromptInjection: 'auto' } }).
 * En DeepAgents: responseFormat del agente (el resultado llega en state.structuredResponse).
 */

const texto = `
Hola, soy Marta Ruiz, ingeniera de software en Acme Corp desde marzo de 2024.
Mi correo es marta.ruiz@acme.com y mi teléfono +34 600 123 456.
Estoy interesada en la posición de Staff Engineer que publicasteis.
`;

const schema = z.object({
  nombre: z.string().nullable().describe('Nombre completo de la persona'),
  empresa: z.string().nullable(),
  email: z.string().nullable(),
  telefono: z.string().nullable(),
  puesto_interes: z.string().nullable(),
  anio_inicio: z.number().nullable().describe('Año en que empezó en su empresa'),
});

assertNanConfig();

const extractor = await createDeepAgent({
  name: 'extractor',
  model: chatModel(),
  systemPrompt:
    'Eres un agente extractor de datos. Del texto recibido, extrae fielmente los campos del schema. No inventes valores: si un dato no aparece, usa null.',
  // toolStrategy: extracción vía tool call (deepseek-v4-flash no soporta json_schema nativo)
  responseFormat: toolStrategy(schema),
});

const res = await extractor.invoke({
  messages: [{ role: 'user', content: texto }],
});

console.log(JSON.stringify((res as any).structuredResponse ?? {}, null, 2));
