import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";

type WeekSettingsDialogProps = {
  open: boolean;
  weekStartDay: number;
  saving: boolean;
  onClose: () => void;
  onChange: (day: number) => Promise<void>;
};

export default function WeekSettingsDialog({
  open,
  weekStartDay,
  saving,
  onClose,
  onChange,
}: WeekSettingsDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>
        Configuración de semanas
      </DialogTitle>

      <DialogContent>
        <Typography
          sx={{
            color: "text.secondary",
            mb: 2,
          }}
        >
          Selecciona el día en que comienza tu semana de trabajo.
        </Typography>

        <FormControl fullWidth>
          <InputLabel id="week-start-label">
            Inicio de semana
          </InputLabel>

          <Select
            labelId="week-start-label"
            value={weekStartDay}
            label="Inicio de semana"
            disabled={saving}
            onChange={(event) =>
              onChange(Number(event.target.value))
            }
          >
            <MenuItem value={0}>Lunes</MenuItem>
            <MenuItem value={1}>Martes</MenuItem>
            <MenuItem value={2}>Miércoles</MenuItem>
            <MenuItem value={3}>Jueves</MenuItem>
            <MenuItem value={4}>Viernes</MenuItem>
            <MenuItem value={5}>Sábado</MenuItem>
            <MenuItem value={6}>Domingo</MenuItem>
          </Select>
        </FormControl>

        {saving && (
          <Typography
            sx={{
              mt: 1,
              fontSize: "0.85rem",
              color: "text.secondary",
            }}
          >
            Guardando...
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onClose}
          disabled={saving}
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}