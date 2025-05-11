import { useEffect, useState } from "react";
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  IconButton, 
  Button,
  Card,
  CardContent,
  Chip,
  Avatar,
  LinearProgress,
  Tooltip,
  Collapse
} from "@mui/material";
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Add as AddIcon,
  Security as SecurityIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from "@mui/icons-material";
import { getRoles, Role } from "../services/roleService";
import RoleForm from "../components/RoleForm";
import { useNotification } from "../components/Notification";
import theme from "../theme";

const Roles = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [expandedRole, setExpandedRole] = useState<string | null>(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getRoles();
        setRoles(data);
      } catch (error) {
        console.error("Erro ao buscar perfis:", error);
        showNotification("Erro ao carregar perfis", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showNotification]);

  const handleOpenForm = (role?: Role) => {
    setSelectedRole(role || null);
    setOpenForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este perfil?")) {
      try {
        // Na versão inicial, removeremos o perfil somente do estado local
        // Em uma implementação completa, chamaríamos um endpoint de API
        setRoles(roles.filter((role) => role.id !== id));
        showNotification("Perfil excluído com sucesso!", "success");
      } catch {
        showNotification("Erro ao excluir perfil.", "error");
      }
    }
  };

  const handleSaveRole = (updatedRole: Role) => {
    // Verificar se é uma atualização ou um novo perfil
    if (selectedRole) {
      // Atualizar perfil existente
      setRoles(roles.map(role => 
        role.id === updatedRole.id ? updatedRole : role
      ));
      showNotification("Perfil atualizado com sucesso!", "success");
    } else {
      // Adicionar novo perfil
      setRoles([...roles, updatedRole]);
      showNotification("Perfil criado com sucesso!", "success");
    }
  };

  const toggleRoleExpansion = (roleId: string) => {
    if (expandedRole === roleId) {
      setExpandedRole(null);
    } else {
      setExpandedRole(roleId);
    }
  };

  return (
    <Box>
      {/* Cabeçalho da página */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          mb: 4 
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 0 } }}>
          <Avatar 
            sx={{ 
              mr: 2, 
              bgcolor: theme.palette.primary.light,
              color: theme.palette.primary.main,
              width: 48,
              height: 48
            }}
          >
            <SecurityIcon fontSize="large" />
          </Avatar>
          <Typography variant="h4" fontWeight={700}>
            Perfis de Acesso
          </Typography>
        </Box>
        
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
          sx={{ 
            borderRadius: '8px',
            px: 3,
            py: 1,
            boxShadow: theme.shadows[2]
          }}
        >
          Novo Perfil
        </Button>
      </Box>

      {/* Indicador de carregamento */}
      {loading && <LinearProgress sx={{ mb: 2 }} color="primary" />}

      {/* Tabela responsiva */}
      <Card
        elevation={2}
        sx={{
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <TableContainer 
            component={Paper} 
            elevation={0} 
            sx={{ 
              borderRadius: 0,
              height: '100%',
              minHeight: '50vh'
            }}
          >
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                  <TableCell sx={{ fontWeight: 600 }}>Nome</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Código</TableCell>
                  <TableCell sx={{ fontWeight: 600, display: { xs: 'none', md: 'table-cell' } }}>Descrição</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Permissões</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roles.length === 0 && !loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                      <Typography variant="body1" color="text.secondary">
                        Nenhum perfil de acesso encontrado
                      </Typography>
                      <Button 
                        variant="outlined" 
                        color="primary"
                        startIcon={<AddIcon />} 
                        onClick={() => handleOpenForm()}
                        sx={{ mt: 2 }}
                      >
                        Criar Perfil
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  roles.map((role) => (
                    <>
                      <TableRow 
                        key={role.id} 
                        hover
                        sx={{
                          cursor: 'pointer', 
                          '&:hover': { 
                            bgcolor: expandedRole === role.id ? 
                              theme.palette.primary.light + '15' : undefined 
                          },
                          bgcolor: expandedRole === role.id ? 
                            theme.palette.primary.light + '10' : undefined
                        }}
                      >
                        <TableCell onClick={() => toggleRoleExpansion(role.id)}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar 
                              sx={{ 
                                mr: 2, 
                                bgcolor: theme.palette.primary.light,
                                fontSize: '0.875rem',
                                width: 32,
                                height: 32
                              }}
                            >
                              {role.name?.charAt(0) || 'R'}
                            </Avatar>
                            <Typography variant="body1" fontWeight={500}>
                              {role.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell onClick={() => toggleRoleExpansion(role.id)}>
                          <Chip 
                            label={role.code} 
                            size="small" 
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell 
                          sx={{ display: { xs: 'none', md: 'table-cell' } }}
                          onClick={() => toggleRoleExpansion(role.id)}
                        >
                          {role.description || "Sem descrição"}
                        </TableCell>
                        <TableCell onClick={() => toggleRoleExpansion(role.id)}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Chip 
                              label={`${role.permissions.length} permissões`} 
                              size="small" 
                              color="secondary"
                              variant="outlined"
                            />
                            {expandedRole === role.id ? 
                              <ExpandLessIcon fontSize="small" sx={{ ml: 1 }} /> :
                              <ExpandMoreIcon fontSize="small" sx={{ ml: 1 }} />
                            }
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Editar">
                            <IconButton 
                              onClick={() => handleOpenForm(role)}
                              size="small"
                              sx={{ 
                                color: theme.palette.primary.main,
                                bgcolor: theme.palette.primary.light + '20',
                                mr: 1,
                                '&:hover': { bgcolor: theme.palette.primary.light + '40' }
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Excluir">
                            <IconButton 
                              onClick={() => handleDelete(role.id)}
                              size="small"
                              sx={{ 
                                color: theme.palette.error.main,
                                bgcolor: theme.palette.error.light + '20',
                                '&:hover': { bgcolor: theme.palette.error.light + '40' }
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell 
                          colSpan={5} 
                          sx={{ 
                            py: 0,
                            borderBottom: expandedRole === role.id ? '1px solid' : 'none',
                            borderBottomColor: 'divider'
                          }}
                        >
                          <Collapse in={expandedRole === role.id} timeout="auto" unmountOnExit>
                            <Box sx={{ p: 3 }}>
                              <Typography variant="subtitle2" gutterBottom>
                                Permissões ({role.permissions.length})
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                                {role.permissions.map((permission) => (
                                  <Chip
                                    key={permission.id}
                                    label={permission.name}
                                    size="small"
                                    sx={{ m: 0.5 }}
                                  />
                                ))}
                                {role.permissions.length === 0 && (
                                  <Typography variant="body2" color="text.secondary">
                                    Este perfil não possui permissões.
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <RoleForm 
        open={openForm} 
        onClose={() => setOpenForm(false)} 
        onSave={handleSaveRole} 
        role={selectedRole} 
      />
    </Box>
  );
};

export default Roles; 