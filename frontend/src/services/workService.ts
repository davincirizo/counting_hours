import { API_URL } from "../config/api";
import type {UpdateWorkEntryData} from "../types/work"
import type { WorkHistoryData } from "../types/work";

function getAuthHeaders() {
  const token = localStorage.getItem("access_token");

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function checkIn() {
  const response = await fetch(`${API_URL}/work/check-in`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Error al registrar entrada");
  }

  return response.json();
}

export async function checkOut() {
  const response = await fetch(`${API_URL}/work/check-out`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Error al registrar salida");
  }

  return response.json();
}

export async function getTodayEntries() {
  const response = await fetch(`${API_URL}/work/today`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("No se pudieron obtener los registros de hoy");
  }

  return response.json();
}

export async function updateWorkEntry(
  entryId: number,
  data: UpdateWorkEntryData
) {
  const response = await fetch(`${API_URL}/work/${entryId}`, {
    method: "PATCH",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail || "No se pudo modificar el registro"
    );
  }

  return response.json();
}

export async function deleteWorkEntry(entryId: number) {
  const response = await fetch(`${API_URL}/work/${entryId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail || "No se pudo eliminar el registro"
    );
  }

  return response.json();
}

export async function getCurrentWeek() {
  const response = await fetch(`${API_URL}/work/week`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(
      "No se pudo obtener el resumen semanal"
    );
  }

  return response.json();
}

export async function getWorkHistory(): Promise<WorkHistoryData> {
  const response = await fetch(
    `${API_URL}/work/history/all`,
    {
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(
      "No se pudo obtener el historial"
    );
  }

  return response.json();
}

export type CreateManualEntryData = {
  work_date: string;
  start_time: string;
  end_time: string;
};

export async function createManualEntry(
  data: CreateManualEntryData
) {
  const response = await fetch(`${API_URL}/work/manual`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail || "No se pudo crear el registro"
    );
  }

  return response.json();
}

export async function updateWeekSettings(
  weekStartDay: number
) {
  const response = await fetch(
    `${API_URL}/users/week-settings`,
    {
      method: "PUT",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        week_start_day: weekStartDay,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail ||
        "No se pudo actualizar el inicio de semana"
    );
  }

  return response.json();
}