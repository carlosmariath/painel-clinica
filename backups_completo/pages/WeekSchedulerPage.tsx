import { useEffect, useState } from 'react';
import { CircularProgress, Select, MenuItem, FormControl, InputLabel, Stack, Box } from '@mui/material';
import WeekScheduler, { Appointment, Therapist, Client } from '../components/WeekScheduler';
import { getCalendarAppointments } from '../services/calendarService';
import { getClients } from '../services/clientsService';
import { getTherapists } from '../services/threapistService';
import { startOfWeek, endOfWeek } from 'date-fns';

const WeekSchedulerPage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTherapist, setFilterTherapist] = useState('');
  const [filterClient, setFilterClient] = useState('');

  const fetchAppointments = async (therapistId?: string, clientId?: string) => {
    const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
    const sunday = endOfWeek(new Date(), { weekStartsOn: 1 });
    const data = await getCalendarAppointments(
      monday.toISOString().split('T')[0],
      sunday.toISOString().split('T')[0],
      therapistId,
      clientId
    );
    setAppointments(data as Appointment[]);
  };

  useEffect(() => {
    const loadInitial = async () => {
      try {
        const [clientsData, therapistsData] = await Promise.all([getClients(), getTherapists()]);
        setClients(clientsData);
        setTherapists(therapistsData);
      } catch (err) {
        console.error(err);
      }
      await fetchAppointments();
      setLoading(false);
    };
    loadInitial();
  }, []);

  useEffect(() => {
    fetchAppointments(filterTherapist || undefined, filterClient || undefined);
  }, [filterTherapist, filterClient]);

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <FormControl sx={{ minWidth: 180 }} size="small">
          <InputLabel id="therapist-filter-label">Terapeuta</InputLabel>
          <Select
            labelId="therapist-filter-label"
            value={filterTherapist}
            label="Terapeuta"
            onChange={(e) => setFilterTherapist(e.target.value)}
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
          >
            <MenuItem value="">Todos</MenuItem>
            {clients.map((c) => (
              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
      <WeekScheduler appointments={appointments} />
    </Box>
  );
};

export default WeekSchedulerPage; 