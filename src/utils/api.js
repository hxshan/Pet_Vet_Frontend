const BASE =
  typeof import.meta !== "undefined" &&
  import.meta.env &&
  import.meta.env.VITE_API_BASE
    ? import.meta.env.VITE_API_BASE
    : "https://petbackend-production.up.railway.app";

function buildUrl(path) {
  if (path.startsWith("http")) return path;
  if (path.startsWith("/api/")) return `${BASE}${path}`;
  if (path.startsWith("api/")) return `${BASE}/${path}`;
  // default prefix to API v1
  return `${BASE}/api/v1/${path.replace(/^\/+/, "")}`;
}

export async function apiFetch(path, opts = {}) {
  const url = buildUrl(path);
  // Build Authorization header from token stored in localStorage so the API helper remains framework-agnostic
  const token =
    typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
  const headers = Object.assign(
    { "Content-Type": "application/json" },
    opts.headers || {},
    authHeader,
  );
  const final = Object.assign({}, opts, { headers });
  if (
    final.body &&
    typeof final.body === "object" &&
    headers["Content-Type"] &&
    headers["Content-Type"].includes("application/json")
  ) {
    final.body = JSON.stringify(final.body);
  }

  const res = await fetch(url, final);
  const contentType = res.headers.get("content-type") || "";
  let data = null;
  if (contentType.includes("application/json")) {
    data = await res.json();
  } else {
    data = await res.text();
  }
  return { ok: res.ok, status: res.status, data };
}

export default { apiFetch, buildUrl };
