import { useState } from "react";

import {
  Box,
  Collapse,
  Divider,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

import WorkEntryCard from "./WorkEntryCard";

import type { WorkEntry } from "../types/work";


type WeekGroupProps = {
  startDate: string;
  endDate: string;
  entries: WorkEntry[];

  onEdit: (entry: WorkEntry) => void;
  onDelete: (entryId: number) => void;
};


type DayGroup = {
  date: string;
  entries: WorkEntry[];
  totalMinutes: number;
};


export default function WeekGroup({
  startDate,
  endDate,
  entries,
  onEdit,
  onDelete,
}: WeekGroupProps) {
  const [open, setOpen] = useState(false);


  /*
   * TOTAL DE TODA LA SEMANA
   */
  const totalMinutes = entries.reduce(
    (total, entry) =>
      total + (entry.total_minutes ?? 0),
    0
  );

  const weekTotal = formatMinutes(totalMinutes);


  /*
   * AGRUPAR REGISTROS POR DÍA
   */
  const days = groupByDay(entries);


  return (
    <Paper
      variant="outlined"
      sx={{
        width: "100%",
        overflow: "hidden",
        borderRadius: 2,
      }}
    >

      {/* CABECERA DE LA SEMANA */}
      <Box
        onClick={() => setOpen(!open)}
        sx={{
          display: "grid",
          gridTemplateColumns:
            "auto minmax(0, 1fr) auto",

          alignItems: "center",
          gap: 1,
          p: 1.5,
          cursor: "pointer",
        }}
      >
        <IconButton
          size="small"
          onClick={(event) => {
            event.stopPropagation();
            setOpen(!open);
          }}
        >
          {open ? (
            <KeyboardArrowDownIcon />
          ) : (
            <KeyboardArrowRightIcon />
          )}
        </IconButton>

        <Typography
          sx={{
            fontWeight: 600,
            minWidth: 0,
          }}
        >
          {formatShortDate(startDate)}
          {" → "}
          {formatShortDate(endDate)}
        </Typography>

        <Typography
          sx={{
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          {weekTotal}
        </Typography>
      </Box>


      {/* CONTENIDO DE LA SEMANA */}
      <Collapse in={open}>
        <Box
          sx={{
            px: 2,
            pb: 2,
          }}
        >
          {days.map((day, index) => (
            <Box
              key={day.date}
              sx={{
                mt: index === 0 ? 1 : 3,
              }}
            >

              {/* CABECERA DEL DÍA */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 2,
                  mb: 1,
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 600,
                  }}
                >
                  {formatDayName(day.date)}
                </Typography>

                <Typography
                  sx={{
                    color: "text.secondary",
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatMinutes(day.totalMinutes)}
                </Typography>
              </Box>

              <Divider
                sx={{
                  mb: 1,
                }}
              />


              {/* REGISTROS DEL DÍA */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                {day.entries.map((entry) => (
                  <WorkEntryCard
                    key={entry.id}
                    entry={entry}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </Box>

            </Box>
          ))}
        </Box>
      </Collapse>

    </Paper>
  );
}


/*
 * AGRUPAR POR DÍA
 */
function groupByDay(
  entries: WorkEntry[]
): DayGroup[] {
  const groups: Record<string, WorkEntry[]> = {};

  for (const entry of entries) {
    if (!groups[entry.work_date]) {
      groups[entry.work_date] = [];
    }

    groups[entry.work_date].push(entry);
  }


  return Object.entries(groups)
    .map(([date, dayEntries]) => {
      const totalMinutes = dayEntries.reduce(
        (total, entry) =>
          total + (entry.total_minutes ?? 0),
        0
      );

      /*
       * También ordenamos los turnos
       * por hora de entrada.
       */
      dayEntries.sort((a, b) =>
        a.start_time.localeCompare(b.start_time)
      );

      return {
        date,
        entries: dayEntries,
        totalMinutes,
      };
    })
    .sort((a, b) =>
      a.date.localeCompare(b.date)
    );
}


/*
 * FORMATEAR MINUTOS
 *
 * 557 -> "9 h 17 min"
 */
function formatMinutes(
  totalMinutes: number
): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours} h ${minutes} min`;
}


/*
 * NOMBRE DEL DÍA + FECHA
 *
 * 2026-09-14
 * ->
 * Lunes 14 de septiembre
 */
function formatDayName(
  dateString: string
): string {
  const [year, month, day] = dateString
    .split("-")
    .map(Number);

  const date = new Date(
    year,
    month - 1,
    day
  );

  const formatted = new Intl.DateTimeFormat(
    "es-US",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
    }
  ).format(date);

  return (
    formatted.charAt(0).toUpperCase() +
    formatted.slice(1)
  );
}


/*
 * FECHA CORTA PARA CABECERA
 *
 * 2026-09-12 -> Sep 12
 */
function formatShortDate(
  dateString: string
): string {
  const [year, month, day] = dateString
    .split("-")
    .map(Number);

  const date = new Date(
    year,
    month - 1,
    day
  );

  return new Intl.DateTimeFormat(
    "es-US",
    {
      month: "short",
      day: "numeric",
    }
  ).format(date);
}