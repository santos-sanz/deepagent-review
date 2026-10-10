import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { indexDocuments } from './rag/store';
import { assertNanConfig } from './nan';
import 'dotenv/config';

async function collectMarkdown(dir: string): Promise<{ path: string; content: string }[]> {
  const files: { path: string; content: string }[] = [];
  const entries = await readdir(dir);
  for (const entry of entries) {
    const full = join(dir, entry);
    const s = await stat(full);
    if (s.isDirectory()) {
      files.push(...(await collectMarkdown(full)));
    } else if (entry.endsWith('.md')) {
      files.push({ path: relative(process.cwd(), full), content: await readFile(full, 'utf8') });
    }
  }
  return files;
}

const dir = process.argv[2] ?? 'docs/conocimiento';
assertNanConfig();
console.log(`Indexando ${dir} en .rag/knowledge.json ...`);
const files = await collectMarkdown(dir);
if (files.length === 0) {
  console.error('No se encontraron ficheros .md');
  process.exit(1);
}
const count = await indexDocuments(files);
console.log(`✅ ${count} fragmentos indexados`);
