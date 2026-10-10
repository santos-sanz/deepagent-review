import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { nanEmbed } from '../nan';

/**
 * Vector store local: chunks con embedding del gateway NaN persistidos en JSON.
 * Equivalente ligero del LibSQLVector de Mastra: sin dependencias externas y
 * con las mismas dos llamadas de red (embeddings + rerank).
 */

const RAG_DIR = join(process.cwd(), '.rag');
const STORE_PATH = join(RAG_DIR, 'knowledge.json');

export type RagChunk = {
  text: string;
  source: string;
  embedding: number[];
};

const CHUNK_SIZE = 900;
const CHUNK_OVERLAP = 120;

function splitIntoChunks(text: string): string[] {
  const paragraphs = text.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
  const chunks: string[] = [];
  let current = '';
  for (const p of paragraphs) {
    if (current.length + p.length + 1 <= CHUNK_SIZE) {
      current = current ? `${current}\n${p}` : p;
      continue;
    }
    if (current) chunks.push(current);
    if (p.length <= CHUNK_SIZE) {
      current = p;
    } else {
      // Párrafo demasiado largo: trocea con solape
      for (let i = 0; i < p.length; i += CHUNK_SIZE - CHUNK_OVERLAP) {
        chunks.push(p.slice(i, i + CHUNK_SIZE));
      }
      current = '';
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

export async function indexDocuments(files: { path: string; content: string }[]): Promise<number> {
  await mkdir(RAG_DIR, { recursive: true });
  const chunks: { text: string; source: string }[] = [];
  for (const file of files) {
    for (const chunk of splitIntoChunks(file.content)) {
      if (chunk.length < 40) continue;
      chunks.push({ text: chunk, source: file.path });
    }
  }
  if (chunks.length === 0) return 0;

  const BATCH = 16;
  const embedded: RagChunk[] = [];
  for (let i = 0; i < chunks.length; i += BATCH) {
    const batch = chunks.slice(i, i + BATCH);
    const vectors = await nanEmbed(batch.map(c => c.text));
    for (let j = 0; j < batch.length; j++) {
      embedded.push({ text: batch[j].text, source: batch[j].source, embedding: vectors[j] });
    }
    process.stdout.write(`  indexados ${Math.min(i + BATCH, chunks.length)}/${chunks.length}\r`);
  }
  process.stdout.write('\n');
  await writeFile(STORE_PATH, JSON.stringify(embedded), 'utf8');
  return embedded.length;
}

export async function loadStore(): Promise<RagChunk[]> {
  try {
    const raw = await readFile(STORE_PATH, 'utf8');
    return JSON.parse(raw) as RagChunk[];
  } catch {
    return [];
  }
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}

export type KnowledgeHit = { text: string; source: string; score: number };

export async function searchStore(
  store: RagChunk[],
  query: string,
  topK = 5,
  useRerank = true,
): Promise<KnowledgeHit[]> {
  if (store.length === 0) return [];
  const [queryVec] = await nanEmbed([query]);
  const candidates = store
    .map(c => ({ chunk: c, score: cosineSimilarity(queryVec, c.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.min(topK * 3, 20))
    .map(c => ({ text: c.chunk.text, source: c.chunk.source, score: c.score }));

  if (candidates.length === 0) return [];

  if (useRerank) {
    try {
      const { nanRerank } = await import('../nan');
      const ranked = await nanRerank({
        query,
        documents: candidates.map(c => c.text),
        topN: topK,
      });
      return ranked.map(r => ({
        text: candidates[r.index].text,
        source: candidates[r.index].source,
        score: r.score,
      }));
    } catch {
      /* sin rerank disponible: devolvemos por similitud */
    }
  }
  return candidates.slice(0, topK);
}
