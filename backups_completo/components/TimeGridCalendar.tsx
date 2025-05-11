import React, { useState, useRef, useEffect } from 'react';
import { 
  alpha,
  Box, 
  Paper, 
  Typography, 
  useTheme, 
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Modal,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Backdrop
} from '@mui/material';
import { startOfWeek, addDays, format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Interfaces
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
  date: string;
  startTime: string;
  endTime: string;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELED';
  client?: Client;
  therapist?: Therapist;
  service?: Service;
  notes?: string;
}

interface TimeGridCalendarProps {
  appointments: Appointment[];
  weekStart?: Date;
  startHour?: number;
  endHour?: number;
  onMoveAppointment?: (id: string, newDate: string, newStartTime: string, newEndTime: string) => void;
  onAppointmentClick?: (appointment: Appointment) => void;
}

// Status colors
const STATUS_COLORS = {
  CONFIRMED: { 
    bg: '#e1f5fe', 
    hover: '#b3e5fc', 
    text: '#0277bd', 
    border: '#4fc3f7',
    label: 'Confirmado'
  },
  PENDING: { 
    bg: '#fff8e1', 
    hover: '#ffecb3', 
    text: '#ff8f00', 
    border: '#ffca28',
    label: 'Pendente'
  },
  CANCELED: { 
    bg: '#f5f5f5', 
    hover: '#eeeeee', 
    text: '#616161', 
    border: '#bdbdbd',
    label: 'Cancelado'
  },
};

const parseTime = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

const TimeGridCalendar: React.FC<TimeGridCalendarProps> = ({
  appointments,
  weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }), // Start from Monday
  startHour = 8,
  endHour = 22,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onMoveAppointment, // será usado quando implementarmos drag-and-drop
  onAppointmentClick,
}) => {
  const theme = useTheme();
  const gridRef = useRef<HTMLDivElement>(null);
  const [currentTimeIndicator, setCurrentTimeIndicator] = useState<HTMLDivElement | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [useModalAlternative, setUseModalAlternative] = useState(true);
  
  // Generate hours array
  const hoursArray = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);
  
  // Generate weekdays
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  // Group appointments by day and time
  const appointmentsByDayAndTime = weekDays.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return appointments.filter(apt => {
      const aptDate = apt.date.includes('T') ? apt.date.split('T')[0] : apt.date;
      return aptDate === dateStr;
    }).sort((a, b) => {
      return parseTime(a.startTime) - parseTime(b.startTime);
    });
  });

  // Update current time indicator position
  useEffect(() => {
    const updateCurrentTimeLine = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      // Check if current time is within displayed hours
      if (currentHour >= startHour && currentHour < endHour) {
        const currentDay = weekDays.findIndex(day => isSameDay(day, now));
        if (currentDay >= 0) {
          const timePercentage = (currentHour - startHour) + (currentMinute / 60);
          const cellHeight = 60; // height of each hour cell
          
          if (gridRef.current) {
            if (!currentTimeIndicator) {
              // Create indicator if it doesn't exist
              const indicator = document.createElement('div');
              indicator.className = 'current-time-indicator';
              indicator.style.position = 'absolute';
              indicator.style.height = '2px';
              indicator.style.backgroundColor = theme.palette.error.main;
              indicator.style.width = '100%';
              indicator.style.zIndex = '1000';
              indicator.style.pointerEvents = 'none';
              
              const timeLabel = document.createElement('div');
              timeLabel.innerText = format(now, 'HH:mm');
              timeLabel.style.position = 'absolute';
              timeLabel.style.backgroundColor = theme.palette.error.main;
              timeLabel.style.color = 'white';
              timeLabel.style.fontSize = '10px';
              timeLabel.style.padding = '2px 4px';
              timeLabel.style.borderRadius = '2px';
              timeLabel.style.left = '0';
              timeLabel.style.transform = 'translateY(-50%)';
              
              indicator.appendChild(timeLabel);
              document.querySelector('.time-grid-container')?.appendChild(indicator);
              setCurrentTimeIndicator(indicator);
            }
            
            if (currentTimeIndicator) {
              // Update position
              const top = 50 + (timePercentage * cellHeight); // 50px is header height
              currentTimeIndicator.style.top = `${top}px`;
            }
          }
        }
      }
    };
    
    updateCurrentTimeLine();
    const intervalId = setInterval(updateCurrentTimeLine, 60000); // Update every minute
    
    return () => {
      clearInterval(intervalId);
      if (currentTimeIndicator && currentTimeIndicator.parentNode) {
        currentTimeIndicator.parentNode.removeChild(currentTimeIndicator);
      }
    };
  }, [currentTimeIndicator, startHour, endHour, weekDays, theme]);
  
  // Handle appointment click
  const handleAppointmentClick = (event: React.MouseEvent<HTMLElement>, appointment: Appointment) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (onAppointmentClick) {
      onAppointmentClick(appointment);
    } else {
      setSelectedAppointment(appointment);
      setOpenDialog(true);
      
      // Verificar se o Dialog foi renderizado e usar alternativa se necessário
      setTimeout(() => {
        if (!document.querySelector('.MuiDialog-root')) {
          setUseModalAlternative(true);
        }
      }, 100);
    }
  };
  
  // Close dialog
  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedAppointment(null);
  };
  
  return (
    <Box ref={gridRef} sx={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <Box className="time-grid-container" sx={{ 
        flexGrow: 1, 
        position: 'relative', 
        overflow: 'auto', 
        backgroundColor: theme.palette.grey[50],
      }}>
        {/* Grid Container */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: '60px repeat(7, minmax(200px, 1fr))', 
          minWidth: 800,
          height: '100%',
          position: 'relative',
        }}>
          {/* Header - Day cells */}
          <Box sx={{ 
            gridColumn: '1 / 2', 
            height: 60, 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: `1px solid ${theme.palette.divider}`, 
            borderRight: `1px solid ${theme.palette.divider}`,
            bgcolor: theme.palette.background.paper,
            position: 'sticky',
            top: 0,
            left: 0,
            zIndex: 1000,
            boxShadow: '2px 0 5px rgba(0,0,0,0.1), 0 2px 5px rgba(0,0,0,0.1)',
          }}>
            <Typography variant="caption" color="textSecondary">Hora</Typography>
          </Box>
          
          {weekDays.map((day, index) => (
            <Box key={`day-${index}`} sx={{ 
              gridColumn: `${index + 2} / ${index + 3}`, 
              height: 60,
              p: 1,
              borderLeft: `1px solid ${theme.palette.divider}`, 
              borderBottom: `2px solid ${isSameDay(day, new Date()) ? theme.palette.primary.main : theme.palette.divider}`,
              bgcolor: isSameDay(day, new Date()) 
                ? alpha(theme.palette.primary.main, 0.15)
                : theme.palette.background.paper,
              color: isSameDay(day, new Date()) ? theme.palette.primary.main : 'inherit',
              position: 'sticky',
              top: 0,
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            }}>
              <Typography align="center" variant="subtitle1" fontWeight="bold" sx={{ textTransform: 'uppercase', fontSize: '0.85rem' }}>
                {format(day, 'EEE', { locale: ptBR })}
              </Typography>
              <Typography align="center" variant="body2" fontWeight="medium">
                {format(day, 'dd/MM')}
              </Typography>
            </Box>
          ))}
          
          {/* Time grid - Hour rows */}
          {hoursArray.map(hour => (
            <React.Fragment key={`hour-${hour}`}>
              {/* Time column */}
              <Box sx={{ 
                gridColumn: '1 / 2', 
                height: 50, 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'center',
                borderBottom: `1px solid ${theme.palette.divider}`,
                borderRight: `1px solid ${theme.palette.divider}`,
                bgcolor: theme.palette.background.paper,
                position: 'sticky',
                left: 0,
                zIndex: 90,
                boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
              }}>
                <Typography variant="caption" color="textSecondary" fontWeight="medium">
                  {`${hour}:00`}
                </Typography>
              </Box>
              
              {/* Day cells */}
              {weekDays.map((day, dayIndex) => (
                <Box 
                  key={`cell-${hour}-${dayIndex}`} 
                  sx={{ 
                    gridColumn: `${dayIndex + 2} / ${dayIndex + 3}`, 
                    height: 50, 
                    borderLeft: `1px solid ${theme.palette.divider}`, 
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    position: 'relative',
                    bgcolor: isSameDay(day, new Date()) ? 'rgba(25, 118, 210, 0.04)' : 'transparent',
                    '&:hover': {
                      bgcolor: theme.palette.action.hover,
                    }
                  }}
                >
                  {/* Appointments */}
                  {appointmentsByDayAndTime[dayIndex]
                    .filter(apt => {
                      const startTimeHour = parseInt(apt.startTime.split(':')[0]);
                      return startTimeHour === hour;
                    })
                    .map((apt) => {
                      const startMinute = parseInt(apt.startTime.split(':')[1]);
                      const startHour = parseInt(apt.startTime.split(':')[0]);
                      const endHour = parseInt(apt.endTime.split(':')[0]);
                      const endMinute = parseInt(apt.endTime.split(':')[1]);
                      
                      // Calculate duration in minutes
                      const durationMinutes = 
                        ((endHour - startHour) * 60) + (endMinute - startMinute);
                      
                      // Calculate relative position within cell
                      const topPercentage = (startMinute / 60) * 100;
                      
                      // Calculate height based on duration (each hour cell is 50px now)
                      const heightPx = Math.max(
                        36, // minimum height
                        (durationMinutes / 60) * 50
                      );
                      
                      return (
                        <Paper
                          key={apt.id}
                          component="div"
                          elevation={2}
                          onClick={(e) => handleAppointmentClick(e, apt)}
                          sx={{
                            position: 'absolute',
                            top: `${topPercentage}%`,
                            left: 5,
                            right: 5,
                            height: heightPx,
                            bgcolor: STATUS_COLORS[apt.status].bg,
                            color: STATUS_COLORS[apt.status].text,
                            border: `1px solid ${STATUS_COLORS[apt.status].border}`,
                            borderLeft: `6px solid ${STATUS_COLORS[apt.status].text}`,
                            borderRadius: '6px',
                            p: 0.5,
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: STATUS_COLORS[apt.status].hover,
                              boxShadow: `0 8px 16px rgba(0,0,0,0.15), 0 0 0 2px ${STATUS_COLORS[apt.status].border}`,
                              transform: 'translateY(-2px) scale(1.03)',
                            },
                            zIndex: 10
                          }}
                        >
                          {/* Layout simplificado em duas linhas para garantir visibilidade */}
                          <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            height: '100%', 
                            justifyContent: 'space-between',
                            width: '100%',
                          }}>
                            {/* Linha 1: Nome do cliente com avatar */}
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              overflow: 'hidden',
                              width: '100%',
                            }}>
                              <Avatar
                                sx={{ 
                                  width: 16,
                                  height: 16,
                                  fontSize: '0.6rem', 
                                  bgcolor: STATUS_COLORS[apt.status].text,
                                  mr: 0.5,
                                  flexShrink: 0
                                }}
                              >
                                {apt.client?.name.charAt(0) || '?'}
                              </Avatar>
                              <Typography 
                                variant="caption" 
                                fontWeight="bold" 
                                sx={{ 
                                  fontSize: '0.65rem',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  width: 'calc(100% - 20px)',
                                }}
                                title={apt.client?.name} // Native HTML tooltip
                              >
                                {apt.client?.name}
                              </Typography>
                            </Box>

                            {/* Linha 2: Horário (sempre visível) */}
                            <Typography 
                              variant="caption"
                              sx={{ 
                                fontSize: '0.65rem',
                                mt: 'auto',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                width: '100%',
                              }}
                            >
                              {apt.startTime} - {apt.endTime}
                            </Typography>
                            
                            {/* Informações extras apenas para cards maiores */}
                            {heightPx > 50 && (
                              <>
                                {apt.service && (
                                  <Typography 
                                    variant="caption" 
                                    sx={{ 
                                      fontSize: '0.65rem',
                                      opacity: 0.8,
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      width: '100%',
                                      mt: 0.5,
                                    }}
                                    title={apt.service.name}
                                  >
                                    {apt.service.name}
                                  </Typography>
                                )}
                              
                                {apt.therapist && (
                                  <Box sx={{ 
                                    position: 'absolute', 
                                    bottom: 1, 
                                    right: 1, 
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}>
                                    <Avatar
                                      sx={{ 
                                        width: 16, 
                                        height: 16, 
                                        fontSize: '0.6rem', 
                                        bgcolor: theme.palette.primary.main
                                      }}
                                      title={apt.therapist.name}
                                    >
                                      {apt.therapist.name.charAt(0)}
                                    </Avatar>
                                  </Box>
                                )}
                              </>
                            )}
                          </Box>
                        </Paper>
                      );
                    })}
                </Box>
              ))}
            </React.Fragment>
          ))}
        </Box>
      </Box>
      
      {/* Adicionar o Modal como alternativa ao Dialog */}
      {useModalAlternative && selectedAppointment && (
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 999 }}
          open={openDialog}
          onClick={handleDialogClose}
        >
          <Modal
            open={openDialog}
            onClose={handleDialogClose}
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Card sx={{ 
              width: '90%', 
              maxWidth: 500, 
              maxHeight: '90vh',
              overflow: 'auto', 
              bgcolor: 'background.paper',
              boxShadow: 24,
              p: 2,
              borderRadius: 2
            }}>
              <CardHeader
                title={`Detalhes do Agendamento: ${selectedAppointment.client?.name}`}
                sx={{ 
                  bgcolor: alpha(STATUS_COLORS[selectedAppointment.status].bg, 0.7),
                  color: STATUS_COLORS[selectedAppointment.status].text,
                  borderRadius: '8px 8px 0 0',
                  mb: 2
                }}
              />
              <CardContent>
                <Typography variant="body1" paragraph>
                  <strong>Data:</strong> {new Date(selectedAppointment.date).toLocaleDateString('pt-BR')}
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Horário:</strong> {selectedAppointment.startTime} - {selectedAppointment.endTime}
                </Typography>
                {selectedAppointment.service && (
                  <Typography variant="body1" paragraph>
                    <strong>Serviço:</strong> {selectedAppointment.service.name}
                  </Typography>
                )}
                {selectedAppointment.therapist && (
                  <Typography variant="body1" paragraph>
                    <strong>Terapeuta:</strong> {selectedAppointment.therapist.name}
                  </Typography>
                )}
                {selectedAppointment.notes && (
                  <Typography variant="body1" paragraph>
                    <strong>Observações:</strong> {selectedAppointment.notes}
                  </Typography>
                )}
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end' }}>
                <Button onClick={handleDialogClose} color="inherit">Fechar</Button>
                <Button color="primary" variant="contained">
                  {selectedAppointment.status === 'CANCELED' ? 'Reagendar' : 'Editar'}
                </Button>
              </CardActions>
            </Card>
          </Modal>
        </Backdrop>
      )}
      
      {/* Manter o Dialog original como fallback caso a abordagem alternativa não seja usada */}
      {!useModalAlternative && (
        <Dialog
          open={openDialog}
          onClose={handleDialogClose}
          maxWidth="sm"
          fullWidth
          keepMounted={false}
          sx={{ 
            zIndex: 1500,
            position: 'fixed',
            display: openDialog ? 'flex' : 'none',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {selectedAppointment ? (
            <>
              <DialogTitle>
                Detalhes do Agendamento: {selectedAppointment.client?.name}
              </DialogTitle>
              <DialogContent dividers>
                <Typography variant="body1" paragraph>
                  <strong>Data:</strong> {new Date(selectedAppointment.date).toLocaleDateString('pt-BR')}
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Horário:</strong> {selectedAppointment.startTime} - {selectedAppointment.endTime}
                </Typography>
                {selectedAppointment.service && (
                  <Typography variant="body1" paragraph>
                    <strong>Serviço:</strong> {selectedAppointment.service.name}
                  </Typography>
                )}
                {selectedAppointment.therapist && (
                  <Typography variant="body1" paragraph>
                    <strong>Terapeuta:</strong> {selectedAppointment.therapist.name}
                  </Typography>
                )}
                {selectedAppointment.notes && (
                  <Typography variant="body1" paragraph>
                    <strong>Observações:</strong> {selectedAppointment.notes}
                  </Typography>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={handleDialogClose} color="inherit">Fechar</Button>
                <Button color="primary" variant="contained">
                  {selectedAppointment.status === 'CANCELED' ? 'Reagendar' : 'Editar'}
                </Button>
              </DialogActions>
            </>
          ) : (
            <DialogContent>
              <Typography>Carregando detalhes...</Typography>
            </DialogContent>
          )}
        </Dialog>
      )}
    </Box>
  );
};

export default TimeGridCalendar; 