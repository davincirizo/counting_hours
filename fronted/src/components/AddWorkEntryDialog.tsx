import { useState } from "react";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";

type AddWorkEntryDialogProps = {
  open: boolean;
  onClose: () => void;
  onSave: (
    workDate: string,
    startTime: string,
    endTime: string
  ) => Promise<void>;
};

export default function AddWorkEntryDialog({
  open,
  onClose,
  onSave,
}: AddWorkEntryDialogProps) {
  const [workDate, setWorkDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!workDate || !startTime || !endTime) {
      return;
    }

    try {
      setSaving(true);

      await onSave(
        workDate,
        startTime,
        endTime
      );

      // Limpiamos el formulario después de guardar
      setWorkDate("");
      setStartTime("");
      setEndTime("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        Añadir registro
      </DialogTitle>

      <DialogContent>
        {/* FECHA */}
        <TextField
          label="Fecha"
          type="date"
          value={workDate}
          onChange={(event) =>
            setWorkDate(event.target.value)
          }
          fullWidth
          margin="normal"
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
        />

        {/* HORA DE ENTRADA */}
        <TextField
          label="Hora de entrada"
          type="time"
          value={startTime}
          onChange={(event) =>
            setStartTime(event.target.value)
          }
          fullWidth
          margin="normal"
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
        />

        {/* HORA DE SALIDA */}
        <TextField
          label="Hora de salida"
          type="time"
          value={endTime}
          onChange={(event) =>
            setEndTime(event.target.value)
          }
          fullWidth
          margin="normal"
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
        />
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onClose}
          disabled={saving}
        >
          Cancelar
        </Button>

        <Button
          variant="contained"
          onClick={handleSave}
          disabled={
            saving ||
            !workDate ||
            !startTime ||
            !endTime
          }
        >
          {saving ? "Guardando..." : "Añadir"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}