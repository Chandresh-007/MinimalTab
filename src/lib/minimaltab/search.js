const ENGINES = {
  duckduckgo: { id: "duckduckgo", name: "DuckDuckGo", url: (q) => `https://duckduckgo.com/?q=${encodeURIComponent(q)}` },
  google: { id: "google", name: "Google", url: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}` },
  wikipedia: { id: "wikipedia", name: "Wikipedia", url: (q) => `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(q)}` },
  github: { id: "github", name: "GitHub", url: (q) => `https://github.com/search?q=${encodeURIComponent(q)}` },
  stackoverflow: { id: "stackoverflow", name: "Stack Overflow", url: (q) => `https://stackoverflow.com/search?q=${encodeURIComponent(q)}` },
  reddit: { id: "reddit", name: "Reddit", url: (q) => `https://www.reddit.com/search/?q=${encodeURIComponent(q)}` },
  youtube: { id: "youtube", name: "YouTube", url: (q) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}` },
  yandex: { id: "yandex", name: "Yandex", url: (q) => `https://yandex.com/search/?text=${encodeURIComponent(q)}` },
  tor: { id: "tor", name: "Tor Search", url: (q) => `https://ahmia.fi/search/?q=${encodeURIComponent(q)}` }
};
const PREFIX_MAP = {
  g: "google",
  gh: "github",
  yt: "youtube",
  w: "wikipedia",
  r: "reddit",
  so: "stackoverflow",
  ddg: "duckduckgo",
  y: "yandex"
};
function routeSearch(input, defaultEngine) {
  const trimmed = input.trim();
  if (!trimmed) return { url: "", engine: defaultEngine, query: "" };
  if (/^https?:\/\//i.test(trimmed) || /^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(trimmed)) {
    const url = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    return { url, engine: "direct", query: trimmed };
  }
  const [head, ...rest] = trimmed.split(/\s+/);
  const prefix = head.toLowerCase();
  if (prefix === "ai" && rest.length) {
    const q = rest.join(" ");
    return { url: `https://chat.openai.com/?q=${encodeURIComponent(q)}`, engine: "AI", query: q };
  }
  if (PREFIX_MAP[prefix] && rest.length) {
    const engine2 = ENGINES[PREFIX_MAP[prefix]];
    const q = rest.join(" ");
    return { url: engine2.url(q), engine: engine2.name, query: q };
  }
  const engine = ENGINES[defaultEngine] ?? ENGINES.duckduckgo;
  return { url: engine.url(trimmed), engine: engine.name, query: trimmed };
}
export {
  ENGINES,
  routeSearch
};
