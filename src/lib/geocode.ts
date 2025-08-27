export async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lon));
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("zoom", "18");
    const res = await fetch(url.toString(), { headers: { Accept: "application/json" } });
    const data = await res.json();
    return data?.display_name ?? null;
  } catch {
    return null;
  }
}
