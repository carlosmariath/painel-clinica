import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Stack, FormControl, InputLabel, Select, MenuItem, CircularProgress, IconButton
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import TimeGridCalendar, { Appointment, Client, Therapist } from '../components/TimeGridCalendar';
import { startOfWeek, addWeeks, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getCalendarAppointments } from '../services/calendarService';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import TodayIcon from '@mui/icons-material/Today';

interface TimeGridCalendarTabProps {
  therapists?: Therapist[];
  clients?: Client[];
  selectedTherapist?: string;
  selectedClient?: string;
  branchId?: string;
  onTherapistChange?: (therapistId: string) => void;
  onClientChange?: (clientId: string) => void;
  onEventSelect?: (event: Appointment) => void;
}

// Interface para compatibilizar com o tipo retornado pelo serviço
interface AppointmentFromApi {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  client?: Client;
  therapist?: Therapist;
  service?: {
    id: string;
    name: string;
  };
  notes?: string;
}

const TimeGridCalendarTab: React.FC<TimeGridCalendarTabProps> = ({ 
  therapists = [], 
  clients = [], 
  selectedTherapist = "", 
  selectedClient = "",
  branchId = "",
  onTherapistChange,
  onClientChange,
  onEventSelect
}) => {
  const [loading, setLoading] = useState(false);
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [filterTherapist, setFilterTherapist] = useState(selectedTherapist);
  const [filterClient, setFilterClient] = useState(selectedClient);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  
  // Carregar agendamentos
  useEffect(() => {
    fetchAppointments();
  }, [weekStart, filterTherapist, filterClient, branchId]);
  
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      // Calcular data final (final da semana)
      const endDate = addWeeks(weekStart, 1);
      
      // Formatar as datas como strings YYYY-MM-DD
      const startStr = format(weekStart, 'yyyy-MM-dd');
      const endStr = format(endDate, 'yyyy-MM-dd');
      
      // Buscar os agendamentos
      const data = await getCalendarAppointments(
        startStr,
        endStr,
        filterTherapist || undefined,
        filterClient || undefined,
        branchId || undefined
      );
      
      // Converter status da API para o formato esperado pelo componente
      const convertedAppointments: Appointment[] = data.map((apt: AppointmentFromApi) => ({
        ...apt,
        status: (apt.status === 'CONFIRMED' || apt.status === 'PENDING' || apt.status === 'CANCELED') 
          ? apt.status 
          : 'PENDING' // valor padrão caso o status não seja um dos esperados
      }));
      
      setAppointments(convertedAppointments);
    } catch (error) {
      console.error("Erro ao buscar agendamentos:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Navegação do calendário
  const handlePrevWeek = () => setWeekStart(prev => addWeeks(prev, -1));
  const handleNextWeek = () => setWeekStart(prev => addWeeks(prev, 1));
  const handleGoToday = () => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  
  // Manipuladores de filtros
  const handleTherapistChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setFilterTherapist(value);
    if (onTherapistChange) {
      onTherapistChange(value);
    }
  };
  
  const handleClientChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setFilterClient(value);
    if (onClientChange) {
      onClientChange(value);
    }
  };
  
  // Manipulador de evento de seleção
  const handleEventSelect = (appointment: Appointment) => {
    if (onEventSelect) {
      onEventSelect(appointment);
    }
  };
  
  return (
    <Box sx={{ height: 'calc(100vh - 250px)', display: 'flex', flexDirection: 'column' }}>
      {/* Filtros e Navegação */}
      <Box sx={{ mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <IconButton onClick={handlePrevWeek} size="small">
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>
          
          <Typography variant="subtitle1">
            {format(weekStart, "MMMM yyyy", { locale: ptBR })}
          </Typography>
          
          <IconButton onClick={handleNextWeek} size="small">
            <ArrowForwardIosIcon fontSize="small" />
          </IconButton>
          
          <IconButton onClick={handleGoToday} size="small" title="Ir para hoje">
            <TodayIcon fontSize="small" />
          </IconButton>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="therapist-filter-label">Terapeuta</InputLabel>
            <Select
              labelId="therapist-filter-label"
              value={filterTherapist}
              label="Terapeuta"
              onChange={handleTherapistChange}
            >
              <MenuItem value="">Todos</MenuItem>
              {therapists.map(t => (
                <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="client-filter-label">Cliente</InputLabel>
            <Select
              labelId="client-filter-label"
              value={filterClient}
              label="Cliente"
              onChange={handleClientChange}
            >
              <MenuItem value="">Todos</MenuItem>
              {clients.map(c => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Box>
      
      {/* Calendário */}
      <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : (
          <TimeGridCalendar 
            appointments={appointments} 
            weekStart={weekStart}
            onAppointmentClick={handleEventSelect}
            onMoveAppointment={(id, newDate, newStartTime, newEndTime) => {
              console.log('Mover agendamento:', id, newDate, newStartTime, newEndTime);
              // Implementar a funcionalidade de mover agendamento quando necessário
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default TimeGridCalendarTab; 