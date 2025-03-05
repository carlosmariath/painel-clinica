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
  Divider,
  LinearProgress,
  Tooltip,
  useMediaQuery
} from "@mui/material";
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Add as AddIcon,
  PersonOutlined as PersonIcon,
  FilterAlt as FilterIcon,
  Search as SearchIcon
} from "@mui/icons-material";
import { getClients, deleteClient } from "../services/clientsService";
import ClientForm from "../components/ClientForm";
import { useNotification } from "../components/Notification";
import theme from "../theme";

const Clients = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const { showNotification } = useNotification();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getClients();
        setClients(data);
      } catch (error) {
        showNotification("Erro ao carregar clientes", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleOpenForm = (client?: any) => {
    setSelectedClient(client || null);
    setOpenForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este cliente?")) {
      try {
        await deleteClient(id);
        setClients(clients.filter((client) => client.id !== id));
        showNotification("Cliente excluído com sucesso!", "success");
      } catch (error) {
        showNotification("Erro ao excluir cliente.", "error");
      }
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
            <PersonIcon fontSize="large" />
          </Avatar>
          <Typography variant="h4" fontWeight={700}>
            Clientes
          </Typography>
        </Box>
        
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
          sx={{ 
            borderRadius: '8px',
            px: 3,
            py: 1,
            boxShadow: theme.shadows[2]
          }}
        >
          Novo Cliente
        </Button>
      </Box>

      {/* Indicador de carregamento */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}

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
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clients.length === 0 && !loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                      <Typography variant="body1" color="text.secondary">
                        Nenhum cliente cadastrado
                      </Typography>
                      <Button 
                        variant="outlined" 
                        startIcon={<AddIcon />} 
                        onClick={() => handleOpenForm()}
                        sx={{ mt: 2 }}
                      >
                        Cadastrar Cliente
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  clients.map((client) => (
                    <TableRow key={client.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            sx={{ 
                              mr: 2, 
                              bgcolor: 
                              theme.palette.primary.light,
                              fontSize: '0.875rem',
                              width: 32,
                              height: 32
                            }}
                          >
                            {client.name?.charAt(0) || 'C'}
                          </Avatar>
                          <Typography variant="body1" fontWeight={500}>
                            {client.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                        {client.phone || "Não informado"}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label="Ativo" 
                          size="small" 
                          sx={{ 
                            bgcolor: theme.palette.success.light,
                            color: theme.palette.success.dark,
                            fontWeight: 500
                          }} 
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Editar">
                          <IconButton 
                            onClick={() => handleOpenForm(client)}
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
                            onClick={() => handleDelete(client.id)}
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
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <ClientForm 
        open={openForm} 
        onClose={() => setOpenForm(false)} 
        onSave={() => {
          setOpenForm(false);
          // Recarregar a lista de clientes após salvar
          const fetchData = async () => {
            try {
              const data = await getClients();
              setClients(data);
              showNotification("Cliente salvo com sucesso!", "success");
            } catch (error) {
              showNotification("Erro ao atualizar a lista de clientes", "error");
            }
          };
          fetchData();
        }} 
        client={selectedClient} 
      />
    </Box>
  );
};

export default Clients;