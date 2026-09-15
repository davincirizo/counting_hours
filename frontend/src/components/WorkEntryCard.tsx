import {
  Box,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import type { WorkEntry } from "../types/work";

type WorkEntryCardProps = {
  entry: WorkEntry;
  onEdit: (entry: WorkEntry) => void;
  onDelete: (entryId: number) => void;
};

export default function WorkEntryCard({
  entry,
  onEdit,
  onDelete,
}: WorkEntryCardProps) {
  const total =
    entry.total_minutes !== null
      ? `${Math.floor(entry.total_minutes / 60)} h ${
          entry.total_minutes % 60
        } min`
      : "En curso";

return (
  <Paper
    variant="outlined"
    sx={{
      width: "100%",
      minWidth: 0,
      maxWidth: "100%",
      boxSizing: "border-box",
      p: 1.5,
      borderRadius: 2,
      overflowX: "auto",
    }}
  >
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        flexWrap: "nowrap",
        gap: 2,
        minWidth: "max-content",
      }}
    >
      {/* Entrada / salida */}
      <Typography sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
        {entry.start_time.slice(0, 5)}
        {" → "}
        {entry.end_time ? entry.end_time.slice(0, 5) : "En curso"}
      </Typography>

      {/* Duración */}
      <Typography
        sx={{
          color: "text.secondary",
          whiteSpace: "nowrap",
          ml: "auto",
        }}
      >
        {total}
      </Typography>

      {/* Botones */}
      <Box sx={{ display: "flex", flexShrink: 0, gap: 0.5 }}>
        <Tooltip title="Editar">
          <IconButton
            size="small"
            aria-label="Editar registro"
            onClick={() => onEdit(entry)}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Eliminar">
          <IconButton
            size="small"
            aria-label="Eliminar registro"
            onClick={() => onDelete(entry.id)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  </Paper>
);
}