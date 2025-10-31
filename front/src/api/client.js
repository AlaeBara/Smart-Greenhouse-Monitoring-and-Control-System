const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

let csrfToken = null;
let accessToken = null;

export const setCsrfToken = (token) => {
  csrfToken = token;
};

export const setAccessToken = (token) => {
  accessToken = token || null;
};

const buildHeaders = (json = true) => {
  const headers = {};
  if (json) headers['Content-Type'] = 'application/json';
  if (csrfToken) headers['x-csrf-token'] = csrfToken;
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  return headers;
};

export async function fetchCsrfToken() {
  const resp = await fetch(`${BASE_URL}/api/csrf-token`, {
    method: 'GET',
    credentials: 'include',
  });
  const data = await resp.json();
  if (data?.csrfToken) setCsrfToken(data.csrfToken);
  return data?.csrfToken || null;
}

export async function login(email, mot_de_passe) {
  const resp = await fetch(`${BASE_URL}/api/utilisateurs/login`, {
    method: 'POST',
    credentials: 'include',
    headers: buildHeaders(true),
    body: JSON.stringify({ email, mot_de_passe }),
  });
  if (!resp.ok) {
    const err = await safeJson(resp);
    throw new Error(err?.message || 'Échec de la connexion');
  }
  const data = await safeJson(resp);
  // Store token as a fallback to cookie-based auth
  const token = data?.data?.token || data?.token;
  if (token) setAccessToken(token);
  return data;
}

export async function logout() {
  const resp = await fetch(`${BASE_URL}/api/utilisateurs/logout`, {
    method: 'POST',
    credentials: 'include',
    headers: buildHeaders(true),
  });
  if (!resp.ok) {
    const err = await safeJson(resp);
    throw new Error(err?.message || 'Échec de la déconnexion');
  }
  const data = await safeJson(resp);
  // Clear in-memory token
  setAccessToken(null);
  return data;
}

export async function getMe() {
  const resp = await fetch(`${BASE_URL}/api/utilisateurs/me`, {
    method: 'GET',
    credentials: 'include',
    headers: buildHeaders(false),
  });
  if (resp.status === 401) return null;
  const json = await safeJson(resp);
  if (!resp.ok) {
    throw new Error(json?.message || 'Impossible de récupérer le profil');
  }
  return json?.data ?? null;
}

async function safeJson(resp) {
  try {
    return await resp.json();
  } catch {
    return null;
  }
}