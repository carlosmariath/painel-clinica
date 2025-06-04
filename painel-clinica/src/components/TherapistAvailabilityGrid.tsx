import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  Avatar,
  Tooltip,
  Badge,
  Skeleton,
  Alert,
  Button
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Schedule,
  Person,
  EventAvailable,
  EventBusy,
  Refresh
} from '@mui/icons-material';
import { format, addMinutes, parse, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TimeSlot {
  time: string;
  available: boolean;
  appointments?: number;
}

interface TherapistAvailability {
  therapist: {
    id: string;
    name: string;
    avatar?: string;
    specialty?: string;
  };
  slots: TimeSlot[];
  totalAvailable: number;
  workSchedule?: {
    start: string;
    end: string;
  };
}

interface Therapist {
  id: string;
  name: string;
  avatar?: string;
  specialty?: string;
}

interface Service {
  id: string;
  name: string;
  averageDuration?: number;
}

interface AvailabilityResponse {
  availableSlots: string[];
  busySlots: string[];
  workSchedule?: {
    start: string;
    end: string;
  };
}

interface TherapistAvailabilityGridProps {
  therapists: Therapist[];
  selectedDate: string;
  selectedService?: Service;
  branchId?: string;
  onSelectTherapist: (therapistId: string, time: string) => void;
  getAvailability: (therapistId: string, date: string, serviceId?: string, branchId?: string) => Promise<AvailabilityResponse>;
  loading?: boolean;
}

const TherapistAvailabilityGrid: React.FC<TherapistAvailabilityGridProps> = ({
  therapists,
  selectedDate,
  selectedService,
  branchId,
  onSelectTherapist,
  getAvailability,
  loading = false
}) => {
  const [availabilities, setAvailabilities] = useState<TherapistAvailability[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<{ therapistId: string; time: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Gerar slots de tempo baseado no horário de trabalho
  const generateTimeSlots = (startTime: string, endTime: string, duration: number = 60): string[] => {
    const slots: string[] = [];
    let current = parse(startTime, 'HH:mm', new Date());
    const end = parse(endTime, 'HH:mm', new Date());

    while (isBefore(current, end)) {
      slots.push(format(current, 'HH:mm'));
      current = addMinutes(current, duration);
    }

    return slots;
  };

  // Buscar disponibilidade de todos os terapeutas
  useEffect(() => {
    const fetchAllAvailabilities = async () => {
      if (!selectedDate || therapists.length === 0) return;

      setLoadingAvailability(true);
      setError(null);

      try {
        const availabilityPromises = therapists.map(async (therapist) => {
          try {
            const response = await getAvailability(
              therapist.id,
              selectedDate,
              selectedService?.id,
              branchId
            );

            // Assumindo que a resposta tem availableSlots e busySlots
            const { availableSlots = [], busySlots = [], workSchedule } = response;

            // Se não há workSchedule, significa que o terapeuta não tem disponibilidade
            if (!workSchedule) {
              return {
                therapist: {
                  id: therapist.id,
                  name: therapist.name,
                  avatar: therapist.avatar,
                  specialty: therapist.specialty
                },
                slots: [],
                totalAvailable: 0,
                workSchedule: undefined
              };
            }

            // Gerar todos os slots possíveis
            const allSlots = generateTimeSlots(
              workSchedule.start,
              workSchedule.end,
              selectedService?.averageDuration || 60
            );

            // Mapear slots com disponibilidade
            const slotsWithAvailability = allSlots.map(time => ({
              time,
              available: availableSlots.includes(time) && !busySlots.includes(time),
              appointments: busySlots.filter((slot: string) => slot === time).length
            }));

            return {
              therapist: {
                id: therapist.id,
                name: therapist.name,
                avatar: therapist.avatar,
                specialty: therapist.specialty
              },
              slots: slotsWithAvailability,
              totalAvailable: slotsWithAvailability.filter(s => s.available).length,
              workSchedule
            };
          } catch (error) {
            console.error(`Erro ao buscar disponibilidade do terapeuta ${therapist.id}:`, error);
            return null;
          }
        });

        const results = await Promise.all(availabilityPromises);
        const validResults = results.filter(r => r !== null) as TherapistAvailability[];
        
        // Ordenar por número de slots disponíveis (mais disponível primeiro)
        validResults.sort((a, b) => b.totalAvailable - a.totalAvailable);
        
        setAvailabilities(validResults);
      } catch (error) {
        console.error('Erro ao buscar disponibilidades:', error);
        setError('Erro ao carregar disponibilidades. Tente novamente.');
      } finally {
        setLoadingAvailability(false);
      }
    };

    fetchAllAvailabilities();
  }, [selectedDate, therapists, selectedService, branchId, getAvailability]);

  const handleSlotClick = (therapistId: string, time: string) => {
    setSelectedSlot({ therapistId, time });
    onSelectTherapist(therapistId, time);
  };

  const getSlotColor = (slot: TimeSlot) => {
    if (!slot.available) return 'action.disabledBackground';
    if (selectedSlot?.time === slot.time) return 'primary.main';
    return 'success.light';
  };

  const getSlotTextColor = (slot: TimeSlot, therapistId: string) => {
    if (!slot.available) return 'text.disabled';
    if (selectedSlot?.time === slot.time && selectedSlot?.therapistId === therapistId) return 'primary.contrastText';
    return 'text.primary';
  };

  if (loading || loadingAvailability) {
    return (
      <Box>
        {[1, 2, 3].map((i) => (
          <Paper key={i} sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="30%" />
                <Skeleton variant="text" width="20%" />
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {[1, 2, 3, 4, 5, 6].map((j) => (
                <Skeleton key={j} variant="rounded" width={80} height={36} />
              ))}
            </Box>
          </Paper>
        ))}
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        action={
          <Button color="inherit" size="small" onClick={() => window.location.reload()}>
            <Refresh />
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  if (availabilities.length === 0) {
    return (
      <Alert severity="info">
        Nenhum terapeuta disponível para a data selecionada.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <EventAvailable color="primary" />
        Disponibilidade dos Terapeutas
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {format(new Date(selectedDate + 'T12:00:00'), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
        {selectedService && ` • ${selectedService.name} (${selectedService.averageDuration}min)`}
      </Typography>

      {availabilities.map((availability) => (
        <Paper
          key={availability.therapist.id}
          sx={{
            p: 2,
            mb: 2,
            border: '1px solid',
            borderColor: 'divider',
            transition: 'all 0.3s',
            '&:hover': {
              borderColor: 'primary.main',
              boxShadow: 2
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar 
                src={availability.therapist.avatar} 
                sx={{ 
                  width: 48, 
                  height: 48,
                  bgcolor: 'primary.main'
                }}
              >
                <Person />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  {availability.therapist.name}
                </Typography>
                {availability.therapist.specialty && (
                  <Typography variant="body2" color="text.secondary">
                    {availability.therapist.specialty}
                  </Typography>
                )}
              </Box>
            </Box>
            
            <Box sx={{ textAlign: 'right' }}>
              <Badge 
                badgeContent={availability.totalAvailable} 
                color={availability.totalAvailable > 0 ? 'success' : 'error'}
                max={99}
              >
                <Chip
                  icon={<Schedule />}
                  label="Horários livres"
                  size="small"
                  color={availability.totalAvailable > 0 ? 'success' : 'default'}
                />
              </Badge>
            </Box>
          </Box>

          {availability.totalAvailable === 0 ? (
            <Alert severity="warning" icon={<EventBusy />} sx={{ py: 1 }}>
              Sem horários disponíveis nesta data
            </Alert>
          ) : (
            <Grid container spacing={1}>
              {availability.slots.map((slot) => (
                <Grid item key={slot.time}>
                  <Tooltip
                    title={
                      !slot.available 
                        ? 'Horário indisponível' 
                        : 'Clique para selecionar este horário'
                    }
                  >
                    <span>
                      <Chip
                        label={slot.time}
                        onClick={() => slot.available && handleSlotClick(availability.therapist.id, slot.time)}
                        disabled={!slot.available}
                        icon={
                          slot.available ? (
                            <CheckCircle fontSize="small" />
                          ) : (
                            <Cancel fontSize="small" />
                          )
                        }
                        sx={{
                          bgcolor: getSlotColor(slot),
                          color: getSlotTextColor(slot, availability.therapist.id),
                          '&:hover': slot.available ? {
                            bgcolor: 'primary.dark',
                            color: 'primary.contrastText'
                          } : {},
                          cursor: slot.available ? 'pointer' : 'not-allowed',
                          transition: 'all 0.2s',
                          fontWeight: 
                            selectedSlot?.time === slot.time && 
                            selectedSlot?.therapistId === availability.therapist.id 
                              ? 600 
                              : 400
                        }}
                      />
                    </span>
                  </Tooltip>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      ))}
    </Box>
  );
};

export default TherapistAvailabilityGrid; 