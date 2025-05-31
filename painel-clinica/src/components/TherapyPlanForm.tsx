import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Switch,
  FormControlLabel,
  Grid,
  InputAdornment,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Typography,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { TherapyPlan, CreateTherapyPlanDTO } from '../types/therapyPlan';
import { useBranch } from '../context/BranchContext';

interface TherapyPlanFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTherapyPlanDTO) => Promise<void>;
  initialData?: TherapyPlan;
  title: string;
}

// Schema de validação
const validationSchema = yup.object().shape({
  name: yup.string().required('Nome é obrigatório').max(100, 'Nome muito longo'),
  description: yup.string().nullable().max(500, 'Descrição muito longa'),
  totalSessions: yup.number()
    .typeError('Quantidade de sessões deve ser um número')
    .required('Quantidade de sessões é obrigatória')
    .min(1, 'Deve haver pelo menos 1 sessão')
    .integer('Deve ser um número inteiro'),
  validityDays: yup.number()
    .typeError('Dias de validade deve ser um número')
    .required('Dias de validade é obrigatório')
    .min(1, 'Deve haver pelo menos 1 dia de validade')
    .integer('Deve ser um número inteiro'),
  totalPrice: yup.number()
    .typeError('Preço deve ser um número')
    .required('Preço é obrigatório')
    .min(0, 'Preço não pode ser negativo'),
  isActive: yup.boolean().default(true),
  branchIds: yup.array().of(yup.string())
    .min(1, 'Selecione pelo menos uma filial')
});

const TherapyPlanForm = ({ 
  open, 
  onClose, 
  onSubmit, 
  initialData, 
  title 
}: TherapyPlanFormProps) => {
  const { branches, loading: loadingBranches, loadBranches } = useBranch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Configurar o formulário com validação
  const { 
    control, 
    handleSubmit, 
    reset,
    formState: { errors } 
  } = useForm<CreateTherapyPlanDTO>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
    name: '',
    description: '',
      totalSessions: 10,
    validityDays: 90,
      totalPrice: 0,
    isActive: true,
      branchIds: []
    }
  });

  // Restaurar valores quando o formulário for aberto ou initialData mudar
  useEffect(() => {
    if (open) {
      if (initialData) {
        // Quando editar um plano existente
        console.log('Carregando dados para edição:', initialData);
        reset({
          name: initialData.name,
          description: initialData.description || '',
          totalSessions: initialData.totalSessions,
          validityDays: initialData.validityDays,
          totalPrice: initialData.totalPrice,
          isActive: initialData.isActive,
          branchIds: initialData.branches.map(branch => branch.id)
        });
      } else {
        // Quando criar um novo plano
        reset({
          name: '',
          description: '',
          totalSessions: 10,
          validityDays: 90,
          totalPrice: 0,
          isActive: true,
          branchIds: []
        });
      }
      
      // Limpar mensagens de erro
      setError(null);
    }
  }, [open, initialData, reset]);

  // Carregar filiais quando o formulário for aberto se não estiverem carregadas
  useEffect(() => {
    if (open && branches.length === 0 && !loadingBranches) {
      loadBranches();
    }
  }, [open, branches.length, loadingBranches, loadBranches]);

  // Processar submissão do formulário
  const handleFormSubmit: SubmitHandler<CreateTherapyPlanDTO> = async (data) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit(data);
    onClose();
    } catch (err) {
      console.error('Erro ao salvar plano:', err);
      setError('Erro ao salvar o plano. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };

  return (
    <Dialog 
      open={open} 
      onClose={isSubmitting ? undefined : onClose} 
      maxWidth="md" 
      fullWidth
      aria-labelledby="therapy-plan-form-title"
    >
      <DialogTitle id="therapy-plan-form-title">
        {title}
      </DialogTitle>
      
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Informações Básicas
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12}>
              {/* Nome do Plano */}
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nome do Plano"
                    fullWidth
                    margin="normal"
                    error={!!errors.name}
                    helperText={errors.name?.message || ''}
                    disabled={isSubmitting}
                    autoFocus
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              {/* Descrição */}
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Descrição"
                    fullWidth
                    multiline
                    rows={3}
                    margin="normal"
                    error={!!errors.description}
                    helperText={errors.description?.message || ''}
                    disabled={isSubmitting}
                    placeholder="Descreva os detalhes do plano"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Configurações do Plano
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={4}>
              {/* Quantidade de Sessões */}
              <Controller
                name="totalSessions"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Quantidade de Sessões"
                    type="number"
                    fullWidth
                    margin="normal"
                    error={!!errors.totalSessions}
                    helperText={errors.totalSessions?.message || ''}
                    disabled={isSubmitting}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">sessões</InputAdornment>,
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              {/* Dias de Validade */}
              <Controller
                name="validityDays"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Dias de Validade"
                    type="number"
                    fullWidth
                    margin="normal"
                    error={!!errors.validityDays}
                    helperText={errors.validityDays?.message || ''}
                    disabled={isSubmitting}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">dias</InputAdornment>,
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              {/* Preço */}
              <Controller
                name="totalPrice"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Preço"
                    type="number"
                    fullWidth
                    margin="normal"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                    }}
                    error={!!errors.totalPrice}
                    helperText={errors.totalPrice?.message || ''}
                    disabled={isSubmitting}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Filiais e Disponibilidade
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
              {/* Filiais */}
              <Controller
                name="branchIds"
                control={control}
                render={({ field }) => (
                  <FormControl 
                    fullWidth 
                    margin="normal" 
                    error={!!errors.branchIds}
                    disabled={isSubmitting || branches.length === 0}
                  >
                    <InputLabel id="branch-select-label">Filiais</InputLabel>
                    <Select
                      {...field}
                      labelId="branch-select-label"
                      label="Filiais"
                      multiple
                      input={<OutlinedInput label="Filiais" />}
                      renderValue={(selected) => {
                        if (!selected || selected.length === 0) return '';
                        const selectedBranches = branches.filter(branch => 
                          (selected as string[]).includes(branch.id)
                        );
                        return selectedBranches.map(b => b.name).join(', ');
                      }}
                      MenuProps={MenuProps}
                    >
                      {branches.length > 0 ? (
                        branches.map((branch) => (
                        <MenuItem key={branch.id} value={branch.id}>
                            <Checkbox checked={(field.value || []).indexOf(branch.id) > -1} />
                            <ListItemText primary={branch.name} />
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>
                          <Typography color="text.secondary">
                            Nenhuma filial disponível
                          </Typography>
                        </MenuItem>
                      )}
                    </Select>
                    {errors.branchIds ? (
                      <FormHelperText error>
                        {errors.branchIds.message || 'Selecione pelo menos uma filial'}
                      </FormHelperText>
                    ) : (
                      <FormHelperText>
                        Selecione uma ou mais filiais onde este plano estará disponível
                      </FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              {/* Ativo/Inativo */}
              <Controller
                name="isActive"
                control={control}
                render={({ field: { value, onChange, ...restField } }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        {...restField}
                        checked={!!value}
                        onChange={(e) => onChange(e.target.checked)}
                        color="primary"
                        disabled={isSubmitting}
                      />
                    }
                    label={
                      <Typography>
                        {value ? 'Plano Ativo' : 'Plano Inativo'}
                        <Typography variant="caption" display="block" color="text.secondary">
                          {value 
                            ? 'Plano disponível para venda e utilização' 
                            : 'Plano não disponível para novas vendas'}
                        </Typography>
                      </Typography>
                    }
                    sx={{ mt: 2 }}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={onClose} 
            color="inherit"
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TherapyPlanForm; 