import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tool } from 'langchain';
import { z } from 'zod';
import { safe } from '../safe';
import { nanSpeech } from '../nan';

export async function speak(text: string, voice = 'af_heart') {
  const audio = await nanSpeech({ input: text.slice(0, 1000), voice });
  const dir = join(process.cwd(), 'generated');
  await mkdir(dir, { recursive: true });
  const path = join(dir, `tts-${Date.now()}.mp3`);
  await writeFile(path, audio);
  return { path };
}

export const speakTool = tool(
  async ({ text, voice }) => safe(() => speak(text, voice)),
  {
    name: 'speak',
    description: 'Convierte texto en audio MP3 con síntesis de voz (kokoro) y lo guarda en ./generated/. Devuelve la ruta local.',
    schema: z.object({
      text: z.string().describe('Texto a convertir en voz (máx. ~1000 caracteres)'),
      voice: z.string().default('af_heart').describe('Voz de kokoro (p. ej. af_heart, am_michael, bf_emma)'),
    }),
  },
);
