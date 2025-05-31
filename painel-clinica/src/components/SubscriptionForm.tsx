import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid,
  Typography,
  TextField,
  CircularProgress,
  Box,
  Alert
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CURRENCY_LOCALE, CURRENCY_OPTIONS } from '../config';
import therapyPlanService from '../services/therapyPlanService';
import { TherapyPlan } from '../types/therapyPlan';
import { useBranch } from '../context/BranchContext';
import { CreateSubscriptionDTO } from '../services/subscriptionService';

interface Client {
  id: string;
  name: string;
  email: string;
}

interface SubscriptionFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSubscriptionDTO) => void;
  clients: Client[];
  title: string;
}

// Schema de validação
const schema = yup.object().shape({
  clientId: yup.string().required('Cliente é obrigatório'),
  planId: yup.string().required('Plano é obrigatório'),
  branchId: yup.string(),
  startDate: yup.string().required('Data de início é obrigatória')
});

const SubscriptionForm = ({ open, onClose, onSubmit, clients, title }: SubscriptionFormProps) => {
  const { currentBranch } = useBranch();
  const [plans, setPlans] = useState<TherapyPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<TherapyPlan | null>(null);
  const today = format(new Date(), 'yyyy-MM-dd');
  const [loading, setLoading] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultValues = {
    clientId: '',
    planId: '',
    branchId: currentBranch?.id || '',
    startDate: today
  };

  const { control, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    defaultValues
  });

  const planId = watch('planId');
  const startDate = watch('startDate');

  // Carregar planos disponíveis
  useEffect(() => {
    if (open && currentBranch) {
      setLoadingPlans(true);
      setError(null);
      therapyPlanService.getPlans({ branchId: currentBranch.id })
        .then(data => {
          // Filtrar apenas planos ativos
          const activePlans = data.filter((plan: TherapyPlan) => plan.isActive);
          setPlans(activePlans);
          if (activePlans.length === 0) {
            setError('Não há planos ativos disponíveis para esta filial.');
          }
        })
        .catch(error => {
          console.error('Erro ao carregar planos:', error);
          setError('Não foi possível carregar os planos. Tente novamente.');
        })
        .finally(() => {
          setLoadingPlans(false);
        });
    }
  }, [open, currentBranch]);

  // Atualizar plano selecionado quando o ID mudar
  useEffect(() => {
    if (planId) {
      const plan = plans.find(p => p.id === planId) || null;
      setSelectedPlan(plan);
    } else {
      setSelectedPlan(null);
    }
  }, [planId, plans]);

  // Resetar formulário ao abrir
  useEffect(() => {
    if (open) {
      reset(defaultValues);
    }
  }, [open, reset]);

  const handleFormSubmit = async (data: any) => {
    setLoading(true);
    try {
      const subscriptionData: CreateSubscriptionDTO = {
        clientId: data.clientId,
        planId: data.planId,
        branchId: currentBranch?.id
      };
      await onSubmit(subscriptionData);
      onClose();
    } catch (error) {
      setError('Ocorreu um erro ao criar a assinatura. Tente novamente.');
      console.error('Erro ao criar assinatura:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular data de fim com base no plano e data de início
  const calculateEndDate = () => {
    if (!selectedPlan || !startDate) return '';
    
    try {
      const date = new Date(startDate);
      const endDate = addDays(date, selectedPlan.validityDays);
      return format(endDate, 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {title}
        {!currentBranch && (
          <Typography variant="subtitle2" color="error">
            Selecione uma filial para criar uma assinatura
          </Typography>
        )}
      </DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Controller
                name="clientId"
                control={control}
                render={({ field }) => (
                  <FormControl 
                    fullWidth 
                    margin="normal" 
                    error={!!errors.clientId}
                    disabled={isSubmitting || loading}
                  >
                    <InputLabel>Cliente</InputLabel>
                    <Select
                      {...field}
                      label="Cliente"
                    >
                      {clients.length === 0 ? (
                        <MenuItem disabled>Carregando clientes...</MenuItem>
                      ) : (
                        clients.map((client) => (
                          <MenuItem key={client.id} value={client.id}>
                            {client.name}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                    {errors.clientId && (
                      <FormHelperText>{(errors.clientId as any).message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="planId"
                control={control}
                render={({ field }) => (
                  <FormControl 
                    fullWidth 
                    margin="normal" 
                    error={!!errors.planId}
                    disabled={isSubmitting || loading || loadingPlans}
                  >
                    <InputLabel>Plano de Terapia</InputLabel>
                    <Select
                      {...field}
                      label="Plano de Terapia"
                    >
                      {loadingPlans ? (
                        <MenuItem disabled>
                          <Box display="flex" alignItems="center">
                            <CircularProgress size={20} sx={{ mr: 1 }} />
                            Carregando planos...
                          </Box>
                        </MenuItem>
                      ) : plans.length === 0 ? (
                        <MenuItem disabled>Nenhum plano disponível</MenuItem>
                      ) : (
                        plans.map((plan) => (
                          <MenuItem key={plan.id} value={plan.id}>
                            {plan.name} - {new Intl.NumberFormat(CURRENCY_LOCALE, CURRENCY_OPTIONS).format(plan.totalPrice)}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                    {errors.planId && (
                      <FormHelperText>{(errors.planId as any).message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Data de Início"
                    type="date"
                    fullWidth
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.startDate}
                    helperText={errors.startDate && (errors.startDate as any).message}
                  />
                )}
              />
            </Grid>

            {selectedPlan && (
              <>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Detalhes do Plano Selecionado
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2">
                    <strong>Sessões:</strong> {selectedPlan.totalSessions}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2">
                    <strong>Validade:</strong> {selectedPlan.validityDays} dias
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2">
                    <strong>Valor:</strong> {new Intl.NumberFormat(CURRENCY_LOCALE, CURRENCY_OPTIONS).format(selectedPlan.totalPrice)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2">
                    <strong>Data de Término:</strong> {calculateEndDate()}
                  </Typography>
                </Grid>
                {selectedPlan.description && (
                  <Grid item xs={12}>
                    <Typography variant="body2">
                      <strong>Descrição:</strong> {selectedPlan.description}
                    </Typography>
                  </Grid>
                )}
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="inherit" disabled={isSubmitting || loading}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={isSubmitting || loading || loadingPlans || !currentBranch}
          >
            {(isSubmitting || loading) ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
                Criando...
              </>
            ) : (
              'Criar Assinatura'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default SubscriptionForm; 