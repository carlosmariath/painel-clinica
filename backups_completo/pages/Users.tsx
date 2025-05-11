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
  Tooltip
} from "@mui/material";
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Add as AddIcon,
  SupervisorAccount as AdminIcon,
} from "@mui/icons-material";
import { getUsers, deleteUser, User } from "../services/userService";
import UserForm from "../components/UserForm";
import { useNotification } from "../components/Notification";
import theme from "../theme";

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
        showNotification("Erro ao carregar usuários", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showNotification]);

  const handleOpenForm = (user?: User) => {
    setSelectedUser(user || null);
    setOpenForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este usuário?")) {
      try {
        await deleteUser(id);
        setUsers(users.filter((user) => user.id !== id));
        showNotification("Usuário excluído com sucesso!", "success");
      } catch {
        showNotification("Erro ao excluir usuário.", "error");
      }
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return { label: 'Administrador', color: 'error' };
      case 'RECEPTIONIST':
        return { label: 'Recepcionista', color: 'info' };
      case 'THERAPIST':
        return { label: 'Terapeuta', color: 'secondary' };
      default:
        return { label: role, color: 'default' };
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
            <AdminIcon fontSize="large" />
          </Avatar>
          <Typography variant="h4" fontWeight={700}>
            Usuários
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
          Novo Usuário
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
                  <TableCell sx={{ fontWeight: 600 }}>E-mail</TableCell>
                  <TableCell sx={{ fontWeight: 600, display: { xs: 'none', md: 'table-cell' } }}>Telefone</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Perfil</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.length === 0 && !loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                      <Typography variant="body1" color="text.secondary">
                        Nenhum usuário administrativo cadastrado
                      </Typography>
                      <Button 
                        variant="outlined" 
                        color="primary"
                        startIcon={<AddIcon />} 
                        onClick={() => handleOpenForm()}
                        sx={{ mt: 2 }}
                      >
                        Cadastrar Usuário
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => {
                    const roleInfo = getRoleLabel(user.role);
                    return (
                      <TableRow key={user.id} hover>
                        <TableCell>
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
                              {user.name?.charAt(0) || 'U'}
                            </Avatar>
                            <Typography variant="body1" fontWeight={500}>
                              {user.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                          {user.phone || "Não informado"}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={roleInfo.label} 
                            size="small" 
                            color={roleInfo.color as any}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Editar">
                            <IconButton 
                              onClick={() => handleOpenForm(user)}
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
                              onClick={() => handleDelete(user.id)}
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
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <UserForm 
        open={openForm} 
        onClose={() => setOpenForm(false)} 
        onSave={() => {
          setOpenForm(false);
          // Recarregar a lista de usuários após salvar
          const fetchData = async () => {
            try {
              const data = await getUsers();
              setUsers(data);
              showNotification("Usuário salvo com sucesso!", "success");
            } catch (err) {
              showNotification("Erro ao atualizar a lista de usuários", "error");
            }
          };
          fetchData();
        }} 
        user={selectedUser} 
      />
    </Box>
  );
};

export default Users; 