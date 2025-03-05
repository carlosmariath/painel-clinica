import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  InputAdornment,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AppointmentForm from "../components/AppointmentForm";
import { getAllAppointments, deleteAppointment } from "../services/appointmentService";
import { getClients } from "../services/clientsService";
import { getTherapists } from "../services/threapistService";
import { useNotification } from "../components/Notification";

// Função formatadora de data para o formato brasileiro
const formatarData = (dateString: string): string => {
  if (!dateString) return "";
  const data = new Date(dateString);
  return data.toLocaleDateString('pt-BR');
};

const Appointments = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [appointmentToDelete, setAppointmentToDelete] = useState<any>(null);
  
  // Filtros
  const [filters, setFilters] = useState({
    clientId: "",
    therapistId: "",
    startDate: "",
    endDate: "",
    searchTerm: ""
  });

  const [clients, setClients] = useState<any[]>([]);
  const [therapists, setTherapists] = useState<any[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<any[]>([]);
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appointmentsData, clientsData, therapistsData] = await Promise.all([
        getAllAppointments(),
        getClients(),
        getTherapists()
      ]);

      setAppointments(appointmentsData);
      setFilteredAppointments(appointmentsData);
      setClients(clientsData);
      setTherapists(therapistsData);
      showNotification("Dados carregados com sucesso", "success");
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      showNotification("Erro ao carregar dados dos agendamentos", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (appointment = null) => {
    setSelectedAppointment(appointment);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedAppointment(null);
  };

  const handleDelete = (appointment: any) => {
    setAppointmentToDelete(appointment);
    setOpenConfirm(true);
  };

  const confirmDelete = async () => {
    if (!appointmentToDelete) return;
    
    try {
      await deleteAppointment(appointmentToDelete.id);
      await fetchData();
      showNotification("Agendamento excluído com sucesso", "success");
    } catch (error) {
      console.error("Erro ao excluir agendamento:", error);
      showNotification("Erro ao excluir agendamento", "error");
    } finally {
      setOpenConfirm(false);
      setAppointmentToDelete(null);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const name = e.target.name as string;
    const value = e.target.value as string;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const name = e.target.name as string;
    const value = e.target.value;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    applyFilters();
  }, [filters, appointments]);

  const applyFilters = () => {
    let filtered = [...appointments];

    // Filtrar por cliente
    if (filters.clientId) {
      filtered = filtered.filter(app => app.clientId === filters.clientId);
    }

    // Filtrar por terapeuta
    if (filters.therapistId) {
      filtered = filtered.filter(app => app.therapistId === filters.therapistId);
    }

    // Filtrar por data de início
    if (filters.startDate) {
      filtered = filtered.filter(app => new Date(app.date) >= new Date(filters.startDate));
    }

    // Filtrar por data de fim
    if (filters.endDate) {
      filtered = filtered.filter(app => new Date(app.date) <= new Date(filters.endDate));
    }

    // Filtrar por termo de busca
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(app => {
        const clientName = clients.find(c => c.id === app.clientId)?.name || "";
        const therapistName = therapists.find(t => t.id === app.therapistId)?.name || "";
        
        return (
          clientName.toLowerCase().includes(term) ||
          therapistName.toLowerCase().includes(term) ||
          app.notes?.toLowerCase().includes(term) ||
          app.startTime?.includes(term) ||
          app.endTime?.includes(term)
        );
      });
    }

    setFilteredAppointments(filtered);
  };

  const resetFilters = () => {
    setFilters({
      clientId: "",
      therapistId: "",
      startDate: "",
      endDate: "",
      searchTerm: ""
    });
  };

  const getClientName = (clientId: string) => {
    return clients.find(client => client.id === clientId)?.name || "Cliente não encontrado";
  };

  const getTherapistName = (therapistId: string) => {
    return therapists.find(therapist => therapist.id === therapistId)?.name || "Terapeuta não encontrado";
  };

  return (
    <Box sx={{ p: 3, flexGrow: 1 }}>
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Agendamentos
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenForm()}
        >
          Novo Agendamento
        </Button>
      </Box>

      {/* Filtros */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Filtros</Typography>
          <Stack spacing={2}>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel id="cliente-label">Cliente</InputLabel>
                <Select
                  labelId="cliente-label"
                  label="Cliente"
                  name="clientId"
                  value={filters.clientId}
                  onChange={handleSelectChange}
                >
                  <MenuItem value="">Todos os clientes</MenuItem>
                  {clients.map(client => (
                    <MenuItem key={client.id} value={client.id}>
                      {client.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel id="terapeuta-label">Terapeuta</InputLabel>
                <Select
                  labelId="terapeuta-label"
                  label="Terapeuta"
                  name="therapistId"
                  value={filters.therapistId}
                  onChange={handleSelectChange}
                >
                  <MenuItem value="">Todos os terapeutas</MenuItem>
                  {therapists.map(therapist => (
                    <MenuItem key={therapist.id} value={therapist.id}>
                      {therapist.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 2 }}>
              <TextField
                label="Data Inicial"
                name="startDate"
                type="date"
                value={filters.startDate}
                onChange={handleFilterChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                label="Data Final"
                name="endDate"
                type="date"
                value={filters.endDate}
                onChange={handleFilterChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Buscar"
                name="searchTerm"
                value={filters.searchTerm}
                onChange={handleFilterChange}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <Button variant="outlined" onClick={resetFilters}>
                Limpar Filtros
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Lista de Agendamentos */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Cliente</TableCell>
                <TableCell>Terapeuta</TableCell>
                <TableCell>Data</TableCell>
                <TableCell>Horário Início</TableCell>
                <TableCell>Horário Fim</TableCell>
                <TableCell>Observações</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAppointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Nenhum agendamento encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAppointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>{getClientName(appointment.clientId)}</TableCell>
                    <TableCell>{getTherapistName(appointment.therapistId)}</TableCell>
                    <TableCell>{formatarData(appointment.date)}</TableCell>
                    <TableCell>{appointment.startTime}</TableCell>
                    <TableCell>{appointment.endTime}</TableCell>
                    <TableCell>
                      {appointment.notes && appointment.notes.length > 30
                        ? `${appointment.notes.substring(0, 30)}...`
                        : appointment.notes}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenForm(appointment)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(appointment)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Formulário de Agendamento */}
      <AppointmentForm
        open={openForm}
        onClose={handleCloseForm}
        onSave={fetchData}
        appointment={selectedAppointment}
      />

      {/* Diálogo de Confirmação de Exclusão */}
      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirm(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={confirmDelete} color="error">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Appointments;