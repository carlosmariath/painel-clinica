import React, { useState } from 'react';
import { Box, Typography, useTheme, Paper, Button } from '@mui/material';
import { startOfWeek, addDays } from 'date-fns';

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

const STATUS_COLORS: Record<Appointment['status'], {bg: string, text: string}> = {
  CONFIRMED: { bg: '#e3f2fd', text: '#1565c0' },  // azul claro
  PENDING: { bg: '#fff8e1', text: '#f57f17' },    // amarelo
  CANCELED: { bg: '#f5f5f5', text: '#757575' },   // cinza
};

// Versão simplificada do KanbanCalendar (SEM DND) para resolver problemas de clique
const KanbanCalendar: React.FC<KanbanCalendarProps> = ({
  appointments,
  onMove,
  weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }),
  startHour = 8,
  endHour = 23,
  hourStep = 60,
  onSlotClick,
  onAppointmentClick,
}) => {
  const theme = useTheme();

  // Converter appointments -> datas JS para cálculo de posição
  const mapped = React.useMemo(() => {
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

  const hoursRange = React.useMemo(() => {
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

  // Função para lidar com cliques nas células vazias
  const handleSlotClick = (day: number, hour: number) => {
    console.log('handleSlotClick chamado:', { day, hour });
    
    if (!onSlotClick) return;
    
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
      
      console.log('onSlotClick será chamado com:', { dateStr, startTime, endTime });
      
      // IMPORTANTE: REMOVER ESTA LINHA APÓS TESTES
      alert(`Célula clicada: Data=${dateStr}, Hora=${startTime}`);
      
      // Chamar o callback com os parâmetros calculados
      onSlotClick(dateStr, startTime, endTime);
    } catch (error) {
      console.error('Erro ao processar clique na célula:', error);
    }
  };

  return (
    <Box sx={{ overflowX: 'auto', position: 'relative', height: '100%' }}>
        <Box
          id="kanban-grid"
          display="grid"
          gridTemplateColumns={`80px repeat(7, minmax(140px, 1fr))`}
          gridTemplateRows={`${SLOT_HEIGHT}px repeat(${hoursRange.length}, ${SLOT_HEIGHT}px)`}
          position="relative"
          minWidth="1000px"
          maxHeight="calc(100vh - 180px)"
          overflow="auto"
          border={`1px solid ${theme.palette.divider}`}
          bgcolor={theme.palette.background.paper}
          sx={{ boxShadow: theme.shadows[1], borderRadius: 1 }}
          ref={(el: HTMLDivElement | null) => {
            if (el) {
              const now = new Date();
              if (now >= weekStart && now <= addDays(weekStart, 6)) {
                const minutesNow = now.getHours() * 60 + now.getMinutes();
                if (minutesNow >= startHour * 60 && minutesNow <= endHour * 60) {
                  const topPx = ((minutesNow - startHour * 60) / hourStep) * SLOT_HEIGHT + SLOT_HEIGHT;
                  
                  const oldLine = document.getElementById('current-time-line');
                  if (oldLine) oldLine.remove();
                  
                  const timeLine = document.createElement('div');
                  timeLine.id = 'current-time-line';
                  timeLine.style.position = 'absolute';
                  timeLine.style.top = `${topPx}px`;
                  timeLine.style.left = '80px';
                  timeLine.style.right = '0';
                  timeLine.style.height = '2px';
                  timeLine.style.backgroundColor = theme.palette.error.main;
                  timeLine.style.zIndex = '1000';
                  timeLine.style.pointerEvents = 'none';
                  
                  el.appendChild(timeLine);
                  
                  el.onscroll = () => {
                    if (timeLine) {
                      const scrollTop = el.scrollTop;
                      timeLine.style.top = `${topPx - scrollTop}px`;
                    }
                  };
                  
                  const scrollButton = document.createElement('button');
                  scrollButton.innerText = 'Agora';
                  scrollButton.style.position = 'absolute';
                  scrollButton.style.top = `${topPx - 30}px`;
                  scrollButton.style.left = '10px';
                  scrollButton.style.zIndex = '1000';
                  scrollButton.style.fontSize = '0.75rem';
                  scrollButton.style.padding = '2px 8px';
                  scrollButton.style.borderRadius = '12px';
                  scrollButton.style.backgroundColor = theme.palette.error.main;
                  scrollButton.style.color = '#fff';
                  scrollButton.style.border = 'none';
                  scrollButton.style.cursor = 'pointer';
                  
                  scrollButton.onclick = () => {
                    el.scrollTo({ top: Math.max(0, topPx - 200), behavior: 'smooth' });
                  };
                  
                  if (!document.getElementById('scroll-to-now')) {
                    scrollButton.id = 'scroll-to-now';
                    el.appendChild(scrollButton);
                    el.onscroll = () => {
                      if (timeLine) {
                        const scrollTop = el.scrollTop;
                        timeLine.style.top = `${topPx - scrollTop}px`;
                        scrollButton.style.top = `${topPx - scrollTop - 30}px`;
                      }
                    };
                  }
                }
              }
            }
          }}
        >
          {/* Header canto vazio */}
          <Paper sx={{ position: 'sticky', top: 0, zIndex: 3 }} square />
          {/* Cabeçalhos de dias */}
          {Array.from({ length: 7 }).map((_, idx) => {
            const day = addDays(weekStart, idx);
            const label = day.toLocaleDateString('pt-BR', {
              weekday: 'short',
              day: '2-digit',
              month: '2-digit',
            });
            return (
              <Paper
                key={`header-${idx}`}
                sx={{
                  borderLeft: `1px solid ${theme.palette.divider}`,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.palette.grey[50],
                  position: 'sticky',
                  top: 0,
                  zIndex: 2,
                }}
              >
                <Typography variant="subtitle2">{label}</Typography>
              </Paper>
            );
          })}

          {/* Coluna de horários + células vazias */}
          {hoursRange.map((hour) => (
            <React.Fragment key={`time-${hour}`}>
              {/* Time label */}
              <Paper
                sx={{
                  height: SLOT_HEIGHT,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.palette.grey[100],
                  position: 'sticky',
                  left: 0,
                  zIndex: 1,
                }}
              >
                <Typography variant="caption" color="textSecondary">{`${hour.toString().padStart(2, '0')}:00`}</Typography>
              </Paper>
              {/* Empty cells for each day */}
              {Array.from({ length: 7 }).map((_, idx) => (
                <Box 
                  key={`slot-wrapper-${hour}-${idx}`} 
                  sx={{ 
                    width: '100%', 
                    height: '100%', 
                    position: 'relative'
                  }}
                >
                  <Button
                    key={`empty-${hour}-${idx}`}
                    disableRipple
                    variant="text"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      borderLeft: `1px solid ${theme.palette.divider}`,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      height: '100%',
                      width: '100%',
                      minWidth: 'unset',
                      borderRadius: 0,
                      textTransform: 'none',
                      ...(idx === 0 && {
                        position: 'sticky',
                        left: 0,
                        backgroundColor: theme.palette.background.paper,
                        zIndex: 0,
                      }),
                      cursor: onSlotClick ? 'pointer' : 'default',
                      '&:hover': onSlotClick ? {
                        backgroundColor: theme.palette.action.hover,
                      } : {},
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 0,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log(`KanbanCalendar - BOTÃO CLICADO: ${hour}:00 - dia ${idx}`);
                      handleSlotClick(idx, hour - startHour);
                    }}
                  >
                    {onSlotClick && (
                      <Typography variant="caption" color="textSecondary" sx={{ opacity: 0.3 }}>
                        {hour}:00
                      </Typography>
                    )}
                  </Button>
                </Box>
              ))}
            </React.Fragment>
          ))}

          {/* Appointment cards */}
          {mapped.map((appt) => {
            const colIndex = Math.floor((appt.startDate.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
            if (colIndex < 0 || colIndex > 6) return null;
            const startMinutes = appt.startDate.getHours() * 60 + appt.startDate.getMinutes();
            const endMinutes = appt.endDate.getHours() * 60 + appt.endDate.getMinutes();
            const topPx = ((startMinutes - startHour * 60) / hourStep) * SLOT_HEIGHT;
            const heightPx = ((endMinutes - startMinutes) / hourStep) * SLOT_HEIGHT;

            const DraggableCard: React.FC = () => {
              const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: appt.id });
              const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;
              return (
                <Box ref={setNodeRef} style={style} {...listeners} {...attributes}
                  sx={{
                    position: 'absolute',
                    gridColumnStart: colIndex + 2,
                    transform: `translateX(calc((100% / 8) * ${colIndex + 1}))`,
                    top: SLOT_HEIGHT + topPx,
                    width: `calc((100% / 8) - ${theme.spacing(2)})`,
                  }}
                >
                  <Paper
                    sx={{
                      position: 'relative',
                      height: heightPx,
                      bgcolor: STATUS_COLORS[appt.status].bg,
                      color: STATUS_COLORS[appt.status].text,
                      borderRadius: 1.5,
                      p: 1,
                      fontSize: '0.8rem',
                      overflow: 'visible',
                      cursor: 'pointer',
                      boxShadow: 2,
                      '&:hover': {
                        boxShadow: 4,
                        transform: 'translateY(-2px)',
                      },
                      border: '1px solid',
                      borderColor: STATUS_COLORS[appt.status].text + '40',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-start',
                      transition: 'all 0.2s ease',
                    }}
                    onClick={(e) => {
                      e.stopPropagation(); // Evitar propagação para o container
                      handleAppointmentClick(appt);
                    }}
                  >
                    {/* Status Tag */}
                    <Box 
                      sx={{ 
                        position: 'absolute',
                        top: -10,
                        right: 8,
                        bgcolor: STATUS_COLORS[appt.status].text,
                        color: '#fff',
                        py: 0.25,
                        px: 0.75,
                        borderRadius: 5,
                        fontSize: '0.65rem',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      {appt.status === 'CONFIRMED' ? 'Confirmado' : 
                       appt.status === 'PENDING' ? 'Pendente' : 'Cancelado'}
                    </Box>
                    
                    {/* Client Circle Initial */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.75 }}>
                      <Box 
                        sx={{ 
                          width: 22, 
                          height: 22, 
                          borderRadius: '50%', 
                          bgcolor: STATUS_COLORS[appt.status].text,
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 1,
                          fontSize: '0.7rem',
                          fontWeight: 'bold'
                        }}
                      >
                        {appt.client?.name.charAt(0) || '?'}
                      </Box>
                      <Typography 
                        variant="subtitle2" 
                        sx={{ fontWeight: 600, lineHeight: 1.2 }} 
                        noWrap
                      >
                        {appt.client?.name ?? '—'} 
                      </Typography>
                    </Box>
                    
                    {/* Content */}
                    <Box sx={{ pl: 0.5, mb: 0.5 }}>
                      {appt.service && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: STATUS_COLORS[appt.status].text, mr: 1, opacity: 0.7 }} />
                          <Typography variant="caption" sx={{ fontSize: '0.7rem', opacity: 0.9 }} noWrap>
                            {appt.service.name}
                          </Typography>
                        </Box>
                      )}
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: STATUS_COLORS[appt.status].text, mr: 1, opacity: 0.7 }} />
                        <Typography variant="caption" sx={{ fontSize: '0.7rem', opacity: 0.9 }}>
                          {appt.startTime} - {appt.endTime}
                        </Typography>
                      </Box>
                    </Box>
                    
                    {/* Badge for therapist */}
                    {appt.therapist && (
                      <Box 
                        sx={{ 
                          position: 'absolute',
                          bottom: -6,
                          right: 8,
                          bgcolor: 'white',
                          color: STATUS_COLORS[appt.status].text,
                          border: '1px solid',
                          borderColor: STATUS_COLORS[appt.status].text + '40',
                          py: 0,
                          px: 0.75,
                          borderRadius: 5,
                          fontSize: '0.65rem',
                          fontWeight: 'medium',
                        }}
                      >
                        {appt.therapist.name.split(' ')[0]}
                      </Box>
                    )}
                    
                    {/* Drag handle indicator */}
                    <Box 
                      sx={{ 
                        position: 'absolute',
                        top: 8,
                        left: -4,
                        height: '25%',
                        width: 4,
                        borderRadius: '2px',
                        bgcolor: STATUS_COLORS[appt.status].text,
                        opacity: 0.7
                      }}
                    />
                  </Paper>
                </Box>
              );
            };

            return <DraggableCard key={appt.id} />;
          })}
        </Box>

        {/* CAMADA DE CLIQUES - separada do DnD */}
        {onSlotClick && (
          <Box 
            sx={{ 
              position: 'absolute',
              top: SLOT_HEIGHT,
              left: 80,
              right: 0,
              bottom: 0,
              pointerEvents: 'none',
              zIndex: 1001,
              display: 'grid',
              gridTemplateColumns: `repeat(7, 1fr)`,
              gridTemplateRows: `repeat(${hoursRange.length}, ${SLOT_HEIGHT}px)`,
            }}
          >
            {hoursRange.map((hour) => (
              <React.Fragment key={`click-row-${hour}`}>
                {Array.from({ length: 7 }).map((_, idx) => (
                  <Button
                    key={`click-cell-${hour}-${idx}`}
                    disableRipple
                    variant="text"
                    sx={{
                      height: '100%',
                      width: '100%',
                      minWidth: 'unset',
                      borderRadius: 0,
                      p: 0,
                      m: 0,
                      pointerEvents: 'auto',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'rgba(0,0,0,0.04)',
                      },
                      opacity: 0,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log(`CLIQUE ABSOLUTO: ${hour}:00 - dia ${idx}`);
                      alert(`Slot clicado: ${hour}:00 - dia ${idx}`);
                      handleSlotClick(idx, hour - startHour);
                    }}
                  />
                ))}
              </React.Fragment>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default KanbanCalendar; 