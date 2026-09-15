import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import SettingsIcon from "@mui/icons-material/Settings";

import EditWorkEntryDialog from "../components/EditWorkEntryDialog";
import AddWorkEntryDialog from "../components/AddWorkEntryDialog";
import WeekSettingsDialog from "../components/WeekSettingsDialog";
import WeekGroup from "../components/WeekGroup";

import { getCurrentUser } from "../services/userService";

import {
  deleteWorkEntry,
  getWorkHistory,
  updateWorkEntry,
  createManualEntry,
  updateWeekSettings,
} from "../services/workService";

import type { WorkEntry } from "../types/work";


type WeekGroupData = {
  startDate: string;
  endDate: string;
  entries: WorkEntry[];
};


export default function Weeks() {
  const navigate = useNavigate();

  const [weeks, setWeeks] = useState<WeekGroupData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingEntry, setEditingEntry] =
    useState<WorkEntry | null>(null);

  const [addDialogOpen, setAddDialogOpen] =
    useState(false);

  const [weekStartDay, setWeekStartDay] =
    useState<number>(0);

  const [settingsOpen, setSettingsOpen] =
    useState(false);

  const [savingSettings, setSavingSettings] =
    useState(false);


  /*
   * Convierte YYYY-MM-DD a Date
   */
  function parseDate(dateString: string): Date {
    const [year, month, day] = dateString
      .split("-")
      .map(Number);

    return new Date(year, month - 1, day);
  }


  /*
   * Convierte Date a YYYY-MM-DD
   */
  function formatDate(date: Date): string {
    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }


  /*
   * Obtiene el inicio de semana.
   *
   * Backend:
   *
   * 0 = lunes
   * 1 = martes
   * 2 = miércoles
   * 3 = jueves
   * 4 = viernes
   * 5 = sábado
   * 6 = domingo
   */
  function getWeekStart(
    date: Date,
    weekStartDay: number
  ): Date {
    /*
     * JavaScript:
     *
     * 0 = domingo
     * 1 = lunes
     * 2 = martes
     * ...
     * 6 = sábado
     */

    const jsWeekStartDay =
      (Number(weekStartDay) + 1) % 7;

    const currentDay = date.getDay();

    const difference =
      (currentDay - jsWeekStartDay + 7) % 7;

    const start = new Date(date);

    start.setDate(
      start.getDate() - difference
    );

    return start;
  }


  /*
   * Agrupa registros por semana
   */
  function groupEntriesByWeek(
    entries: WorkEntry[],
    weekStartDay: number
  ): WeekGroupData[] {
    const groups: Record<string, WorkEntry[]> = {};

    for (const entry of entries) {
      const date = parseDate(entry.work_date);

      const weekStart = getWeekStart(
        date,
        weekStartDay
      );

      const startDate = formatDate(weekStart);

      if (!groups[startDate]) {
        groups[startDate] = [];
      }

      groups[startDate].push(entry);
    }


    return Object.entries(groups)
      .map(([startDate, weekEntries]) => {
        const start = parseDate(startDate);

        const end = new Date(start);

        end.setDate(
          end.getDate() + 6
        );

        return {
          startDate,
          endDate: formatDate(end),
          entries: weekEntries,
        };
      })

      /*
       * Semanas anteriores primero.
       */
      .sort((a, b) =>
        a.startDate.localeCompare(
          b.startDate
        )
      );
  }


  /*
   * Cargar usuario + historial
   */
  async function loadWeeks() {
    try {
      setLoading(true);
      setError("");

      const [user, history] =
        await Promise.all([
          getCurrentUser(),
          getWorkHistory(),
        ]);

      setWeekStartDay(
        user.week_start_day
      );

      const groupedWeeks =
        groupEntriesByWeek(
          history,
          user.week_start_day
        );

      setWeeks(groupedWeeks);

    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "No se pudieron cargar las semanas"
        );
      }
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadWeeks();
  }, []);


  /*
   * CAMBIAR INICIO DE SEMANA
   */
  async function handleWeekStartChange(
    newDay: number
  ) {
    try {
      setSavingSettings(true);
      setError("");

      await updateWeekSettings(newDay);

      setWeekStartDay(newDay);

      /*
       * Reagrupa todas las semanas
       * utilizando la nueva configuración.
       */
      await loadWeeks();

    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setSavingSettings(false);
    }
  }


  /*
   * EDITAR
   */
  function handleEdit(
    entry: WorkEntry
  ) {
    setEditingEntry(entry);
  }


  /*
   * GUARDAR EDICIÓN
   */
  async function handleSaveEdit(
    entryId: number,
    startTime: string,
    endTime: string
  ) {
    try {
      setError("");

      await updateWorkEntry(
        entryId,
        {
          start_time: startTime,
          end_time:
            endTime || undefined,
        }
      );

      setEditingEntry(null);

      await loadWeeks();

    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    }
  }


  /*
   * AÑADIR REGISTRO MANUAL
   */
  async function handleAddEntry(
    workDate: string,
    startTime: string,
    endTime: string
  ) {
    try {
      setError("");

      await createManualEntry({
        work_date: workDate,
        start_time: startTime,
        end_time: endTime,
      });

      setAddDialogOpen(false);

      await loadWeeks();

    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }

      throw error;
    }
  }


  /*
   * ELIMINAR
   */
  async function handleDelete(
    entryId: number
  ) {
    const confirmed =
      window.confirm(
        "¿Seguro que quieres eliminar este registro?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteWorkEntry(
        entryId
      );

      await loadWeeks();

    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    }
  }


  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1000,
        mx: "auto",

        p: {
          xs: 2,
          sm: 3,
        },

        boxSizing: "border-box",
      }}
    >

      {/* CABECERA */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          mb: 3,
        }}
      >
        {/* VOLVER */}
        <Button
          startIcon={
            <ArrowBackIcon />
          }
          onClick={() =>
            navigate("/dashboard")
          }
        >
          Volver
        </Button>


        {/* TÍTULO */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            ml: 1,
          }}
        >
          Semanas
        </Typography>


        {/* CONFIGURACIÓN */}
        <IconButton
          aria-label="Configuración de semanas"
          onClick={() =>
            setSettingsOpen(true)
          }
          sx={{
            ml: "auto",
          }}
        >
          <SettingsIcon />
        </IconButton>
      </Box>


      {/* AÑADIR REGISTRO */}
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() =>
          setAddDialogOpen(true)
        }
      >
        Añadir registro
      </Button>


      {/* CARGANDO */}
      {loading && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mt: 3,
          }}
        >
          <CircularProgress
            size={24}
          />

          <Typography>
            Cargando semanas...
          </Typography>
        </Box>
      )}


      {/* ERROR */}
      {!loading && error && (
        <Alert
          severity="error"
          sx={{
            mt: 3,
          }}
        >
          {error}
        </Alert>
      )}


      {/* SIN REGISTROS */}
      {!loading &&
        !error &&
        weeks.length === 0 && (
          <Typography
            sx={{
              mt: 3,
              color:
                "text.secondary",
            }}
          >
            No hay registros todavía.
          </Typography>
        )}


      {/* SEMANAS */}
      {!loading &&
        !error &&
        weeks.length > 0 && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
              mt: 3,
            }}
          >
            {weeks.map(
              (week) => (
                <WeekGroup
                  key={
                    week.startDate
                  }
                  startDate={
                    week.startDate
                  }
                  endDate={
                    week.endDate
                  }
                  entries={
                    week.entries
                  }
                  onEdit={
                    handleEdit
                  }
                  onDelete={
                    handleDelete
                  }
                />
              )
            )}
          </Box>
        )}


      {/* EDITAR REGISTRO */}
      <EditWorkEntryDialog
        open={
          editingEntry !== null
        }
        entry={editingEntry}
        onClose={() =>
          setEditingEntry(null)
        }
        onSave={
          handleSaveEdit
        }
      />


      {/* AÑADIR REGISTRO */}
      <AddWorkEntryDialog
        open={addDialogOpen}
        onClose={() =>
          setAddDialogOpen(false)
        }
        onSave={
          handleAddEntry
        }
      />


      {/* CONFIGURACIÓN DE SEMANA */}
      <WeekSettingsDialog
        open={settingsOpen}
        weekStartDay={
          weekStartDay
        }
        saving={
          savingSettings
        }
        onClose={() =>
          setSettingsOpen(false)
        }
        onChange={
          handleWeekStartChange
        }
      />

    </Box>
  );
}