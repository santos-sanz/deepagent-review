import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tool } from 'langchain';
import { z } from 'zod';
import { safe } from '../safe';
import { nanImage } from '../nan';

export async function generateImage(prompt: string, size: '512x512' | '768x768' | '1024x1024' = '1024x1024') {
  const { url } = await nanImage({ prompt, size });
  const dir = join(process.cwd(), 'generated');
  await mkdir(dir, { recursive: true });
  const path = join(dir, `img-${Date.now()}.png`);
  const res = await fetch(url, { signal: AbortSignal.timeout(60_000) });
  if (!res.ok) throw new Error(`No se pudo descargar la imagen generada (HTTP ${res.status})`);
  await writeFile(path, Buffer.from(await res.arrayBuffer()));
  return { path, url };
}

export const generateImageTool = tool(
  async ({ prompt, size }) => safe(() => generateImage(prompt, size)),
  {
    name: 'generate_image',
    description: 'Genera una imagen a partir de un prompt de texto (qwen-image-2.1) y la guarda en ./generated/. Devuelve la ruta local.',
    schema: z.object({
      prompt: z.string().describe('Descripción de la imagen a generar, detallada y en inglés a ser posible'),
      size: z.enum(['512x512', '768x768', '1024x1024']).default('1024x1024').describe('Tamaño de la imagen'),
    }),
  },
);
