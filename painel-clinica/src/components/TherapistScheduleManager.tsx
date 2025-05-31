import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Switch,
  FormControlLabel,
  TextField,
  Chip,
  IconButton,
  Paper,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip
} from '@mui/material';
import {
  Schedule,
  Add,
  Delete,
  Save,
  Close,
  Block,
  ContentCopy
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { useNotification } from './Notification';

interface TimeSlot {
  start: string;
  end: string;
  enabled: boolean;
}

interface DaySchedule {
  day: number; // 0 = Domingo, 1 = Segunda, etc.
  slots: TimeSlot[];
  enabled: boolean;
}

interface TherapistScheduleManagerProps {
  open: boolean;
  onClose: () => void;
  therapistId: string;
  therapistName: string;
  selectedDate?: string;
  onScheduleUpdated?: () => void;
}

const WEEKDAYS = [
  { value: 1, label: 'Segunda', short: 'Seg' },
  { value: 2, label: 'Terça', short: 'Ter' },
  { value: 3, label: 'Quarta', short: 'Qua' },
  { value: 4, label: 'Quinta', short: 'Qui' },
  { value: 5, label: 'Sexta', short: 'Sex' },
  { value: 6, label: 'Sábado', short: 'Sáb' },
  { value: 0, label: 'Domingo', short: 'Dom' }
];

const TherapistScheduleManager: React.FC<TherapistScheduleManagerProps> = ({
  open,
  onClose,
  therapistId,
  therapistName,
  selectedDate,
  onScheduleUpdated
}) => {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [schedules, setSchedules] = useState<DaySchedule[]>([]);
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [blockDates, setBlockDates] = useState<string[]>([]);
  const [newBlockDate, setNewBlockDate] = useState('');

  // Inicializar com horários padrão
  useEffect(() => {
    if (open) {
      loadTherapistSchedule();
    }
  }, [open, therapistId]);

  const loadTherapistSchedule = async () => {
    setLoading(true);
    try {
      // Aqui você faria a chamada à API para buscar os horários do terapeuta
      // Por enquanto, vamos usar dados mockados
      const defaultSchedule: DaySchedule[] = WEEKDAYS.map(day => ({
        day: day.value,
        enabled: day.value >= 1 && day.value <= 5, // Segunda a Sexta habilitados por padrão
        slots: [
          { start: '08:00', end: '12:00', enabled: true },
          { start: '14:00', end: '18:00', enabled: true }
        ]
      }));
      
      setSchedules(defaultSchedule);
    } catch (error) {
      console.error('Erro ao carregar horários:', error);
      showNotification('Erro ao carregar horários do terapeuta', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDayToggle = (day: number) => {
    setSchedules(prev => prev.map(schedule => 
      schedule.day === day 
        ? { ...schedule, enabled: !schedule.enabled }
        : schedule
    ));
  };

  const handleSlotChange = (day: number, slotIndex: number, field: 'start' | 'end', value: string) => {
    setSchedules(prev => prev.map(schedule => 
      schedule.day === day 
        ? {
            ...schedule,
            slots: schedule.slots.map((slot, index) => 
              index === slotIndex 
                ? { ...slot, [field]: value }
                : slot
            )
          }
        : schedule
    ));
  };

  const handleSlotToggle = (day: number, slotIndex: number) => {
    setSchedules(prev => prev.map(schedule => 
      schedule.day === day 
        ? {
            ...schedule,
            slots: schedule.slots.map((slot, index) => 
              index === slotIndex 
                ? { ...slot, enabled: !slot.enabled }
                : slot
            )
          }
        : schedule
    ));
  };

  const addSlot = (day: number) => {
    setSchedules(prev => prev.map(schedule => 
      schedule.day === day 
        ? {
            ...schedule,
            slots: [...schedule.slots, { start: '09:00', end: '10:00', enabled: true }]
          }
        : schedule
    ));
  };

  const removeSlot = (day: number, slotIndex: number) => {
    setSchedules(prev => prev.map(schedule => 
      schedule.day === day 
        ? {
            ...schedule,
            slots: schedule.slots.filter((_, index) => index !== slotIndex)
          }
        : schedule
    ));
  };

  const copyToSelectedDays = (fromDay: number) => {
    const sourceSchedule = schedules.find(s => s.day === fromDay);
    if (!sourceSchedule) return;

    setSchedules(prev => prev.map(schedule => 
      selectedDays.includes(schedule.day) && schedule.day !== fromDay
        ? {
            ...schedule,
            enabled: sourceSchedule.enabled,
            slots: [...sourceSchedule.slots]
          }
        : schedule
    ));

    showNotification(`Horários copiados para ${selectedDays.length - 1} dias`, 'success');
  };

  const addBlockDate = () => {
    if (newBlockDate && !blockDates.includes(newBlockDate)) {
      setBlockDates(prev => [...prev, newBlockDate]);
      setNewBlockDate('');
    }
  };

  const removeBlockDate = (date: string) => {
    setBlockDates(prev => prev.filter(d => d !== date));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Aqui você faria a chamada à API para salvar os horários
      // const response = await updateTherapistSchedule(therapistId, {
      //   schedules,
      //   blockDates
      // });
      
      showNotification('Horários atualizados com sucesso!', 'success');
      
      if (onScheduleUpdated) {
        onScheduleUpdated();
      }
      
      onClose();
    } catch (error) {
      console.error('Erro ao salvar horários:', error);
      showNotification('Erro ao salvar horários', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Schedule color="primary" />
            <Typography variant="h6">
              Gerenciar Disponibilidade - {therapistName}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              Configure os horários de disponibilidade para cada dia da semana. 
              Você pode adicionar múltiplos períodos por dia e bloquear datas específicas.
            </Alert>

            {/* Seletor de dias para operações em lote */}
            <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" gutterBottom>
                Selecione dias para operações em lote:
              </Typography>
              <ToggleButtonGroup
                value={selectedDays}
                onChange={(_, newDays) => setSelectedDays(newDays)}
                aria-label="dias da semana"
                size="small"
                sx={{ flexWrap: 'wrap' }}
              >
                {WEEKDAYS.map(day => (
                  <ToggleButton key={day.value} value={day.value}>
                    {day.short}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Paper>

            {/* Lista de horários por dia */}
            <List>
              {schedules.map((schedule) => {
                const weekday = WEEKDAYS.find(w => w.value === schedule.day);
                
                return (
                  <React.Fragment key={schedule.day}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={schedule.enabled}
                                  onChange={() => handleDayToggle(schedule.day)}
                                  color="primary"
                                />
                              }
                              label={
                                <Typography variant="subtitle1" fontWeight={600}>
                                  {weekday?.label}
                                </Typography>
                              }
                            />
                            {schedule.enabled && schedule.slots.length > 0 && (
                              <Tooltip title="Copiar para dias selecionados">
                                <IconButton
                                  size="small"
                                  onClick={() => copyToSelectedDays(schedule.day)}
                                  color="primary"
                                >
                                  <ContentCopy fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        }
                        secondary={
                          schedule.enabled && (
                            <Box sx={{ mt: 2 }}>
                              {schedule.slots.map((slot, slotIndex) => (
                                <Box
                                  key={slotIndex}
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    mb: 1,
                                    p: 1,
                                    bgcolor: slot.enabled ? 'background.paper' : 'action.disabledBackground',
                                    borderRadius: 1
                                  }}
                                >
                                  <Switch
                                    size="small"
                                    checked={slot.enabled}
                                    onChange={() => handleSlotToggle(schedule.day, slotIndex)}
                                  />
                                  
                                  <TextField
                                    size="small"
                                    label="Início"
                                    type="time"
                                    value={slot.start}
                                    onChange={(e) => handleSlotChange(schedule.day, slotIndex, 'start', e.target.value)}
                                    disabled={!slot.enabled}
                                    sx={{ width: 120 }}
                                  />
                                  
                                  <Typography>até</Typography>
                                  
                                  <TextField
                                    size="small"
                                    label="Fim"
                                    type="time"
                                    value={slot.end}
                                    onChange={(e) => handleSlotChange(schedule.day, slotIndex, 'end', e.target.value)}
                                    disabled={!slot.enabled}
                                    sx={{ width: 120 }}
                                  />
                                  
                                  <IconButton
                                    size="small"
                                    onClick={() => removeSlot(schedule.day, slotIndex)}
                                    color="error"
                                  >
                                    <Delete fontSize="small" />
                                  </IconButton>
                                </Box>
                              ))}
                              
                              <Button
                                size="small"
                                startIcon={<Add />}
                                onClick={() => addSlot(schedule.day)}
                                sx={{ mt: 1 }}
                              >
                                Adicionar período
                              </Button>
                            </Box>
                          )
                        }
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                );
              })}
            </List>

            {/* Bloqueio de datas específicas */}
            <Paper sx={{ p: 2, mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Block color="error" />
                Bloquear Datas Específicas
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  size="small"
                  type="date"
                  label="Data"
                  value={newBlockDate}
                  onChange={(e) => setNewBlockDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={addBlockDate}
                  disabled={!newBlockDate}
                >
                  Bloquear
                </Button>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {blockDates.map(date => (
                  <Chip
                    key={date}
                    label={dayjs(date).format('DD/MM/YYYY')}
                    onDelete={() => removeBlockDate(date)}
                    color="error"
                    variant="outlined"
                  />
                ))}
                {blockDates.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    Nenhuma data bloqueada
                  </Typography>
                )}
              </Box>
            </Paper>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving || loading}
          startIcon={saving ? <CircularProgress size={20} /> : <Save />}
        >
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TherapistScheduleManager; 