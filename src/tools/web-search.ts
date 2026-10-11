import { tool } from 'langchain';
import { z } from 'zod';
import { safe } from '../safe';

const ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'",
};

function decodeHtml(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&([a-z#0-9]+);/gi, (_, e) => ENTITIES[e.toLowerCase()] ?? ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function resolveUrl(href: string): string {
  let h = href;
  if (h.startsWith('//')) h = 'https:' + h;
  try {
    const u = new URL(h, 'https://duckduckgo.com');
    const uddg = u.searchParams.get('uddg');
    if (uddg) return uddg;
  } catch {
    /* fallthrough */
  }
  return h;
}

function parseResults(html: string, limit: number) {
  const results: { title: string; url: string; snippet: string }[] = [];
  const anchors = [...html.matchAll(/<a[^>]*class=["']result-link["'][^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>|<a[^>]*href=["']([^"']+)["'][^>]*class=["']result-link["'][^>]*>([\s\S]*?)<\/a>/gi)];
  for (const a of anchors) {
    if (results.length >= limit) break;
    const href = a[1] ?? a[3];
    const title = decodeHtml(a[2] ?? a[4] ?? '');
    if (!href || !title) continue;
    results.push({ title, url: resolveUrl(href), snippet: '' });
  }
  const snippets = [...html.matchAll(/<td[^>]*class=["']result-snippet["'][^>]*>([\s\S]*?)<\/td>|<a[^>]*class=["']result__snippet["'][^>]*>([\s\S]*?)<\/a>/gi)];
  snippets.forEach((s, i) => {
    if (results[i]) results[i].snippet = decodeHtml(s[1] ?? s[2] ?? '');
  });
  return results;
}

async function ddgSearch(query: string, maxResults: number) {
  const endpoints = [
    { url: 'https://lite.duckduckgo.com/lite/', method: 'POST' as const, body: new URLSearchParams({ q: query }).toString() },
    { url: `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, method: 'GET' as const },
  ];
  for (const ep of endpoints) {
    try {
      const res = await fetch(ep.url, {
        method: ep.method,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Accept-Language': 'es,es-ES;q=0.9,en;q=0.8',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: ep.body,
        signal: AbortSignal.timeout(20_000),
      });
      if (!res.ok) continue;
      const html = await res.text();
      const results = parseResults(html, maxResults);
      if (results.length > 0) return { results };
    } catch {
      continue;
    }
  }
  return { results: [] };
}

export async function tavilySearch(query: string, maxResults: number) {
  const key = process.env.TAVILY_API_KEY;
  if (!key) return [];
  const res = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ query, max_results: maxResults }),
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) return [];
  const json = (await res.json()) as { results?: { title: string; url: string; content: string }[] };
  return (json.results ?? []).map(r => ({ title: r.title, url: r.url, snippet: r.content }));
}

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36';

const STOPWORDS = new Set([
  'de', 'del', 'la', 'las', 'el', 'los', 'un', 'una', 'unos', 'unas', 'y', 'o', 'en', 'que', 'qué', 'como', 'cómo',
  'para', 'por', 'con', 'sin', 'sobre', 'entre', 'desde', 'hasta', 'the', 'a', 'an', 'of', 'in', 'on', 'for', 'to',
  'with', 'and', 'or', 'is', 'are', 'was', 'were', 'this', 'that', 'novedades', 'news', 'latest', 'usando', 'usa',
]);

function keywords(query: string, limit = 6): string {
  return [...new Set(query
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOPWORDS.has(w)))]
    .slice(0, limit)
    .join(' ');
}

async function keylessSearch(query: string, maxResults: number) {
  const wikiKw = keywords(query, 3);
  const shortKw = encodeURIComponent(keywords(query, 2));
  const wikiKwEnc = encodeURIComponent(wikiKw);

  // Las APIs keyless no acotan el tamaño de sus campos (una description de
  // GitHub llegó a ocupar 137 KB y entró entera en el contexto del agente):
  // recortamos SIEMPRE cada snippet antes de devolverlo.
  const clip = (s: unknown, n = 300): string =>
    String(s ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n);

  type WebResult = { title: string; url: string; snippet: string };
  const wiki = (lang: string): Promise<WebResult[]> =>
    fetch(`https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${wikiKwEnc}&format=json&srlimit=2`, {
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(10_000),
    })
      .then(r => (r.ok ? r.json() : null))
      .then((j: any) =>
        (j?.query?.search ?? []).map((s: any) => ({
          title: clip(s.title, 150),
          url: `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(String(s.title).replace(/ /g, '_'))}`,
          snippet: clip(s.snippet),
        })),
      )
      .catch(() => []);

  const requests: Promise<WebResult[]>[] = [
    fetch(`https://api.duckduckgo.com/?q=${wikiKwEnc}&format=json&no_html=1&no_redirect=1`, {
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(10_000),
    })
      .then(r => (r.ok ? r.json() : null))
      .then((j: any) => {
        const topics: WebResult[] = [];
        const collect = (list: any[]) => {
          for (const t of list ?? []) {
            if (t.Topics) collect(t.Topics);
            else if (t.FirstURL) {
              topics.push({
                title: clip(t.Text ?? t.FirstURL, 150),
                url: t.FirstURL,
                snippet: clip(t.Text),
              });
            }
          }
        };
        collect(j?.RelatedTopics ?? []);
        return topics;
      })
      .catch(() => []),
    wiki('en'),
    wiki('es'),
    fetch(`https://api.github.com/search/repositories?q=${shortKw}&per_page=3&sort=stars`, {
      headers: { 'User-Agent': UA, Accept: 'application/vnd.github+json' },
      signal: AbortSignal.timeout(10_000),
    })
      .then(r => (r.ok ? r.json() : null))
      .then((j: any) =>
        (j?.items ?? []).map((i: any) => ({
          title: clip(i.full_name, 150),
          url: i.html_url,
          snippet: clip(i.description),
        })),
      )
      .catch(() => []),
    fetch(`https://hn.algolia.com/api/v1/search?query=${shortKw}&hitsPerPage=3`, {
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(10_000),
    })
      .then(r => (r.ok ? r.json() : null))
      .then((j: any) =>
        (j?.hits ?? [])
          .filter((h: any) => h.title)
          .map((h: any) => ({
            title: clip(h.title, 150),
            url: h.url ?? `https://news.ycombinator.com/item?id=${h.objectID}`,
            snippet: clip(h.story_text),
          })),
      )
      .catch(() => []),
  ];

  const all = (await Promise.all(requests)).flat();
  const seen = new Set<string>();
  return all.filter(r => r.url && !seen.has(r.url) && seen.add(r.url)).slice(0, maxResults);
}

export async function searchWeb(query: string, maxResults = 5) {
  const ddg = await ddgSearch(query, maxResults);
  if (ddg.results.length > 0) return ddg;

  const keyless = await keylessSearch(query, maxResults);
  if (keyless.length > 1) return { results: keyless };

  const tavily = await tavilySearch(query, maxResults);
  return { results: tavily.length > 0 ? tavily : keyless };
}

export const webSearchTool = tool(
  async ({ query, maxResults }) => safe(() => searchWeb(query, maxResults)),
  {
    name: 'web_search',
    description:
      'Busca en la web. Primero intenta fuentes keyless (DuckDuckGo, Wikipedia, GitHub, Hacker News); si el resultado es pobre, escala automáticamente a Tavily si hay TAVILY_API_KEY. Devuelve resultados con título, URL y snippet.',
    schema: z.object({
      query: z.string().describe('La consulta de búsqueda'),
      maxResults: z.number().int().min(1).max(10).default(5).describe('Número máximo de resultados'),
    }),
  },
);
