import { tool } from 'langchain';
import { z } from 'zod';
import { safe } from '../safe';
import { loadStore, searchStore } from '../rag/store';

export const knowledgeSearchTool = tool(
  async ({ query, topK }) =>
    safe(async () => {
      const store = await loadStore();
      if (store.length === 0) {
        return {
          results: [],
          note: 'Base de conocimiento vacía: ejecuta `npm run rag:index -- docs/conocimiento` para indexar documentos.',
        };
      }
      return { results: await searchStore(store, query, topK) };
    }),
  {
    name: 'knowledge_search',
    description:
      'Busca en la base de conocimiento local (documentos indexados con npm run rag:index). Devuelve los fragmentos más relevantes con su fuente. Úsala antes de decir que no sabes algo si el usuario pudo haber indexado documentos.',
    schema: z.object({
      query: z.string().describe('Consulta en lenguaje natural'),
      topK: z.number().int().min(1).max(10).default(5).describe('Número de fragmentos a devolver'),
    }),
  },
);
