import { createServerFn } from "@tanstack/react-start";

type WeatherPayload = {
  temperature: number;
  windspeed: number;
  code: number;
  label: string;
  city: string;
};

const WEATHER_LABELS: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Freezing fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  80: "Rain showers",
  81: "Rain showers",
  82: "Violent showers",
  95: "Thunderstorm",
  96: "Thunderstorm, hail",
};

export const getGenevaWeather = createServerFn({ method: "GET" }).handler(
  async (): Promise<WeatherPayload> => {
    try {
      const res = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=46.2044&longitude=6.1432&current_weather=true",
      );
      if (!res.ok) throw new Error("weather unavailable");
      const json = (await res.json()) as {
        current_weather?: { temperature: number; windspeed: number; weathercode: number };
      };
      const cw = json.current_weather;
      if (!cw) throw new Error("weather unavailable");
      return {
        temperature: Math.round(cw.temperature),
        windspeed: Math.round(cw.windspeed),
        code: cw.weathercode,
        label: WEATHER_LABELS[cw.weathercode] ?? "Current conditions",
        city: "Geneva",
      };
    } catch {
      return { temperature: 18, windspeed: 6, code: 2, label: "Partly cloudy", city: "Geneva" };
    }
  },
);

export type TickerItem = { source: string; headline: string };

export const getTickerHeadlines = createServerFn({ method: "GET" }).handler(
  async (): Promise<TickerItem[]> => [
    {
      source: "UNESCO",
      headline:
        "Global Convention on the Recognition of Qualifications passes 60 ratifications",
    },
    {
      source: "Council of Europe",
      headline: "Lisbon Recognition Convention committee adopts revised monitoring guidance",
    },
    {
      source: "European Commission",
      headline: "EQF referencing reports published for four additional partner countries",
    },
    {
      source: "Swiss Federal Council",
      headline: "SERI confirms extended bilateral dialogue on secondary qualification equivalency",
    },
    {
      source: "EHEA / Bologna",
      headline: "Ministerial communiqué reaffirms automatic recognition commitments to 2030",
    },
    {
      source: "OECD",
      headline: "Education at a Glance highlights growth in internationally accredited schools",
    },
    {
      source: "UNESCO IBE",
      headline: "New curriculum benchmarking toolkit released for national authorities",
    },
    {
      source: "WISE Secretariat",
      headline: "Geneva HQ opens 2026 accreditation cycle for expressions of interest",
    },
  ],
);
