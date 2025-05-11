import { useEffect, useState, useContext } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, MenuItem, Box, Typography } from "@mui/material";
import { createAppointment, updateAppointment } from "../services/appointmentService";
import { getTherapists } from "../services/threapistService";
import { getClients } from "../services/clientsService";
import { getServices, Service } from "../services/serviceService";
import { getAvailableSlots } from "../services/availabilityService";
import BranchSelector from "./BranchSelector";
import { BranchContext } from "../context/BranchContext";

interface Appointment {
  id: string;
  clientId: string;
  therapistId: string;
  serviceId?: string;
  date: string | Date;
  startTime: string;
  endTime: string;
  notes?: string;
  branchId?: string;
}

interface AppointmentFormProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  appointment?: Appointment;
}

interface Therapist {
  id: string;
  name: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
}

const AppointmentForm = ({ open, onClose, onSave, appointment }: AppointmentFormProps) => {
  const branchContext = useContext(BranchContext);
  const [services, setServices] = useState<Service[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    clientId: "",
    serviceId: "",
    therapistId: "",
    date: new Date().toISOString().split('T')[0],
    startTime: "",
    endTime: "",
    notes: "",
    branchId: branchContext?.currentBranch?.id || ""
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const servicesData = await getServices();
        setServices(servicesData);
        const clientsData = await getClients();
        setClients(clientsData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (formData.serviceId) {
      const fetchTherapists = async () => {
        try {
          const data = await getTherapists(formData.serviceId);
          setTherapists(data);
        } catch (error) {
          console.error("Erro ao carregar terapeutas:", error);
          setTherapists([]);
        }
      };
      
      fetchTherapists();
    } else {
      setTherapists([]);
    }
    setFormData((prev) => ({ ...prev, therapistId: "" }));
  }, [formData.serviceId, formData.branchId]);

  useEffect(() => {
    if (formData.therapistId && formData.serviceId && formData.date) {
      getAvailableSlots(
        [formData.serviceId], 
        formData.therapistId, 
        formData.date,
        formData.branchId
      ).then(setAvailableSlots);
    } else {
      setAvailableSlots([]);
    }
    setFormData((prev) => ({ ...prev, startTime: "", endTime: "" }));
  }, [formData.therapistId, formData.serviceId, formData.date, formData.branchId]);

  useEffect(() => {
    if (appointment) {
      const appointmentDate = appointment.date 
        ? (typeof appointment.date === 'string' 
            ? appointment.date 
            : new Date(appointment.date).toISOString().split('T')[0])
        : new Date().toISOString().split('T')[0];
      setFormData({
        clientId: appointment.clientId || "",
        serviceId: appointment.serviceId || "",
        therapistId: appointment.therapistId || "",
        date: appointmentDate,
        startTime: appointment.startTime || "",
        endTime: appointment.endTime || "",
        notes: appointment.notes || "",
        branchId: appointment.branchId || branchContext?.currentBranch?.id || ""
      });
    } else if (branchContext?.currentBranch?.id) {
      setFormData(prev => ({
        ...prev,
        branchId: branchContext.currentBranch?.id || ""
      }));
    }
  }, [appointment, branchContext?.currentBranch?.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBranchChange = (branchId: string | null) => {
    setFormData({ ...formData, branchId: branchId || "" });
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
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Selecione a filial para o atendimento
          </Typography>
          <BranchSelector
            value={formData.branchId}
            onChange={handleBranchChange}
            showAllOption={false}
          />
        </Box>

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
          label="Serviço"
          name="serviceId"
          value={formData.serviceId}
          onChange={handleChange}
        >
          {services.map((service) => (
            <MenuItem key={service.id} value={service.id}>
              {service.name} - R$ {service.price.toFixed(2)}
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
          disabled={!formData.serviceId || !formData.branchId}
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
          select
          fullWidth 
          margin="normal" 
          label="Hora Inicial" 
          name="startTime" 
          value={formData.startTime} 
          onChange={handleChange} 
          InputLabelProps={{ shrink: true }} 
          disabled={!formData.therapistId || !formData.serviceId || !formData.date || !formData.branchId}
        >
          {availableSlots.map((slot) => (
            <MenuItem key={slot} value={slot}>{slot}</MenuItem>
          ))}
        </TextField>
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