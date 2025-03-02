import { useEffect, useState } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, MenuItem } from "@mui/material";
import { createAppointment, updateAppointment } from "../services/appointmentService";
import { getTherapists } from "../services/threapistService";
import { getClients } from "../services/clientsService";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";

interface AppointmentFormProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  appointment?: any;
}

const AppointmentForm = ({ open, onClose, onSave, appointment }: AppointmentFormProps) => {
  const [therapists, setTherapists] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [formData, setFormData] = useState({
    clientId: "",
    therapistId: "",
    startTime: "",
    endTime: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      const therapistsData = await getTherapists();
      const clientsData = await getClients();
      setTherapists(therapistsData);
      setClients(clientsData);
    };

    fetchData();

    if (appointment) {
      setFormData({
        clientId: appointment.client?.id || "",
        therapistId: appointment.therapist?.id || "",
        startTime: appointment.startTime,
        endTime: appointment.endTime,
      });
      setSelectedDate(dayjs(appointment.date));
    }
  }, [appointment]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const appointmentData = {
      ...formData,
      date: selectedDate ? selectedDate.format("YYYY-MM-DD") : "",
    };

    if (appointment) {
      await updateAppointment(appointment.id, appointmentData);
    } else {
      await createAppointment(appointmentData);
    }
    onSave();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{appointment ? "Editar Agendamento" : "Novo Agendamento"}</DialogTitle>
      <DialogContent>
        <TextField
          select
          fullWidth
          margin="normal"
          label="Cliente"
          name="clientId"
          value={formData.clientId}
          onChange={handleChange}
        >
          {clients.map((client) => (
            <MenuItem key={client.id} value={client.id}>
              {client.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          fullWidth
          margin="normal"
          label="Terapeuta"
          name="therapistId"
          value={formData.therapistId}
          onChange={handleChange}
        >
          {therapists.map((therapist) => (
            <MenuItem key={therapist.id} value={therapist.id}>
              {therapist.name}
            </MenuItem>
          ))}
        </TextField>

        {/* 🔹 Calendário para selecionar a data */}
        <DatePicker
          label="Data do Agendamento"
          value={selectedDate}
          onChange={(newValue) => setSelectedDate(newValue)}
          format="DD/MM/YYYY"
        />

        <TextField fullWidth margin="normal" label="Hora Inicial" name="startTime" type="time" value={formData.startTime} onChange={handleChange} />
        <TextField fullWidth margin="normal" label="Hora Final" name="endTime" type="time" value={formData.endTime} onChange={handleChange} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancelar</Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">Salvar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AppointmentForm;