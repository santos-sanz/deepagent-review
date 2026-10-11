import { ChatOpenAI } from '@langchain/openai';

export const CHAT_MODEL = 'deepseek-v4-flash';
export const EMBEDDING_MODEL = 'qwen3-embedding';
export const IMAGE_MODEL = 'qwen-image-2.1';
export const TTS_MODEL = 'kokoro';
export const STT_MODEL = 'whisper';
export const RERANK_MODEL = 'rerank';

export const NAN_URL = process.env.NAN_URL ?? 'https://api.nan.builders/v1';

export function assertNanConfig(): void {
  if (!process.env.NAN_API_KEY) {
    throw new Error('Falta NAN_API_KEY: copia .env.example a .env y rellena la clave del gateway NaN.');
  }
}

export function chatModel(): ChatOpenAI {
  return new ChatOpenAI({
    model: CHAT_MODEL,
    apiKey: process.env.NAN_API_KEY ?? '',
    configuration: { baseURL: NAN_URL },
    // Streaming obligatorio tras el gateway: las generaciones largas sin stream
    // superan el Proxy Read Timeout de Cloudflare (error 524) en api.nan.builders
    streaming: true,
    maxRetries: 3,
    timeout: 180_000,
  });
}

const authHeaders = (): Record<string, string> => ({ Authorization: `Bearer ${process.env.NAN_API_KEY!}` });

export async function nanEmbed(texts: string[]): Promise<number[][]> {
  const res = await fetch(`${NAN_URL}/embeddings`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: EMBEDDING_MODEL, input: texts }),
    signal: AbortSignal.timeout(60_000),
  });
  if (!res.ok) throw new Error(`nanEmbed ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { data: { embedding: number[]; index: number }[] };
  return json.data.sort((a, b) => a.index - b.index).map(d => d.embedding);
}

export async function nanRerank(opts: {
  query: string;
  documents: string[];
  model?: string;
  topN?: number;
}): Promise<{ index: number; score: number }[]> {
  const res = await fetch(`${NAN_URL}/rerank`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: opts.model ?? RERANK_MODEL, query: opts.query, documents: opts.documents, top_n: opts.topN }),
    signal: AbortSignal.timeout(60_000),
  });
  if (!res.ok) throw new Error(`nanRerank ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { results: { index: number; relevance_score: number }[] };
  return json.results.map(r => ({ index: r.index, score: r.relevance_score }));
}

export async function nanImage(opts: { prompt: string; model?: string; size?: string }): Promise<{ url: string }> {
  const res = await fetch(`${NAN_URL}/images/generations`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: opts.model ?? IMAGE_MODEL, prompt: opts.prompt, n: 1, size: opts.size ?? '1024x1024' }),
    signal: AbortSignal.timeout(120_000),
  });
  if (!res.ok) throw new Error(`nanImage ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { data: { url: string }[] };
  return { url: json.data[0].url };
}

export async function nanSpeech(opts: { input: string; model?: string; voice?: string }): Promise<Buffer> {
  const res = await fetch(`${NAN_URL}/audio/speech`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: opts.model ?? TTS_MODEL, input: opts.input, voice: opts.voice ?? 'af_heart', response_format: 'mp3' }),
    signal: AbortSignal.timeout(120_000),
  });
  if (!res.ok) throw new Error(`nanSpeech ${res.status}: ${await res.text()}`);
  return Buffer.from(await res.arrayBuffer());
}

export async function nanTranscribe(opts: { file: Buffer; filename?: string; language?: string }): Promise<{
  text: string;
  language?: string;
  duration?: number;
}> {
  const form = new FormData();
  form.append('file', new Blob([new Uint8Array(opts.file)], { type: 'audio/mpeg' }), opts.filename ?? 'audio.mp3');
  form.append('model', STT_MODEL);
  if (opts.language) form.append('language', opts.language);
  const res = await fetch(`${NAN_URL}/audio/transcriptions`, {
    method: 'POST',
    headers: authHeaders(),
    body: form,
    signal: AbortSignal.timeout(300_000),
  });
  if (!res.ok) throw new Error(`nanTranscribe ${res.status}: ${await res.text()}`);
  return (await res.json()) as { text: string; language?: string; duration?: number };
}
