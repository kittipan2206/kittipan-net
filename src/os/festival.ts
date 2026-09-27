// Thai calendar moments that change the desktop. Pure: no React, testable under Node.
export type Festival = "songkran" | "loykrathong" | "newyear";

// Full moon of the 12th Thai lunar month; TAT confirms each year. Add new years as they're announced.
const LOY_KRATHONG: Record<number, string> = {
  2026: "11-25",
  2027: "11-14",
  2028: "11-02",
  2029: "11-21",
  2030: "11-11",
};

function bangkokParts(date: Date) {
  const [y, m, d] = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok", year: "numeric", month: "2-digit", day: "2-digit" })
    .format(date)
    .split("-");
  return { year: +y, md: `${m}-${d}` };
}

export function festivalOn(date: Date): Festival | null {
  const { year, md } = bangkokParts(date);
  if (md === "12-31" || md === "01-01") return "newyear";
  if (md >= "04-13" && md <= "04-15") return "songkran";
  const loy = LOY_KRATHONG[year];
  if (loy) {
    const eve = new Date(`${year}-${loy}T12:00:00+07:00`);
    eve.setDate(eve.getDate() - 1);
    if (md === loy || md === bangkokParts(eve).md) return "loykrathong";
  }
  return null;
}

export const FESTIVAL_GREETING: Record<Festival, { th: string; en: string }> = {
  songkran: { th: "สุขสันต์วันสงกรานต์", en: "Happy Songkran" },
  loykrathong: { th: "สุขสันต์วันลอยกระทง", en: "Happy Loy Krathong" },
  newyear: { th: "สวัสดีปีใหม่", en: "Happy New Year" },
};
