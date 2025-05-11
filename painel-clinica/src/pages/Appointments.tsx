/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo, useContext } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  IconButton,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  SelectChangeEvent,
  Grid,
  Tabs,
  Tab,
  Avatar
} from "@mui/material";
import AppointmentForm from "../components/AppointmentForm";
import { getAllAppointments, deleteAppointment, createAppointment } from "../services/appointmentService";
import { getClients } from "../services/clientsService";
import { getTherapists } from "../services/threapistService";
import { getBranches } from "../services/branchService";
import { useNotification } from "../components/Notification";
import { getServices, Service } from "../services/serviceService";
import { getAvailableDates } from "../services/availabilityService";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import AppointmentList from './AppointmentList';
import TimeGridCalendarTab from './TimeGridCalendarTab';
import { BranchContext } from "../context/BranchContext";

// Função formatadora de data para o formato brasileiro
const formatarData = (dateString: string): string => {
  if (!dateString) return "";
  const data = new Date(dateString);
  return data.toLocaleDateString('pt-BR');
};

// Definindo uma interface para os tipos de visualização
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`appointment-tabpanel-${index}`}
      aria-labelledby={`appointment-tab-${index}`}
      {...other}
      style={{ width: '100%' }}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Appointments = () => {
  const branchContext = useContext(BranchContext);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [appointmentToDelete, setAppointmentToDelete] = useState<any>(null);
  const [tabValue, setTabValue] = useState(0);
  const [showFresha, setShowFresha] = useState(false);
  
  // Estados para o fluxo de agendamento no estilo Fresha
  const [freshaStep, setFreshaStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedTherapist, setSelectedTherapist] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(
    branchContext?.currentBranch?.id || null
  );
  
  // Lista de serviços e disponibilidade
  const [servicesList, setServicesList] = useState<Service[]>([]);
  const [availableDates, setAvailableDates] = useState<{date: string; available: boolean; slots: string[]}[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  // Filtros
  const [filters, setFilters] = useState({
    clientId: "",
    therapistId: "",
    branchId: branchContext?.currentBranch?.id || "",
    startDate: "",
    endDate: "",
    searchTerm: ""
  });

  const [clients, setClients] = useState<any[]>([]);
  const [therapists, setTherapists] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<any[]>([]);
  const { showNotification } = useNotification();
  const [saving, setSaving] = useState(false);

  const [buscaCliente, setBuscaCliente] = useState("");
  const [buscaTerapeuta, setBuscaTerapeuta] = useState("");

  // Novo: dias iniciais a exibir slots carregados
  const INITIAL_DAYS = 5;
  const [initialDaysRange, setInitialDaysRange] = useState<{start: Date, end: Date} | null>(null);
  const [loadingDaySlots, setLoadingDaySlots] = useState<string | null>(null); // date string

  // Cálculos para o carrossel de dias (fora do renderFreshaStep e do switch)
  const today = new Date();
  const selected = selectedDate || today;
  const startOfWeek = useMemo(() => {
    const d = new Date(selected);
    d.setDate(d.getDate() - d.getDay()); // domingo
    return d;
  }, [selected]);
  const diasVisiveis = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const available = availableDates.find(ad => ad.date === dateStr)?.available;
    return {
      date: dateStr,
      weekday: d.toLocaleDateString('pt-BR', { weekday: 'short' }),
      day: d.getDate(),
      available,
      fullDate: new Date(d),
    };
  });
  // Navegação de semana
  const handlePrevWeek = () => {
    const prev = new Date(startOfWeek);
    prev.setDate(prev.getDate() - 7);
    setSelectedDate(prev);
    setSelectedTimeSlot(null);
  };
  const handleNextWeek = () => {
    const next = new Date(startOfWeek);
    next.setDate(next.getDate() + 7);
    setSelectedDate(next);
    setSelectedTimeSlot(null);
  };

  const [calendarAppointments, setCalendarAppointments] = useState<any[]>([]);
  const [calendarTherapist, setCalendarTherapist] = useState<string>("");
  const [calendarClient, setCalendarClient] = useState<string>("");
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [openEventModal, setOpenEventModal] = useState(false);

  // Função utilitária para mapear agendamentos para eventos do FullCalendar
  const mapAppointmentsToEvents = (appointments: any[]) =>
    appointments.map(app => ({
      id: app.id,
      title: `${app.client?.name || ""}: ${app.service?.name || ""}`,
      start: `${app.date}T${app.startTime}`,
      end: `${app.date}T${app.endTime}`,
      backgroundColor: app.status === 'CANCELED' ? '#bdbdbd' : '#e57373',
      extendedProps: {
        client: app.client,
        therapist: app.therapist,
        service: app.service,
        status: app.status,
        notes: app.notes,
        branch: app.branch,
      },
    }));

  // Função para buscar agendamentos do calendário
  const fetchCalendarAppointments = async (start: string, end: string) => {
    let url = `${process.env.REACT_APP_API_URL || ""}/appointments/calendar?start=${start}&end=${end}`;
    if (calendarTherapist) url += `&therapistId=${calendarTherapist}`;
    if (calendarClient) url += `&clientId=${calendarClient}`;
    if (filters.branchId) url += `&branchId=${filters.branchId}`;
    const res = await fetch(url);
    const data = await res.json();
    setCalendarAppointments(data);
  };

  useEffect(() => {
    fetchData();
    // buscar serviços
    getServices().then(setServicesList).catch(console.error);
    // buscar filiais
    getBranches().then(setBranches).catch(console.error);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, appointments]);

  useEffect(() => {
    if ((freshaStep === 3 || freshaStep === 4) && selectedService) {
      // Calcular os próximos 5 dias a partir de hoje
      const today = new Date();
      const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const end = new Date(start);
      end.setDate(end.getDate() + INITIAL_DAYS - 1);
      setInitialDaysRange({start, end});

      // Buscar disponibilidade para os próximos dias
      getAvailableDates(
        [selectedService.id], 
        selectedTherapist || undefined, 
        `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`,
        selectedBranch || undefined
      )
        .then(setAvailableDates)
        .catch(console.error);
    }
  }, [freshaStep, selectedService, selectedTherapist, selectedBranch]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appointmentsData, clientsData, therapistsData] = await Promise.all([
        getAllAppointments(filters.branchId),
        getClients(),
        getTherapists(),
      ]);
      setAppointments(appointmentsData);
      setClients(clientsData);
      setTherapists(therapistsData);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      showNotification("Erro ao carregar dados", "error");
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
      setAppointments(appointments.filter(a => a.id !== appointmentToDelete.id));
      showNotification("Agendamento excluído com sucesso", "success");
    } catch (error) {
      console.error("Erro ao excluir agendamento:", error);
      showNotification("Erro ao excluir agendamento", "error");
    } finally {
      setOpenConfirm(false);
      setAppointmentToDelete(null);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleBranchChange = (branchId: string | null) => {
    setFilters({ ...filters, branchId: branchId || "" });
  };

  const applyFilters = () => {
    let filtered = [...appointments];

    if (filters.clientId) {
      filtered = filtered.filter(a => a.clientId === filters.clientId);
    }

    if (filters.therapistId) {
      filtered = filtered.filter(a => a.therapistId === filters.therapistId);
    }

    if (filters.branchId) {
      filtered = filtered.filter(a => a.branchId === filters.branchId);
    }

    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filtered = filtered.filter(a => new Date(a.date) >= startDate);
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999); // Final do dia
      filtered = filtered.filter(a => new Date(a.date) <= endDate);
    }

    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(a => {
        const client = clients.find(c => c.id === a.clientId);
        const therapist = therapists.find(t => t.id === a.therapistId);
        const clientName = client ? client.name.toLowerCase() : "";
        const therapistName = therapist ? therapist.name.toLowerCase() : "";
        const notes = a.notes ? a.notes.toLowerCase() : "";
        
        return (
          clientName.includes(searchTerm) ||
          therapistName.includes(searchTerm) ||
          notes.includes(searchTerm)
        );
      });
    }

    setFilteredAppointments(filtered);
  };

  const resetFilters = () => {
    setFilters({
      clientId: "",
      therapistId: "",
      branchId: branchContext?.currentBranch?.id || "",
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleStartFreshaFlow = () => {
    setFreshaStep(1);
    setSelectedService(null);
    setSelectedTherapist(null);
    setSelectedDate(null);
    setSelectedTimeSlot(null);
    setSelectedClient(null);
    // Inicializa com a filial atual do contexto, se disponível
    setSelectedBranch(branchContext?.currentBranch?.id || null);
    setShowFresha(true);
  };

  const handleCloseFreshaFlow = () => {
    setShowFresha(false);
    setFreshaStep(1);
    setSelectedService(null);
    setSelectedTherapist(null);
    setSelectedDate(null);
    setSelectedTimeSlot(null);
    setSelectedClient(null);
    setSelectedBranch(null);
  };

  const handleNextStep = () => {
    if (freshaStep < 5) {
      setFreshaStep(freshaStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (freshaStep > 1) {
      setFreshaStep(freshaStep - 1);
    }
  };

  const handleSaveAppointment = async () => {
    if (!selectedClient || !selectedTherapist || !selectedDate || !selectedTimeSlot) {
      showNotification("Preencha todos os campos obrigatórios", "error");
      return;
    }

    setSaving(true);
    try {
      // Calcular horário de término baseado na duração do serviço
      const startHour = parseInt(selectedTimeSlot.split(':')[0]);
      const startMinute = parseInt(selectedTimeSlot.split(':')[1]);
      
      // Duração padrão de 1 hora se não houver serviço selecionado
      const durationMinutes = selectedService?.averageDuration || 60;
      
      const endDate = new Date();
      endDate.setHours(startHour);
      endDate.setMinutes(startMinute + durationMinutes);
      
      const endTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
      
      const appointmentData = {
        clientId: selectedClient,
        therapistId: selectedTherapist,
        date: selectedDate.toISOString().split('T')[0],
        startTime: selectedTimeSlot,
        endTime: endTime,
        branchId: selectedBranch || undefined
      };
      
      await createAppointment(appointmentData);
      showNotification("Agendamento criado com sucesso!", "success");
      handleCloseFreshaFlow();
      fetchData(); // Recarregar os agendamentos
    } catch (error) {
      console.error("Erro ao criar agendamento:", error);
      showNotification("Erro ao criar agendamento", "error");
    } finally {
      setSaving(false);
    }
  };

  // Componentes para cada etapa do fluxo de agendamento estilo Fresha
  const renderFreshaStep = () => {
    switch (freshaStep) {
      case 1:
        // Seleção de Cliente
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Selecione o cliente</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Passo 1 de 5</Typography>
            <TextField
              label="Buscar cliente"
              value={buscaCliente}
              onChange={e => setBuscaCliente(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            />
            <Box sx={{ maxHeight: '400px', overflow: 'auto' }}>
              {clients
                .filter(client =>
                  client.name.toLowerCase().includes(buscaCliente.toLowerCase()) ||
                  client.email.toLowerCase().includes(buscaCliente.toLowerCase())
                )
                .map(client => (
                  <Card key={client.id} sx={{ mb: 2, cursor: 'pointer', border: selectedClient === client.id ? '2px solid #1976d2' : '1px solid #eee', bgcolor: selectedClient === client.id ? 'primary.light' : 'background.paper', transition: 'border 0.2s' }} onClick={() => setSelectedClient(selectedClient === client.id ? null : client.id)}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2 }}>{client.name.charAt(0)}</Avatar>
                      <Box>
                        <Typography variant="subtitle1">{client.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{client.email}</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
            </Box>
          </Box>
        );
      case 2:
        // Seleção de Serviço
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Selecione o serviço</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Passo 2 de 6</Typography>
            <Grid container spacing={2}>
              {servicesList.map(service => (
                <Grid item xs={12} sm={6} md={4} key={service.id}>
                  <Card sx={{ cursor: 'pointer', border: selectedService?.id===service.id?'2px solid #1976d2':'1px solid #eee', bgcolor: selectedService?.id===service.id?'primary.light':'background.paper', transition: 'border 0.2s' }} onClick={() => setSelectedService(selectedService?.id===service.id ? null : service)}>
                    <CardContent>
                      <Typography variant="h6">{service.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{service.description}</Typography>
                      <Typography variant="h6" sx={{ mt: 1 }}>R$ {service.price.toFixed(2)}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );
      case 3:
        // Seleção de Terapeuta
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Selecione o terapeuta</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Passo 3 de 5</Typography>
            <TextField
              label="Buscar terapeuta"
              value={buscaTerapeuta}
              onChange={e => setBuscaTerapeuta(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            />
            <Grid container spacing={2}>
              {therapists
                .filter(t => t.therapistServices?.some((ts: any) => ts.service.id === selectedService?.id))
                .filter(terap =>
                  terap.name.toLowerCase().includes(buscaTerapeuta.toLowerCase()) ||
                  (terap.specialty && terap.specialty.toLowerCase().includes(buscaTerapeuta.toLowerCase()))
                )
                .map(therapist => (
                  <Grid item xs={12} sm={6} md={4} key={therapist.id}>
                    <Card sx={{ cursor: 'pointer', border: selectedTherapist===therapist.id?'2px solid #1976d2':'1px solid #eee', bgcolor: selectedTherapist===therapist.id?'primary.light':'background.paper', transition: 'border 0.2s' }} onClick={() => setSelectedTherapist(selectedTherapist===therapist.id ? null : therapist.id)}>
                      <CardContent>
                        <Typography variant="h6">{therapist.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{therapist.specialty}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
            </Grid>
          </Box>
        );
      case 4:
        // Seleção de Data e Horário (carrossel horizontal)
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Escolha uma data</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Passo 4 de 5</Typography>
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ mb: 3 }}>
              <IconButton onClick={handlePrevWeek}><ArrowBackIosNewIcon /></IconButton>
              {diasVisiveis.map(dia => {
                const isInitial = initialDaysRange && new Date(dia.date) >= initialDaysRange.start && new Date(dia.date) <= initialDaysRange.end;
                return (
                  <Button
                    key={dia.date}
                    variant={selectedDate?.toISOString().split('T')[0] === dia.date ? "contained" : "outlined"}
                    onClick={() => { setSelectedDate(dia.fullDate); setSelectedTimeSlot(null); }}
                    disabled={!dia.available && !!isInitial}
                    sx={{ minWidth: 64, flexDirection: 'column', opacity: dia.available || !isInitial ? 1 : 0.4 }}
                  >
                    <Typography variant="caption">{dia.weekday.toUpperCase()}</Typography>
                    <Typography variant="h6">{dia.day}</Typography>
                    {!isInitial && <Typography variant="caption" color="primary">Ver horários</Typography>}
                  </Button>
                );
              })}
              <IconButton onClick={handleNextWeek}><ArrowForwardIosIcon /></IconButton>
            </Stack>
            {/* Grade de horários */}
            {selectedDate && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>Horários disponíveis para {selectedDate.toLocaleDateString()}</Typography>
                {loadingDaySlots === selectedDate.toISOString().split('T')[0] ? (
                  <Typography color="text.secondary">Carregando horários...</Typography>
                ) : (
                  <Grid container spacing={2}>
                    {availableSlots.length === 0 ? (
                      <Grid item xs={12}><Typography color="text.secondary">Nenhum horário disponível para este dia.</Typography></Grid>
                    ) : (
                      availableSlots.map(slot => (
                        <Grid item xs={6} sm={4} md={2} key={slot}>
                          <Button
                            variant={selectedTimeSlot === slot ? 'contained' : 'outlined'}
                            fullWidth
                            onClick={() => setSelectedTimeSlot(selectedTimeSlot === slot ? null : slot)}
                          >{slot}</Button>
                        </Grid>
                      ))
                    )}
                  </Grid>
                )}
              </Box>
            )}
          </Box>
        );
      case 5:
        // Revisão
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Resumo do Agendamento</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Passo 5 de 6</Typography>
            <Card sx={{ mb:3 }}><CardContent>
              <Typography><strong>Cliente:</strong> {clients.find(c=>c.id===selectedClient)?.name}</Typography>
              <Typography><strong>Serviço:</strong> {selectedService?.name}</Typography>
              <Typography><strong>Data:</strong> {selectedDate?.toLocaleDateString()}</Typography>
              <Typography><strong>Horário:</strong> {selectedTimeSlot}</Typography>
              <Typography><strong>Terapeuta:</strong> {selectedTherapist ? therapists.find(t=>t.id===selectedTherapist)?.name : 'Não selecionado'}</Typography>
              <Typography><strong>Valor:</strong> R$ {selectedService?.price.toFixed(2)}</Typography>
            </CardContent></Card>
          </Box>
        );
      default:
        return null;
    }
  };

  // Botões de navegação para o fluxo Fresha
  const renderFreshaNavigation = () => {
    const canNext = [
      selectedClient,
      selectedService,
      selectedTherapist,
      selectedDate && selectedTimeSlot
    ];
    return (
      <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
        <Button 
          variant="outlined"
          onClick={freshaStep === 1 ? handleCloseFreshaFlow : handlePreviousStep}
          disabled={saving}
        >
          {freshaStep === 1 ? 'Cancelar' : 'Voltar'}
        </Button>
        <Button 
          variant="contained"
          onClick={freshaStep === 5 ? handleSaveAppointment : handleNextStep}
          disabled={
            saving ||
            (freshaStep < 5 && !canNext[freshaStep-1])
          }
        >
          {saving && freshaStep === 5 ? <CircularProgress size={22} color="inherit" sx={{ mr: 1 }} /> : null}
          {freshaStep === 5 ? 'Confirmar Agendamento' : 'Próximo'}
        </Button>
      </Box>
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Agendamentos
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleOpenForm()}
            sx={{ mr: 2 }}
          >
            Novo Agendamento
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleStartFreshaFlow}
          >
            Agendamento Rápido
          </Button>
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="appointment tabs">
          <Tab label="Lista" />
          <Tab label="Calendário" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <AppointmentList
          appointments={filteredAppointments}
          clients={clients}
          therapists={therapists}
          branches={branches}
          filters={filters}
          onFilterChange={handleFilterChange}
          onSelectChange={handleSelectChange}
          onBranchChange={handleBranchChange}
          onResetFilters={resetFilters}
          onEdit={handleOpenForm}
          onDelete={handleDelete}
          loading={loading}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <TimeGridCalendarTab />
      </TabPanel>

      {/* Modal de formulário de agendamento */}
      <AppointmentForm
        open={openForm}
        onClose={handleCloseForm}
        onSave={fetchData}
        appointment={selectedAppointment}
      />

      {/* Modal de confirmação de exclusão */}
      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir este agendamento?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirm(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de agendamento estilo Fresha */}
      <Dialog
        open={showFresha}
        onClose={handleCloseFreshaFlow}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            height: '80vh',
            maxHeight: '900px',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h5">
              {freshaStep === 1 ? 'Novo Agendamento' : 
               freshaStep === 2 ? 'Selecione uma data' :
               freshaStep === 3 ? 'Selecione um horário' :
               freshaStep === 4 ? 'Selecione um cliente' :
               freshaStep === 5 ? 'Selecione os serviços' :
               'Revisar e Confirmar'}
            </Typography>
            <Typography variant="body1">
              Etapa {freshaStep} de 6
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers sx={{ flexGrow: 1, overflow: 'auto' }}>
          {renderFreshaStep()}
        </DialogContent>
        
        {renderFreshaNavigation()}
      </Dialog>
    </Box>
  );
};

export default Appointments;