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

export type GatewayCallUsage = { input: number; output: number; cacheRead: number };

/**
 * Intercepta las peticiones al gateway y extrae el `usage` EXACTO que reporta
 * la API en cada respuesta (JSON o SSE). Es la única fuente fiable: en streaming
 * LangChain suma el usage de cada chunk (infla) y su estimado por caracteres
 * queda corto (no cuenta tool schemas).
 */
export function createUsageTrackingFetch(onCall?: (u: GatewayCallUsage) => void): {
  fetch: typeof fetch;
  calls: GatewayCallUsage[];
  total(): { input: number; output: number; cacheRead: number; uncachedInput: number; totalTokens: number; calls: number };
} {
  const calls: GatewayCallUsage[] = [];

  function record(usage: any): void {
    if (!usage || typeof usage !== 'object') return;
    const call: GatewayCallUsage = {
      input: usage.prompt_tokens ?? 0,
      output: usage.completion_tokens ?? 0,
      cacheRead: usage.prompt_tokens_details?.cached_tokens ?? 0,
    };
    calls.push(call);
    onCall?.(call);
  }

  async function parseSse(body: ReadableStream<Uint8Array>): Promise<void> {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const payload = trimmed.slice(5).trim();
          if (!payload || payload === '[DONE]') continue;
          try {
            const json = JSON.parse(payload);
            if (json.usage) record(json.usage);
          } catch {
            /* fragmento SSE incompleto */
          }
        }
      }
    } catch {
      /* stream interrumpido */
    }
  }

  const trackedFetch: typeof fetch = async (input, init) => {
    const res = await fetch(input, init);
    const contentType = res.headers.get('content-type') ?? '';
    if (contentType.includes('text/event-stream') && res.body) {
      const [main, copy] = res.body.tee();
      void parseSse(copy);
      return new Response(main, { status: res.status, statusText: res.statusText, headers: res.headers });
    }
    try {
      const json = await res.clone().json();
      if (json?.usage) record(json.usage);
    } catch {
      /* respuesta no JSON */
    }
    return res;
  };

  return {
    fetch: trackedFetch,
    calls,
    total: () => {
      const input = calls.reduce((a, c) => a + c.input, 0);
      const output = calls.reduce((a, c) => a + c.output, 0);
      const cacheRead = calls.reduce((a, c) => a + c.cacheRead, 0);
      return {
        input,
        output,
        cacheRead,
        uncachedInput: input - cacheRead,
        totalTokens: input + output,
        calls: calls.length,
      };
    },
  };
}

export function chatModel(opts?: { fetch?: typeof fetch }): ChatOpenAI {
  return new ChatOpenAI({
    model: CHAT_MODEL,
    apiKey: process.env.NAN_API_KEY ?? '',
    configuration: { baseURL: NAN_URL, ...(opts?.fetch ? { fetch: opts.fetch } : {}) },
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
