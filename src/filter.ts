const OFFENSIVE_WORDS = [
  "idiot", "stupid", "dumb", "fool", "moron", "imbecile", "ass", "asshole",
  "bitch", "bastard", "crap", "shit", "fuck", "damn", "dick", "pussy",
  "whore", "slut", "cunt", "fag", "nigger", "nigga", "retard",
  "tonto", "idiota", "estúpido", "estupido", "imbécil", "imbecil", "pendejo", "cabrón", "cabron",
  "puta", "puto", "mierda", "joder", "coño", "carajo", "verga", "chinga", "zorra", "perra"
];

export function filterOffensiveText(text: string): string {
  if (!text) return text;
  let filtered = text;
  OFFENSIVE_WORDS.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    filtered = filtered.replace(regex, match => '*'.repeat(match.length));
  });
  return filtered;
}
