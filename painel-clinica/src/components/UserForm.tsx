import { useEffect, useState } from "react";
import { 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  TextField, 
  Button, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Divider,
  FormHelperText,
  SelectChangeEvent
} from "@mui/material";
import { createUser, updateUser, User } from "../services/userService";
import { getBranches } from "../services/branchService";
import { Branch } from "../types/branch";

interface UserFormProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  user?: User | null;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  branchId: string;
}

const UserForm = ({ open, onClose, onSave, user }: UserFormProps) => {
  const [formData, setFormData] = useState<FormData>({ 
    name: "", 
    email: "", 
    phone: "",
    password: "",
    role: "ADMIN",
    branchId: ""
  });
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(!user); // Mostrar campo de senha apenas em novos usuários

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const data = await getBranches();
        setBranches(data);
      } catch (error) {
        console.error("Erro ao buscar filiais:", error);
      }
    };
    
    fetchBranches();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({ 
        name: user.name || "", 
        email: user.email || "", 
        phone: user.phone || "",
        password: "",
        role: user.role || "ADMIN",
        branchId: user.branchId || ""
      });
    } else {
      setFormData({ 
        name: "", 
        email: "", 
        phone: "",
        password: "",
        role: "ADMIN",
        branchId: ""
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name as string]: value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (user) {
        // Remover campos vazios para não sobrescrever no update
        if (!formData.password) {
          // Criar um objeto sem a propriedade password
          const { name, email, phone, role, branchId } = formData;
          await updateUser(user.id, { name, email, phone, role, branchId });
        } else {
          await updateUser(user.id, formData);
        }
      } else {
        await createUser(formData);
      }
      
      onSave();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar usuário:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{user ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
      <DialogContent>
        <Box sx={{ my: 2 }}>
          <Typography variant="subtitle1" fontWeight={500} gutterBottom>
            Informações Básicas
          </Typography>
          <TextField 
            fullWidth 
            margin="normal" 
            label="Nome" 
            name="name" 
            value={formData.name} 
            onChange={handleInputChange} 
            required 
          />
          <TextField 
            fullWidth 
            margin="normal" 
            label="E-mail" 
            name="email" 
            type="email" 
            value={formData.email} 
            onChange={handleInputChange} 
            required 
          />
          <TextField 
            fullWidth 
            margin="normal" 
            label="Telefone" 
            name="phone" 
            value={formData.phone} 
            onChange={handleInputChange} 
            required
          />
          
          {/* Campo de senha (visível apenas em novos cadastros ou se showPassword=true) */}
          {(!user || showPassword) && (
            <TextField 
              fullWidth 
              margin="normal" 
              label="Senha" 
              name="password" 
              type="password" 
              value={formData.password} 
              onChange={handleInputChange} 
              required={!user}
              helperText={user ? "Deixe em branco para manter a senha atual" : ""}
            />
          )}
          
          {user && !showPassword && (
            <Button 
              variant="text" 
              color="primary"
              onClick={() => setShowPassword(true)}
              sx={{ mt: 1 }}
            >
              Alterar senha
            </Button>
          )}
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ my: 2 }}>
          <Typography variant="subtitle1" fontWeight={500} gutterBottom>
            Perfil e Acesso
          </Typography>
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="role-label">Tipo de Usuário</InputLabel>
            <Select
              labelId="role-label"
              name="role"
              value={formData.role}
              label="Tipo de Usuário"
              onChange={handleSelectChange}
            >
              <MenuItem value="ADMIN">Administrador</MenuItem>
              <MenuItem value="RECEPTIONIST">Recepcionista</MenuItem>
            </Select>
            <FormHelperText>Selecione o tipo de acesso deste usuário</FormHelperText>
          </FormControl>
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="branch-label">Filial</InputLabel>
            <Select
              labelId="branch-label"
              name="branchId"
              value={formData.branchId}
              label="Filial"
              onChange={handleSelectChange}
            >
              <MenuItem value="">
                <em>Sem filial específica</em>
              </MenuItem>
              {branches.map((branch) => (
                <MenuItem key={branch.id} value={branch.id}>
                  {branch.name}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>A filial principal deste usuário (opcional)</FormHelperText>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Cancelar</Button>
        <Button 
          onClick={handleSubmit} 
          color="primary" 
          variant="contained"
          disabled={loading || !formData.name || !formData.email || !formData.phone || (!user && !formData.password)}
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserForm; 