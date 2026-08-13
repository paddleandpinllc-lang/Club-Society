export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const miles = Math.min(75, Math.max(5, Number(url.searchParams.get("miles")) || 25));
  let lat = Number(url.searchParams.get("lat"));
  let lon = Number(url.searchParams.get("lon"));
  let locationLabel = "Current location";
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    const location = String(url.searchParams.get("location") || "Watkinsville, GA 30677").slice(0, 160);
    const geocode = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=us&q=${encodeURIComponent(location)}`, { headers: { "User-Agent": "ClubSociety/1.0 (clubsociety.app)" } });
    const places = await geocode.json();
    if (!places[0]) return Response.json({ ok: false, error: "We could not locate that profile city or ZIP." }, { status: 404 });
    lat = Number(places[0].lat); lon = Number(places[0].lon); locationLabel = places[0].display_name;
  }
  const radius = Math.round(miles * 1609.344);
  const query = `[out:json][timeout:20];nwr(around:${radius},${lat},${lon})[leisure=golf_course];out center tags;`;
  const overpass = await fetch("https://overpass-api.de/api/interpreter", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "ClubSociety/1.0 (clubsociety.app)" }, body: `data=${encodeURIComponent(query)}` });
  if (!overpass.ok) return Response.json({ ok: false, error: "Nearby course search is temporarily busy." }, { status: 503 });
  const data = await overpass.json();
  const courses = data.elements.map((item) => {
    const tags = item.tags || {}; const courseLat = item.lat || item.center?.lat; const courseLon = item.lon || item.center?.lon;
    const accessValue = String(tags.access || "").toLowerCase();
    const access = accessValue === "private" || /country club/i.test(tags.name || "") ? "Private" : "Public / verify access";
    const website = safeUrl(tags.website || tags["contact:website"]);
    const bookingUrl = access === "Private" ? "" : safeUrl(tags.booking || tags["contact:booking"] || tags.reservation || website);
    return { name: tags.name || "Golf course", miles: haversine(lat, lon, courseLat, courseLon).toFixed(1), access, address: [tags["addr:housenumber"], tags["addr:street"], tags["addr:city"], tags["addr:state"]].filter(Boolean).join(" "), website, bookingUrl };
  }).filter((course) => course.name !== "Golf course").sort((a, b) => Number(a.miles) - Number(b.miles));
  return Response.json({ ok: true, locationLabel, courses });
}

function safeUrl(value) { try { const url = new URL(String(value || "")); return ["http:", "https:"].includes(url.protocol) ? url.toString() : ""; } catch { return ""; } }
function haversine(aLat, aLon, bLat, bLon) { const rad = (n) => n * Math.PI / 180; const dLat = rad(bLat - aLat); const dLon = rad(bLon - aLon); const x = Math.sin(dLat / 2) ** 2 + Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLon / 2) ** 2; return 3958.8 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)); }

