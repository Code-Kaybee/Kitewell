import { API_BASE } from "./config";

export async function fetchNetworkInfo() {
  const res = await fetch(`${API_BASE}/api/network`);
  if (!res.ok) throw new Error("Backend network endpoint failed");
  return res.json();
}

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error("Backend health check failed");
  return res.json();
}

/** Read the latest ledger sequence directly from the selected Horizon. */
export async function fetchLatestHorizonLedger(horizonUrl) {
  const base = String(horizonUrl || "").replace(/\/$/, "");
  const res = await fetch(`${base}/ledgers?order=desc&limit=1`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error("Latest Horizon ledger fetch failed");
  const sequence = data?._embedded?.records?.[0]?.sequence;
  return sequence == null ? null : Number(sequence);
}

export async function fetchAccountViaApi(publicKey, networkId) {
  const params = new URLSearchParams();
  if (networkId) params.set("network", networkId);
  const query = params.toString();
  const res = await fetch(
    `${API_BASE}/api/account/${publicKey}${query ? `?${query}` : ""}`
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Account fetch failed");
  return data;
}

export async function fetchPaymentsViaApi(
  publicKey,
  limit = 15,
  cursor,
  networkOrOptions = {}
) {
  const options =
    typeof networkOrOptions === "string" ? {} : networkOrOptions || {};
  const networkId =
    typeof networkOrOptions === "string"
      ? networkOrOptions
      : options.network || null;
  const params = new URLSearchParams({ limit: String(limit) });
  if (networkId) params.set("network", networkId);
  if (cursor) params.set("cursor", cursor);

  const url = `${API_BASE}/api/payments/${publicKey}?${params.toString()}`;
  const res = options.signal
    ? await fetch(url, { signal: options.signal })
    : await fetch(url);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Payments fetch failed");
  return { records: data.records || [], nextCursor: data.nextCursor ?? null };
}
