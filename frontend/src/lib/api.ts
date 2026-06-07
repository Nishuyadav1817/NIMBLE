const API_URL = import.meta.env.VITE_API_URL;

export async function apiGet(path: string) {
  const res = await fetch(`${API_URL}${path}`);
  return res.json();
}