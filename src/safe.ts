/**
 * Las tools devuelven { error } en lugar de lanzar: el agente lee el error y
 * lo explica al usuario ("si una herramienta falla o un dato no está disponible, dilo claramente").
 * En LangGraph un tool error no capturado puede abortar el run completo.
 */
export async function safe<T>(fn: () => Promise<T>): Promise<T | { error: string }> {
  try {
    return await fn();
  } catch (e: any) {
    return { error: e?.message ?? String(e) };
  }
}
