import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  doc,
} from "firebase/firestore";
import { db, authReady } from "./firebase";

const COL = "sets";

export async function addSet({ setNumber, name, image, parts, theme, themeName, parentThemeName, year, status, location }) {
  await authReady;
  const ref = await addDoc(collection(db, COL), {
    setNumber,
    name,
    image,
    parts,
    theme,
    ...(themeName       ? { themeName }       : {}),
    ...(parentThemeName ? { parentThemeName } : {}),
    ...(year            ? { year }            : {}),
    ...(location        ? { location }        : {}),
    status,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateSetStatus(id, status) {
  await authReady;
  await updateDoc(doc(db, COL, id), { status });
}

export async function updateSetLocation(id, location) {
  await authReady;
  await updateDoc(doc(db, COL, id), { location: location ?? null });
}

export async function updateSetPrice(id, retailPrice) {
  await authReady;
  await updateDoc(doc(db, COL, id), { retailPrice });
}

export async function deleteSet(id) {
  await authReady;
  await deleteDoc(doc(db, COL, id));
}
