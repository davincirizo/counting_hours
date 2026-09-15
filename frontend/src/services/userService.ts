import { API_URL } from "../config/api";

export async function getCurrentUser() {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("No se pudo obtener el usuario");
  }

  return response.json();
}