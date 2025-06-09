import React, { useState, useEffect, useContext } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  MenuItem,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  CircularProgress,
  Tooltip,
  Avatar,
  ListItemText,
  ListItemAvatar,
  ListItem
} from '@mui/material';
import {
  Close,
  CalendarMonth,
  Person,
  MedicalServices,
  Schedule,
  Notes,
  Business,
  AttachMoney,
  CheckCircle,
  Warning,
  Info,
  Phone,
  Email,
  Save,
  Cancel,
  AccessTime,
  LocalHospital
} from '@mui/icons-material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { updateAppointment } from '../services/appointmentService';
import { getTherapists } from '../services/threapistService';
import { getClients } from '../services/clientsService';
import { getServices, Service } from '../services/serviceService';
import { getAvailableSlots } from '../services/availabilityService';
import { getBranches } from '../services/branchService';
import { BranchContext } from '../context/BranchContext';
import { useNotification } from './Notification';
import dayjs, { Dayjs } from 'dayjs';

interface Appointment {
  id: string;
  client?: { id: string; name: string; phone?: string; email?: string };
  therapist?: { id: string; name: string };
  service?: { id: string; name: string; price?: number; averageDuration?: number };
  branch?: { id: string; name: string };
  date: string;
  startTime: string;
  endTime?: string;
  status: string;
  notes?: string;
}

interface AppointmentEditModalProps {
  open: boolean;
  appointment: Appointment | null;
  onClose: () => void;
  onSave: (updatedAppointment: Appointment) => void;
}

const AppointmentEditModal: React.FC<AppointmentEditModalProps> = ({
  open,
  appointment,
  onClose,
  onSave
}) => {
  const { showNotification } = useNotification();
  const branchContext = useContext(BranchContext);
  
  // States
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    clientId: '',
    therapistId: '',
    serviceId: '',
    branchId: '',
    date: dayjs() as Dayjs,
    startTime: dayjs() as Dayjs,
    endTime: dayjs() as Dayjs,
    status: '',
    notes: ''
  });
  
  // Data lists
  const [clients, setClients] = useState<any[]>([]);
  const [therapists, setTherapists] = useState<any[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  
  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = [
    {
      label: 'Informações Básicas',
      description: 'Cliente, Serviço e Filial'
    },
    {
      label: 'Terapeuta e Agendamento',
      description: 'Data, Horário e Terapeuta'
    },
    {
      label: 'Detalhes e Confirmação',
      description: 'Status, Observações e Revisão'
    }
  ];

  // Load initial data
  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  // Load appointment data
  useEffect(() => {
    if (appointment && open) {
      setFormData({
        clientId: appointment.client?.id || '',
        therapistId: appointment.therapist?.id || '',
        serviceId: appointment.service?.id || '',
        branchId: appointment.branch?.id || branchContext?.currentBranch?.id || '',
        date: dayjs(appointment.date),
        startTime: dayjs(`${appointment.date} ${appointment.startTime}`),
        endTime: appointment.endTime ? dayjs(`${appointment.date} ${appointment.endTime}`) : dayjs(),
        status: appointment.status || 'SCHEDULED',
        notes: appointment.notes || ''
      });
    }
  }, [appointment, open, branchContext]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [clientsData, servicesData, branchesData] = await Promise.all([
        getClients(),
        getServices(),
        getBranches()
      ]);
      
      setClients(clientsData);
      setServices(servicesData);
      setBranches(branchesData);
    } catch (error) {
      showNotification('Erro ao carregar dados', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load therapists when service changes
  useEffect(() => {
    if (formData.serviceId) {
      loadTherapists();
    }
  }, [formData.serviceId]);

  const loadTherapists = async () => {
    try {
      const therapistsData = await getTherapists(formData.serviceId);
      setTherapists(therapistsData);
    } catch (error) {
      showNotification('Erro ao carregar terapeutas', 'error');
    }
  };

  // Load available slots
  useEffect(() => {
    if (formData.therapistId && formData.serviceId && formData.date) {
      loadAvailableSlots();
    }
  }, [formData.therapistId, formData.serviceId, formData.date]);

  const loadAvailableSlots = async () => {
    try {
      const slots = await getAvailableSlots(
        [formData.serviceId],
        formData.therapistId,
        formData.date.format('YYYY-MM-DD'),
        formData.branchId
      );
      setAvailableSlots(slots);
    } catch (error) {
      showNotification('Erro ao carregar horários', 'error');
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 0:
        if (!formData.clientId) newErrors.clientId = 'Cliente é obrigatório';
        if (!formData.serviceId) newErrors.serviceId = 'Serviço é obrigatório';
        if (!formData.branchId) newErrors.branchId = 'Filial é obrigatória';
        break;
      case 1:
        if (!formData.therapistId) newErrors.therapistId = 'Terapeuta é obrigatório';
        if (!formData.date) newErrors.date = 'Data é obrigatória';
        if (!formData.startTime) newErrors.startTime = 'Horário é obrigatório';
        break;
      case 2:
        if (!formData.status) newErrors.status = 'Status é obrigatório';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSave = async () => {
    if (!validateStep(2) || !appointment) return;

    setSaving(true);
    try {
      const updateData = {
        clientId: formData.clientId,
        therapistId: formData.therapistId,
        serviceId: formData.serviceId,
        branchId: formData.branchId,
        date: formData.date.format('YYYY-MM-DD'),
        startTime: formData.startTime.format('HH:mm'),
        endTime: formData.endTime.format('HH:mm'),
        status: formData.status,
        notes: formData.notes
      };

      await updateAppointment(appointment.id, updateData);
      
      // Create updated appointment object
      const updatedAppointment: Appointment = {
        ...appointment,
        client: clients.find(c => c.id === formData.clientId),
        therapist: therapists.find(t => t.id === formData.therapistId),
        service: services.find(s => s.id === formData.serviceId),
        branch: branches.find(b => b.id === formData.branchId),
        date: formData.date.format('YYYY-MM-DD'),
        startTime: formData.startTime.format('HH:mm'),
        endTime: formData.endTime.format('HH:mm'),
        status: formData.status,
        notes: formData.notes
      };

      onSave(updatedAppointment);
      showNotification('Agendamento atualizado com sucesso!', 'success');
      onClose();
    } catch (error) {
      showNotification('Erro ao atualizar agendamento', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setActiveStep(0);
    setErrors({});
    onClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'success';
      case 'CANCELED': return 'error';
      case 'PENDING': return 'warning';
      default: return 'default';
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary">
                📋 Informações Básicas
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.clientId}>
                <InputLabel>Cliente</InputLabel>
                <Select
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  label="Cliente"
                >
                  {clients.map((client) => (
                    <MenuItem key={client.id} value={client.id}>
                      <ListItem disablePadding>
                        <ListItemAvatar>
                          <Avatar>
                            <Person />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={client.name}
                          secondary={`${client.phone || 'Sem telefone'} • ${client.email || 'Sem email'}`}
                        />
                      </ListItem>
                    </MenuItem>
                  ))}
                </Select>
                {errors.clientId && <Typography variant="caption" color="error">{errors.clientId}</Typography>}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.serviceId}>
                <InputLabel>Serviço</InputLabel>
                <Select
                  value={formData.serviceId}
                  onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                  label="Serviço"
                >
                  {services.map((service) => (
                    <MenuItem key={service.id} value={service.id}>
                      <Box>
                        <Typography variant="body1">{service.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {service.price ? `R$ ${service.price.toFixed(2)}` : 'Preço não definido'} • 
                          {service.averageDuration ? ` ${service.averageDuration}min` : ' Duração não definida'}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {errors.serviceId && <Typography variant="caption" color="error">{errors.serviceId}</Typography>}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.branchId}>
                <InputLabel>Filial</InputLabel>
                <Select
                  value={formData.branchId}
                  onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                  label="Filial"
                >
                  {branches.map((branch) => (
                    <MenuItem key={branch.id} value={branch.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Business fontSize="small" />
                        {branch.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {errors.branchId && <Typography variant="caption" color="error">{errors.branchId}</Typography>}
              </FormControl>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary">
                🗓️ Agendamento e Terapeuta
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.therapistId}>
                <InputLabel>Terapeuta</InputLabel>
                <Select
                  value={formData.therapistId}
                  onChange={(e) => setFormData({ ...formData, therapistId: e.target.value })}
                  label="Terapeuta"
                  disabled={!formData.serviceId}
                >
                  {therapists.map((therapist) => (
                    <MenuItem key={therapist.id} value={therapist.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          <LocalHospital fontSize="small" />
                        </Avatar>
                        {therapist.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {errors.therapistId && <Typography variant="caption" color="error">{errors.therapistId}</Typography>}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <DatePicker
                label="Data do Agendamento"
                value={formData.date}
                onChange={(newValue) => setFormData({ ...formData, date: newValue || dayjs() })}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.date,
                    helperText: errors.date
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TimePicker
                label="Horário de Início"
                value={formData.startTime}
                onChange={(newValue) => setFormData({ ...formData, startTime: newValue || dayjs() })}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.startTime,
                    helperText: errors.startTime
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TimePicker
                label="Horário de Término"
                value={formData.endTime}
                onChange={(newValue) => setFormData({ ...formData, endTime: newValue || dayjs() })}
                slotProps={{
                  textField: {
                    fullWidth: true
                  }
                }}
              />
            </Grid>

            {availableSlots.length > 0 && (
              <Grid item xs={12}>
                <Alert severity="info" icon={<Info />}>
                  <Typography variant="subtitle2" gutterBottom>
                    Horários disponíveis para este terapeuta:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {availableSlots.map((slot) => (
                      <Chip
                        key={slot}
                        label={slot}
                        variant="outlined"
                        size="small"
                        onClick={() => setFormData({ 
                          ...formData, 
                          startTime: dayjs(`${formData.date.format('YYYY-MM-DD')} ${slot}`) 
                        })}
                        sx={{ cursor: 'pointer' }}
                      />
                    ))}
                  </Box>
                </Alert>
              </Grid>
            )}
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary">
                ✅ Finalização e Revisão
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.status}>
                <InputLabel>Status do Agendamento</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  label="Status do Agendamento"
                >
                  <MenuItem value="SCHEDULED">
                    <Chip label="Agendado" color="default" size="small" sx={{ mr: 1 }} />
                    Agendado
                  </MenuItem>
                  <MenuItem value="CONFIRMED">
                    <Chip label="Confirmado" color="success" size="small" sx={{ mr: 1 }} />
                    Confirmado
                  </MenuItem>
                  <MenuItem value="CANCELED">
                    <Chip label="Cancelado" color="error" size="small" sx={{ mr: 1 }} />
                    Cancelado
                  </MenuItem>
                  <MenuItem value="PENDING">
                    <Chip label="Pendente" color="warning" size="small" sx={{ mr: 1 }} />
                    Pendente
                  </MenuItem>
                </Select>
                {errors.status && <Typography variant="caption" color="error">{errors.status}</Typography>}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Observações"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Adicione observações sobre o agendamento..."
              />
            </Grid>

            {/* Resumo do agendamento */}
            <Grid item xs={12}>
              <Card sx={{ bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    📋 Resumo do Agendamento
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Cliente:</Typography>
                      <Typography variant="body1">
                        {clients.find(c => c.id === formData.clientId)?.name || 'Não selecionado'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Serviço:</Typography>
                      <Typography variant="body1">
                        {services.find(s => s.id === formData.serviceId)?.name || 'Não selecionado'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Terapeuta:</Typography>
                      <Typography variant="body1">
                        {therapists.find(t => t.id === formData.therapistId)?.name || 'Não selecionado'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Data e Horário:</Typography>
                      <Typography variant="body1">
                        {formData.date.format('DD/MM/YYYY')} às {formData.startTime.format('HH:mm')}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  if (!appointment) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
          maxHeight: '90vh'
        }
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        position: 'relative',
        pb: 3
      }}>
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: 'white'
          }}
        >
          <Close />
        </IconButton>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
            <CalendarMonth />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={600}>
              Editar Agendamento
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              {appointment.client?.name} • {appointment.service?.name}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ p: 3 }}>
            <Stepper activeStep={activeStep} orientation="vertical">
              {steps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel
                    optional={
                      <Typography variant="caption">
                        {step.description}
                      </Typography>
                    }
                  >
                    {step.label}
                  </StepLabel>
                  <StepContent>
                    <Box sx={{ mb: 2 }}>
                      {renderStepContent(index)}
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <div>
                        <Button
                          variant="contained"
                          onClick={index === steps.length - 1 ? handleSave : handleNext}
                          sx={{ mt: 1, mr: 1 }}
                          disabled={saving}
                          startIcon={saving ? <CircularProgress size={16} /> : 
                                    index === steps.length - 1 ? <Save /> : undefined}
                        >
                          {saving ? 'Salvando...' : 
                           index === steps.length - 1 ? 'Salvar Alterações' : 'Continuar'}
                        </Button>
                        <Button
                          disabled={index === 0 || saving}
                          onClick={handleBack}
                          sx={{ mt: 1, mr: 1 }}
                        >
                          Voltar
                        </Button>
                      </div>
                    </Box>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentEditModal;