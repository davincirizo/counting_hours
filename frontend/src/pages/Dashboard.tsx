import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getCurrentUser } from "../services/userService";
import {
  checkIn,
  checkOut,
  getTodayEntries,
  updateWorkEntry,
  deleteWorkEntry,
  getCurrentWeek,
} from "../services/workService";

import type { TodayData, WorkEntry, WeekData } from "../types/work";
import type { User } from "../types/user";

import EditWorkEntryDialog from "../components/EditWorkEntryDialog";
import WorkEntryCard from "../components/WorkEntryCard";

import "./Dashboard.css";


export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState("");
  const [workLoading, setWorkLoading] = useState(false);
  const [todayData, setTodayData] = useState<TodayData | null>(null);
  const [editingEntry, setEditingEntry] = useState<WorkEntry | null>(null);
  const [weekData, setWeekData] =
    useState<WeekData | null>(null);

  const navigate = useNavigate();

  async function loadWeek() {
    try {
      const data = await getCurrentWeek();
      setWeekData(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function loadToday() {
    try {
      const data = await getTodayEntries();
      setTodayData(data);
    } catch (error) {
      console.error(error);
    }
  }


  async function handleCheckIn() {
    setMessage("");
    setWorkLoading(true);

    try {
      await checkIn();

      setMessage("Entrada registrada correctamente");

      await loadToday();
      await loadWeek();
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message);
      }
    } finally {
      setWorkLoading(false);
    }
  }


  async function handleCheckOut() {
    setMessage("");
    setWorkLoading(true);

    try {
      const data = await checkOut();

      setMessage(
        `Salida registrada. Total: ${data.total}`
      );

      await loadToday();
      await loadWeek();
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message);
      }
    } finally {
      setWorkLoading(false);
    }
  }


  function handleEdit(entry: WorkEntry) {
    setEditingEntry(entry);
  }


  async function handleSaveEdit(
    entryId: number,
    startTime: string,
    endTime: string
  ) {
    try {
      await updateWorkEntry(entryId, {
        start_time: startTime,
        end_time: endTime || undefined,
      });

      setEditingEntry(null);

      setMessage(
        "Registro actualizado correctamente"
      );

      await loadToday();
      await loadWeek();
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message);
      }
    }
  }


  async function handleDelete(entryId: number) {
    const confirmed = window.confirm(
      "¿Seguro que quieres eliminar este registro?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteWorkEntry(entryId);

      setMessage("Registro eliminado");

      await loadToday();
      await loadWeek();
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message);
      }
    }
  }


  useEffect(() => {
    async function loadDashboard() {
      try {
        const data = await getCurrentUser();

        setUser(data);

        await loadToday();
      } catch {
        localStorage.removeItem("access_token");
        navigate("/");
      }
    }

    loadDashboard();
    loadWeek();
  }, [navigate]);


  function logout() {
    localStorage.removeItem("access_token");
    navigate("/");
  }


  return (
    <main className="dashboard-page">
      <section className="dashboard-card">
        {weekData && (
          <div className="week-summary">
            <h3>Semana actual</h3>
            <button
              onClick={() => navigate("/weeks")}
            >
              Ver semanas
            </button>
            <p>
              {weekData.week_start} → {weekData.week_end}
            </p>

            <strong>
              Total trabajado: {weekData.total}
            </strong>
          </div>
        )}
        <h1>WorkHours</h1>

        {user ? (
          <>
            <h2>Hola, {user.username}</h2>
            <p>{user.email}</p>

            <div className="work-actions">
              <button
                onClick={handleCheckIn}
                disabled={workLoading}
              >
                Marcar entrada
              </button>

              <button
                onClick={handleCheckOut}
                disabled={workLoading}
              >
                Marcar salida
              </button>
            </div>

            {todayData && (
              <div className="today-section">
                <h3>Hoy</h3>

                {todayData.entries.length === 0 ? (
                  <p>
                    No hay horas registradas hoy.
                  </p>
                ) : (
                  <div className="today-entries">
                    {todayData.entries.map((entry) => (
                      <WorkEntryCard
                        key={entry.id}
                        entry={entry}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                )}

                <div className="today-total">
                  <span>Total de hoy</span>
                  <strong>
                    {todayData.total}
                  </strong>
                </div>
              </div>
            )}

            {message && (
              <p className="work-message">
                {message}
              </p>
            )}

            <button onClick={logout}>
              Cerrar sesión
            </button>
          </>
        ) : (
          <p>Cargando...</p>
        )}
      </section>

      <EditWorkEntryDialog
        open={editingEntry !== null}
        entry={editingEntry}
        onClose={() => setEditingEntry(null)}
        onSave={handleSaveEdit}
      />
    </main>
  );
}