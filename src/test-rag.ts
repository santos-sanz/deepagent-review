import 'dotenv/config';
import { nanEmbed } from './nan';
import { loadStore, searchStore } from './rag/store';

const query = process.argv.slice(2).join(' ') ?? 'qué es el beta de una acción';
if (!process.env.NAN_API_KEY) {
  console.error('Falta NAN_API_KEY en .env');
  process.exit(1);
}

const store = await loadStore();
if (store.length === 0) {
  console.error('Base de conocimiento vacía. Ejecuta: npm run rag:index -- docs/conocimiento');
  process.exit(1);
}

console.log(`Consulta: "${query}"\n`);
const hits = await searchStore(store, query, 5);
for (const hit of hits) {
  console.log(`--- ${hit.source} (score ${hit.score.toFixed(4)})`);
  console.log(hit.text.slice(0, 300));
  console.log();
}
