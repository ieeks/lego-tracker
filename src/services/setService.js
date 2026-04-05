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

export async function addSet({ setNumber, name, image, parts, theme, themeName, year, status, location }) {
  const ref = await addDoc(collection(db, COL), {
    setNumber,
    name,
    image,
    parts,
    theme,
    ...(themeName  ? { themeName }  : {}),
    ...(year       ? { year }       : {}),
    ...(location   ? { location }   : {}),
    status,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateSetStatus(id, status) {
  await updateDoc(doc(db, COL, id), { status });
}

export async function updateSetLocation(id, location) {
  await updateDoc(doc(db, COL, id), { location: location ?? null });
}

export async function deleteSet(id) {
  await deleteDoc(doc(db, COL, id));
}
