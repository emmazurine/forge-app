const EN = '–'; // en-dash used in all hours strings

const DAY: Record<string, number> = {
  Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
};

function toMin(t: string, hint?: 'AM' | 'PM'): number {
  t = t.trim();
  if (/midnight/i.test(t)) return 24 * 60;
  if (/noon/i.test(t)) return 12 * 60;
  const m = t.match(/^(\d+)(?::(\d+))?\s*(AM|PM)?$/i);
  if (!m) return -1;
  let h = parseInt(m[1]);
  const min = m[2] ? parseInt(m[2]) : 0;
  const ap = ((m[3] ?? hint ?? 'AM') as string).toUpperCase();
  if (ap === 'PM' && h !== 12) h += 12;
  if (ap === 'AM' && h === 12) h = 0;
  return h * 60 + min;
}

function daysInRange(range: string): number[] {
  range = range.trim();
  const parts = range.split(EN);
  if (parts.length === 1) {
    const d = DAY[range];
    return d !== undefined ? [d] : [];
  }
  const s = DAY[parts[0].trim()], e = DAY[parts[1].trim()];
  if (s === undefined || e === undefined) return [];
  if (s <= e) return Array.from({ length: e - s + 1 }, (_, i) => s + i);
  // wrap-around e.g. Sat–Sun
  const out: number[] = [];
  for (let d = s; d <= 6; d++) out.push(d);
  for (let d = 0; d <= e; d++) out.push(d);
  return out;
}

// Returns true=open, false=closed, null=unknown (unparseable hours string)
export function isSpotOpenNow(hours: string): boolean | null {
  const now = new Date();
  const day = now.getDay();
  const cur = now.getHours() * 60 + now.getMinutes();

  let anyParsed = false;

  for (const seg of hours.split(', ')) {
    // Match: "<day-range> <time-range>"
    // day-range ends just before the first digit
    const m = seg.match(/^([^\d]+?)\s+(\d.+)$/);
    if (!m) continue;

    const days = daysInRange(m[1].trim());
    if (days.length === 0) continue;

    anyParsed = true;
    if (!days.includes(day)) continue;

    const timePart = m[2]; // e.g. "7 AM – Midnight" or "1–6 PM"

    let openStr: string, closeStr: string;
    if (timePart.includes(` ${EN} `)) {
      [openStr, closeStr] = timePart.split(` ${EN} `, 2);
    } else {
      [openStr, closeStr] = timePart.split(EN, 2);
    }

    const closeMin = toMin(closeStr?.trim() ?? '');
    const sfx = closeStr?.trim().match(/(AM|PM)$/i)?.[1]?.toUpperCase() as 'AM' | 'PM' | undefined;
    const openMin = toMin(openStr?.trim() ?? '', sfx);

    if (openMin < 0 || closeMin < 0) continue;
    return cur >= openMin && cur < closeMin;
  }

  // If we successfully parsed at least one day segment but today wasn't covered, the spot is closed today.
  // If nothing parsed at all, hours are unknown.
  return anyParsed ? false : null;
}
