/**
 * Equivalente del output processor de Mastra: garantiza el disclaimer legal.
 * En DeepAgents no hay output processors, así que se aplica en la capa de
 * aplicación (tras cada respuesta del agente) además de exigirlo en el prompt.
 */
export const FINANCIAL_DISCLAIMER =
  '⚠️ Esto es información educativa, no asesoramiento financiero. Haz tu propia investigación (DYOR).';

const MARKERS = ['educativa', 'dyor'];

export function ensureDisclaimer(text: string): string {
  const lower = text.toLowerCase();
  return MARKERS.some(marker => lower.includes(marker)) ? text : `${text}\n\n${FINANCIAL_DISCLAIMER}`;
}

export function msgText(m: any): string {
  if (typeof m?.content === 'string') return m.content;
  if (Array.isArray(m?.content)) {
    return m.content
      .filter((c: any) => c?.type === 'text')
      .map((c: any) => c.text ?? '')
      .join('');
  }
  return '';
}
