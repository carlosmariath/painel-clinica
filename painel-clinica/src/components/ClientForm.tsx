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
  InputAdornment
} from "@mui/material";
import { createClient, updateClient } from "../services/clientsService";
import { useNotification } from "./Notification";
import { Person, Email, Phone } from "@mui/icons-material";

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
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
}

const ClientForm = ({ open, onClose, onSave, client }: ClientFormProps) => {
  const [formData, setFormData] = useState<FormData>({ name: "", email: "", phone: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (client) {
      setFormData({ name: client.name, email: client.email, phone: client.phone || "" });
    } else {
      setFormData({ name: "", email: "", phone: "" });
    }
    setErrors({});
  }, [client]);

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Remove formatação do telefone antes de enviar
      const dataToSend = {
        ...formData,
        phone: formData.phone.replace(/\D/g, "")
      };

      if (client) {
        await updateClient(client.id, dataToSend);
        showNotification("Cliente atualizado com sucesso!", "success");
      } else {
        await createClient(dataToSend);
        showNotification("Cliente criado com sucesso!", "success");
      }
      onSave();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
      
      // Tratamento de erros específicos do backend
      if (error instanceof Error) {
        const axiosError = error as any; // Temporário para acessar response
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
    if (!loading) {
      setFormData({ name: "", email: "", phone: "" });
      setErrors({});
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      fullWidth 
      maxWidth="sm"
      disableEscapeKeyDown={loading}
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
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button 
          onClick={handleClose} 
          color="inherit"
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit} 
          color="primary" 
          variant="contained"
          disabled={loading || !formData.name || !formData.email}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? "Salvando..." : "Salvar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClientForm;