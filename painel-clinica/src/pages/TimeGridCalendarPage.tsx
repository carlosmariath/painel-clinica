import React, { useState, useEffect } from 'react';
import { 
  Box, Toolbar, IconButton, Typography, Button, Select, MenuItem, 
  FormControl, InputLabel, CircularProgress, Dialog, DialogTitle, 
  DialogContent, DialogActions, Chip, Avatar, Grid, Paper, Divider,
  Alert, Snackbar
} from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import TimeGridCalendar, { Appointment, Client, Therapist } from '../components/TimeGridCalendar';
import { startOfWeek, addWeeks, format, endOfWeek, addDays } from 'date-fns';
import { updateAppointment } from '../services/appointmentService';
import { getCalendarAppointments } from '../services/calendarService';
import { getClients } from '../services/clientsService';
import { getTherapists } from '../services/threapistService';
import { ptBR } from 'date-fns/locale';

const TimeGridCalendarPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [filterTherapist, setFilterTherapist] = useState('');
  const [filterClient, setFilterClient] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para o Dialog
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  
  // Função para buscar agendamentos
  const fetchAppointments = async (therapistId?: string, clientId?: string, wkStart: Date = weekStart) => {
    try {
      setLoadingAppointments(true);
      setError(null);
      
      const monday = wkStart;
      const sunday = endOfWeek(wkStart, { weekStartsOn: 1 });
      
      const data = await getCalendarAppointments(
        monday.toISOString().split('T')[0],
        sunday.toISOString().split('T')[0],
        therapistId,
        clientId
      );
      
      setAppointments(data as Appointment[]);
    } catch {
      setError('Não foi possível carregar os agendamentos. Verifique a conexão com o servidor.');
    } finally {
      setLoadingAppointments(false);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Buscar clientes e terapeutas
        const [clientsData, therapistsData] = await Promise.all([
          getClients(),
          getTherapists()
        ]);
        
        setClients(clientsData);
        setTherapists(therapistsData);
        
        // Buscar agendamentos iniciais
        await fetchAppointments();
      } catch {
        setError('Não foi possível carregar os dados iniciais. Verifique a conexão com o servidor.');
      } finally {
        setLoading(false);
      }
    };
    
    init();
  }, []);

  // Atualizar agendamentos quando a semana mudar
  useEffect(() => {
    if (!loading) { // Evitar busca duplicada durante a inicialização
      fetchAppointments(filterTherapist || undefined, filterClient || undefined, weekStart);
    }
  }, [weekStart, loading]);

  // Atualizar agendamentos quando os filtros mudarem
  useEffect(() => {
    if (!loading) { // Evitar busca duplicada durante a inicialização
      fetchAppointments(filterTherapist || undefined, filterClient || undefined, weekStart);
    }
  }, [filterTherapist, filterClient, loading]);
  
  const prevWeek = () => setWeekStart(prev => addWeeks(prev, -1));
  const nextWeek = () => setWeekStart(prev => addWeeks(prev, 1));
  const goToday = () => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  
  // Handle moving appointments
  const handleMoveAppointment = async (id: string, newDate: string, newStartTime: string, newEndTime: string) => {
    try {
      setLoadingAppointments(true);
      await updateAppointment(id, { date: newDate, startTime: newStartTime, endTime: newEndTime });
      // Update local state
      setAppointments(prev => prev.map(a => a.id === id ? {
        ...a, 
        date: newDate, 
        startTime: newStartTime, 
        endTime: newEndTime
      } : a));
    } catch {
      setError('Erro ao mover agendamento. Recarregando dados...');
      // Recarregar todos os agendamentos em caso de erro para garantir consistência
      fetchAppointments(filterTherapist || undefined, filterClient || undefined, weekStart);
    } finally {
      setLoadingAppointments(false);
    }
  };
  
  // Função para abrir o Dialog com detalhes do agendamento
  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setOpenDialog(true);
  };

  // Função para fechar o Dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleCloseError = () => {
    setError(null);
  };

  const formatWeekRange = (start: Date) => {
    const end = addDays(start, 6);
    return `${format(start, 'dd', { locale: ptBR })} - ${format(end, 'dd')} de ${format(start, 'MMMM yyyy', { locale: ptBR })}`;
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar Navegação */}
      <Toolbar sx={{ pl: 0 }}>
        <IconButton onClick={prevWeek} disabled={loadingAppointments}><ChevronLeft /></IconButton>
        <IconButton onClick={nextWeek} disabled={loadingAppointments}><ChevronRight /></IconButton>
        <Typography variant="h6" sx={{ minWidth: 200 }}>
          {formatWeekRange(weekStart)}
        </Typography>
        <Button size="small" onClick={goToday} disabled={loadingAppointments}>HOJE</Button>
        <Box flex={1} />
        
        {loadingAppointments && <CircularProgress size={24} sx={{ ml: 2 }} />}
        
        {/* Filtros */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel id="therapist-filter-label">Terapeuta</InputLabel>
            <Select
              labelId="therapist-filter-label"
              value={filterTherapist}
              label="Terapeuta"
              onChange={(e) => setFilterTherapist(e.target.value)}
              disabled={loadingAppointments}
            >
              <MenuItem value="">Todos</MenuItem>
              {therapists.map((t) => (
                <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel id="client-filter-label">Cliente</InputLabel>
            <Select
              labelId="client-filter-label"
              value={filterClient}
              label="Cliente"
              onChange={(e) => setFilterClient(e.target.value)}
              disabled={loadingAppointments}
            >
              <MenuItem value="">Todos</MenuItem>
              {clients.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Toolbar>
      
      {/* Calendar */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        {appointments.length === 0 && !loadingAppointments ? (
          <Box sx={{ 
            p: 3, 
            textAlign: 'center', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: '300px'
          }}>
            <Typography variant="h6" color="text.secondary">
              Nenhum agendamento encontrado para este período
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {filterTherapist || filterClient 
                ? 'Tente remover os filtros ou selecionar outra semana'
                : 'Selecione outro período ou crie novos agendamentos'
              }
            </Typography>
          </Box>
        ) : (
          <TimeGridCalendar 
            appointments={appointments} 
            weekStart={weekStart}
            onMoveAppointment={handleMoveAppointment}
            onAppointmentClick={handleAppointmentClick}
          />
        )}
      </Box>

      {/* Dialog de Detalhes do Agendamento */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        {selectedAppointment && (
          <>
            <DialogTitle sx={{ 
              pb: 1, 
              display: 'flex', 
              alignItems: 'center', 
              bgcolor: selectedAppointment.status === 'CONFIRMED' 
                ? '#e1f5fe' 
                : selectedAppointment.status === 'PENDING' 
                  ? '#fff8e1' 
                  : '#f5f5f5'
            }}>
              <Avatar sx={{ 
                mr: 2, 
                bgcolor: selectedAppointment.status === 'CONFIRMED' 
                  ? '#0277bd' 
                  : selectedAppointment.status === 'PENDING' 
                    ? '#ff8f00' 
                    : '#616161'
              }}>
                {selectedAppointment.client?.name.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h6">{selectedAppointment.client?.name}</Typography>
                <Chip 
                  label={
                    selectedAppointment.status === 'CONFIRMED' 
                      ? 'Confirmado' 
                      : selectedAppointment.status === 'PENDING' 
                        ? 'Pendente' 
                        : 'Cancelado'
                  } 
                  size="small" 
                  sx={{ 
                    mt: 0.5,
                    bgcolor: selectedAppointment.status === 'CONFIRMED' 
                      ? '#0277bd' 
                      : selectedAppointment.status === 'PENDING' 
                        ? '#ff8f00' 
                        : '#616161',
                    color: 'white'
                  }}
                />
              </Box>
            </DialogTitle>

            <DialogContent>
              <Grid container spacing={2} sx={{ pt: 2 }}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'medium', mb: 1 }}>
                    Detalhes do Agendamento
                  </Typography>
                  <Divider />
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Data</Typography>
                  <Typography variant="body1">
                    {new Date(selectedAppointment.date).toLocaleDateString('pt-BR', { 
                      weekday: 'long', 
                      day: '2-digit', 
                      month: '2-digit',
                      year: 'numeric' 
                    })}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Horário</Typography>
                  <Typography variant="body1">
                    {selectedAppointment.startTime} - {selectedAppointment.endTime}
                  </Typography>
                </Grid>
                
                {selectedAppointment.service && (
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Serviço</Typography>
                    <Typography variant="body1">{selectedAppointment.service.name}</Typography>
                  </Grid>
                )}
                
                {selectedAppointment.therapist && (
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Terapeuta</Typography>
                    <Typography variant="body1">{selectedAppointment.therapist.name}</Typography>
                  </Grid>
                )}
                
                {selectedAppointment.notes && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Observações</Typography>
                    <Paper variant="outlined" sx={{ p: 1.5, mt: 0.5, bgcolor: '#f5f5f5' }}>
                      <Typography variant="body2">{selectedAppointment.notes}</Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            
            <DialogActions>
              <Button onClick={handleCloseDialog} color="inherit">Fechar</Button>
              <Button 
                variant="contained" 
                color="primary"
              >
                Editar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Notificação de erro */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError}>
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TimeGridCalendarPage; 