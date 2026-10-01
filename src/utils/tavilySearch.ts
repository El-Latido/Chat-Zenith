export interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score?: number;
}

export interface TavilySearchResponse {
  query: string;
  answer?: string;
  results: TavilySearchResult[];
}

export const TAVILY_STORAGE_KEY = "chatliz_tavily_key";

export function getSavedTavilyKey(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(TAVILY_STORAGE_KEY) || "";
}

export function saveTavilyKey(key: string): void {
  if (typeof window === "undefined") return;
  const cleanKey = (key || "").trim();
  if (cleanKey) {
    localStorage.setItem(TAVILY_STORAGE_KEY, cleanKey);
  } else {
    localStorage.removeItem(TAVILY_STORAGE_KEY);
  }
}

/**
 * Realiza una búsqueda web en tiempo real utilizando la API oficial de Tavily AI.
 * Endpoint: POST https://api.tavily.com/search
 * 
 * Si la llamada directa desde el cliente tiene problemas de CORS o red,
 * conmuta limpiamente al proxy del servidor /api/tavily-search.
 */
export async function searchWeb(query: string, apiKey: string): Promise<TavilySearchResponse> {
  const cleanKey = (apiKey || "").trim();
  const cleanQuery = (query || "").trim();

  if (!cleanKey) {
    throw new Error("Clave de API de Tavily no proporcionada. Por favor configúrala en Ajustes / API Keys.");
  }
  if (!cleanQuery) {
    throw new Error("La consulta de búsqueda no puede estar vacía.");
  }

  const payload = {
    api_key: cleanKey,
    query: cleanQuery,
    search_depth: "basic",
    include_answer: true,
    max_results: 5,
  };

  // 1. Intentar endpoint oficial directo de Tavily
  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        query: data.query || cleanQuery,
        answer: data.answer || "",
        results: (data.results || []).map((r: any) => ({
          title: r.title || "Sin título",
          url: r.url || "",
          content: r.content || "",
          score: r.score,
        })),
      };
    }
    
    // Si la respuesta fue de error (por ejemplo key inválida)
    const errData = await response.json().catch(() => ({}));
    const errMsg = errData?.detail?.error || errData?.message || `HTTP ${response.status}`;
    if (response.status === 401 || response.status === 403) {
      throw new Error(`Tavily API Key inválida o no autorizada (${errMsg}). Revisa tu clave en Ajustes.`);
    }
  } catch (directErr: any) {
    if (directErr.message?.includes("inválida") || directErr.message?.includes("no autorizada")) {
      throw directErr;
    }
    console.warn("[Tavily Direct]: Intentando vía proxy de servidor local...", directErr?.message || directErr);
  }

  // 2. Fallback a través del endpoint proxy de nuestro servidor Express (/api/tavily-search)
  try {
    const proxyRes = await fetch("/api/tavily-search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!proxyRes.ok) {
      const errJson = await proxyRes.json().catch(() => ({}));
      throw new Error(errJson.error || `Error del servidor al buscar en Tavily: HTTP ${proxyRes.status}`);
    }

    const proxyData = await proxyRes.json();
    return {
      query: proxyData.query || cleanQuery,
      answer: proxyData.answer || "",
      results: (proxyData.results || []).map((r: any) => ({
        title: r.title || "Sin título",
        url: r.url || "",
        content: r.content || "",
        score: r.score,
      })),
    };
  } catch (proxyErr: any) {
    throw new Error(proxyErr.message || "No fue posible conectar con el servicio de búsqueda de Tavily.");
  }
}

/**
 * Detecta si un mensaje del usuario probablemente requiere información actualizada de Internet.
 */
export function requiresWebSearch(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();

  // Comandos explícitos de búsqueda
  if (/\b(busca|buscar|búscame|investiga|googlea|consulta en internet|búsqueda web)\b/i.test(lower)) {
    return true;
  }

  // Noticias y actualidad
  if (/\b(noticias?|actualidad|últimas noticias|última hora|hoy|reciente|sucedió hoy|pasó hoy|este año)\b/i.test(lower)) {
    return true;
  }

  // Clima y meteorología
  if (/\b(clima|temperatura|pronóstico|va a llover|tiempo en|grados hace)\b/i.test(lower)) {
    return true;
  }

  // Deportes y resultados
  if (/\b(partido|resultado|campeonato|champions|mundial|tabla de posiciones|quién ganó|gol de|fútbol|baloncesto|nba|f1)\b/i.test(lower)) {
    return true;
  }

  // Economía y mercados
  if (/\b(precio del?|cotización|bitcoin|btc|ethereum|cripto|dólar|euro|bolsa|acciones de|inflación)\b/i.test(lower)) {
    return true;
  }

  // Tecnología y versiones
  if (/\b(nueva versión de|cuándo sale|lanzamiento|última actualización|changelog)\b/i.test(lower)) {
    return true;
  }

  // Hora exacta y huso horario
  if (/\b(hora es en|qué hora tiene|hora actual en)\b/i.test(lower)) {
    return true;
  }

  return false;
}
