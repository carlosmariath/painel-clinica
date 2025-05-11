import { Box, Typography } from '@mui/material';
import { startOfWeek, addDays } from 'date-fns';

// Tipos básicos reutilizados
export interface Therapist {
  id: string;
  name: string;
}
export interface Client {
  id: string;
  name: string;
}
export interface Service {
  id: string;
  name: string;
}
export interface Appointment {
  id: string;
  date: string;       // yyyy-mm-dd OU ISO
  startTime: string;  // HH:mm
  endTime: string;    // HH:mm
  status: string;
  client?: Client;
  therapist?: Therapist;
  service?: Service;
  notes?: string;
}

interface WeekSchedulerProps {
  appointments: Appointment[];
  weekStart?: Date; // default = Monday da semana atual
  startHour?: number; // default 8
  endHour?: number;   // default 18
}

/*
  O componente renderiza 7 colunas (segunda-domingo) + coluna de horários.
  Cada coluna de dia é position:relative, permitindo posicionar agendamentos
  como boxes absolutos dentro.
*/
const COLORS: Record<string, string> = {
  CONFIRMED: '#4caf50',
  PENDING: '#ff9800',
  CANCELED: '#9e9e9e',
};

const SLOT_HEIGHT = 40; // px por hora

const WeekScheduler: React.FC<WeekSchedulerProps> = ({
  appointments,
  weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }), // segunda
  startHour = 8,
  endHour = 18,
}) => {
  // converter appointments
  const appts = appointments.map((a) => {
    const datePart = a.date.includes('T') ? a.date.split('T')[0] : a.date;
    const startDate = new Date(`${datePart}T${a.startTime}`);
    const endDate = new Date(`${datePart}T${a.endTime}`);
    return { ...a, startDate, endDate } as Appointment & { startDate: Date; endDate: Date };
  });

  return (
    <Box display="grid" gridTemplateColumns="60px repeat(7, 1fr)" sx={{ border: '1px solid #e0e0e0' }}>
      {/* Header */}
      <Box />
      {Array.from({ length: 7 }).map((_, idx) => {
        const day = addDays(weekStart, idx);
        const label = day.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
        return (
          <Box key={idx} sx={{ p: 1, borderLeft: '1px solid #e0e0e0', borderBottom: '1px solid #e0e0e0', textAlign: 'center', backgroundColor: '#fafafa' }}>
            <Typography variant="subtitle2">{label}</Typography>
          </Box>
        );
      })}

      {/* Horas + cells */}
      {Array.from({ length: endHour - startHour }).map((_, hrIdx) => {
        const hour = startHour + hrIdx;
        return (
          <>
            {/* Coluna horário */}
            <Box key={`h-${hour}`} sx={{ height: SLOT_HEIGHT, borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="caption">{`${hour.toString().padStart(2, '0')}:00`}</Typography>
            </Box>
            {/* Column cells for each day */}
            {Array.from({ length: 7 }).map((_, dIdx) => (
              <Box key={`cell-${hrIdx}-${dIdx}`} sx={{ borderLeft: '1px solid #eee', borderBottom: '1px solid #eee', height: SLOT_HEIGHT, position: 'relative' }} />
            ))}
          </>
        );
      })}

      {/* Appointments overlay */}
      {appts.map((appt) => {
        const dayIndex = Math.floor((appt.startDate.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
        if (dayIndex < 0 || dayIndex > 6) return null;
        const startMinutes = appt.startDate.getHours() * 60 + appt.startDate.getMinutes();
        const endMinutes = appt.endDate.getHours() * 60 + appt.endDate.getMinutes();
        const topPx = ((startMinutes - startHour * 60) / 60) * SLOT_HEIGHT;
        const heightPx = ((endMinutes - startMinutes) / 60) * SLOT_HEIGHT;
        return (
          <Box
            key={appt.id}
            sx={{
              gridColumnStart: dayIndex + 2, // +1 for time column, +1 index base 1
              gridRowStart: 2, // overlay using absolute below
              position: 'relative',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: topPx,
                left: 4,
                right: 4,
                height: heightPx,
                bgcolor: COLORS[appt.status] ?? '#2196f3',
                color: '#fff',
                borderRadius: 1,
                p: 0.5,
                fontSize: '0.75rem',
                overflow: 'hidden',
                cursor: 'pointer',
              }}
            >
              {appt.client?.name ?? ''}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default WeekScheduler; 