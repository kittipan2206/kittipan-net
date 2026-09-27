// Solar math adapted from the NOAA/suncalc approach; accurate to ~1 min, enough to drive lighting.
export type Phase = "dawn" | "day" | "dusk" | "night";

export const BANGKOK = { lat: 13.7563, lon: 100.5018 };

const RAD = Math.PI / 180;
const DAY_MS = 86_400_000;
const J1970 = 2440588;
const J2000 = 2451545;
const J0 = 0.0009;
const OBLIQUITY = RAD * 23.4397;
const TWILIGHT_MS = 45 * 60_000;

const toDays = (date: Date) => date.valueOf() / DAY_MS - 0.5 + J1970 - J2000;
const fromJulian = (j: number) => new Date((j + 0.5 - J1970) * DAY_MS);
const solarMeanAnomaly = (d: number) => RAD * (357.5291 + 0.98560028 * d);
const eclipticLongitude = (m: number) =>
  m +
  RAD *
    (1.9148 * Math.sin(m) + 0.02 * Math.sin(2 * m) + 0.0003 * Math.sin(3 * m)) +
  RAD * 102.9372 +
  Math.PI;
const solarTransitJ = (ds: number, m: number, l: number) =>
  J2000 + ds + 0.0053 * Math.sin(m) - 0.0069 * Math.sin(2 * l);

export function sunTimes(date: Date, lat = BANGKOK.lat, lon = BANGKOK.lon) {
  const lw = RAD * -lon;
  const phi = RAD * lat;
  const n = Math.round(toDays(date) - J0 - lw / (2 * Math.PI));
  const ds = J0 + lw / (2 * Math.PI) + n;
  const m = solarMeanAnomaly(ds);
  const l = eclipticLongitude(m);
  const dec = Math.asin(Math.sin(OBLIQUITY) * Math.sin(l));
  const jNoon = solarTransitJ(ds, m, l);
  const h0 = RAD * -0.833;
  const w = Math.acos(
    (Math.sin(h0) - Math.sin(phi) * Math.sin(dec)) /
      (Math.cos(phi) * Math.cos(dec)),
  );
  const jSet = solarTransitJ(J0 + (w + lw) / (2 * Math.PI) + n, m, l);
  const jRise = jNoon - (jSet - jNoon);
  return {
    sunrise: fromJulian(jRise),
    sunset: fromJulian(jSet),
    noon: fromJulian(jNoon),
  };
}

export function phaseAt(now: Date): Phase {
  const { sunrise, sunset } = sunTimes(now);
  const t = now.getTime();
  if (Math.abs(t - sunrise.getTime()) <= TWILIGHT_MS) return "dawn";
  if (Math.abs(t - sunset.getTime()) <= TWILIGHT_MS) return "dusk";
  return t > sunrise.getTime() && t < sunset.getTime() ? "day" : "night";
}

/** 0 at sunrise → 1 at sunset; null when the sun is down. */
export function sunProgress(now: Date): number | null {
  const { sunrise, sunset } = sunTimes(now);
  const p =
    (now.getTime() - sunrise.getTime()) /
    (sunset.getTime() - sunrise.getTime());
  return p < 0 || p > 1 ? null : p;
}

export function bangkokTime(date: Date, withSeconds = false) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Bangkok",
    hour: "2-digit",
    minute: "2-digit",
    ...(withSeconds ? { second: "2-digit" } : {}),
    hour12: false,
  }).format(date);
}

export function bangkokDate(date: Date) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Bangkok", weekday: "short", day: "numeric", month: "short" })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  );
  return `${parts.weekday} ${parts.day} ${parts.month}`.toUpperCase();
}

/** Hard-shadow offset (px) for a sun position: long and to the west at dawn, short at noon, east at dusk. */
export function shadowOffset(progress: number | null): { x: number; y: number } {
  if (progress === null) return { x: 0, y: 3 };
  const tilt = 0.5 - progress; // +0.5 at sunrise … -0.5 at sunset
  return { x: Math.round(tilt * 10), y: 3 + Math.round(Math.abs(tilt) * 2) };
}

export const PHASE_PROGRESS: Record<Phase, number | null> = { dawn: 0.04, day: 0.5, dusk: 0.96, night: null };
