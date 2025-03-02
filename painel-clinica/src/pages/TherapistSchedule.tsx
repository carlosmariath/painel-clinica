import { useEffect, useState } from "react";
import { Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, IconButton, MenuItem, TextField } from "@mui/material";
import { getTherapistSchedule, updateTherapistSchedule } from "../services/threapistService";
import { useNotification } from "../components/Notification";
import SaveIcon from "@mui/icons-material/Save";

const daysOfWeek = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda-feira" },
  { value: 2, label: "Terça-feira" },
  { value: 3, label: "Quarta-feira" },
  { value: 4, label: "Quinta-feira" },
  { value: 5, label: "Sexta-feira" },
  { value: 6, label: "Sábado" },
];
interface ScheduleItem {
    id?: string; // Opcional, pois pode ser gerado pelo backend
    dayOfWeek: number; // 0 = Domingo, 1 = Segunda...
    startTime: string; // Formato "HH:mm"
    endTime: string; // Formato "HH:mm"
  }
const TherapistSchedule = () => {
  const { showNotification } = useNotification();
  const [schedule, setSchedule] = useState<{ id: number; dayOfWeek: number; startTime: string; endTime: string }[]>([]);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const data = await getTherapistSchedule();
        setSchedule(data);
      } catch {
        showNotification("Erro ao carregar horários.", "error");
      }
    };

    fetchSchedule();
  }, []);

  const handleChange = (index: number, field: keyof ScheduleItem, value: string | number) => {
    setSchedule((prevSchedule) => {
      const updatedSchedule = [...prevSchedule];
      updatedSchedule[index] = {
        ...updatedSchedule[index],
        [field]: value,
      };
      return updatedSchedule;
    });
  };

  const handleSave = async () => {
    try {
      await updateTherapistSchedule(schedule);
      showNotification("Horário salvo com sucesso!", "success");
    } catch {
      showNotification("Erro ao salvar horário.", "error");
    }
  };

  return (
    <Container>
      <Typography variant="h4" sx={{ mb: 3 }}>🕒 Configuração de Disponibilidade</Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Dia da Semana</TableCell>
              <TableCell>Hora Inicial</TableCell>
              <TableCell>Hora Final</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {schedule.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell>
                  <TextField select value={item.dayOfWeek} onChange={(e) => handleChange(index, "dayOfWeek", e.target.value)}>
                    {daysOfWeek.map((day) => (
                      <MenuItem key={day.value} value={day.value}>{day.label}</MenuItem>
                    ))}
                  </TextField>
                </TableCell>
                <TableCell>
                  <TextField type="time" value={item.startTime} onChange={(e) => handleChange(index, "startTime", e.target.value)} />
                </TableCell>
                <TableCell>
                  <TextField type="time" value={item.endTime} onChange={(e) => handleChange(index, "endTime", e.target.value)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Button onClick={handleSave} variant="contained" sx={{ mt: 2 }} startIcon={<SaveIcon />}>
        Salvar Horários
      </Button>
    </Container>
  );
};

export default TherapistSchedule;