/**
 * Helfer rund um Neuheiten-Sets.
 *
 * Hier standen bis zuletzt auch die kuratierten Wellen aus
 * src/data/newReleases.json. Die Datei wurde von Hand gepflegt, stand seit
 * August still und ist mit der Wellen-Ansicht entfallen — der Katalog aus
 * dem woechentlichen Rebrickable-Sync deckt dasselbe ab. Geblieben sind die
 * Helfer, die Katalog, Sammlung und Karte gemeinsam nutzen.
 */

/**
 * "2027-12-31" -> "vsl. EOL 12/2027".
 * Das "vsl." ist nicht Kosmetik: LEGO gibt Auslaufdaten nie offiziell
 * bekannt, die Werte sind aus Verfuegbarkeitsmustern geschaetzt. Ohne den
 * Zusatz liest der Badge wie ein gesichertes Datum.
 */
export function formatEol(eolForecast) {
  if (!eolForecast) return null;
  const [year, month] = eolForecast.split("-");
  return `vsl. EOL ${month}/${year}`;
}

/**
 * Teilezahl oder null, wenn unbekannt.
 *
 * 0 heisst "noch unbekannt", nicht "null Teile": Rebrickable fuehrt
 * angekuendigte, noch nicht ausgelieferte Sets mit 0 Teilen. Wichtig ist
 * auch die Reihenfolge — mit ?? wuerde eine 0 von Rebrickable eine echte
 * Teilezahl aus der JSON verdecken, weil 0 nicht nullish ist.
 */
export function knownParts(...candidates) {
  for (const value of candidates) {
    if (typeof value === "number" && value > 0) return value;
  }
  return null;
}

/**
 * Einheitlicher Join-Key für Sammlung, Wunschliste, Wellen und Katalog.
 * Alte Einträge ohne Suffix entsprechen der Hauptvariante „-1“; echte
 * Varianten wie „-2“ bleiben eigenständig.
 */
export function canonicalSetNum(setNumber) {
  const number = String(setNumber ?? "").trim();
  return number && !number.includes("-") ? `${number}-1` : number;
}
