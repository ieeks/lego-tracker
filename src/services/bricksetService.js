export async function fetchRetailPrice(setNumber) {
  try {
    const res = await fetch(
      `https://lego-brickset-proxy.gxnpny5jhn.workers.dev/?setNumber=${encodeURIComponent(setNumber)}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const price = data?.retailPrice;
    return typeof price === "number" && Number.isFinite(price) && price > 0 ? price : null;
  } catch {
    return null;
  }
}
