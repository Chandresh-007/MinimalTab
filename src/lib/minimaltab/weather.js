const CACHE_KEY = "mt.weather";
const CACHE_MINUTES = 30;
const WMO = {
  0: "Clear",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  56: "Freezing drizzle",
  57: "Freezing drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  66: "Freezing rain",
  67: "Freezing rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Light showers",
  81: "Showers",
  82: "Heavy showers",
  85: "Snow showers",
  86: "Snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Thunderstorm with hail"
};
function describeWeather(code) {
  return WMO[code] ?? "Unknown";
}
function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.fetchedAt > CACHE_MINUTES * 60 * 1e3) return null;
    return parsed;
  } catch {
    return null;
  }
}
function writeCache(cache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
  }
}
async function fetchWeather(lat, lon, city) {
  const cached = readCache();
  if (cached && cached.lat === lat && cached.lon === lon) {
    return cached.weather;
  }
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set("current", "temperature_2m,weather_code,is_day");
  url.searchParams.set("hourly", "temperature_2m,weather_code");
  url.searchParams.set("forecast_days", "1");
  url.searchParams.set("timezone", "auto");
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Weather unavailable");
  const data = await res.json();
  const now = /* @__PURE__ */ new Date();
  const currentHour = now.getHours();
  const hourly = [];
  for (let i = 0; i < data.hourly.time.length; i++) {
    const h = new Date(data.hourly.time[i]).getHours();
    if (h > currentHour && h <= currentHour + 3) {
      hourly.push({
        time: `${String(h).padStart(2, "0")}:00`,
        temp: Math.round(data.hourly.temperature_2m[i]),
        code: data.hourly.weather_code[i]
      });
    }
  }
  const weather = {
    temp: Math.round(data.current.temperature_2m),
    code: data.current.weather_code,
    isDay: data.current.is_day === 1,
    hourly: hourly.slice(0, 3),
    city
  };
  writeCache({ lat, lon, city, weather, fetchedAt: Date.now() });
  return weather;
}
function getLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: false, timeout: 1e4, maximumAge: 6e5 }
    );
  });
}
async function reverseGeocode(lat, lon) {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
    );
    if (!res.ok) return void 0;
    const data = await res.json();
    return data.city || data.locality || void 0;
  } catch {
    return void 0;
  }
}
export {
  describeWeather,
  fetchWeather,
  getLocation,
  reverseGeocode
};
