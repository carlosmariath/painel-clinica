/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useContext } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  SelectChangeEvent,
  Grid,
  Tabs,
  Tab,
  Toolbar,
  IconButton,
  Paper,
  CircularProgress,
  Container,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Skeleton,
  Tooltip,
  Fade
} from "@mui/material";
import AppointmentForm from "../components/AppointmentForm";
import AppointmentWizardV2 from "../components/AppointmentWizardV2";
import { getAllAppointments, deleteAppointment, createAppointment } from "../services/appointmentService";
import { getClients } from "../services/clientsService";
import { getTherapists } from "../services/threapistService";
import { getBranches } from "../services/branchService";
import { useNotification } from "../components/Notification";
import { getServices, Service } from "../services/serviceService";
import AppointmentList from './AppointmentList';
import KanbanCalendar from '../components/KanbanCalendar';
import { BranchContext } from "../context/BranchContext";
import { subscriptionService, Subscription } from '../services/subscriptionService';
import { format, startOfWeek, addWeeks, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Add as AddIcon, ChevronLeft, ChevronRight, CalendarMonth, FilterList, Refresh, CheckCircle, Cancel, Schedule, WarningAmber } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

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

// Interface para o objeto de agendamento
interface AppointmentData {
  clientId: string;
  serviceId: string;
  therapistId: string;
  date: string;
  startTime?: string;
  endTime?: string;
  branchId?: string;
  subscriptionId?: string;
  couponCode?: string;
  notes?: string;
  autoSchedule?: boolean;
}

const Appointments = () => {
  const branchContext = useContext(BranchContext);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [appointmentToDelete, setAppointmentToDelete] = useState<any>(null);
  const [tabValue, setTabValue] = useState(1); // Definindo o calendário como padrão (índice 1)
  
  // Estados para navegação do calendário
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  
  // Estados para o novo fluxo de agendamento
  const [openWizard, setOpenWizard] = useState(false);
  const [clientSubscriptions, setClientSubscriptions] = useState<Subscription[]>([]);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false);
  const [preselectedDate, setPreselectedDate] = useState<string | null>(null);
  const [preselectedTime, setPreselectedTime] = useState<string | null>(null);

  // Lista de serviços, clientes e terapeutas
  const [servicesList, setServicesList] = useState<Service[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [therapists, setTherapists] = useState<any[]>([]);
  
  // Filtros
  const [filters, setFilters] = useState({
    clientId: "",
    therapistId: "",
    branchId: branchContext?.currentBranch?.id || "",
    startDate: "",
    endDate: "",
    searchTerm: "",
    status: 'all',
    date: '',
    therapist: 'all'
  });

  const [filteredAppointments, setFilteredAppointments] = useState<any[]>([]);
  const { showNotification } = useNotification();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [openEventModal, setOpenEventModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const theme = useTheme();

  useEffect(() => {
    fetchData();
    // buscar serviços
    getServices().then(setServicesList).catch(console.error);
    // buscar filiais
    getBranches().then(() => {}).catch(console.error);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, appointments]);

  useEffect(() => {
    // Carregar assinaturas ativas quando o componente for montado
    const fetchActiveSubscriptions = async () => {
      try {
        setLoadingSubscriptions(true);
        const activeSubscriptions = await subscriptionService.getSubscriptions(
          undefined, 
          'ACTIVE',
          branchContext?.currentBranch?.id
        );
        setClientSubscriptions(activeSubscriptions);
      } catch (error) {
        console.error('Erro ao carregar assinaturas ativas:', error);
      } finally {
        setLoadingSubscriptions(false);
      }
    };
    
    fetchActiveSubscriptions();
  }, [branchContext?.currentBranch?.id]);

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

  const handleOpenWizard = (date?: string, time?: string) => {
    console.log('Appointments - handleOpenWizard chamado com:', { date, time });
    if (date) setPreselectedDate(date);
    if (time) setPreselectedTime(time);
    setOpenWizard(true);
  };

  const handleCloseWizard = () => {
    setOpenWizard(false);
    setPreselectedDate(null);
    setPreselectedTime(null);
  };

  const handleDelete = (appointment: any) => {
    setAppointmentToDelete(appointment);
    setOpenConfirm(true);
  };

  const confirmDelete = async () => {
    if (!appointmentToDelete) return;

    try {
      await deleteAppointment(appointmentToDelete.id);
      setAppointments(appointments.filter(app => app.id !== appointmentToDelete.id));
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
      filtered = filtered.filter(app => app.clientId === filters.clientId);
    }

    if (filters.therapistId) {
      filtered = filtered.filter(app => app.therapistId === filters.therapistId);
    }

    if (filters.branchId) {
      filtered = filtered.filter(app => app.branchId === filters.branchId);
    }

    if (filters.startDate) {
      filtered = filtered.filter(app => new Date(app.date) >= new Date(filters.startDate));
    }

    if (filters.endDate) {
      filtered = filtered.filter(app => new Date(app.date) <= new Date(filters.endDate));
    }

    if (filters.searchTerm) {
      const searchTermLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(app => {
        const clientName = app.client?.name.toLowerCase() || '';
        const therapistName = app.therapist?.name.toLowerCase() || '';
        const serviceName = app.service?.name.toLowerCase() || '';
        return (
          clientName.includes(searchTermLower) ||
          therapistName.includes(searchTermLower) ||
          serviceName.includes(searchTermLower)
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
      searchTerm: "",
      status: 'all',
      date: '',
      therapist: 'all'
    });
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSaveAppointment = async (appointmentData: AppointmentData): Promise<void> => {
    try {
      console.log('Appointments - Dados recebidos do wizard:', appointmentData);
      
      // Garantir que endTime seja calculado se não estiver presente
      const finalData = {
        ...appointmentData,
        branchId: appointmentData.branchId || branchContext?.currentBranch?.id
      };
      
      // Se não tem endTime mas tem startTime, calcular baseado na duração do serviço
      if (finalData.startTime && !finalData.endTime && finalData.serviceId) {
        const selectedService = servicesList.find(s => s.id === finalData.serviceId);
        if (selectedService) {
          const [hours, minutes] = finalData.startTime.split(':').map(Number);
          const startMinutes = hours * 60 + minutes;
          const endMinutes = startMinutes + (selectedService.averageDuration || 60);
          const endHours = Math.floor(endMinutes / 60);
          const endMins = endMinutes % 60;
          finalData.endTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
        }
      }
      
      console.log('Appointments - Dados finais a serem enviados:', finalData);
      
      await createAppointment(finalData);
      
      showNotification("Agendamento criado com sucesso", "success");
      fetchData();  // Recarrega os agendamentos
    } catch (error) {
      console.error("Erro ao criar agendamento:", error);
      showNotification("Erro ao criar agendamento", "error");
      throw error;
    }
  };

  // Manipulador de clique em uma célula do calendário Kanban
  const handleCalendarSlotClick = (date: string, startTime: string, endTime: string) => {
    console.log('Appointments - handleCalendarSlotClick chamado com:', { date, startTime, endTime });
    // Verificar se todas as propriedades necessárias estão definidas
    if (!date || !startTime) {
      console.error('Dados de slot incompletos:', { date, startTime, endTime });
      showNotification('Não foi possível iniciar um agendamento para este horário.', 'error');
      return;
    }
    
    // Formatar a data se necessário (garantir que está no formato YYYY-MM-DD)
    const formattedDate = date.includes('T') ? date.split('T')[0] : date;
    
    // Iniciar o wizard com os valores pré-selecionados
    handleOpenWizard(formattedDate, startTime);
  };

  // Funções para navegação do calendário
  const prevWeek = () => setWeekStart(prev => addWeeks(prev, -1));
  const nextWeek = () => setWeekStart(prev => addWeeks(prev, 1));
  const goToday = () => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

  // Formatar o intervalo da semana
  const formatWeekRange = (start: Date) => {
    const end = addDays(start, 6);
    return `${format(start, 'dd', { locale: ptBR })} - ${format(end, 'dd')} de ${format(start, 'MMMM yyyy', { locale: ptBR })}`;
  };

  const fetchAppointments = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const data = await getAllAppointments(filters.branchId);
      setAppointments(data);
      if (showRefreshIndicator) {
        showNotification("Dados atualizados com sucesso", "success");
      }
    } catch (error) {
      console.error("Erro ao buscar agendamentos:", error);
      showNotification("Erro ao carregar agendamentos", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchAppointments(true);
  };

  // Skeleton Loader Component
  const AppointmentSkeleton = () => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={30} />
            <Skeleton variant="text" width="40%" height={20} sx={{ mt: 1 }} />
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Skeleton variant="rounded" width={80} height={24} />
              <Skeleton variant="rounded" width={100} height={24} />
            </Box>
          </Box>
          <Skeleton variant="circular" width={40} height={40} />
        </Box>
      </CardContent>
    </Card>
  );

  // Status statistics
  const getStatusStats = () => {
    const stats = {
      scheduled: appointments.filter(a => a.status === 'SCHEDULED').length,
      confirmed: appointments.filter(a => a.status === 'CONFIRMED').length,
      canceled: appointments.filter(a => a.status === 'CANCELED').length,
      total: appointments.length
    };
    return stats;
  };

  const stats = getStatusStats();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CalendarMonth fontSize="large" color="primary" />
            <Typography variant="h4" fontWeight={700}>
              Agendamentos
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Atualizar">
              <IconButton 
                onClick={handleRefresh} 
                disabled={refreshing}
                sx={{ 
                  transition: 'transform 0.3s',
                  '&:hover': { transform: 'rotate(180deg)' }
                }}
              >
                <Refresh sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
              </IconButton>
            </Tooltip>
            
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => handleOpenWizard()}
              sx={{ borderRadius: 2 }}
            >
              Novo Agendamento
            </Button>
          </Box>
        </Box>

        {/* Status Cards */}
        <Fade in={!loading} timeout={600}>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                bgcolor: 'primary.50', 
                border: '1px solid',
                borderColor: 'primary.200',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-2px)' }
              }}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Schedule sx={{ color: 'primary.main', mb: 1 }} />
                  <Typography variant="h5" fontWeight={600}>{stats.total}</Typography>
                  <Typography variant="body2" color="text.secondary">Total</Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                bgcolor: 'info.50',
                border: '1px solid',
                borderColor: 'info.200',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-2px)' }
              }}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Schedule sx={{ color: 'info.main', mb: 1 }} />
                  <Typography variant="h5" fontWeight={600}>{stats.scheduled}</Typography>
                  <Typography variant="body2" color="text.secondary">Agendados</Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                bgcolor: 'success.50',
                border: '1px solid', 
                borderColor: 'success.200',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-2px)' }
              }}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <CheckCircle sx={{ color: 'success.main', mb: 1 }} />
                  <Typography variant="h5" fontWeight={600}>{stats.confirmed}</Typography>
                  <Typography variant="body2" color="text.secondary">Confirmados</Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                bgcolor: 'error.50',
                border: '1px solid',
                borderColor: 'error.200',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-2px)' }
              }}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Cancel sx={{ color: 'error.main', mb: 1 }} />
                  <Typography variant="h5" fontWeight={600}>{stats.canceled}</Typography>
                  <Typography variant="body2" color="text.secondary">Cancelados</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Fade>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <FilterList color="action" />
            
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="SCHEDULED">Agendados</MenuItem>
                <MenuItem value="CONFIRMED">Confirmados</MenuItem>
                <MenuItem value="CANCELED">Cancelados</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              size="small"
              type="date"
              label="Data"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 150 }}
            />
            
                         <Button 
              size="small" 
              onClick={() => setFilters({ ...filters, status: 'all', date: '', therapist: 'all' })}
              disabled={filters.status === 'all' && !filters.date}
            >
              Limpar Filtros
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* Appointments List with Loading States */}
      <Box>
        {loading ? (
          <Box>
            {[1, 2, 3, 4].map((i) => (
              <AppointmentSkeleton key={i} />
            ))}
          </Box>
        ) : appointments.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
            <WarningAmber sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Nenhum agendamento encontrado
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Clique no botão "Novo Agendamento" para criar o primeiro
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => handleOpenWizard()}
            >
              Criar Agendamento
            </Button>
          </Paper>
        ) : (
          <Fade in={!loading} timeout={800}>
            <Box>
              <AppointmentList 
                appointments={appointments}
                loading={loading}
                therapists={therapists}
                clients={clients}
                onEdit={handleOpenForm}
                onDelete={handleDelete}
                filters={filters}
                onFilterChange={handleFilterChange}
                onSelectChange={handleSelectChange}
                onBranchChange={handleBranchChange}
                onResetFilters={resetFilters}
              />
            </Box>
          </Fade>
        )}
      </Box>

      {/* Appointment Form */}
      <AppointmentForm 
        open={openForm}
        onClose={handleCloseForm}
        onSave={fetchData}
        appointment={selectedAppointment}
      />

      {/* Novo wizard de agendamento melhorado */}
      <AppointmentWizardV2
        open={openWizard}
        onClose={handleCloseWizard}
        onSave={handleSaveAppointment}
        services={servicesList}
        clients={clients}
        therapists={therapists}
        clientSubscriptions={clientSubscriptions}
        isLoading={loadingSubscriptions}
        preselectedDate={preselectedDate}
        preselectedTime={preselectedTime}
      />

      {/* Diálogo de confirmação de exclusão */}
      <Dialog
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
      >
        <DialogTitle>Excluir Agendamento</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir este agendamento?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirm(false)} color="inherit">
            Cancelar
          </Button>
          <Button onClick={confirmDelete} color="error">
            Confirmar Exclusão
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de detalhes do evento do calendário */}
      <Dialog open={openEventModal} onClose={() => setOpenEventModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Detalhes do Agendamento</DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6">
                  {selectedEvent.extendedProps.client?.name}
                </Typography>
                <Typography variant="subtitle1" color="textSecondary">
                  {selectedEvent.extendedProps.service?.name} | 
                  {format(new Date(selectedEvent.extendedProps.date), 'dd/MM/yyyy', { locale: ptBR })} às {selectedEvent.extendedProps.startTime}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Terapeuta</Typography>
                <Typography>{selectedEvent.extendedProps.therapist?.name}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Status</Typography>
                <Typography>{selectedEvent.extendedProps.status === 'CONFIRMED' ? 'Confirmado' : 
                            selectedEvent.extendedProps.status === 'CANCELED' ? 'Cancelado' : 
                            selectedEvent.extendedProps.status === 'PENDING' ? 'Pendente' : 
                            selectedEvent.extendedProps.status}</Typography>
              </Grid>
              {selectedEvent.extendedProps.notes && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Observações</Typography>
                  <Typography>{selectedEvent.extendedProps.notes}</Typography>
                </Grid>
              )}
              <Grid item xs={12}>
                <Typography variant="subtitle2">Filial</Typography>
                <Typography>{selectedEvent.extendedProps.branch?.name}</Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEventModal(false)}>Fechar</Button>
          <Button 
            onClick={() => {
              handleOpenForm(selectedEvent.extendedProps.originalAppointment);
              setOpenEventModal(false);
            }} 
            color="primary"
          >
            Editar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Appointments;