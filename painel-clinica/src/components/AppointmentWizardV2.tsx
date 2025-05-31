import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  Select,
  MenuItem,
  InputLabel,
  TextField,
  Paper,
  CircularProgress,
  useTheme,
  Stepper,
  Step,
  StepLabel,
  Alert,
  AlertTitle,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Fade,
  Zoom
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  FolderOutlined as PlanIcon,
  ConfirmationNumber as SingleIcon,
  ArrowBack as BackIcon,
  ArrowForward as NextIcon,
  Person,
  CalendarMonth,
  MedicalServices,
  CheckCircle,
  Schedule,
  AttachMoney,
  Info,
  Close
} from '@mui/icons-material';
import { useBranch } from '../context/BranchContext';
import { Service } from '../services/serviceService';
import { Client } from '../services/clientsService';
import { Subscription } from '../services/subscriptionService';
import dayjs, { Dayjs } from 'dayjs';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import TherapistAvailabilityGrid from './TherapistAvailabilityGrid';
import { getTherapistAvailability } from '../services/availabilityService';
import { useNotification } from './Notification';

interface Therapist {
  id: string;
  name: string;
  avatar?: string;
  specialty?: string;
}

interface AppointmentWizardV2Props {
  open: boolean;
  onClose: () => void;
  onSave: (appointmentData: AppointmentData) => Promise<void>;
  services: Service[];
  clients: Client[];
  therapists: Therapist[];
  clientSubscriptions?: Subscription[];
  isLoading?: boolean;
  preselectedDate?: string | null;
  preselectedTime?: string | null;
}

interface AppointmentData {
  clientId: string;
  serviceId: string;
  therapistId: string;
  date: string;
  startTime?: string;
  endTime?: string;
  subscriptionId?: string;
  notes?: string;
  branchId?: string;
}

interface FormDataType {
  clientId: string;
  appointmentType: 'plan' | 'single';
  serviceId: string;
  therapistId: string;
  date: Dayjs;
  time: string;
  subscriptionId: string;
  notes: string;
  branchId: string;
}

const steps = [
  { label: 'Cliente', icon: <Person /> },
  { label: 'Serviço', icon: <MedicalServices /> },
  { label: 'Data e Horário', icon: <CalendarMonth /> },
  { label: 'Confirmação', icon: <CheckCircle /> }
];

const AppointmentWizardV2 = ({
  open,
  onClose,
  onSave,
  services,
  clients,
  therapists,
  clientSubscriptions = [],
  isLoading = false,
  preselectedDate,
  preselectedTime
}: AppointmentWizardV2Props) => {
  const theme = useTheme();
  const { currentBranch } = useBranch();
  const { showNotification } = useNotification();
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<FormDataType>({
    clientId: '',
    appointmentType: 'single',
    serviceId: '',
    therapistId: '',
    date: preselectedDate ? dayjs(preselectedDate) : dayjs(),
    time: preselectedTime || '',
    subscriptionId: '',
    notes: '',
    branchId: currentBranch?.id || ''
  });
  
  const [activeSubscriptions, setActiveSubscriptions] = useState<Subscription[]>([]);
  // Reset wizard when opened
  useEffect(() => {
    if (open) {
      setActiveStep(0);
      setError(null);
      if (preselectedDate || preselectedTime) {
        setFormData(prev => ({
          ...prev,
          date: preselectedDate ? dayjs(preselectedDate) : prev.date,
          time: preselectedTime || ''
        }));
      }
    }
  }, [open, preselectedDate, preselectedTime]);
  
  // Update active subscriptions when client changes
  useEffect(() => {
    if (formData.clientId) {
      const activeSubs = clientSubscriptions.filter(
        sub => sub.clientId === formData.clientId && 
        sub.status === 'ACTIVE' && 
        sub.remainingSessions > 0
      );
      setActiveSubscriptions(activeSubs);
      
      if (activeSubs.length === 0 && formData.appointmentType === 'plan') {
        setFormData(prev => ({ ...prev, appointmentType: 'single' }));
      }
    }
  }, [formData.clientId, clientSubscriptions]);
  
  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else {
      setActiveStep(prev => prev + 1);
    }
  };
  
  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };
  
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleTherapistSelect = (therapistId: string, time: string) => {
    const therapist = therapists.find(t => t.id === therapistId);
    setSelectedTherapistInfo(therapist || null);
    setFormData(prev => ({
      ...prev,
      therapistId,
      time
    }));
    
    // Auto avançar para o próximo passo
    setTimeout(() => handleNext(), 300);
  };
  
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const selectedService = services.find(s => s.id === formData.serviceId);
      
      let endTime: string | undefined;
      if (formData.time && selectedService) {
        const [hours, minutes] = formData.time.split(':').map(Number);
        const startMinutes = hours * 60 + minutes;
        const endMinutes = startMinutes + (selectedService.averageDuration || 60);
        const endHours = Math.floor(endMinutes / 60);
        const endMins = endMinutes % 60;
        endTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
      }
      
      const appointmentData: AppointmentData = {
        clientId: formData.clientId,
        serviceId: formData.serviceId,
        therapistId: formData.therapistId,
        date: format(formData.date.toDate(), 'yyyy-MM-dd'),
        startTime: formData.time,
        endTime,
        subscriptionId: formData.appointmentType === 'plan' ? formData.subscriptionId : undefined,
        notes: formData.notes || undefined,
        branchId: formData.branchId
      };
      
      await onSave(appointmentData);
      showNotification('Agendamento criado com sucesso!', 'success');
      onClose();
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      setError('Ocorreu um erro ao criar o agendamento. Tente novamente.');
      showNotification('Erro ao criar agendamento', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 0:
        return !!formData.clientId && (
          formData.appointmentType === 'single' || 
          (formData.appointmentType === 'plan' && !!formData.subscriptionId)
        );
      case 1:
        return !!formData.serviceId;
      case 2:
        return !!formData.therapistId && !!formData.time;
      default:
        return true;
    }
  };
  
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return <ClientStep />;
      case 1:
        return <ServiceStep />;
      case 2:
        return <DateTimeStep />;
      case 3:
        return <ConfirmationStep />;
      default:
        return null;
    }
  };
  
  // Step 1: Client Selection
  const ClientStep = () => {
    const selectedClient = clients.find(c => c.id === formData.clientId);
    const hasActiveSubscriptions = activeSubscriptions.length > 0;
    
    return (
      <Fade in timeout={300}>
        <Box>
          <FormControl fullWidth margin="normal">
            <InputLabel>Selecione o Cliente</InputLabel>
            <Select
              value={formData.clientId}
              onChange={(e) => handleChange('clientId', e.target.value)}
              label="Selecione o Cliente"
            >
              {clients.map(client => (
                <MenuItem key={client.id} value={client.id}>
                  {client.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {selectedClient && (
            <Paper sx={{ p: 2, mt: 2, bgcolor: 'background.default' }}>
              <Typography variant="subtitle2" gutterBottom>
                Cliente selecionado:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar>{selectedClient.name.charAt(0)}</Avatar>
                <Box>
                  <Typography variant="body1" fontWeight={500}>
                    {selectedClient.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedClient.email}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          )}
          
          {formData.clientId && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Tipo de Agendamento
              </Typography>
              
              <RadioGroup
                row
                value={formData.appointmentType}
                onChange={(e) => handleChange('appointmentType', e.target.value)}
                sx={{ gap: 2 }}
              >
                <Paper
                  elevation={formData.appointmentType === 'plan' ? 3 : 1}
                  sx={{
                    p: 2,
                    flex: 1,
                    cursor: hasActiveSubscriptions ? 'pointer' : 'not-allowed',
                    opacity: hasActiveSubscriptions ? 1 : 0.5,
                    border: formData.appointmentType === 'plan' ? 
                      `2px solid ${theme.palette.primary.main}` : 
                      '1px solid transparent',
                    transition: 'all 0.3s'
                  }}
                  onClick={() => hasActiveSubscriptions && handleChange('appointmentType', 'plan')}
                >
                  <FormControlLabel
                    value="plan"
                    control={<Radio />}
                    disabled={!hasActiveSubscriptions}
                    label={
                      <Box sx={{ textAlign: 'center' }}>
                        <PlanIcon fontSize="large" color={formData.appointmentType === 'plan' ? 'primary' : 'action'} />
                        <Typography>Plano</Typography>
                      </Box>
                    }
                    sx={{ m: 0, width: '100%', justifyContent: 'center' }}
                  />
                </Paper>
                
                <Paper
                  elevation={formData.appointmentType === 'single' ? 3 : 1}
                  sx={{
                    p: 2,
                    flex: 1,
                    cursor: 'pointer',
                    border: formData.appointmentType === 'single' ? 
                      `2px solid ${theme.palette.primary.main}` : 
                      '1px solid transparent',
                    transition: 'all 0.3s'
                  }}
                  onClick={() => handleChange('appointmentType', 'single')}
                >
                  <FormControlLabel
                    value="single"
                    control={<Radio />}
                    label={
                      <Box sx={{ textAlign: 'center' }}>
                        <SingleIcon fontSize="large" color={formData.appointmentType === 'single' ? 'primary' : 'action'} />
                        <Typography>Avulso</Typography>
                      </Box>
                    }
                    sx={{ m: 0, width: '100%', justifyContent: 'center' }}
                  />
                </Paper>
              </RadioGroup>
              
              {formData.appointmentType === 'plan' && hasActiveSubscriptions && (
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel>Selecione o Plano</InputLabel>
                  <Select
                    value={formData.subscriptionId}
                    onChange={(e) => handleChange('subscriptionId', e.target.value)}
                    label="Selecione o Plano"
                  >
                    {activeSubscriptions.map(sub => (
                      <MenuItem key={sub.id} value={sub.id}>
                        <Box sx={{ width: '100%' }}>
                          <Typography>{sub.therapyPlan?.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {sub.remainingSessions} sessões restantes
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              
              {!hasActiveSubscriptions && formData.appointmentType === 'plan' && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Este cliente não possui planos ativos com sessões disponíveis.
                </Alert>
              )}
            </Box>
          )}
        </Box>
      </Fade>
    );
  };
  
  // Step 2: Service Selection
  const ServiceStep = () => {
    const selectedService = services.find(s => s.id === formData.serviceId);
    
    return (
      <Fade in timeout={300}>
        <Box>
          <Typography variant="h6" gutterBottom>
            Selecione o Serviço
          </Typography>
          
          <List>
            {services.map(service => (
              <ListItem
                key={service.id}
                button
                selected={formData.serviceId === service.id}
                onClick={() => handleChange('serviceId', service.id)}
                sx={{
                  mb: 1,
                  border: '1px solid',
                  borderColor: formData.serviceId === service.id ? 'primary.main' : 'divider',
                  borderRadius: 1,
                  transition: 'all 0.3s'
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.light' }}>
                    <MedicalServices />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={service.name}
                  secondary={
                    <Box>
                      <Typography variant="body2" component="span">
                        <Schedule fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                        {service.averageDuration} min
                      </Typography>
                      {formData.appointmentType === 'single' && (
                        <Typography variant="body2" component="span" sx={{ ml: 2 }}>
                          <AttachMoney fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                          R$ {service.price.toFixed(2)}
                        </Typography>
                      )}
                    </Box>
                  }
                />
                {formData.serviceId === service.id && (
                  <ListItemSecondaryAction>
                    <CheckCircle color="primary" />
                  </ListItemSecondaryAction>
                )}
              </ListItem>
            ))}
          </List>
          
          {selectedService && (
            <Alert severity="info" icon={<Info />} sx={{ mt: 2 }}>
              <AlertTitle>Serviço selecionado</AlertTitle>
              {selectedService.name} - Duração aproximada de {selectedService.averageDuration} minutos
            </Alert>
          )}
        </Box>
      </Fade>
    );
  };
  
  // Step 3: Date and Time Selection with Therapist Availability
  const DateTimeStep = () => {
    const [loadingAvailability, setLoadingAvailability] = useState(false);
    
    return (
      <Fade in timeout={300}>
        <Box>
          <Typography variant="h6" gutterBottom>
            Selecione a Data
          </Typography>
          
          <DatePicker
            label="Data do Agendamento"
            value={formData.date}
            onChange={(newDate) => newDate && handleChange('date', newDate)}
            disablePast
            sx={{ width: '100%', mb: 3 }}
          />
          
          <Divider sx={{ my: 3 }} />
          
          {formData.date && (
            <TherapistAvailabilityGrid
              therapists={therapists}
              selectedDate={format(formData.date.toDate(), 'yyyy-MM-dd')}
              selectedService={services.find(s => s.id === formData.serviceId)}
              onSelectTherapist={handleTherapistSelect}
              getAvailability={getTherapistAvailability}
              loading={loadingAvailability}
            />
          )}
          
          <TextField
            fullWidth
            label="Observações (opcional)"
            multiline
            rows={3}
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            sx={{ mt: 3 }}
          />
        </Box>
      </Fade>
    );
  };
  
  // Step 4: Confirmation
  const ConfirmationStep = () => {
    const selectedClient = clients.find(c => c.id === formData.clientId);
    const selectedService = services.find(s => s.id === formData.serviceId);
    const selectedTherapist = therapists.find(t => t.id === formData.therapistId);
    const selectedSubscription = activeSubscriptions.find(s => s.id === formData.subscriptionId);
    
    return (
      <Zoom in timeout={300}>
        <Box>
          <Alert severity="success" sx={{ mb: 3 }}>
            <AlertTitle>Confirme os dados do agendamento</AlertTitle>
            Revise as informações antes de confirmar
          </Alert>
          
          <List>
            <ListItem>
              <ListItemAvatar>
                <Avatar><Person /></Avatar>
              </ListItemAvatar>
              <ListItemText
                primary="Cliente"
                secondary={selectedClient?.name}
              />
            </ListItem>
            
            <ListItem>
              <ListItemAvatar>
                <Avatar><MedicalServices /></Avatar>
              </ListItemAvatar>
              <ListItemText
                primary="Serviço"
                secondary={selectedService?.name}
              />
            </ListItem>
            
            <ListItem>
              <ListItemAvatar>
                <Avatar src={selectedTherapist?.avatar}>
                  <Person />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary="Terapeuta"
                secondary={selectedTherapist?.name}
              />
            </ListItem>
            
            <ListItem>
              <ListItemAvatar>
                <Avatar><CalendarMonth /></Avatar>
              </ListItemAvatar>
              <ListItemText
                primary="Data e Horário"
                secondary={`${format(formData.date.toDate(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} às ${formData.time}`}
              />
            </ListItem>
            
            {formData.appointmentType === 'plan' && selectedSubscription && (
              <ListItem>
                <ListItemAvatar>
                  <Avatar><PlanIcon /></Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Plano"
                  secondary={`${selectedSubscription.therapyPlan?.name} (${selectedSubscription.remainingSessions} sessões restantes)`}
                />
              </ListItem>
            )}
            
            {formData.appointmentType === 'single' && selectedService && (
              <ListItem>
                <ListItemAvatar>
                  <Avatar><AttachMoney /></Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Valor"
                  secondary={`R$ ${selectedService.price.toFixed(2)}`}
                />
              </ListItem>
            )}
            
            {formData.notes && (
              <ListItem>
                <ListItemAvatar>
                  <Avatar><Info /></Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Observações"
                  secondary={formData.notes}
                />
              </ListItem>
            )}
          </List>
        </Box>
      </Zoom>
    );
  };
  
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '70vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5" component="div">
            Novo Agendamento
          </Typography>
          <IconButton onClick={onClose} disabled={loading}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel
                icon={step.icon}
                optional={
                  index === steps.length - 1 ? (
                    <Typography variant="caption">Último passo</Typography>
                  ) : null
                }
              >
                {step.label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ minHeight: 400 }}>
          {renderStepContent()}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={handleBack}
          disabled={activeStep === 0 || loading}
          startIcon={<BackIcon />}
        >
          Voltar
        </Button>
        
        <Box sx={{ flex: 1 }} />
        
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        
        <Button
          onClick={handleNext}
          variant="contained"
          disabled={!isStepValid(activeStep) || loading || isLoading}
          endIcon={activeStep === steps.length - 1 ? <CheckCircle /> : <NextIcon />}
        >
          {loading ? (
            <CircularProgress size={24} />
          ) : activeStep === steps.length - 1 ? (
            'Confirmar'
          ) : (
            'Próximo'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AppointmentWizardV2; 