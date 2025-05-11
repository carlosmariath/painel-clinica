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
  TextField
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { TherapyPlan } from '../services/therapyPlanService';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CURRENCY_LOCALE, CURRENCY_OPTIONS, DATE_FORMAT } from '../config';
import therapyPlanService from '../services/therapyPlanService';
import { useBranch } from '../context/BranchContext';

interface Client {
  id: string;
  name: string;
  email: string;
}

interface SubscriptionFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: SubscriptionFormData) => void;
  clients: Client[];
  title: string;
}

interface SubscriptionFormData {
  clientId: string;
  therapyPlanId: string;
  startDate: string;
}

// Schema de validação
const schema = yup.object().shape({
  clientId: yup.string().required('Cliente é obrigatório'),
  therapyPlanId: yup.string().required('Plano é obrigatório'),
  startDate: yup.string().required('Data de início é obrigatória')
});

const SubscriptionForm = ({ open, onClose, onSubmit, clients, title }: SubscriptionFormProps) => {
  const { currentBranch } = useBranch();
  const [plans, setPlans] = useState<TherapyPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<TherapyPlan | null>(null);
  const today = format(new Date(), 'yyyy-MM-dd');

  const defaultValues = {
    clientId: '',
    therapyPlanId: '',
    startDate: today
  };

  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<SubscriptionFormData>({
    resolver: yupResolver(schema),
    defaultValues
  });

  const therapyPlanId = watch('therapyPlanId');
  const startDate = watch('startDate');

  // Carregar planos disponíveis
  useEffect(() => {
    if (open && currentBranch) {
      therapyPlanService.getPlans(currentBranch.id)
        .then(data => {
          // Filtrar apenas planos ativos
          const activePlans = data.filter((plan: TherapyPlan) => plan.isActive);
          setPlans(activePlans);
        })
        .catch(error => console.error('Erro ao carregar planos:', error));
    }
  }, [open, currentBranch]);

  // Atualizar plano selecionado quando o ID mudar
  useEffect(() => {
    if (therapyPlanId) {
      const plan = plans.find(p => p.id === therapyPlanId) || null;
      setSelectedPlan(plan);
    } else {
      setSelectedPlan(null);
    }
  }, [therapyPlanId, plans]);

  // Resetar formulário ao abrir
  useEffect(() => {
    if (open) {
      reset(defaultValues);
    }
  }, [open, reset]);

  const handleFormSubmit = (data: SubscriptionFormData) => {
    onSubmit(data);
    onClose();
  };

  // Calcular data de fim com base no plano e data de início
  const calculateEndDate = () => {
    if (!selectedPlan || !startDate) return '';
    
    try {
      const date = new Date(startDate);
      const endDate = addDays(date, selectedPlan.validityDays);
      return format(endDate, 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      return 'Data inválida';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
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
                  >
                    <InputLabel>Cliente</InputLabel>
                    <Select
                      {...field}
                      label="Cliente"
                    >
                      {clients.map((client) => (
                        <MenuItem key={client.id} value={client.id}>
                          {client.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.clientId && (
                      <FormHelperText>{errors.clientId.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="therapyPlanId"
                control={control}
                render={({ field }) => (
                  <FormControl 
                    fullWidth 
                    margin="normal" 
                    error={!!errors.therapyPlanId}
                  >
                    <InputLabel>Plano de Terapia</InputLabel>
                    <Select
                      {...field}
                      label="Plano de Terapia"
                    >
                      {plans.map((plan) => (
                        <MenuItem key={plan.id} value={plan.id}>
                          {plan.name} - {new Intl.NumberFormat(CURRENCY_LOCALE, CURRENCY_OPTIONS).format(plan.price)}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.therapyPlanId && (
                      <FormHelperText>{errors.therapyPlanId.message}</FormHelperText>
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
                    helperText={errors.startDate?.message}
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
                    <strong>Sessões:</strong> {selectedPlan.sessionCount}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2">
                    <strong>Validade:</strong> {selectedPlan.validityDays} dias
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2">
                    <strong>Valor:</strong> {new Intl.NumberFormat(CURRENCY_LOCALE, CURRENCY_OPTIONS).format(selectedPlan.price)}
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
          <Button onClick={onClose} color="inherit">
            Cancelar
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Criar Assinatura
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default SubscriptionForm; 