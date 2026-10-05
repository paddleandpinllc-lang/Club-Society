export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const zip = String(url.searchParams.get("zip") || "").trim();
  const miles = Math.min(100, Math.max(5, Number(url.searchParams.get("miles")) || 25));
  if (!/^\d{5}$/.test(zip)) return Response.json({ ok: false, error: "Enter a valid five-digit U.S. ZIP code." }, { status: 400 });

  try {
    const zipResponse = await fetch(`https://api.zippopotam.us/us/${encodeURIComponent(zip)}`, {
      headers: { "User-Agent": "ClubSociety/1.0 (clubsociety.app)" },
      cf: { cacheEverything: true, cacheTtl: 86400 },
    });
    if (!zipResponse.ok) return Response.json({ ok: false, error: "We could not locate that U.S. ZIP code." }, { status: 404 });
    const zipData = await zipResponse.json();
    const place = zipData?.places?.[0];
    const lat = Number(place?.latitude);
    const lon = Number(place?.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return Response.json({ ok: false, error: "That ZIP code did not return a usable location." }, { status: 404 });

    const radius = Math.round(miles * 1609.344);
    const query = `[out:json][timeout:25];(nwr(around:${radius},${lat},${lon})[sport~"pickleball",i];nwr(around:${radius},${lat},${lon})[name~"pickleball",i];);out center tags;`;
    const data = await fetchOverpass(query);
    const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`pickleball courts near ${zip}`)}`;
    if (!data) return Response.json({ ok: true, zip, miles, locationLabel: `${place["place name"]}, ${place["state abbreviation"]} ${zip}`, courts: [], fallbackUrl }, {
      headers: { "Cache-Control": "public, max-age=300" },
    });
    const seen = new Set();
    const courts = (data.elements || []).map((item) => {
      const tags = item.tags || {};
      const courtLat = Number(item.lat ?? item.center?.lat);
      const courtLon = Number(item.lon ?? item.center?.lon);
      if (!Number.isFinite(courtLat) || !Number.isFinite(courtLon)) return null;
      const name = String(tags.name || tags.operator || "Pickleball courts").trim();
      const key = `${name.toLowerCase()}:${courtLat.toFixed(4)}:${courtLon.toFixed(4)}`;
      if (seen.has(key)) return null;
      seen.add(key);
      const accessTag = String(tags.access || "").toLowerCase();
      const access = ["private", "members", "customers"].includes(accessTag) ? "Club/private" : "Public / verify access";
      const surface = tags.indoor === "yes" || tags.covered === "yes" ? "Indoor/covered" : (tags.surface ? String(tags.surface).replaceAll("_", " ") : "Outdoor/verify");
      const city = tags["addr:city"] || tags["addr:town"] || tags["addr:village"] || place["place name"] || "Nearby";
      const address = [tags["addr:housenumber"], tags["addr:street"], tags["addr:city"], tags["addr:state"], tags["addr:postcode"]].filter(Boolean).join(" ");
      const courtCount = tags.courts || tags.capacity || tags.count || "Pickleball courts";
      return {
        id: `${item.type}-${item.id}`,
        name,
        city,
        address,
        access,
        surface,
        courts: String(courtCount),
        note: tags.opening_hours ? `Hours: ${tags.opening_hours}` : "Confirm hours and access before traveling.",
        miles: Number(haversine(lat, lon, courtLat, courtLon).toFixed(1)),
        lat: courtLat,
        lon: courtLon,
      };
    }).filter(Boolean).sort((left, right) => left.miles - right.miles).slice(0, 80);

    return Response.json({ ok: true, zip, miles, locationLabel: `${place["place name"]}, ${place["state abbreviation"]} ${zip}`, courts, fallbackUrl }, {
      headers: { "Cache-Control": "public, max-age=900" },
    });
  } catch (error) {
    console.error("Club Society court search failed", error);
    return Response.json({ ok: false, error: "Court search is temporarily unavailable." }, { status: 503 });
  }
}

async function fetchOverpass(query) {
  const endpoints = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
  ];
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "ClubSociety/1.0 (clubsociety.app)" },
        body: `data=${encodeURIComponent(query)}`,
        signal: AbortSignal.timeout(8000),
      });
      if (response.ok) return await response.json();
    } catch {
      // Try the next public Overpass mirror.
    }
  }
  return null;
}

function haversine(aLat, aLon, bLat, bLon) {
  const radians = (value) => value * Math.PI / 180;
  const dLat = radians(bLat - aLat);
  const dLon = radians(bLon - aLon);
  const value = Math.sin(dLat / 2) ** 2 + Math.cos(radians(aLat)) * Math.cos(radians(bLat)) * Math.sin(dLon / 2) ** 2;
  return 3958.8 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}
