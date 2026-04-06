// backfill-parent-theme.mjs
// Einmalig ausführen: node backfill-parent-theme.mjs

import { readFileSync } from "fs";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc } from "firebase/firestore";

const env = Object.fromEntries(
  readFileSync(".env", "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => l.split("=").map((s) => s.trim()))
);

const app = initializeApp({
  apiKey:            env.VITE_FIREBASE_API_KEY,
  authDomain:        env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             env.VITE_FIREBASE_APP_ID,
});
const db = getFirestore(app);
const KEY = env.VITE_REBRICKABLE_KEY;

async function fetchParentTheme(themeId) {
  const r1 = await fetch(`https://rebrickable.com/api/v3/lego/themes/${themeId}/?key=${KEY}`);
  const t = await r1.json();
  if (!t.parent_id) return null;
  const r2 = await fetch(`https://rebrickable.com/api/v3/lego/themes/${t.parent_id}/?key=${KEY}`);
  const p = await r2.json();
  return p.name ?? null;
}

async function main() {
  const snap = await getDocs(collection(db, "sets"));
  const missing = snap.docs.filter((d) => d.data().theme && !d.data().parentThemeName);

  console.log(`${missing.length} Sets ohne parentThemeName.`);
  if (!missing.length) { console.log("Nichts zu tun."); process.exit(0); }

  for (const docSnap of missing) {
    const { setNumber, name, theme } = docSnap.data();
    process.stdout.write(`  ${setNumber} (${name}) → `);
    try {
      const parentThemeName = await fetchParentTheme(theme);
      if (parentThemeName) {
        await updateDoc(doc(db, "sets", docSnap.id), { parentThemeName });
        console.log(`✅ ${parentThemeName}`);
      } else {
        console.log("— kein Parent (Top-Level Theme)");
      }
    } catch (e) {
      console.log(`❌ ${e.message}`);
    }
    await new Promise((r) => setTimeout(r, 1200)); // Rate-Limit
  }

  console.log("\nFertig.");
  process.exit(0);
}

main();
