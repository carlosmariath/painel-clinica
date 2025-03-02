import { useEffect, useState } from "react";
import { Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Tabs, Tab, TextField, MenuItem, Button } from "@mui/material";
import { getAllAppointments, getClientAppointments, getTherapistAppointments, cancelAppointment, deleteAppointment, updateAppointmentStatus } from "../services/appointmentService";
import { getTherapists } from "../services/threapistService";
import { useAuth } from "../context/AuthContext";
import AppointmentForm from "../components/AppointmentForm";
import dayjs from "dayjs";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import AddIcon from "@mui/icons-material/Add";
import { useNotification } from "../components/Notification";

const Appointments = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [openForm, setOpenForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  const [therapists, setTherapists] = useState<any[]>([]);
  const [filterDate, setFilterDate] = useState("");
  const [filterTherapist, setFilterTherapist] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let data;
        if (activeTab === 0) {
          data = await getClientAppointments();
        } else if (activeTab === 1) {
          data = await getTherapistAppointments();
        } else {
          data = await getAllAppointments();
        }
        setAppointments(data);
        const therapistsData = await getTherapists();
        setTherapists(therapistsData);
      } catch (error) {
        showNotification("Erro ao buscar agendamentos", "error");
      }
      setLoading(false);
    };

    fetchData();
  }, [activeTab]);

  // 🔹 Filtra os agendamentos conforme a seleção do usuário
  const filteredAppointments = appointments.filter((appointment) => {
    return (
      (!filterDate || dayjs(appointment.date).format("YYYY-MM-DD") === filterDate) &&
      (!filterTherapist || appointment.therapist?.id === filterTherapist)
    );
  });

  const handleOpenForm = (appointment?: any) => {
    setSelectedAppointment(appointment || null);
    setOpenForm(true);
  };

  return (
    <Container>
      <Typography variant="h4" sx={{ mb: 3 }}>📅 Gestão de Agendamentos</Typography>

      <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
        <Tab label="Meus Agendamentos" />
        <Tab label="Meus Atendimentos" />
        <Tab label="Todos os Agendamentos" />
      </Tabs>

      {/* 🔹 Botão de Novo Agendamento */}
      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 2, mb: 2 }}
        onClick={() => handleOpenForm()}
        startIcon={<AddIcon />}
      >
        Novo Agendamento
      </Button>

      {/* 🔹 Filtros */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">Filtros</Typography>
        <TextField
          label="Data"
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          sx={{ mr: 2, mt: 1 }}
        />
        <TextField
          select
          label="Terapeuta"
          value={filterTherapist}
          onChange={(e) => setFilterTherapist(e.target.value)}
          sx={{ mr: 2, mt: 1 }}
        >
          <MenuItem value="">Todos</MenuItem>
          {therapists.map((therapist) => (
            <MenuItem key={therapist.id} value={therapist.id}>
              {therapist.name}
            </MenuItem>
          ))}
        </TextField>
        <Button onClick={() => { setFilterDate(""); setFilterTherapist(""); }} variant="outlined" sx={{ mt: 1 }}>
          Limpar Filtros
        </Button>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Cliente</TableCell>
              <TableCell>Terapeuta</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Hora Inicial</TableCell>
              <TableCell>Hora Final</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAppointments.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell>{appointment.client?.name ?? "N/A"}</TableCell>
                <TableCell>{appointment.therapist?.name ?? "N/A"}</TableCell>
                <TableCell>{dayjs(appointment.date).format("DD/MM/YYYY")}</TableCell>
                <TableCell>{appointment.startTime}</TableCell>
                <TableCell>{appointment.endTime}</TableCell>
                <TableCell>{appointment.status}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenForm(appointment)} title="Editar">
                    <EditIcon />
                  </IconButton>
                  <IconButton title="Alterar Status">
                    <EventAvailableIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => deleteAppointment(appointment.id)} title="Cancelar">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <AppointmentForm open={openForm} onClose={() => setOpenForm(false)} onSave={() => setOpenForm(false)} appointment={selectedAppointment} />
    </Container>
  );
};

export default Appointments;