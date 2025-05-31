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
  Switch,
  Chip,
  Paper,
  Grid,
  CircularProgress,
  FormHelperText,
  useTheme
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import {
  FolderOutlined as PlanIcon,
  ConfirmationNumber as SingleIcon,
  ArrowBack as BackIcon,
  ArrowForward as NextIcon,
  LocalOffer as CouponIcon,
  AccessTime as TimeIcon,
  CheckCircleOutline as CheckIcon
} from '@mui/icons-material';
import { useBranch } from '../context/BranchContext';
import { Service } from '../services/serviceService';
import { Client } from '../services/clientsService';
import { Subscription } from '../services/subscriptionService';
import dayjs, { Dayjs } from 'dayjs';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Therapist {
  id: string;
  name: string;
}

interface AppointmentWizardProps {
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
  couponCode?: string;
  notes?: string;
  branchId?: string;
  autoSchedule?: boolean;
}

interface FormDataType {
  clientId: string;
  appointmentType: 'plan' | 'single';
  serviceId: string;
  therapistId: string;
  date: Dayjs;
  time: Dayjs | null;
  autoSchedule: boolean;
  couponCode: string;
  subscriptionId: string;
  notes: string;
  branchId: string;
}

const AppointmentWizard = ({
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
}: AppointmentWizardProps) => {
  const theme = useTheme();
  const { currentBranch } = useBranch();
  
  // Debug para valores pré-selecionados
  console.log('AppointmentWizard - Valores pré-selecionados:', { preselectedDate, preselectedTime });
  
  // Estado para controlar os passos do wizard
  const [activeStep, setActiveStep] = useState(0);
  
  // Dados do formulário
  const [formData, setFormData] = useState<FormDataType>(() => {
    // Valor inicial do formulário
    const initialData: FormDataType = {
      clientId: '',
      appointmentType: clientSubscriptions.some(s => s.status === 'ACTIVE') ? 'plan' : 'single',
      serviceId: '',
      therapistId: '',
      date: preselectedDate ? dayjs(preselectedDate) : dayjs(),
      time: preselectedTime ? dayjs(`2023-01-01T${preselectedTime}`) : null,
      autoSchedule: false,
      couponCode: '',
      subscriptionId: '',
      notes: '',
      branchId: currentBranch?.id || ''
    };
    
    console.log('AppointmentWizard - Formulário inicializado com:', initialData);
    return initialData;
  });
  
  // Estados de carregamento e erro
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados auxiliares
  const [filteredTherapists, setFilteredTherapists] = useState<Therapist[]>([]);
  const [activeSubscriptions, setActiveSubscriptions] = useState<Subscription[]>([]);
  
  // Efeito para atualizar as assinaturas ativas quando o cliente muda
  useEffect(() => {
    if (formData.clientId) {
      const activeSubs = clientSubscriptions.filter(
        sub => sub.clientId === formData.clientId && sub.status === 'ACTIVE' && sub.remainingSessions > 0
      );
      
      setActiveSubscriptions(activeSubs);
      
      // Se não houver assinaturas ativas, forçar o tipo para avulso
      if (activeSubs.length === 0 && formData.appointmentType === 'plan') {
        setFormData(prev => ({ ...prev, appointmentType: 'single' }));
      }
    }
  }, [formData.clientId, clientSubscriptions]);
  
  // Efeito para filtrar terapeutas com base no serviço selecionado
  useEffect(() => {
    if (formData.serviceId) {
      // Aqui seria necessário implementar a lógica para filtrar terapeutas por serviço
      // Por enquanto, estamos apenas passando todos os terapeutas
      setFilteredTherapists(therapists);
      
      // Se só houver um terapeuta, selecioná-lo automaticamente
      if (therapists.length === 1) {
        setFormData(prev => ({ ...prev, therapistId: therapists[0].id }));
      }
    } else {
      setFilteredTherapists([]);
      setFormData(prev => ({ ...prev, therapistId: '' }));
    }
  }, [formData.serviceId, therapists]);
  
  // Pré-selecionar o serviço se só houver um disponível
  useEffect(() => {
    if (services.length === 1) {
      setFormData(prev => ({ ...prev, serviceId: services[0].id }));
    }
  }, [services]);
  
  // Resetar para a primeira etapa quando o modal abrir
  useEffect(() => {
    if (open) {
      setActiveStep(0); // Sempre começar na primeira etapa
      // Manter os valores pré-selecionados mas começar do início
      if (preselectedDate || preselectedTime) {
        setFormData(prev => ({
          ...prev,
          date: preselectedDate ? dayjs(preselectedDate) : prev.date,
          time: preselectedTime ? dayjs(`2023-01-01T${preselectedTime}`) : prev.time,
          autoSchedule: false
        }));
      }
    }
  }, [open, preselectedDate, preselectedTime]);
  
  // Funções auxiliares
  const getServiceById = (id: string): Service | undefined => {
    return services.find(service => service.id === id);
  };
  
  const getClientById = (id: string): Client | undefined => {
    return clients.find(client => client.id === id);
  };
  
  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };
  
  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };
  
  const handleChange = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obter o serviço selecionado para calcular o endTime
      const selectedService = getServiceById(formData.serviceId);
      
      // Calcular o endTime se houver startTime
      let endTime: string | undefined;
      if (!formData.autoSchedule && formData.time && selectedService) {
        const startMoment = dayjs(formData.time);
        const endMoment = startMoment.add(selectedService.averageDuration || 60, 'minute');
        endTime = endMoment.format('HH:mm');
      }
      
      // Preparar dados do agendamento
      const appointmentData: AppointmentData = {
        clientId: formData.clientId,
        serviceId: formData.serviceId,
        therapistId: formData.therapistId,
        date: format(formData.date.toDate(), 'yyyy-MM-dd'),
        startTime: formData.autoSchedule ? undefined : formData.time ? dayjs(formData.time).format('HH:mm') : undefined,
        endTime: formData.autoSchedule ? undefined : endTime,
        subscriptionId: formData.appointmentType === 'plan' ? formData.subscriptionId : undefined,
        couponCode: formData.couponCode || undefined,
        notes: formData.notes || undefined,
        branchId: formData.branchId,
        autoSchedule: formData.autoSchedule
      };
      
      await onSave(appointmentData);
      onClose();
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      setError('Ocorreu um erro ao criar o agendamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  
  // Verificar se o formulário está valido em cada etapa
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 0: // Tipo de venda e cliente
        return !!formData.clientId;
      case 1: // Serviço
        return !!formData.serviceId;
      case 2: // Data e hora
        if (formData.autoSchedule) return true;
        return !!formData.date && !!formData.time;
      case 3: // Terapeuta
        return !!formData.therapistId;
      default:
        return true;
    }
  };
  
  // Renderizar o conteúdo com base na etapa atual
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return renderTypeSelection();
      case 1:
        return renderServiceSelection();
      case 2:
        return renderSchedulingOptions();
      case 3:
        return renderTherapistSelection();
      case 4:
        return renderSummary();
      default:
        return <Typography>Passo não encontrado</Typography>;
    }
  };
  
  // Passo 1: Tipo de Venda (Plano ou Avulso)
  const renderTypeSelection = () => {
    const hasActiveSubscriptions = activeSubscriptions.length > 0;
    
    return (
      <Box sx={{ py: 2 }}>
        <Typography variant="h6" gutterBottom>
          Tipo de Agendamento
        </Typography>
        
        {formData.clientId ? (
          <>
            <Box sx={{ mb: 3 }}>
              <RadioGroup
                row
                name="appointmentType"
                value={formData.appointmentType}
                onChange={(e) => handleChange('appointmentType', e.target.value)}
                sx={{ justifyContent: 'center', gap: 2 }}
              >
                <Paper
                  elevation={formData.appointmentType === 'plan' ? 3 : 1}
                  sx={{
                    p: 2,
                    width: '45%',
                    cursor: 'pointer',
                    border: formData.appointmentType === 'plan' ? `2px solid ${theme.palette.primary.main}` : 'none',
                    opacity: !hasActiveSubscriptions ? 0.5 : 1,
                    pointerEvents: !hasActiveSubscriptions ? 'none' : 'auto'
                  }}
                  onClick={() => hasActiveSubscriptions && handleChange('appointmentType', 'plan')}
                >
                  <FormControlLabel
                    value="plan"
                    control={<Radio />}
                    disabled={!hasActiveSubscriptions}
                    label={
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <PlanIcon fontSize="large" color={formData.appointmentType === 'plan' ? 'primary' : 'action'} />
                        <Typography variant="subtitle1">Plano</Typography>
                      </Box>
                    }
                    sx={{ m: 0, width: '100%', justifyContent: 'center' }}
                  />
                </Paper>
                
                <Paper
                  elevation={formData.appointmentType === 'single' ? 3 : 1}
                  sx={{
                    p: 2,
                    width: '45%',
                    cursor: 'pointer',
                    border: formData.appointmentType === 'single' ? `2px solid ${theme.palette.primary.main}` : 'none'
                  }}
                  onClick={() => handleChange('appointmentType', 'single')}
                >
                  <FormControlLabel
                    value="single"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <SingleIcon fontSize="large" color={formData.appointmentType === 'single' ? 'primary' : 'action'} />
                        <Typography variant="subtitle1">Avulso</Typography>
                      </Box>
                    }
                    sx={{ m: 0, width: '100%', justifyContent: 'center' }}
                  />
                </Paper>
              </RadioGroup>
            </Box>
            
            {formData.appointmentType === 'plan' && hasActiveSubscriptions && (
              <FormControl fullWidth margin="normal">
                <InputLabel>Selecione o Plano</InputLabel>
                <Select
                  value={formData.subscriptionId}
                  onChange={(e) => handleChange('subscriptionId', e.target.value)}
                  label="Selecione o Plano"
                >
                  {activeSubscriptions.map(sub => (
                    <MenuItem key={sub.id} value={sub.id}>
                      {sub.therapyPlan?.name} ({sub.remainingSessions} sessões restantes)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            
            {!hasActiveSubscriptions && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                Este cliente não possui planos ativos com sessões disponíveis.
              </Typography>
            )}
          </>
        ) : (
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
            <FormHelperText>Selecione um cliente para continuar</FormHelperText>
          </FormControl>
        )}
      </Box>
    );
  };
  
  // Passo 2: Seleção de Serviço
  const renderServiceSelection = () => {
    // Se só houver um serviço disponível, pular este passo
    if (services.length === 1) {
      setTimeout(() => handleNext(), 0);
      return <CircularProgress />;
    }
    
    return (
      <Box sx={{ py: 2 }}>
        <Typography variant="h6" gutterBottom>
          Selecione o Serviço
        </Typography>
        
        <FormControl fullWidth margin="normal">
          <InputLabel>Tipo de Sessão</InputLabel>
          <Select
            value={formData.serviceId}
            onChange={(e) => handleChange('serviceId', e.target.value)}
            label="Tipo de Sessão"
          >
            {services.map(service => (
              <MenuItem key={service.id} value={service.id}>
                {service.name} - {service.averageDuration} min - 
                {formData.appointmentType === 'single' && 
                  <> R$ {service.price.toFixed(2)}</>
                }
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    );
  };
  
  // Passo 3: Opções de Agendamento (Auto ou Manual)
  const renderSchedulingOptions = () => {
    return (
      <Box sx={{ py: 2 }}>
        <Typography variant="h6" gutterBottom>
          Opções de Agendamento
        </Typography>
        
        <FormControlLabel
          control={
            <Switch
              checked={formData.autoSchedule}
              onChange={(e) => handleChange('autoSchedule', e.target.checked)}
              color="primary"
            />
          }
          label="Agendar próximo horário disponível"
          sx={{ mb: 2 }}
        />
        
        {!formData.autoSchedule && (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Data"
                value={formData.date}
                onChange={(newDate) => newDate && handleChange('date', newDate)}
                disablePast
                sx={{ width: '100%' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TimePicker
                label="Horário"
                value={formData.time}
                onChange={(newTime) => handleChange('time', newTime)}
                sx={{ width: '100%' }}
              />
            </Grid>
          </Grid>
        )}
      </Box>
    );
  };
  
  // Passo 4: Seleção de Terapeuta
  const renderTherapistSelection = () => {
    // Se só houver um terapeuta disponível, pular este passo
    if (filteredTherapists.length === 1) {
      setTimeout(() => handleNext(), 0);
      return <CircularProgress />;
    }
    
    return (
      <Box sx={{ py: 2 }}>
        <Typography variant="h6" gutterBottom>
          Selecione o Terapeuta
        </Typography>
        
        <FormControl fullWidth margin="normal">
          <InputLabel>Terapeuta</InputLabel>
          <Select
            value={formData.therapistId}
            onChange={(e) => handleChange('therapistId', e.target.value)}
            label="Terapeuta"
          >
            {filteredTherapists.map(therapist => (
              <MenuItem key={therapist.id} value={therapist.id}>
                {therapist.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    );
  };
  
  // Passo 5: Resumo e Confirmação
  const renderSummary = () => {
    const selectedService = getServiceById(formData.serviceId);
    const selectedClient = getClientById(formData.clientId);
    const selectedSubscription = activeSubscriptions.find(sub => sub.id === formData.subscriptionId);
    
    return (
      <Box sx={{ py: 2 }}>
        <Typography variant="h6" gutterBottom>
          Resumo do Agendamento
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Cliente
              </Typography>
              <Typography variant="body1">
                {selectedClient?.name || 'Não selecionado'}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Serviço
              </Typography>
              <Typography variant="body1">
                {selectedService?.name || 'Não selecionado'}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Tipo
              </Typography>
              <Typography variant="body1">
                {formData.appointmentType === 'plan' ? 'Plano' : 'Avulso'}
                {formData.appointmentType === 'plan' && selectedSubscription && (
                  <Chip 
                    size="small" 
                    label={`${selectedSubscription.remainingSessions} sessões restantes`} 
                    color="primary" 
                    sx={{ ml: 1 }} 
                  />
                )}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Agendamento
              </Typography>
              <Typography variant="body1">
                {formData.autoSchedule ? (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TimeIcon sx={{ mr: 1 }} />
                    Próximo horário disponível
                  </Box>
                ) : (
                  `${format(formData.date.toDate(), 'dd/MM/yyyy', { locale: ptBR })} às ${formData.time ? dayjs(formData.time).format('HH:mm') : '--:--'}`
                )}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: formData.appointmentType === 'single' ? '#f5f5f5' : 'transparent' }}>
              <Typography variant="subtitle2" gutterBottom>
                Valor
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {formData.appointmentType === 'plan' ? (
                  `Usando plano: ${selectedSubscription?.therapyPlan?.name || 'Plano selecionado'}`
                ) : (
                  `R$ ${selectedService?.price.toFixed(2) || '0.00'}`
                )}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ mt: 2 }}>
              <TextField
                label="Cupom de desconto (opcional)"
                value={formData.couponCode}
                onChange={(e) => handleChange('couponCode', e.target.value)}
                fullWidth
                size="small"
                placeholder="Digite o código do cupom"
                InputProps={{
                  startAdornment: <CouponIcon color="action" sx={{ mr: 1 }} />
                }}
              />
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Observações (opcional)"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              fullWidth
              multiline
              rows={2}
              placeholder="Observações adicionais para este agendamento"
            />
          </Grid>
        </Grid>
      </Box>
    );
  };
  
  // Determinar se o botão Próximo deve estar desativado
  const isNextDisabled = () => {
    return !isStepValid(activeStep);
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm"
      fullWidth
      PaperProps={{ 
        sx: { 
          minHeight: '500px',
          display: 'flex',
          flexDirection: 'column'
        } 
      }}
    >
      <DialogTitle>
        <Typography variant="h6">Novo Agendamento</Typography>
        <Typography variant="caption" color="textSecondary">
          Passo {activeStep + 1} de 5
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
            <CircularProgress />
          </Box>
        ) : (
          renderStepContent()
        )}
        
        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </DialogContent>
      
      <DialogActions sx={{ justifyContent: 'space-between', p: 2 }}>
        {activeStep > 0 ? (
          <Button
            onClick={handleBack}
            startIcon={<BackIcon />}
            color="inherit"
          >
            Voltar
          </Button>
        ) : (
          <Button onClick={onClose} color="inherit">
            Cancelar
          </Button>
        )}
        
        {activeStep === 4 ? (
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={loading}
            endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckIcon />}
          >
            {loading ? 'Confirmando...' : 'Confirmar Agendamento'}
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            variant="contained"
            color="primary"
            disabled={isNextDisabled()}
            endIcon={<NextIcon />}
          >
            Próximo
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AppointmentWizard; 