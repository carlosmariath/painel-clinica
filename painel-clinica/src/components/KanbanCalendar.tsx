import React, { useMemo } from 'react';
import { Box, Typography, useTheme, Paper, Button, Badge } from '@mui/material';
import { startOfWeek, addDays, format, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Tipos compartilhados (podem ser movidos para arquivo comum futuramente)
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
  status: 'CONFIRMED' | 'PENDING' | 'CANCELED';
  client?: Client;
  therapist?: Therapist;
  service?: Service;
  notes?: string;
  originalAppointment?: Record<string, unknown>;
}

interface KanbanCalendarProps {
  appointments: Appointment[];
  onMove?: (id: string, newDate: string, newStart: string, newEnd: string) => void; // callback quando move
  weekStart?: Date;   // default: segunda da semana atual
  startHour?: number; // default 8
  endHour?: number;   // default 18
  hourStep?: number;  // minutos por linha, default 60
  onSlotClick?: (date: string, startTime: string, endTime: string) => void; // callback quando clica em um slot vazio
  onAppointmentClick?: (appointment: Appointment) => void; // callback quando clica em um agendamento
}

const SLOT_HEIGHT = 50; // px por linha de hora (visual mais espaçoso)
const HEADER_HEIGHT = 70; // px para altura do cabeçalho

const STATUS_COLORS: Record<Appointment['status'], {bg: string, text: string}> = {
  CONFIRMED: { bg: '#e3f2fd', text: '#1565c0' },  // azul claro
  PENDING: { bg: '#fff3e0', text: '#f57c00' },    // laranja
  CANCELED: { bg: '#f5f5f5', text: '#757575' },   // cinza
};

// Versão simplificada do KanbanCalendar sem DND para resolver o problema de cliques
const KanbanCalendar: React.FC<KanbanCalendarProps> = ({
  appointments,
  weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }),
  startHour = 8,
  endHour = 23,
  hourStep = 60,
  onSlotClick,
  onAppointmentClick,
}) => {
  const theme = useTheme();

  // Converter appointments -> datas JS para cálculo de posição
  const mapped = useMemo(() => {
    return appointments.map((a) => {
      try {
        const datePart = a.date.includes('T') ? a.date.split('T')[0] : a.date;
        const startDate = new Date(`${datePart}T${a.startTime}`);
        const endDate = new Date(`${datePart}T${a.endTime}`);
        
        // Verificar se as datas são válidas
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          // Retornar um valor padrão para evitar quebrar o componente
          const today = new Date();
          return { 
            ...a, 
            startDate: today, 
            endDate: new Date(today.getTime() + 60 * 60 * 1000) 
          } as Appointment & { startDate: Date; endDate: Date };
        }
        
        return { ...a, startDate, endDate } as Appointment & { startDate: Date; endDate: Date };
      } catch {
        // Retornar um valor padrão para evitar quebrar o componente
        const today = new Date();
        return { 
          ...a, 
          startDate: today, 
          endDate: new Date(today.getTime() + 60 * 60 * 1000) 
        } as Appointment & { startDate: Date; endDate: Date };
      }
    });
  }, [appointments]);

  const hoursRange = useMemo(() => {
    const arr: number[] = [];
    for (let h = startHour; h < endHour; h++) arr.push(h);
    return arr;
  }, [startHour, endHour]);

  // Scroll to current hour on first render
  React.useEffect(() => {
    const now = new Date();
    const grid = document.getElementById('kanban-grid');
    if (grid && now.getHours() >= startHour && now.getHours() <= endHour) {
      const minutesNow = now.getHours() * 60 + now.getMinutes();
      const topPx = ((minutesNow - startHour * 60) / hourStep) * SLOT_HEIGHT;
      setTimeout(() => {
        grid.scrollTo({ top: Math.max(0, topPx - 100), behavior: 'smooth' });
      }, 500);
    }
  }, [weekStart, startHour, endHour, hourStep]);

  // Agrupar agendamentos por dia para marcação visual
  const appointmentsByDay = useMemo(() => {
    const days: Array<Array<typeof mapped[0]>> = Array(7).fill(0).map(() => []);
    
    mapped.forEach(appt => {
      const colIndex = Math.floor((appt.startDate.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
      if (colIndex >= 0 && colIndex < 7) {
        days[colIndex].push(appt);
      }
    });
    
    return days;
  }, [mapped, weekStart]);

  // Mapa de agendamentos por slot (dia, hora)
  const appointmentsBySlot = useMemo(() => {
    const slots: Record<string, typeof mapped> = {};
    
    mapped.forEach(appt => {
      const colIndex = Math.floor((appt.startDate.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
      if (colIndex >= 0 && colIndex < 7) {
        const startHourDecimal = appt.startDate.getHours() + (appt.startDate.getMinutes() / 60);
        const slotHour = Math.floor(startHourDecimal);
        
        if (slotHour >= startHour && slotHour < endHour) {
          const slotKey = `${colIndex}-${slotHour}`;
          if (!slots[slotKey]) {
            slots[slotKey] = [];
          }
          slots[slotKey].push(appt);
        }
      }
    });
    
    return slots;
  }, [mapped, weekStart, startHour, endHour]);

  // Função para lidar com cliques nas células vazias
  const handleSlotClick = (day: number, hour: number) => {
    const slotKey = `${day}-${hour}`;
    const slotAppointments = appointmentsBySlot[slotKey];
    
    if (slotAppointments && slotAppointments.length > 0) {
      // Se existem agendamentos nesse slot, mostra os detalhes
      const appointment = slotAppointments[0]; // Se houver múltiplos, pegamos o primeiro
      if (onAppointmentClick) {
        onAppointmentClick(appointment);
      }
    } else if (onSlotClick) {
      try {
        // Calcular a data
        const date = addDays(weekStart, day);
        const dateStr = date.toISOString().split('T')[0];
        
        // Calcular o horário
        const startTimeHour = startHour + Math.floor(hour / (60 / hourStep));
        const startTimeMin = (hour % (60 / hourStep)) * hourStep;
        const startTime = `${String(startTimeHour).padStart(2, '0')}:${String(startTimeMin).padStart(2, '0')}`;
        
        // Calcular horário de término (padrão 1 hora depois)
        const endTimeHour = startTimeHour + 1;
        const endTime = `${String(endTimeHour).padStart(2, '0')}:${String(startTimeMin).padStart(2, '0')}`;
        
        // Chamar o callback com os parâmetros calculados
        onSlotClick(dateStr, startTime, endTime);
      } catch (error) {
        console.error('Erro ao processar clique na célula:', error);
      }
    }
  };

  return (
    <Box sx={{ overflowX: 'auto', position: 'relative', height: '100%', px: 1 }}>
      <Box
        id="kanban-grid"
        display="grid"
        gridTemplateColumns={`80px repeat(7, minmax(140px, 1fr))`}
        gridTemplateRows={`${HEADER_HEIGHT}px repeat(${hoursRange.length}, ${SLOT_HEIGHT}px)`}
        position="relative"
        minWidth="1000px"
        height="100%"
        overflow="auto"
        border={`1px solid ${theme.palette.divider}`}
        bgcolor={theme.palette.background.paper}
        sx={{ boxShadow: theme.shadows[1], borderRadius: 1 }}
      >
        {/* Header canto vazio */}
        <Paper 
          elevation={0}
          sx={{ 
            position: 'sticky', 
            top: 0, 
            zIndex: 3,
            height: HEADER_HEIGHT,
            borderBottom: `1px solid ${theme.palette.divider}`,
            bgcolor: theme.palette.grey[50],
          }} 
          square 
        />
        
        {/* Cabeçalhos de dias */}
        {Array.from({ length: 7 }).map((_, idx) => {
          const day = addDays(weekStart, idx);
          const dayHasAppointments = appointmentsByDay[idx].length > 0;
          const todayDay = isToday(day);
          
          return (
            <Paper
              elevation={0}
              key={`header-${idx}`}
              sx={{
                borderLeft: `1px solid ${theme.palette.divider}`,
                borderBottom: `1px solid ${theme.palette.divider}`,
                padding: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: todayDay ? theme.palette.primary.light + '30' : theme.palette.background.paper,
                position: 'sticky',
                top: 0,
                zIndex: 2,
                height: HEADER_HEIGHT,
                transition: 'background-color 0.2s ease',
                '&:hover': {
                  backgroundColor: todayDay
                    ? theme.palette.primary.light + '40'
                    : theme.palette.action.hover,
                }
              }}
            >
              <Typography variant="caption" color="textSecondary" sx={{ mb: 0.5, textTransform: 'capitalize' }}>
                {format(day, 'EEEE', { locale: ptBR })}
              </Typography>
              
              <Typography 
                variant="h5" 
                align="center"
                sx={{ 
                  fontWeight: todayDay ? 700 : 500,
                  color: todayDay ? theme.palette.primary.main : 'inherit',
                  lineHeight: 1.2
                }}
              >
                {format(day, 'dd')}
              </Typography>
              
              <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                {format(day, 'MMM', { locale: ptBR })}
              </Typography>
              
              {dayHasAppointments && (
                <Badge
                  color="primary"
                  badgeContent={appointmentsByDay[idx].length}
                  max={99}
                  sx={{ 
                    position: 'absolute', 
                    top: '8px', 
                    right: '8px',
                    '& .MuiBadge-badge': {
                      fontSize: '0.7rem',
                      height: '20px',
                      minWidth: '20px'
                    }
                  }}
                />
              )}

              {todayDay && (
                <Box 
                  sx={{ 
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '70%',
                    height: '3px',
                    backgroundColor: theme.palette.primary.main,
                    borderRadius: '3px 3px 0 0'
                  }}
                />
              )}
            </Paper>
          );
        })}

        {/* Coluna de horários + células vazias */}
        {hoursRange.map((hour) => (
          <React.Fragment key={`time-${hour}`}>
            {/* Time label */}
            <Paper
              elevation={0}
              sx={{
                height: SLOT_HEIGHT,
                borderBottom: `1px solid ${theme.palette.divider}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.palette.grey[50],
                position: 'sticky',
                left: 0,
                zIndex: 1,
              }}
            >
              <Typography variant="caption" fontWeight="medium" color="textSecondary">{`${hour.toString().padStart(2, '0')}:00`}</Typography>
            </Paper>
            
            {/* Células clicáveis para cada dia */}
            {Array.from({ length: 7 }).map((_, idx) => {
              const day = addDays(weekStart, idx);
              const isDayToday = isToday(day);
              const isCurrentHour = isDayToday && new Date().getHours() === hour;
              
              // Verificar se há agendamentos neste slot
              const slotKey = `${idx}-${hour}`;
              const hasAppointments = appointmentsBySlot[slotKey] && appointmentsBySlot[slotKey].length > 0;
              const slotAppointments = appointmentsBySlot[slotKey] || [];
              const primaryAppointment = slotAppointments[0]; // Para obter o status, se houver
              const appointmentCount = slotAppointments.length;
              
              return (
                <Button
                  key={`slot-${hour}-${idx}`}
                  onClick={() => handleSlotClick(idx, hour)}
                  sx={{
                    borderLeft: `1px solid ${theme.palette.divider}`,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    height: SLOT_HEIGHT,
                    p: 0,
                    m: 0,
                    borderRadius: 0,
                    minWidth: 'unset',
                    textTransform: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: onSlotClick || hasAppointments ? 'pointer' : 'default',
                    backgroundColor: hasAppointments
                      ? (primaryAppointment.status === 'PENDING' 
                          ? STATUS_COLORS.PENDING.bg
                          : primaryAppointment.status === 'CONFIRMED'
                            ? STATUS_COLORS.CONFIRMED.bg
                            : STATUS_COLORS.CANCELED.bg)
                      : isCurrentHour 
                        ? theme.palette.primary.light + '35'
                        : isDayToday 
                          ? theme.palette.primary.light + '15' 
                          : 'transparent',
                    '&:hover': {
                      backgroundColor: hasAppointments
                        ? (primaryAppointment.status === 'PENDING' 
                            ? STATUS_COLORS.PENDING.bg + 'dd'
                            : primaryAppointment.status === 'CONFIRMED'
                              ? STATUS_COLORS.CONFIRMED.bg + 'dd'
                              : STATUS_COLORS.CANCELED.bg + 'dd')
                        : isCurrentHour
                          ? theme.palette.primary.light + '45'
                          : theme.palette.action.hover,
                      boxShadow: hasAppointments ? 'inset 0 0 5px rgba(0,0,0,0.1)' : 'none',
                    },
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {hasAppointments ? (
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center', 
                      width: '100%'
                    }}>
                      {/* Iniciais do cliente */}
                      <Typography 
                        variant="subtitle2" 
                        sx={{ 
                          fontSize: '0.8rem',
                          fontWeight: 600, 
                          color: STATUS_COLORS[primaryAppointment.status].text
                        }}
                      >
                        {primaryAppointment.client?.name.split(' ')[0] || 'Cliente'}
                      </Typography>
                      
                      {/* Hora do agendamento */}
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          fontSize: '0.7rem',
                          color: STATUS_COLORS[primaryAppointment.status].text,
                          opacity: 0.85
                        }}
                      >
                        {primaryAppointment.startTime}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography 
                      variant="caption" 
                      color="textSecondary" 
                      sx={{ opacity: 0.3 }}
                    >
                      {hour}:00
                    </Typography>
                  )}
                  
                  {/* Indicador de múltiplos agendamentos */}
                  {appointmentCount > 1 && (
                    <Badge
                      badgeContent={appointmentCount}
                      color="primary"
                      sx={{
                        position: 'absolute',
                        top: 2,
                        right: 2,
                        '& .MuiBadge-badge': {
                          height: 16,
                          minWidth: 16,
                          fontSize: '0.65rem',
                        }
                      }}
                    />
                  )}
                </Button>
              );
            })}
          </React.Fragment>
        ))}

        {/* Linha que indica a hora atual */}
        {(() => {
          const now = new Date();
          const today = now.getDay() - 1; // -1 porque segunda é o dia 0 no grid (domingo é 6)
          
          // Verifica se o dia atual está na semana exibida
          if (today >= 0 && today < 7) {
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            
            // Calcular posição vertical baseada na hora e minutos atuais
            if (currentHour >= startHour && currentHour < endHour) {
              const minutesFromStartHour = (currentHour - startHour) * 60 + currentMinute;
              const topPosition = (minutesFromStartHour / hourStep) * SLOT_HEIGHT + HEADER_HEIGHT;
              
              return (
                <Box
                  sx={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: topPosition,
                    height: '2px',
                    backgroundColor: theme.palette.error.main,
                    zIndex: 30,
                    pointerEvents: 'none'
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 76,
                      top: -4,
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: theme.palette.error.main,
                    }}
                  />
                </Box>
              );
            }
          }
          
          return null;
        })()}
      </Box>
    </Box>
  );
};

export default KanbanCalendar; 