import { useEffect, useState } from "react";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";

import type { WorkEntry } from "../types/work";

type EditWorkEntryDialogProps = {
  open: boolean;
  entry: WorkEntry | null;
  onClose: () => void;
  onSave: (
    entryId: number,
    startTime: string,
    endTime: string
  ) => Promise<void>;
};

export default function EditWorkEntryDialog({
  open,
  entry,
  onClose,
  onSave,
}: EditWorkEntryDialogProps) {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  useEffect(() => {
    if (entry) {
      setStartTime(entry.start_time.slice(0, 5));

      setEndTime(
        entry.end_time
          ? entry.end_time.slice(0, 5)
          : ""
      );
    }
  }, [entry]);

  async function handleSave() {
    if (!entry) return;

    await onSave(
      entry.id,
      startTime,
      endTime
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        Editar registro
      </DialogTitle>

      <DialogContent>
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
        <Button onClick={onClose}>
          Cancelar
        </Button>

        <Button
          variant="contained"
          onClick={handleSave}
        >
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}