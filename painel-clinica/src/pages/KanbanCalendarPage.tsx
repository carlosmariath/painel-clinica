import React, { useState, useEffect } from 'react';
import { CircularProgress, Select, MenuItem, FormControl, InputLabel, Stack, Box, Toolbar, IconButton, Typography, Button, Alert, Snackbar } from '@mui/material';
import { ChevronLeft, ChevronRight, CalendarMonth } from '@mui/icons-material';
import KanbanCalendar, { Appointment, Client, Therapist } from '../components/KanbanCalendar';
import { startOfWeek, endOfWeek, addWeeks, format, addDays } from 'date-fns';
import { updateAppointment } from '../services/appointmentService';
import { getCalendarAppointments } from '../services/calendarService';
import { getClients } from '../services/clientsService';
import { getTherapists } from '../services/threapistService';
import { ptBR } from 'date-fns/locale';

const KanbanCalendarPage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [filterTherapist, setFilterTherapist] = useState('');
  const [filterClient, setFilterClient] = useState('');
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [error, setError] = useState<string | null>(null);

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
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
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
      } catch (err) {
        console.error('Erro ao inicializar dados:', err);
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
  const goToday  = () => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

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
        <IconButton onClick={prevWeek} disabled={loadingAppointments}>
          <ChevronLeft />
        </IconButton>
        <IconButton onClick={nextWeek} disabled={loadingAppointments}>
          <ChevronRight />
        </IconButton>
        <Typography variant="h6" sx={{ minWidth: 200 }}>
          {formatWeekRange(weekStart)}
        </Typography>
        <Button size="small" onClick={goToday} disabled={loadingAppointments}>HOJE</Button>
        <Box flex={1} />
        {loadingAppointments && <CircularProgress size={24} sx={{ ml: 2 }} />}
      </Toolbar>
      
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <FormControl sx={{ minWidth: 180 }} size="small">
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
        <FormControl sx={{ minWidth: 180 }} size="small">
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
      </Stack>
      
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
            <CalendarMonth sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
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
          <KanbanCalendar
            appointments={appointments}
            weekStart={weekStart}
            onMove={async (id, newDate, newStart, newEnd) => {
              try {
                setLoadingAppointments(true);
                await updateAppointment(id, { date: newDate, startTime: newStart, endTime: newEnd });
                // Atualizar estado local
                setAppointments(prev => prev.map(a => a.id === id ? { ...a, date: newDate, startTime: newStart, endTime: newEnd } : a));
              } catch (err) {
                console.error('Erro ao mover agendamento', err);
                setError('Erro ao mover agendamento. Recarregando dados...');
                // Recarregar todos os agendamentos em caso de erro para garantir consistência
                fetchAppointments(filterTherapist || undefined, filterClient || undefined, weekStart);
              } finally {
                setLoadingAppointments(false);
              }
            }}
          />
        )}
      </Box>
      
      {/* Notificação de erro */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError}>
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default KanbanCalendarPage; 