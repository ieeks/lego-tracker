const API_KEY = import.meta.env.VITE_REBRICKABLE_KEY;
const BASE = "https://rebrickable.com/api/v3/lego";

/**
 * Theme-Name und Parent-Theme-Name von Rebrickable laden.
 * @param {number} themeId
 * @returns {Promise<{ themeName: string|null, parentThemeName: string|null }>}
 */
export async function fetchThemeNames(themeId) {
  if (!themeId || !API_KEY) return { themeName: null, parentThemeName: null };
  const res = await fetch(`${BASE}/themes/${themeId}/`, {
    headers: { Authorization: `key ${API_KEY}` },
  });
  if (!res.ok) return { themeName: null, parentThemeName: null };
  const theme = await res.json();
  const themeName = theme.name ?? null;

  let parentThemeName = null;
  if (theme.parent_id) {
    const parentRes = await fetch(`${BASE}/themes/${theme.parent_id}/`, {
      headers: { Authorization: `key ${API_KEY}` },
    });
    if (parentRes.ok) {
      const parent = await parentRes.json();
      parentThemeName = parent.name ?? null;
    }
  }

  return { themeName, parentThemeName };
}

/**
 * Set-Daten von Rebrickable laden.
 * @param {string} setNumber  z.B. "42115" oder "42115-1"
 * @returns {Promise<{ set_num, name, num_parts, set_img_url, theme_id }>}
 */
export async function fetchSet(setNumber) {
  const id = setNumber.includes("-") ? setNumber : `${setNumber}-1`;

  if (!API_KEY) throw new Error("Kein Rebrickable API-Key gesetzt (VITE_REBRICKABLE_KEY).");

  const res = await fetch(`${BASE}/sets/${id}/`, {
    headers: { Authorization: `key ${API_KEY}` },
  });

  if (!res.ok) {
    if (res.status === 401) throw new Error("API-Key ungültig (401). Bitte prüfen.");
    if (res.status === 404) throw new Error(`Set „${id}" nicht gefunden (404).`);
    throw new Error(`Fehler ${res.status} von Rebrickable.`);
  }

  return res.json();
}
