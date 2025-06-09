/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useContext } from "react";
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
  IconButton,
  Paper,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Skeleton,
  Tooltip,
  Fade
} from "@mui/material";
import {
  CalendarMonth,
  Add as AddIcon,
  Refresh,
  Schedule,
  CheckCircle,
  Cancel,
  WarningAmber,
  FilterList,
  ViewList,
  ViewKanban,
  Person,
  MedicalServices,
  Business,
  Notes,
  Info,
  Phone,
  Email,
  Edit,
  AttachMoney,
  AccessTime,
  QrCode2
} from "@mui/icons-material";
import { Avatar } from "@mui/material";
import { startOfWeek, addDays, addWeeks, format } from "date-fns";
import { ptBR } from "date-fns/locale";
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
import AppointmentForm from "../components/AppointmentForm";
import AppointmentWizardV2 from "../components/AppointmentWizardV2";
import AppointmentEditModal from "../components/AppointmentEditModal";

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
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [appointmentToDelete, setAppointmentToDelete] = useState<any>(null);
  const [tabValue, setTabValue] = useState(0); // 0 = Lista, 1 = Kanban
  
  // Estados para navegação do calendário Kanban
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

  // const [filteredAppointments, setFilteredAppointments] = useState<any[]>([]);
  const { showNotification } = useNotification();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [openEventModal, setOpenEventModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);



  useEffect(() => {
    fetchData();
    // buscar serviços
    getServices().then(setServicesList).catch(console.error);
    // buscar filiais
    getBranches().then(() => {}).catch(console.error);
  }, []);

  // useEffect(() => {
  //   applyFilters();
  // }, [filters, appointments]);

  useEffect(() => {
    // Carregar assinaturas ativas quando o componente for montado
    const fetchActiveSubscriptions = async () => {
      try {
        setLoadingSubscriptions(true);
        const response = await subscriptionService.getSubscriptions(
          undefined, 
          'ACTIVE',
          branchContext?.currentBranch?.id
        );
        
        // Extrair dados do formato paginado
        const subscriptionsData = response.data || response;
        
        setClientSubscriptions(subscriptionsData);
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
      const [appointmentsResponse, clientsData, therapistsData] = await Promise.all([
        getAllAppointments(filters.branchId),
        getClients(),
        getTherapists(),
      ]);
      
      // Extrair dados do formato paginado
      const appointmentsData = appointmentsResponse.data || appointmentsResponse;
      
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
    if (appointment) {
      setOpenEditModal(true);
    } else {
      setOpenForm(true);
    }
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedAppointment(null);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setSelectedAppointment(null);
  };

  const handleSaveAppointmentEdit = (updatedAppointment: any) => {
    // Atualizar a lista de agendamentos
    setAppointments(prev => 
      prev.map(apt => 
        apt.id === updatedAppointment.id ? updatedAppointment : apt
      )
    );
    setOpenEditModal(false);
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

  // const applyFilters = () => {
  //   let filtered = [...appointments];

  //   if (filters.clientId) {
  //     filtered = filtered.filter(app => app.clientId === filters.clientId);
  //   }

  //   if (filters.therapistId) {
  //     filtered = filtered.filter(app => app.therapistId === filters.therapistId);
  //   }

  //   if (filters.branchId) {
  //     filtered = filtered.filter(app => app.branchId === filters.branchId);
  //   }

  //   if (filters.startDate) {
  //     filtered = filtered.filter(app => new Date(app.date) >= new Date(filters.startDate));
  //   }

  //   if (filters.endDate) {
  //     filtered = filtered.filter(app => new Date(app.date) <= new Date(filters.endDate));
  //   }

  //   if (filters.searchTerm) {
  //     const searchTermLower = filters.searchTerm.toLowerCase();
  //     filtered = filtered.filter(app => {
  //       const clientName = app.client?.name.toLowerCase() || '';
  //       const therapistName = app.therapist?.name.toLowerCase() || '';
  //       const serviceName = app.service?.name.toLowerCase() || '';
  //       return (
  //         clientName.includes(searchTermLower) ||
  //         therapistName.includes(searchTermLower) ||
  //         serviceName.includes(searchTermLower)
  //       );
  //     });
  //   }

  //   // setFilteredAppointments(filtered);
  // };

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

  // Manipulador de clique em um agendamento no Kanban
  const handleKanbanAppointmentClick = (appointment: any) => {
    console.log('Appointments - handleKanbanAppointmentClick chamado com:', appointment);
    setSelectedEvent(appointment);
    setOpenEventModal(true);
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
      const response = await getAllAppointments(filters.branchId);
      
      // Extrair dados do formato paginado
      const appointmentsData = response.data || response;
      
      setAppointments(appointmentsData);
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

        {/* Tabs de Visualização */}
        <Paper sx={{ mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            centered
          >
            <Tab 
              icon={<ViewList />} 
              label="Lista" 
              iconPosition="start"
              sx={{ minHeight: 48 }}
            />
            <Tab 
              icon={<ViewKanban />} 
              label="Kanban" 
              iconPosition="start"
              sx={{ minHeight: 48 }}
            />
          </Tabs>
        </Paper>

        {/* Navegação do Kanban (somente na aba Kanban) */}
        {tabValue === 1 && (
          <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Button 
                variant="outlined" 
                onClick={prevWeek}
                size="small"
              >
                ← Semana Anterior
              </Button>
              
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" fontWeight={600}>
                  {formatWeekRange(weekStart)}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  variant="outlined" 
                  onClick={goToday}
                  size="small"
                >
                  Hoje
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={nextWeek}
                  size="small"
                >
                  Próxima Semana →
                </Button>
              </Box>
            </Box>
          </Paper>
        )}

        {/* Filtros (somente na aba Lista) */}
        {tabValue === 0 && (
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
        )}
      </Box>

      {/* Conteúdo baseado na aba selecionada */}
      <Box>
        {tabValue === 0 ? (
          // Vista de Lista
          <>
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
          </>
        ) : (
          // Vista Kanban
          <Box sx={{ height: '600px', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Box>
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} variant="rectangular" width="100%" height={60} sx={{ mb: 1 }} />
                  ))}
                </Box>
              </Box>
            ) : (
              <KanbanCalendar
                appointments={appointments}
                weekStart={weekStart}
                onSlotClick={handleCalendarSlotClick}
                onAppointmentClick={handleKanbanAppointmentClick}
                startHour={8}
                endHour={18}
                hourStep={60}
              />
            )}
          </Box>
        )}
      </Box>

      {/* Appointment Form - Simple */}
      <AppointmentForm 
        open={openForm}
        onClose={handleCloseForm}
        onSave={fetchData}
        appointment={selectedAppointment}
      />

      {/* Advanced Edit Modal */}
      <AppointmentEditModal
        open={openEditModal}
        appointment={selectedAppointment}
        onClose={handleCloseEditModal}
        onSave={handleSaveAppointmentEdit}
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

      {/* Modal de detalhes do evento do calendário - Versão melhorada */}
      <Dialog 
        open={openEventModal} 
        onClose={() => setOpenEventModal(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden'
          }
        }}
      >
        {selectedEvent && (() => {
          // Normalizar dados dependendo se vem do FullCalendar (extendedProps) ou Kanban (direto)
          const eventData = selectedEvent.extendedProps || selectedEvent;
                      // const originalAppointment = eventData.originalAppointment || selectedEvent;
          
          // Função para obter cor do status
          const getStatusColor = (status: string) => {
            switch (status) {
              case 'CONFIRMED': return { bg: '#e8f5e8', color: '#2e7d32', icon: '✓' };
              case 'PENDING': return { bg: '#fff3e0', color: '#f57c00', icon: '⏱' };
              case 'CANCELED': return { bg: '#ffebee', color: '#d32f2f', icon: '✕' };
              default: return { bg: '#f5f5f5', color: '#757575', icon: '?' };
            }
          };

          const statusInfo = getStatusColor(eventData.status);
          
          return (
            <>
              {/* Header com gradiente e informações principais */}
              <Box sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                p: 3,
                position: 'relative'
              }}>
                <IconButton
                  onClick={() => setOpenEventModal(false)}
                  sx={{ 
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  <Cancel />
                </IconButton>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    color: 'white',
                    width: 56,
                    height: 56,
                    fontSize: '1.5rem'
                  }}>
                    {eventData.client?.name?.charAt(0) || 'C'}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight={600}>
                      {eventData.client?.name || 'Cliente não informado'}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                      {eventData.service?.name || 'Serviço não informado'}
                    </Typography>
                  </Box>
                </Box>

                {/* Status Badge */}
                <Box sx={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  bgcolor: statusInfo.bg,
                  color: statusInfo.color,
                  px: 2,
                  py: 0.5,
                  borderRadius: 3,
                  fontWeight: 600,
                  fontSize: '0.875rem'
                }}>
                  <span>{statusInfo.icon}</span>
                  {eventData.status === 'CONFIRMED' ? 'Confirmado' : 
                   eventData.status === 'CANCELED' ? 'Cancelado' : 
                   eventData.status === 'PENDING' ? 'Pendente' : 
                   eventData.status}
                </Box>
              </Box>

              <DialogContent sx={{ p: 0 }}>
                <Grid container>
                  {/* Informações principais */}
                  <Grid item xs={12} md={8}>
                    <Box sx={{ p: 3 }}>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                        <Schedule color="primary" />
                        Detalhes do Agendamento
                      </Typography>

                      <Grid container spacing={3}>
                        {/* Data e Horário */}
                        <Grid item xs={12} sm={6} md={4}>
                          <Box sx={{ 
                            p: 2, 
                            bgcolor: 'primary.50', 
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'primary.200',
                            height: '100%'
                          }}>
                            <Typography variant="subtitle2" color="primary.main" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CalendarMonth fontSize="small" />
                              Data & Horário
                            </Typography>
                            <Typography variant="h6" fontWeight={600}>
                              {eventData.date && format(new Date(eventData.date), 'dd/MM/yyyy', { locale: ptBR })}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                              {eventData.startTime} - {eventData.endTime || 'Não informado'}
                            </Typography>
                          </Box>
                        </Grid>

                        {/* Terapeuta */}
                        <Grid item xs={12} sm={6} md={4}>
                          <Box sx={{ 
                            p: 2, 
                            bgcolor: 'success.50', 
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'success.200',
                            height: '100%'
                          }}>
                            <Typography variant="subtitle2" color="success.main" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Person fontSize="small" />
                              Terapeuta
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {eventData.therapist?.name || 'Não informado'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Responsável pelo atendimento
                            </Typography>
                          </Box>
                        </Grid>

                        {/* Filial */}
                        <Grid item xs={12} sm={6} md={4}>
                          <Box sx={{ 
                            p: 2, 
                            bgcolor: 'warning.50', 
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'warning.200',
                            height: '100%'
                          }}>
                            <Typography variant="subtitle2" color="warning.main" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Business fontSize="small" />
                              Filial
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {eventData.branch?.name || 'Não informado'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Local do atendimento
                            </Typography>
                          </Box>
                        </Grid>

                        {/* Serviço - Expandido com mais informações */}
                        <Grid item xs={12}>
                          <Box sx={{ 
                            p: 3, 
                            bgcolor: 'info.50', 
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'info.200'
                          }}>
                            <Typography variant="subtitle1" color="info.main" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                              <MedicalServices />
                              Detalhes do Serviço
                            </Typography>
                            
                            <Grid container spacing={2}>
                              {/* Nome do Serviço */}
                              <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                  Nome do Serviço
                                </Typography>
                                <Typography variant="h6" fontWeight={600} color="info.main">
                                  {eventData.service?.name || 'Não informado'}
                                </Typography>
                              </Grid>

                              {/* Preço */}
                              <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <AttachMoney fontSize="small" color="success" />
                                  Valor do Serviço
                                </Typography>
                                <Typography variant="h6" fontWeight={600} color="success.main">
                                  {eventData.service?.price 
                                    ? new Intl.NumberFormat('pt-BR', { 
                                        style: 'currency', 
                                        currency: 'BRL' 
                                      }).format(eventData.service.price)
                                    : 'Não informado'
                                  }
                                </Typography>
                              </Grid>

                              {/* Duração */}
                              <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <AccessTime fontSize="small" color="info" />
                                  Duração Estimada
                                </Typography>
                                <Typography variant="body1" fontWeight={500}>
                                  {eventData.service?.averageDuration 
                                    ? `${eventData.service.averageDuration} minutos`
                                    : 'Não informada'
                                  }
                                </Typography>
                              </Grid>

                              {/* Código do Serviço */}
                              <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <QrCode2 fontSize="small" color="action" />
                                  Código do Serviço
                                </Typography>
                                <Typography variant="body2" sx={{ 
                                  fontFamily: 'monospace',
                                  bgcolor: 'white',
                                  p: 1,
                                  borderRadius: 1,
                                  border: '1px solid',
                                  borderColor: 'grey.300',
                                  display: 'inline-block'
                                }}>
                                  {eventData.service?.id || 'N/A'}
                                </Typography>
                              </Grid>

                              {/* Descrição do Serviço */}
                              {eventData.service?.description && (
                                <Grid item xs={12}>
                                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Descrição do Serviço
                                  </Typography>
                                  <Paper sx={{ 
                                    p: 2, 
                                    bgcolor: 'white', 
                                    border: '1px solid', 
                                    borderColor: 'grey.300',
                                    borderRadius: 1
                                  }}>
                                    <Typography variant="body2" color="text.primary">
                                      {eventData.service.description}
                                    </Typography>
                                  </Paper>
                                </Grid>
                              )}
                            </Grid>
                          </Box>
                        </Grid>


                      </Grid>

                      {/* Observações */}
                      {eventData.notes && (
                        <Box sx={{ mt: 3 }}>
                          <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Notes color="action" />
                            Observações
                          </Typography>
                          <Paper sx={{ p: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200' }}>
                            <Typography variant="body2">
                              {eventData.notes}
                            </Typography>
                          </Paper>
                        </Box>
                      )}
                    </Box>
                  </Grid>

                  {/* Sidebar com informações adicionais */}
                  <Grid item xs={12} md={4}>
                    <Box sx={{ 
                      bgcolor: 'grey.50', 
                      height: '100%', 
                      p: 3,
                      borderLeft: { md: '1px solid' },
                      borderColor: { md: 'divider' }
                    }}>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Info color="primary" />
                        Informações Extras
                      </Typography>

                      {/* Informações do cliente */}
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" gutterBottom color="primary">
                          Informações do Cliente
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Phone fontSize="small" color="action" />
                          <Typography variant="body2">
                            {eventData.client?.phone || 'Não informado'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Email fontSize="small" color="action" />
                          <Typography variant="body2">
                            {eventData.client?.email || 'Não informado'}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Agendamento ID */}
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" gutterBottom color="primary">
                          ID do Agendamento
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          fontFamily: 'monospace',
                          bgcolor: 'white',
                          p: 1,
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'grey.300'
                        }}>
                          {eventData.id || 'N/A'}
                        </Typography>
                      </Box>

                      {/* Última atualização */}
                      <Box>
                        <Typography variant="subtitle2" gutterBottom color="primary">
                          Última Atualização
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {eventData.updatedAt ? format(new Date(eventData.updatedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : 'Não disponível'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </DialogContent>

              {/* Actions melhoradas */}
              <DialogActions sx={{ p: 3, bgcolor: 'grey.50', gap: 1 }}>
                <Button 
                  onClick={() => setOpenEventModal(false)}
                  variant="outlined"
                  size="large"
                  startIcon={<Cancel />}
                >
                  Fechar
                </Button>
                <Button 
                  onClick={() => {
                    const eventData = selectedEvent.extendedProps || selectedEvent;
                    const originalAppointment = eventData.originalAppointment || selectedEvent;
                    handleOpenForm(originalAppointment);
                    setOpenEventModal(false);
                  }} 
                  variant="contained"
                  size="large"
                  startIcon={<Edit />}
                  color="primary"
                >
                  Editar Agendamento
                </Button>
              </DialogActions>
            </>
          );
        })()}
      </Dialog>
    </Container>
  );
};

export default Appointments;