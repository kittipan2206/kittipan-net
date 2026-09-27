"use client";

import { useEffect, useState } from "react";
import { loadWeather, type Weather } from "./weather";

/** Current time, ticking every `intervalMs`. Null until mounted to keep SSR output stable. */
export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return now;
}

let weatherPromise: Promise<Weather | null> | null = null;

export function useWeather() {
  const [weather, setWeather] = useState<Weather | null>(null);
  useEffect(() => {
    weatherPromise ??= loadWeather();
    let alive = true;
    weatherPromise.then((w) => alive && setWeather(w));
    return () => {
      alive = false;
    };
  }, []);
  return weather;
}
