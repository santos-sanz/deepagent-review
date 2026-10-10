import { readFile } from 'node:fs/promises';
import { tool } from 'langchain';
import { z } from 'zod';
import { safe } from '../safe';
import { nanTranscribe } from '../nan';

export async function transcribeAudio(filePath: string, language?: string) {
  const file = await readFile(filePath);
  const result = await nanTranscribe({ file, filename: filePath.split('/').pop(), language });
  return { text: result.text, language: result.language, duration: result.duration };
}

export const transcribeTool = tool(
  async ({ filePath, language }) => safe(() => transcribeAudio(filePath, language)),
  {
    name: 'transcribe',
    description: 'Transcribe un archivo de audio local (mp3, wav, m4a...) a texto con whisper. Devuelve el texto y el idioma detectado.',
    schema: z.object({
      filePath: z.string().describe('Ruta absoluta o relativa al archivo de audio'),
      language: z.string().optional().describe('Código de idioma ISO (p. ej. "es") para forzar el idioma'),
    }),
  },
);
