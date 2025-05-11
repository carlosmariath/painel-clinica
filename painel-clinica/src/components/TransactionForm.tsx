import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputAdornment,
  Typography
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  FinancialTransaction, 
  TransactionType, 
  FinanceCategory, 
  PaymentMethod 
} from '../services/financeService';
import { format } from 'date-fns';
import { useBranch } from '../context/BranchContext';
import financeService from '../services/financeService';

interface Client {
  id: string;
  name: string;
  email: string;
}

interface TransactionFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TransactionFormData) => void;
  initialData?: FinancialTransaction;
  clients: Client[];
  title: string;
}

type TransactionFormData = Omit<FinancialTransaction, 'id' | 'client' | 'branch' | 'paymentMethod' | 'financeCategory'>;

// Schema de validação
const schema = yup.object().shape({
  type: yup.string().required('Tipo é obrigatório'),
  amount: yup.number()
    .typeError('Valor deve ser um número')
    .required('Valor é obrigatório')
    .min(0.01, 'Valor deve ser maior que zero'),
  description: yup.string().required('Descrição é obrigatória'),
  category: yup.string().required('Categoria é obrigatória'),
  date: yup.string().required('Data é obrigatória'),
  clientId: yup.string().nullable(),
  branchId: yup.string().required('Filial é obrigatória'),
  paymentMethodId: yup.string().nullable(),
  financeCategoryId: yup.string().nullable(),
  reference: yup.string().nullable(),
  referenceType: yup.string().nullable()
});

const TransactionForm = ({ 
  open, 
  onClose, 
  onSubmit, 
  initialData, 
  clients, 
  title 
}: TransactionFormProps) => {
  const { currentBranch, branches } = useBranch();
  const [categories, setCategories] = useState<FinanceCategory[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedType, setSelectedType] = useState<TransactionType>('REVENUE');
  
  const today = format(new Date(), 'yyyy-MM-dd');

  const defaultValues: TransactionFormData = {
    type: 'REVENUE',
    amount: 0,
    description: '',
    category: '',
    date: today,
    clientId: '',
    branchId: currentBranch?.id || '',
    paymentMethodId: '',
    financeCategoryId: '',
    reference: '',
    referenceType: ''
  };

  const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<TransactionFormData>({
    resolver: yupResolver(schema),
    defaultValues: initialData || defaultValues
  });

  const transactionType = watch('type') as TransactionType;
  const financeCategoryId = watch('financeCategoryId');

  // Carregar categorias e métodos de pagamento
  useEffect(() => {
    if (open) {
      // Carregar categorias financeiras
      financeService.getCategories()
        .then(data => setCategories(data))
        .catch(error => console.error('Erro ao carregar categorias:', error));
      
      // Carregar métodos de pagamento
      financeService.getPaymentMethods(true)
        .then(data => setPaymentMethods(data))
        .catch(error => console.error('Erro ao carregar métodos de pagamento:', error));
    }
  }, [open]);

  // Atualizar o tipo selecionado quando mudar
  useEffect(() => {
    setSelectedType(transactionType);
  }, [transactionType]);

  // Resetar formulário ao abrir
  useEffect(() => {
    if (open) {
      reset(initialData || defaultValues);
      if (initialData) {
        setSelectedType(initialData.type);
      }
    }
  }, [open, initialData, reset]);

  // Quando selecionar uma categoria, atualizar o campo category
  useEffect(() => {
    if (financeCategoryId) {
      const selectedCategory = categories.find(cat => cat.id === financeCategoryId);
      if (selectedCategory) {
        setValue('category', selectedCategory.name);
      }
    }
  }, [financeCategoryId, categories, setValue]);

  const handleFormSubmit = (data: TransactionFormData) => {
    onSubmit(data);
    onClose();
  };

  // Filtrar categorias pelo tipo selecionado
  const filteredCategories = categories.filter(
    category => category.type === selectedType
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <FormControl component="fieldset" error={!!errors.type}>
                    <RadioGroup
                      row
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        // Limpar categoria ao mudar o tipo
                        setValue('financeCategoryId', '');
                        setValue('category', '');
                      }}
                    >
                      <FormControlLabel 
                        value="REVENUE" 
                        control={<Radio />} 
                        label="Receita" 
                      />
                      <FormControlLabel 
                        value="EXPENSE" 
                        control={<Radio />} 
                        label="Despesa" 
                      />
                    </RadioGroup>
                    {errors.type && (
                      <FormHelperText>{errors.type.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Valor"
                    type="number"
                    inputProps={{ step: '0.01' }}
                    fullWidth
                    margin="normal"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                    }}
                    error={!!errors.amount}
                    helperText={errors.amount?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Data"
                    type="date"
                    fullWidth
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.date}
                    helperText={errors.date?.message}
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
                    margin="normal"
                    error={!!errors.description}
                    helperText={errors.description?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="financeCategoryId"
                control={control}
                render={({ field }) => (
                  <FormControl 
                    fullWidth 
                    margin="normal" 
                    error={!!errors.financeCategoryId}
                  >
                    <InputLabel>Categoria Financeira</InputLabel>
                    <Select
                      {...field}
                      label="Categoria Financeira"
                    >
                      <MenuItem value="">
                        <em>Selecione uma categoria</em>
                      </MenuItem>
                      {filteredCategories.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.financeCategoryId && (
                      <FormHelperText>{errors.financeCategoryId.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="paymentMethodId"
                control={control}
                render={({ field }) => (
                  <FormControl 
                    fullWidth 
                    margin="normal" 
                    error={!!errors.paymentMethodId}
                  >
                    <InputLabel>Método de Pagamento</InputLabel>
                    <Select
                      {...field}
                      label="Método de Pagamento"
                    >
                      <MenuItem value="">
                        <em>Selecione um método</em>
                      </MenuItem>
                      {paymentMethods.map((method) => (
                        <MenuItem key={method.id} value={method.id}>
                          {method.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.paymentMethodId && (
                      <FormHelperText>{errors.paymentMethodId.message}</FormHelperText>
                    )}
                  </FormControl>
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
                    <InputLabel>Cliente (opcional)</InputLabel>
                    <Select
                      {...field}
                      label="Cliente (opcional)"
                    >
                      <MenuItem value="">
                        <em>Selecione um cliente</em>
                      </MenuItem>
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

            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Campos adicionais (opcional)
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="reference"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Referência"
                    fullWidth
                    margin="normal"
                    error={!!errors.reference}
                    helperText={errors.reference?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="referenceType"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Tipo de Referência"
                    fullWidth
                    margin="normal"
                    error={!!errors.referenceType}
                    helperText={errors.referenceType?.message}
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

export default TransactionForm; 