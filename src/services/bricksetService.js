export async function fetchRetailPrice(setNumber) {
  try {
    const res = await fetch(
      `https://lego-brickset-proxy.gxnpny5jhn.workers.dev/?setNumber=${setNumber}`
    );
    const data = await res.json();
    return data.retailPrice ?? null;
  } catch {
    return null;
  }
}
