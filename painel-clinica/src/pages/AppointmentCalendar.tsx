import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import {
  Box, Typography, Stack, FormControl, InputLabel, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button,
  CircularProgress
} from '@mui/material';
import { getCalendarAppointments } from '../services/calendarService';
import api from '../api';

interface Therapist {
  id: string;
  name: string;
}

interface Client {
  id: string;
  name: string;
  email?: string;
}

interface Service {
  id: string;
  name: string;
}

interface Appointment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  client?: Client;
  therapist?: Therapist;
  service?: Service;
  notes?: string;
}

interface AppointmentExtendedProps {
  client?: Client;
  therapist?: Therapist;
  service?: Service;
  status: string;
  notes?: string;
}

const AppointmentCalendar: React.FC = () => {
  const [calendarAppointments, setCalendarAppointments] = useState<Appointment[]>([]);
  const [calendarTherapist, setCalendarTherapist] = useState<string>("");
  const [calendarClient, setCalendarClient] = useState<string>("");
  const [selectedEvent, setSelectedEvent] = useState<AppointmentExtendedProps | null>(null);
  const [openEventModal, setOpenEventModal] = useState(false);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const calendarRef = useRef<FullCalendar>(null);

  // Função para buscar terapeutas
  const fetchTherapists = async () => {
    try {
      const response = await api.get('/therapists');
      setTherapists(response.data);
    } catch (error) {
      console.error('Erro ao buscar terapeutas:', error);
    }
  };

  // Função para buscar clientes
  const fetchClients = async () => {
    try {
      const response = await api.get('/clients');
      setClients(response.data);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    }
  };

  // Carregar terapeutas e clientes ao inicializar o componente
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchTherapists(), fetchClients()]);
        
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14);
        
        await fetchCalendarAppointments(
          start.toISOString().split('T')[0],
          end.toISOString().split('T')[0]
        );
      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Função para formatar a data recebida da API para o formato esperado pelo FullCalendar
  const formatDate = (dateString: string) => {
    // Se a data vier no formato ISO completo, extrair apenas a parte da data
    if (dateString.includes('T')) {
      return dateString.split('T')[0];
    }
    return dateString;
  };

  const mapAppointmentsToEvents = (appointments: Appointment[]) =>
    appointments.map(app => {
      // Formatar a data corretamente
      const formattedDate = formatDate(app.date);
      
      // Criar o evento com as datas formatadas corretamente
      return {
        id: app.id,
        title: `${app.client?.name || ""}: ${app.service?.name || ""}`,
        start: `${formattedDate}T${app.startTime}`,
        end: `${formattedDate}T${app.endTime}`,
        backgroundColor: app.status === 'CANCELED' ? '#bdbdbd' : '#e57373',
        extendedProps: {
          client: app.client,
          therapist: app.therapist,
          service: app.service || { id: "", name: "" },
          status: app.status,
          notes: app.notes,
        } as AppointmentExtendedProps,
      };
    });

  const fetchCalendarAppointments = async (start: string, end: string) => {
    try {
      const data = await getCalendarAppointments(
        start, 
        end, 
        calendarTherapist || undefined, 
        calendarClient || undefined
      );
      
      console.log("Agendamentos recebidos:", data);
      setCalendarAppointments(data);
    } catch (error) {
      console.error("Erro ao buscar agendamentos:", error);
    }
  };

  // Função para recarregar os eventos do calendário
  const refreshCalendarEvents = () => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      const start = calendarApi.view.activeStart;
      const end = calendarApi.view.activeEnd;
      
      fetchCalendarAppointments(
        start.toISOString().split('T')[0],
        end.toISOString().split('T')[0]
      );
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '600px' }}>
      <Typography variant="h6" gutterBottom>Visualização de Calendário</Typography>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel id="therapist-filter-label">Terapeuta</InputLabel>
          <Select
            labelId="therapist-filter-label"
            value={calendarTherapist}
            label="Terapeuta"
            onChange={e => {
              setCalendarTherapist(e.target.value);
              // Usar setTimeout para garantir que o estado foi atualizado
              setTimeout(() => refreshCalendarEvents(), 100);
            }}
          >
            <MenuItem value="">Todos</MenuItem>
            {therapists.map(t => (
              <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel id="client-filter-label">Cliente</InputLabel>
          <Select
            labelId="client-filter-label"
            value={calendarClient}
            label="Cliente"
            onChange={e => {
              setCalendarClient(e.target.value);
              // Usar setTimeout para garantir que o estado foi atualizado
              setTimeout(() => refreshCalendarEvents(), 100);
            }}
          >
            <MenuItem value="">Todos</MenuItem>
            {clients.map(c => (
              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
      <FullCalendar
        ref={calendarRef}
        plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        height={550}
        locale={ptBrLocale}
        events={mapAppointmentsToEvents(calendarAppointments)}
        slotMinTime="08:00:00"
        slotMaxTime="18:00:00"
        allDaySlot={false}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'timeGridWeek,timeGridDay',
        }}
        datesSet={({ start, end }) => {
          fetchCalendarAppointments(
            start.toISOString().split('T')[0],
            end.toISOString().split('T')[0]
          );
        }}
        eventClick={({ event }) => {
          setSelectedEvent(event.extendedProps as AppointmentExtendedProps);
          setOpenEventModal(true);
        }}
      />
      <Dialog open={openEventModal} onClose={() => setOpenEventModal(false)}>
        <DialogTitle>Detalhes do Agendamento</DialogTitle>
        <DialogContent>
          <Typography><b>Cliente:</b> {selectedEvent?.client?.name}</Typography>
          <Typography><b>Terapeuta:</b> {selectedEvent?.therapist?.name}</Typography>
          <Typography><b>Serviço:</b> {selectedEvent?.service?.name || "Não especificado"}</Typography>
          <Typography><b>Status:</b> {selectedEvent?.status}</Typography>
          <Typography><b>Observações:</b> {selectedEvent?.notes || "Sem observações"}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEventModal(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AppointmentCalendar; 