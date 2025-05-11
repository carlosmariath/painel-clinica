import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  Button, 
  TextField,
  Box,
  Typography,
  Divider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Chip,
  Paper,
  Grid
} from "@mui/material";
import { Role, Permission, getPermissions } from "../services/roleService";

interface RoleFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (role: Role) => void;
  role?: Role | null;
}

interface FormData {
  name: string;
  code: string;
  description: string;
  permissions: Permission[];
}

const RoleForm = ({ open, onClose, onSave, role }: RoleFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    code: "",
    description: "",
    permissions: []
  });
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Carregar todas as permissões disponíveis
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const permissions = await getPermissions();
        setAllPermissions(permissions);
      } catch (error) {
        console.error("Erro ao buscar permissões:", error);
      }
    };
    
    fetchPermissions();
  }, []);
  
  // Inicializar dados do formulário com os dados do perfil (se em modo de edição)
  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name || "",
        code: role.code || "",
        description: role.description || "",
        permissions: role.permissions || []
      });
    } else {
      setFormData({
        name: "",
        code: "",
        description: "",
        permissions: []
      });
    }
  }, [role]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  // Lidar com seleção de permissões
  const handlePermissionToggle = (permission: Permission) => {
    const currentPermissions = [...formData.permissions];
    const permissionIndex = currentPermissions.findIndex(p => p.id === permission.id);
    
    if (permissionIndex === -1) {
      // Adicionar permissão
      currentPermissions.push(permission);
    } else {
      // Remover permissão
      currentPermissions.splice(permissionIndex, 1);
    }
    
    setFormData({ ...formData, permissions: currentPermissions });
  };
  
  // Verificar se uma permissão está selecionada
  const isPermissionSelected = (permissionId: string) => {
    return formData.permissions.some(p => p.id === permissionId);
  };
  
  // Agrupar permissões por recurso para exibição
  const getPermissionsByResource = () => {
    const groupedPermissions: Record<string, Permission[]> = {};
    
    allPermissions.forEach(permission => {
      if (!groupedPermissions[permission.resource]) {
        groupedPermissions[permission.resource] = [];
      }
      groupedPermissions[permission.resource].push(permission);
    });
    
    return groupedPermissions;
  };
  
  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Criar objeto de perfil para salvar
      const roleToSave: Role = {
        id: role?.id || Math.random().toString(36).substr(2, 9), // ID temporário se for novo
        name: formData.name,
        code: formData.code,
        description: formData.description,
        permissions: formData.permissions
      };
      
      onSave(roleToSave);
      onClose();
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const permissionsByResource = getPermissionsByResource();
  
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{role ? "Editar Perfil" : "Novo Perfil"}</DialogTitle>
      <DialogContent>
        <Box sx={{ my: 2 }}>
          <Typography variant="subtitle1" fontWeight={500} gutterBottom>
            Informações Básicas
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField 
                fullWidth 
                margin="normal" 
                label="Nome do Perfil" 
                name="name" 
                value={formData.name} 
                onChange={handleInputChange} 
                required 
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField 
                fullWidth 
                margin="normal" 
                label="Código" 
                name="code" 
                value={formData.code} 
                onChange={handleInputChange} 
                required 
                helperText="Identificador único do perfil (ex: ADMIN, MANAGER)"
              />
            </Grid>
          </Grid>
          <TextField 
            fullWidth 
            margin="normal" 
            label="Descrição" 
            name="description" 
            value={formData.description} 
            onChange={handleInputChange} 
            multiline
            rows={2}
          />
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ my: 2 }}>
          <Typography variant="subtitle1" fontWeight={500} gutterBottom>
            Permissões
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Selecione as permissões que este perfil terá acesso:
          </Typography>
          
          <Box sx={{ mt: 2 }}>
            {Object.entries(permissionsByResource).map(([resource, permissions]) => (
              <Paper key={resource} elevation={0} sx={{ mb: 2, p: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" gutterBottom sx={{ textTransform: 'capitalize' }}>
                  {resource}
                </Typography>
                <FormGroup>
                  <Grid container spacing={1}>
                    {permissions.map((permission) => (
                      <Grid item xs={12} md={6} key={permission.id}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={isPermissionSelected(permission.id)}
                              onChange={() => handlePermissionToggle(permission)}
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body2">{permission.name}</Typography>
                              <Typography variant="caption" color="text.secondary">{permission.description}</Typography>
                            </Box>
                          }
                        />
                      </Grid>
                    ))}
                  </Grid>
                </FormGroup>
              </Paper>
            ))}
          </Box>
        </Box>
        
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Permissões selecionadas: {formData.permissions.length}
          </Typography>
          <Paper variant="outlined" sx={{ p: 1, mt: 1 }}>
            {formData.permissions.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ p: 1 }}>
                Nenhuma permissão selecionada
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {formData.permissions.map((permission) => (
                  <Chip
                    key={permission.id}
                    label={permission.name}
                    size="small"
                    onDelete={() => handlePermissionToggle(permission)}
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Box>
            )}
          </Paper>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Cancelar</Button>
        <Button 
          onClick={handleSubmit} 
          color="primary" 
          variant="contained"
          disabled={loading || !formData.name || !formData.code}
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoleForm; 