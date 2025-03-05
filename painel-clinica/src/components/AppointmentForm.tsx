import { useEffect, useState } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, MenuItem, Box } from "@mui/material";
import { createAppointment, updateAppointment } from "../services/appointmentService";
import { getTherapists } from "../services/threapistService";
import { getClients } from "../services/clientsService";

interface AppointmentFormProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  appointment?: any;
}

const AppointmentForm = ({ open, onClose, onSave, appointment }: AppointmentFormProps) => {
  const [therapists, setTherapists] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    clientId: "",
    therapistId: "",
    date: new Date().toISOString().split('T')[0], // Formato YYYY-MM-DD
    startTime: "",
    endTime: "",
    notes: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const therapistsData = await getTherapists();
        const clientsData = await getClients();
        setTherapists(therapistsData);
        setClients(clientsData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    };

    fetchData();

    if (appointment) {
      // Formatar a data se ela existir
      const appointmentDate = appointment.date 
        ? new Date(appointment.date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
        
      setFormData({
        clientId: appointment.clientId || "",
        therapistId: appointment.therapistId || "",
        date: appointmentDate,
        startTime: appointment.startTime || "",
        endTime: appointment.endTime || "",
        notes: appointment.notes || ""
      });
    }
  }, [appointment]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (appointment) {
        await updateAppointment(appointment.id, formData);
      } else {
        await createAppointment(formData);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar agendamento:", error);
    }
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

        <Box sx={{ mt: 2, mb: 1 }}>
          <TextField
            fullWidth
            margin="normal"
            label="Data do Agendamento"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />
        </Box>

        <TextField 
          fullWidth 
          margin="normal" 
          label="Hora Inicial" 
          name="startTime" 
          type="time" 
          value={formData.startTime} 
          onChange={handleChange} 
          InputLabelProps={{ shrink: true }} 
        />
        
        <TextField 
          fullWidth 
          margin="normal" 
          label="Hora Final" 
          name="endTime" 
          type="time" 
          value={formData.endTime} 
          onChange={handleChange} 
          InputLabelProps={{ shrink: true }} 
        />
        
        <TextField
          fullWidth
          margin="normal"
          label="Observações"
          name="notes"
          multiline
          rows={3}
          value={formData.notes}
          onChange={handleChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancelar</Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">Salvar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AppointmentForm;