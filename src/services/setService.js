import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  doc,
} from "firebase/firestore";
import { db } from "./firebase";

const COL = "sets";

/**
 * Neues Set speichern (Daten kommen von Rebrickable).
 * @param {{ setNumber, name, image, parts, theme, status }} data
 */
export async function addSet({ setNumber, name, image, parts, theme, themeName, status }) {
  const ref = await addDoc(collection(db, COL), {
    setNumber,
    name,
    image,
    parts,
    theme,
    ...(themeName ? { themeName } : {}),
    status, // "built" | "boxed" | "wishlist"
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/**
 * Status eines Sets ändern.
 * @param {string} id
 * @param {"built"|"boxed"|"wishlist"} status
 */
export async function updateSetStatus(id, status) {
  await updateDoc(doc(db, COL, id), { status });
}

/**
 * Set löschen.
 * @param {string} id
 */
export async function deleteSet(id) {
  await deleteDoc(doc(db, COL, id));
}
