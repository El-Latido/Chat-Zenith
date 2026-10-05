/**
 * Tavily AI Real-Time Web Search Integration for ChatLiz
 * Official endpoint: POST https://api.tavily.com/search
 */

export interface TavilySearchResultItem {
  title: string;
  url: string;
  content: string;
  score?: number;
}

export interface TavilySearchResponse {
  query: string;
  answer?: string;
  results: TavilySearchResultItem[];
  images?: string[];
}

/**
 * Searches the web in real-time using Tavily AI API
 */
export async function searchWeb(query: string, apiKey: string): Promise<TavilySearchResponse | null> {
  const cleanKey = (apiKey || "").trim();
  if (!cleanKey) {
    console.warn("[Tavily] No se proporcionó API Key para la búsqueda");
    return null;
  }

  const cleanQuery = (query || "").trim();
  if (!cleanQuery) return null;

  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: cleanKey,
        query: cleanQuery,
        search_depth: "basic",
        include_answer: true,
        max_results: 5,
      }),
      signal: AbortSignal.timeout(12000), // 12s timeout
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`[Tavily Search Error ${response.status}]:`, errText);
      return null;
    }

    const data: any = await response.json();
    return {
      query: data.query || cleanQuery,
      answer: data.answer || undefined,
      results: Array.isArray(data.results)
        ? data.results.map((r: any) => ({
            title: r.title || "Sin título",
            url: r.url || "",
            content: r.content || "",
            score: r.score,
          }))
        : [],
      images: Array.isArray(data.images) ? data.images : [],
    };
  } catch (err: any) {
    console.warn("[Tavily Search Exception]:", err?.message || err);
    return null;
  }
}

/**
 * Detects whether a message asks for real-time information or factual external web knowledge
 */
export function shouldPerformWebSearch(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();

  // Explicit user commands
  if (
    lower.includes("busca en internet") ||
    lower.includes("busca en la web") ||
    lower.includes("busca en google") ||
    lower.includes("investiga en internet") ||
    lower.includes("investiga en la web") ||
    lower.includes("búscame") ||
    lower.includes("buscame") ||
    lower.includes("buscar en internet") ||
    lower.includes("buscar en la web") ||
    lower.includes("busca sobre") ||
    lower.includes("busca información") ||
    lower.includes("busca informacion") ||
    lower.includes("tavily")
  ) {
    return true;
  }

  // Temporal and current event keywords
  const temporalKeywords = [
    "noticias", "noticia de hoy", "última hora", "ultima hora", "actualidad",
    "el clima en", "el tiempo en", "temperatura en", "pronóstico", "pronostico",
    "hora en", "qué hora es en", "que hora es en", "hora actual",
    "precio de", "precio del", "cotización", "cotizacion", "cuánto vale", "cuanto vale",
    "dólar hoy", "dolar hoy", "bitcoin", "criptomoneda",
    "resultado del partido", "quién ganó", "quien gano", "tabla de posiciones",
    "campeonato", "último partido", "ultimo partido",
    "última versión de", "ultima version de", "novedades de",
    "año 2025", "año 2026", "hoy en día", "hoy en dia", "este mes", "esta semana"
  ];

  return temporalKeywords.some(kw => lower.includes(kw));
}
