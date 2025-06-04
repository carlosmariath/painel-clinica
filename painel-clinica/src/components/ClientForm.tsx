import { useEffect, useState } from "react";
import { 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  TextField, 
  Button,
  CircularProgress,
  Box,
  InputAdornment,
  Divider,
  Typography,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  FormHelperText,
  Grid,
  FormControlLabel,
  Switch
} from "@mui/material";
import { createClient, updateClient } from "../services/clientsService";
import { useNotification } from "./Notification";
import { Person, Email, Phone, AttachMoney } from "@mui/icons-material";
import therapyPlanService from "../services/therapyPlanService";
import subscriptionService from "../services/subscriptionService";
import { getBranches } from "../services/branchService";
import { Branch } from "../types/branch";
import { TherapyPlan } from "../types/therapyPlan";

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface ClientFormProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  client?: Client;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  addPlan: boolean; // Novo campo para controlar se adiciona plano ou não
  planId: string;   // ID do plano selecionado
  branchId: string; // ID da filial selecionada
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  planId?: string;
  branchId?: string;
}

const ClientForm = ({ open, onClose, onSave, client }: ClientFormProps) => {
  const [formData, setFormData] = useState<FormData>({ 
    name: "", 
    email: "", 
    phone: "",
    addPlan: false,
    planId: "",
    branchId: ""
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [savingSubscription, setSavingSubscription] = useState(false);
  const [plans, setPlans] = useState<TherapyPlan[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<TherapyPlan | null>(null);
  const { showNotification } = useNotification();

  // Carregar planos e filiais
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingPlans(true);
        const [plansData, branchesData] = await Promise.all([
          therapyPlanService.getPlans({ isActive: true }),
          getBranches()
        ]);
        
        setPlans(plansData);
        setBranches(branchesData);
        
        if (branchesData.length > 0) {
          setFormData(prev => ({ ...prev, branchId: branchesData[0].id }));
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        showNotification("Erro ao carregar planos ou filiais", "error");
      } finally {
        setLoadingPlans(false);
      }
    };

    if (open) {
      fetchData();
    }
  }, [open, showNotification]);

  // Atualizar detalhes do plano selecionado
  useEffect(() => {
    if (formData.planId) {
      const plan = plans.find(p => p.id === formData.planId) || null;
      setSelectedPlan(plan);
    } else {
      setSelectedPlan(null);
    }
  }, [formData.planId, plans]);

  useEffect(() => {
    if (client) {
      setFormData({ 
        name: client.name, 
        email: client.email, 
        phone: client.phone || "",
        addPlan: false,
        planId: "",
        branchId: branches.length > 0 ? branches[0].id : ""
      });
    } else {
      setFormData({ 
        name: "", 
        email: "", 
        phone: "",
        addPlan: false,
        planId: "",
        branchId: branches.length > 0 ? branches[0].id : ""
      });
    }
    setErrors({});
  }, [client, branches]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    // Aceita formato brasileiro: (11) 99999-9999 ou 11999999999
    const phoneRegex = /^(\(\d{2}\)\s?)?(\d{4,5}-?\d{4})$/;
    return phone === "" || phoneRegex.test(phone.replace(/\s/g, ""));
  };

  const formatPhone = (value: string): string => {
    // Remove todos os caracteres não numéricos
    const numbers = value.replace(/\D/g, "");
    
    // Aplica a máscara brasileira
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else if (numbers.length <= 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Aplica formatação para telefone
    if (name === "phone") {
      const formattedValue = formatPhone(value);
      setFormData({ ...formData, [name]: formattedValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    // Limpa o erro do campo quando o usuário começa a digitar
    if (errors[name as keyof FormErrors]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const name = e.target.name as keyof FormData;
    const value = e.target.value as string;
    
    setFormData({ ...formData, [name]: value });
    
    // Limpa o erro do campo quando o usuário seleciona algo
    if (errors[name as keyof FormErrors]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, addPlan: e.target.checked });
    
    // Se desativou a opção de adicionar plano, limpar erros relacionados
    if (!e.target.checked) {
      setErrors({ 
        ...errors, 
        planId: undefined,
        branchId: undefined
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validação do nome
    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Nome deve ter pelo menos 3 caracteres";
    }

    // Validação do email
    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Email inválido";
    }

    // Validação do telefone (opcional mas se preenchido deve ser válido)
    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = "Telefone inválido. Use o formato (11) 99999-9999";
    }

    // Validação do plano (se a opção de adicionar plano estiver ativada)
    if (formData.addPlan) {
      if (!formData.planId) {
        newErrors.planId = "Selecione um plano";
      }
      
      if (!formData.branchId) {
        newErrors.branchId = "Selecione uma filial";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Prepara apenas os dados do cliente para enviar
      const clientData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone.replace(/\D/g, "") // Remove formatação do telefone
      };

      let clientId = '';
      
      if (client) {
        const updatedClient = await updateClient(client.id, clientData);
        clientId = updatedClient.id;
        showNotification("Cliente atualizado com sucesso!", "success");
      } else {
        const newClient = await createClient(clientData);
        clientId = newClient.id;
        showNotification("Cliente criado com sucesso!", "success");
      }
      
      // Se a opção de adicionar plano estiver ativada, criar a assinatura
      if (formData.addPlan && formData.planId && clientId) {
        try {
          setSavingSubscription(true);
          
          await subscriptionService.createSubscription({
            clientId,
            planId: formData.planId,
            branchId: formData.branchId
          });
          
          showNotification("Plano associado ao cliente com sucesso!", "success");
        } catch (subscriptionError) {
          console.error("Erro ao associar plano:", subscriptionError);
          showNotification("Erro ao associar plano ao cliente", "error");
        } finally {
          setSavingSubscription(false);
        }
      }
      
      onSave();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
      
      // Tratamento de erros específicos do backend
      if (error instanceof Error) {
        const axiosError = error as { 
          response?: { 
            status?: number; 
            data?: { 
              message?: string 
            } 
          } 
        };
        
        if (axiosError.response?.status === 409) {
          showNotification("Email já cadastrado", "error");
          setErrors({ email: "Este email já está em uso" });
        } else if (axiosError.response?.data?.message) {
          showNotification(axiosError.response.data.message, "error");
        } else {
          showNotification("Erro ao salvar cliente", "error");
        }
      } else {
        showNotification("Erro ao salvar cliente", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading && !savingSubscription) {
      setFormData({ 
        name: "", 
        email: "", 
        phone: "",
        addPlan: false,
        planId: "",
        branchId: ""
      });
      setErrors({});
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      fullWidth 
      maxWidth="md"
      disableEscapeKeyDown={loading || savingSubscription}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Person color="primary" />
          {client ? "Editar Cliente" : "Novo Cliente"}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField 
            fullWidth 
            margin="normal" 
            label="Nome completo" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            error={!!errors.name}
            helperText={errors.name}
            disabled={loading}
            required
            inputProps={{ maxLength: 100 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          
          <TextField 
            fullWidth 
            margin="normal" 
            label="E-mail" 
            name="email" 
            type="email" 
            value={formData.email} 
            onChange={handleChange} 
            error={!!errors.email}
            helperText={errors.email}
            disabled={loading}
            required
            inputProps={{ maxLength: 100 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          
          <TextField 
            fullWidth 
            margin="normal" 
            label="Telefone" 
            name="phone" 
            value={formData.phone} 
            onChange={handleChange}
            error={!!errors.phone}
            helperText={errors.phone || "Formato: (11) 99999-9999"}
            disabled={loading}
            placeholder="(11) 99999-9999"
            inputProps={{ maxLength: 15 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Phone fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          
          <Box sx={{ mt: 3, mb: 1 }}>
            <Divider />
          </Box>
          
          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.addPlan}
                  onChange={handleSwitchChange}
                  name="addPlan"
                  color="primary"
                  disabled={loading || loadingPlans}
                />
              }
              label={
                <Typography variant="subtitle1" color="primary">
                  Adicionar Plano de Terapia
                </Typography>
              }
            />
            
            {formData.addPlan && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth error={!!errors.planId}>
                      <InputLabel>Plano de Terapia</InputLabel>
                      <Select
                        name="planId"
                        value={formData.planId}
                        onChange={handleSelectChange}
                        label="Plano de Terapia"
                        disabled={loading || loadingPlans}
                        startAdornment={
                          <InputAdornment position="start">
                            <AttachMoney />
                          </InputAdornment>
                        }
                      >
                        <MenuItem value="" disabled>
                          <em>Selecione um plano</em>
                        </MenuItem>
                        {plans.map(plan => (
                          <MenuItem key={plan.id} value={plan.id}>
                            {plan.name} - {plan.totalSessions} sessões
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.planId && <FormHelperText>{errors.planId}</FormHelperText>}
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth error={!!errors.branchId}>
                      <InputLabel>Filial</InputLabel>
                      <Select
                        name="branchId"
                        value={formData.branchId}
                        onChange={handleSelectChange}
                        label="Filial"
                        disabled={loading || loadingPlans}
                      >
                        <MenuItem value="" disabled>
                          <em>Selecione uma filial</em>
                        </MenuItem>
                        {branches.map(branch => (
                          <MenuItem key={branch.id} value={branch.id}>
                            {branch.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.branchId && <FormHelperText>{errors.branchId}</FormHelperText>}
                    </FormControl>
                  </Grid>
                </Grid>
                
                {selectedPlan && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Detalhes do Plano
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Nome: <Typography component="span" fontWeight="medium">{selectedPlan.name}</Typography>
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Preço: <Typography component="span" fontWeight="medium">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedPlan.totalPrice)}
                          </Typography>
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Sessões: <Typography component="span" fontWeight="medium">{selectedPlan.totalSessions}</Typography>
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Validade: <Typography component="span" fontWeight="medium">{selectedPlan.validityDays} dias</Typography>
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={handleClose} 
          color="inherit"
          disabled={loading || savingSubscription}
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={loading || savingSubscription}
          startIcon={loading || savingSubscription ? <CircularProgress size={20} /> : null}
        >
          {loading || savingSubscription ? 'Salvando...' : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClientForm;