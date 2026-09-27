import type { Localized } from "@/config/profile";
import { BANGKOK } from "./sun";

export interface Weather {
  temp: number;
  code: number;
  fetchedAt: number;
}

const CACHE_KEY = "kos_weather";
const TTL_MS = 15 * 60_000;
const URL = `https://api.open-meteo.com/v1/forecast?latitude=${BANGKOK.lat}&longitude=${BANGKOK.lon}&current=temperature_2m,weather_code&timezone=Asia%2FBangkok`;

export async function loadWeather(): Promise<Weather | null> {
  try {
    const cached = JSON.parse(
      sessionStorage.getItem(CACHE_KEY) ?? "null",
    ) as Weather | null;
    if (cached && Date.now() - cached.fetchedAt < TTL_MS) return cached;
  } catch {}
  try {
    const res = await fetch(URL);
    if (!res.ok) return null;
    const data = await res.json();
    const weather: Weather = {
      temp: Math.round(data.current.temperature_2m),
      code: data.current.weather_code,
      fetchedAt: Date.now(),
    };
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(weather));
    } catch {}
    return weather;
  } catch {
    return null;
  }
}

// WMO weather interpretation codes, grouped.
export function describe(code: number): Localized {
  if (code === 0) return { en: "Clear", th: "ฟ้าโปร่ง" };
  if (code <= 2) return { en: "Partly cloudy", th: "มีเมฆบางส่วน" };
  if (code === 3) return { en: "Overcast", th: "เมฆครึ้ม" };
  if (code <= 48) return { en: "Fog", th: "หมอก" };
  if (code <= 57) return { en: "Drizzle", th: "ฝนปรอย" };
  if (code <= 67) return { en: "Rain", th: "ฝนตก" };
  if (code <= 77) return { en: "Snow", th: "หิมะ" };
  if (code <= 82) return { en: "Rain showers", th: "ฝนตกเป็นช่วง" };
  if (code <= 86) return { en: "Snow showers", th: "หิมะตกเป็นช่วง" };
  return { en: "Thunderstorm", th: "พายุฝนฟ้าคะนอง" };
}
