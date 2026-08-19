/**
 * Holt UVP-Werte von BrickSet fuer die Jahrgaenge im Katalog.
 *
 * Warum hier und nicht ueber den Cloudflare-Worker: den Worker gibt es,
 * weil der Browser den API-Key nicht halten kann und CORS im Weg ist. Die
 * GitHub Action hat beide Probleme nicht — sie laeuft serverseitig und
 * haelt den Key als Secret. Ein Worker-Umbau waere reine Zusatzstrecke.
 *
 * getSets filtert nach Jahr und liefert LEGOCom.DE.retailPrice. Das Limit
 * liegt bei 100 Aufrufen pro 24 Stunden; ein woechentlicher Lauf braucht
 * bei 500 Sets pro Seite unter 20.
 */

const ENDPOINT = "https://brickset.com/api/v3.asmx/getSets";
const PAGE_SIZE = 500;
const MAX_PAGES = 10;   // Reissleine gegen eine Endlosschleife

async function getPage(apiKey, year, pageNumber) {
  const params = new URLSearchParams({
    apiKey,
    userHash: "",
    params: JSON.stringify({ year: String(year), pageSize: PAGE_SIZE, pageNumber }),
  });
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });
  if (!res.ok) throw new Error(`BrickSet HTTP ${res.status}`);
  const data = await res.json();
  if (data.status !== "success") throw new Error(`BrickSet: ${data.message ?? data.status}`);
  return data;
}

/**
 * @returns {Promise<Map<string, number>>} set_num im Rebrickable-Format -> EUR
 */
export async function fetchPrices(apiKey, years, log = console.log) {
  const prices = new Map();
  let calls = 0;

  for (const year of years) {
    for (let page = 1; page <= MAX_PAGES; page++) {
      const data = await getPage(apiKey, year, page);
      calls++;
      const batch = data.sets ?? [];
      for (const s of batch) {
        // BrickSet fuehrt Nummer und Variante getrennt, Rebrickable
        // zusammen — "60509" + 1 wird zu "60509-1".
        const key = `${s.number}-${s.numberVariant ?? 1}`;
        const eur = s.LEGOCom?.DE?.retailPrice;
        if (typeof eur === "number" && eur > 0) prices.set(key, eur);
      }
      if (batch.length < PAGE_SIZE) break;
    }
  }

  log(`  BrickSet: ${prices.size} Preise aus ${calls} Aufruf(en)`);
  return prices;
}
