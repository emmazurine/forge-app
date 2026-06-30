export async function geocodeZip(zip: string): Promise<{ lat: number; lng: number } | null> {
  if (!zip || zip.trim().length < 3) return null;
  try {
    const url = `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(zip.trim())}&format=json&limit=1`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'ForgeApp/1.0' },
    });
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    const lat = parseFloat(data[0].lat);
    const lng = parseFloat(data[0].lon);
    if (isNaN(lat) || isNaN(lng)) return null;
    return { lat, lng };
  } catch {
    return null;
  }
}
