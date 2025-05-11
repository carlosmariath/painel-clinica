import { useEffect } from 'react';
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
  InputAdornment
} from '@mui/material';
import { useForm, Controller, FieldValues } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { TherapyPlan } from '../services/therapyPlanService';
import { useBranch } from '../context/BranchContext';

interface TherapyPlanFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<TherapyPlan, 'id'>) => void;
  initialData?: TherapyPlan;
  title: string;
}

// Schema de validação
const schema = yup.object().shape({
  name: yup.string().required('Nome é obrigatório'),
  description: yup.string(),
  sessionCount: yup.number()
    .typeError('Quantidade de sessões deve ser um número')
    .required('Quantidade de sessões é obrigatória')
    .min(1, 'Deve haver pelo menos 1 sessão')
    .integer('Deve ser um número inteiro'),
  validityDays: yup.number()
    .typeError('Dias de validade deve ser um número')
    .required('Dias de validade é obrigatório')
    .min(1, 'Deve haver pelo menos 1 dia de validade')
    .integer('Deve ser um número inteiro'),
  price: yup.number()
    .typeError('Preço deve ser um número')
    .required('Preço é obrigatório')
    .min(0, 'Preço não pode ser negativo'),
  isActive: yup.boolean().required(),
  branchId: yup.string().required('Filial é obrigatória')
});

const TherapyPlanForm = ({ open, onClose, onSubmit, initialData, title }: TherapyPlanFormProps) => {
  const { currentBranch, branches } = useBranch();
  const defaultValues = {
    name: '',
    description: '',
    sessionCount: 10,
    validityDays: 90,
    price: 0,
    isActive: true,
    branchId: currentBranch?.id || ''
  };

  const { control, handleSubmit, reset, formState: { errors } } = useForm<Omit<TherapyPlan, 'id'>>({
    resolver: yupResolver(schema),
    defaultValues: initialData || defaultValues
  });

  useEffect(() => {
    if (open) {
      reset(initialData || defaultValues);
    }
  }, [open, initialData, reset, defaultValues]);

  const handleFormSubmit = (data: Omit<TherapyPlan, 'id'>) => {
    onSubmit(data);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
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
                    helperText={errors.name?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
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
                    helperText={errors.description?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="sessionCount"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Quantidade de Sessões"
                    type="number"
                    fullWidth
                    margin="normal"
                    error={!!errors.sessionCount}
                    helperText={errors.sessionCount?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
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
                    helperText={errors.validityDays?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="price"
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
                    error={!!errors.price}
                    helperText={errors.price?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="branchId"
                control={control}
                render={({ field }) => (
                  <FormControl 
                    fullWidth 
                    margin="normal" 
                    error={!!errors.branchId}
                  >
                    <InputLabel>Filial</InputLabel>
                    <Select
                      {...field}
                      label="Filial"
                    >
                      {branches.map((branch) => (
                        <MenuItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.branchId && (
                      <FormHelperText>{errors.branchId.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    }
                    label="Plano Ativo"
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="inherit">
            Cancelar
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Salvar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TherapyPlanForm; 