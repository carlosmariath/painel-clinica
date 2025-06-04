import { useEffect, useState, useCallback, useMemo, memo } from "react";
import { 
  Box, 
  Typography, 
  Paper, 
  IconButton, 
  Button,
  Card,
  CardContent,
  Chip,
  Avatar,
  LinearProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Collapse,
  Stack,
  Divider,
  Tab,
  Tabs,
  Badge,
  TextField,
  InputAdornment,
  Menu,
  MenuItem
} from "@mui/material";
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Add as AddIcon,
  PersonOutlined as PersonIcon,
  CardMembership as PlanIcon,
  Info as InfoIcon,
  Cancel as CancelIcon,
  ExpandMore as ExpandMoreIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  CalendarMonth as CalendarIcon,
  AccountBalance as AccountBalanceIcon
} from "@mui/icons-material";
import { getClients, deleteClient } from "../services/clientsService";
import ClientForm from "../components/ClientForm";
import { useNotification } from "../components/Notification";
import theme from "../theme";
import subscriptionService, { Subscription } from "../services/subscriptionService";
import SubscriptionForm from "../components/SubscriptionForm";

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subscriptions?: Subscription[];
}

const Clients = memo(() => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false);
  const [subscriptions, setSubscriptions] = useState<{[clientId: string]: Subscription[]}>({});
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [openSubscriptionDialog, setOpenSubscriptionDialog] = useState(false);
  const [expandedClients, setExpandedClients] = useState<{[clientId: string]: boolean}>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const [openNewSubscription, setOpenNewSubscription] = useState(false);
  const [selectedClientForSubscription, setSelectedClientForSubscription] = useState<Client | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { showNotification } = useNotification();

  // Debounce para a busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getClients();
        setClients(data);
        
        // Recarregar assinaturas
        setLoadingSubscriptions(true);
        const subscriptionsByClient: {[clientId: string]: Subscription[]} = {};
        
        await Promise.all(data.map(async (client) => {
          try {
            const clientSubscriptions = await subscriptionService.getSubscriptions(client.id);
            
            // Log de debug para verificar as assinaturas carregadas
            if (client.name.toLowerCase().includes('carlos')) {
              console.log(`[DEBUG] Cliente: ${client.name} (ID: ${client.id})`);
              console.log(`[DEBUG] Assinaturas encontradas:`, clientSubscriptions);
              console.log(`[DEBUG] Status das assinaturas:`, clientSubscriptions.map(sub => ({
                id: sub.id,
                status: sub.status,
                planName: sub.therapyPlan?.name,
                startDate: sub.startDate,
                endDate: sub.endDate
              })));
            }
            
            if (clientSubscriptions.length > 0) {
              subscriptionsByClient[client.id] = clientSubscriptions;
            }
          } catch (subscriptionError) {
            console.error(`Erro ao carregar assinaturas para o cliente ${client.id}:`, subscriptionError);
          }
        }));
        
        console.log('[DEBUG] Todas as assinaturas carregadas:', subscriptionsByClient);
        
        setSubscriptions(subscriptionsByClient);
      } catch (clientError) {
        console.error("Erro ao recarregar clientes:", clientError);
        showNotification("Erro ao recarregar clientes", "error");
      } finally {
        setLoading(false);
        setLoadingSubscriptions(false);
      }
    };

    fetchData();
  }, [showNotification]);

  const handleOpenForm = useCallback((client?: Client) => {
    setSelectedClient(client || null);
    setOpenForm(true);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este cliente?")) {
      try {
        await deleteClient(id);
        setClients(clients.filter((client) => client.id !== id));
        showNotification("Cliente excluído com sucesso!", "success");
      } catch {
        showNotification("Erro ao excluir cliente.", "error");
      }
    }
  }, [clients, showNotification]);

  const handleViewSubscription = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setOpenSubscriptionDialog(true);
  };

  const handleDeleteSubscription = async (subscription: Subscription) => {
    if (window.confirm("Tem certeza que deseja excluir esta assinatura?")) {
      try {
        await subscriptionService.deleteSubscription(subscription.id);
        showNotification("Assinatura excluída com sucesso!", "success");
        // Recarregar dados
        window.location.reload();
      } catch {
        showNotification("Erro ao excluir assinatura.", "error");
      }
    }
  };

  const handleCancelSubscription = async (subscription: Subscription) => {
    if (window.confirm("Tem certeza que deseja cancelar esta assinatura?")) {
      try {
        await subscriptionService.cancelSubscription(subscription.id);
        showNotification("Assinatura cancelada com sucesso!", "success");
        // Recarregar dados
        window.location.reload();
      } catch {
        showNotification("Erro ao cancelar assinatura.", "error");
      }
    }
  };

  const handleExpandClient = useCallback((clientId: string) => {
    setExpandedClients(prev => ({
      ...prev,
      [clientId]: !prev[clientId]
    }));
  }, []);

  const handleAddSubscription = (client: Client) => {
    setSelectedClientForSubscription(client);
    setOpenNewSubscription(true);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, subscription: Subscription) => {
    setAnchorEl(event.currentTarget);
    setSelectedSubscription(subscription);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Obtém o status do cliente com base em suas assinaturas
  const getClientStatus = (clientId: string) => {
    if (!subscriptions[clientId] || subscriptions[clientId].length === 0) {
      return { label: "Sem plano", color: "default" };
    }
    
    // Verifica se há alguma assinatura ativa
    if (subscriptions[clientId].some(sub => sub.status === 'ACTIVE')) {
      return { label: "Ativo", color: "success" };
    }
    
    // Verifica os outros status em ordem de prioridade
    if (subscriptions[clientId].some(sub => sub.status === 'PENDING')) {
      return { label: "Pendente", color: "warning" };
    }
    
    if (subscriptions[clientId].some(sub => sub.status === 'EXPIRED')) {
      return { label: "Expirado", color: "error" };
    }
    
    return { label: "Inativo", color: "default" };
  };

  // Formatar data para exibição
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Memoizar cálculos pesados
  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const matchesSearch = client.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                           client.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      
      if (tabValue === 0) return matchesSearch; // Todos
      if (tabValue === 1) return matchesSearch && getClientStatus(client.id).label === "Ativo";
      if (tabValue === 2) return matchesSearch && getClientStatus(client.id).label === "Sem plano";
      if (tabValue === 3) return matchesSearch && ["Expirado", "Cancelado", "Inativo"].includes(getClientStatus(client.id).label);
      
      return matchesSearch;
    });
  }, [clients, debouncedSearchTerm, tabValue, subscriptions]);

  const counters = useMemo(() => {
    const activeCount = clients.filter(c => getClientStatus(c.id).label === "Ativo").length;
    const withoutPlanCount = clients.filter(c => getClientStatus(c.id).label === "Sem plano").length;
    const inactiveCount = clients.filter(c => ["Expirado", "Cancelado", "Inativo"].includes(getClientStatus(c.id).label)).length;
    
    return { activeCount, withoutPlanCount, inactiveCount };
  }, [clients, subscriptions]);

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

      {/* Barra de busca */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Buscar por nome ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ 
            backgroundColor: 'white',
            borderRadius: 1,
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: theme.palette.divider,
              },
            },
          }}
        />
      </Box>

      {/* Tabs de filtro */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={(_, newValue) => setTabValue(newValue)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab 
            label={
              <Badge badgeContent={clients.length} color="default">
                Todos
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={counters.activeCount} color="success">
                Ativos
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={counters.withoutPlanCount} color="warning">
                Sem Plano
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={counters.inactiveCount} color="error">
                Inativos
              </Badge>
            } 
          />
        </Tabs>
      </Paper>

      {/* Indicador de carregamento */}
      {(loading || loadingSubscriptions) && <LinearProgress sx={{ mb: 2 }} />}

      {/* Lista de clientes */}
      {filteredClients.length === 0 && !loading ? (
        <Card>
          <CardContent>
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Nenhum cliente encontrado
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                {searchTerm ? "Tente buscar com outros termos" : "Cadastre seu primeiro cliente"}
              </Typography>
              {!searchTerm && (
                <Button 
                  variant="outlined" 
                  startIcon={<AddIcon />} 
                  onClick={() => handleOpenForm()}
                >
                  Cadastrar Cliente
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2}>
          {filteredClients.map((client) => {
            const clientStatus = getClientStatus(client.id);
            const clientSubscriptions = subscriptions[client.id] || [];
            const isExpanded = expandedClients[client.id] || false;
            
            return (
              <Card key={client.id} elevation={2}>
                <CardContent>
                  {/* Cabeçalho do card */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                      <Avatar 
                        sx={{ 
                          mr: 2, 
                          bgcolor: clientStatus.color === "success" ? theme.palette.success.light :
                                  clientStatus.color === "warning" ? theme.palette.warning.light :
                                  clientStatus.color === "error" ? theme.palette.error.light :
                                  theme.palette.grey[300],
                          color: clientStatus.color === "success" ? theme.palette.success.dark :
                                clientStatus.color === "warning" ? theme.palette.warning.dark :
                                clientStatus.color === "error" ? theme.palette.error.dark :
                                theme.palette.grey[700],
                          width: 56,
                          height: 56
                        }}
                      >
                        {client.name?.charAt(0) || 'C'}
                      </Avatar>
                      
                      <Box flex={1}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="h6" fontWeight={600}>
                            {client.name}
                          </Typography>
                          <Chip 
                            label={clientStatus.label} 
                            size="small" 
                            sx={{ 
                              bgcolor: clientStatus.color === "success" ? theme.palette.success.light :
                                      clientStatus.color === "warning" ? theme.palette.warning.light :
                                      clientStatus.color === "error" ? theme.palette.error.light :
                                      theme.palette.grey[200],
                              color: clientStatus.color === "success" ? theme.palette.success.dark :
                                    clientStatus.color === "warning" ? theme.palette.warning.dark :
                                    clientStatus.color === "error" ? theme.palette.error.dark :
                                    theme.palette.grey[700],
                              fontWeight: 500
                            }} 
                          />
                        </Box>
                        
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <EmailIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {client.email}
                            </Typography>
                          </Box>
                          {client.phone && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <PhoneIcon fontSize="small" color="action" />
                              <Typography variant="body2" color="text.secondary">
                                {client.phone}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Tooltip title="Editar cliente">
                        <IconButton onClick={() => handleOpenForm(client)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir cliente">
                        <IconButton onClick={() => handleDelete(client.id)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                      <IconButton 
                        onClick={() => handleExpandClient(client.id)}
                        sx={{ 
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.3s'
                        }}
                      >
                        <ExpandMoreIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  {/* Seção expansível com assinaturas */}
                  <Collapse in={isExpanded}>
                    <Divider sx={{ my: 2 }} />
                    
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          Assinaturas ({clientSubscriptions.length})
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<AddIcon />}
                          onClick={() => handleAddSubscription(client)}
                        >
                          Nova Assinatura
                        </Button>
                      </Box>
                      
                      {clientSubscriptions.length === 0 ? (
                        <Box sx={{ 
                          textAlign: 'center', 
                          py: 3, 
                          bgcolor: theme.palette.grey[50],
                          borderRadius: 1
                        }}>
                          <Typography variant="body2" color="text.secondary">
                            Nenhuma assinatura encontrada
                          </Typography>
                        </Box>
                      ) : (
                        <Grid container spacing={2}>
                          {clientSubscriptions.map((subscription) => (
                            <Grid item xs={12} md={6} key={subscription.id}>
                              <Card variant="outlined">
                                <CardContent>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box flex={1}>
                                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                        {subscription.therapyPlan?.name || "Plano"}
                                      </Typography>
                                      
                                      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                        <Chip 
                                          label={
                                            subscription.status === 'ACTIVE' ? 'Ativo' :
                                            subscription.status === 'EXPIRED' ? 'Expirado' :
                                            subscription.status === 'CANCELED' ? 'Cancelado' : 'Pendente'
                                          }
                                          size="small"
                                          color={subscription.status === 'ACTIVE' ? 'success' : 'default'}
                                        />
                                        <Chip 
                                          label={`${subscription.remainingSessions}/${subscription.totalSessions} sessões`}
                                          size="small"
                                          variant="outlined"
                                        />
                                      </Box>
                                      
                                      <Stack spacing={0.5}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                          <CalendarIcon fontSize="small" color="action" />
                                          <Typography variant="caption" color="text.secondary">
                                            {formatDate(subscription.startDate)} - {formatDate(subscription.endDate)}
                                          </Typography>
                                        </Box>
                                        {subscription.therapyPlan && (
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <AccountBalanceIcon fontSize="small" color="action" />
                                            <Typography variant="caption" color="text.secondary">
                                              {new Intl.NumberFormat('pt-BR', { 
                                                style: 'currency', 
                                                currency: 'BRL' 
                                              }).format(subscription.therapyPlan.totalPrice)}
                                            </Typography>
                                          </Box>
                                        )}
                                      </Stack>
                                    </Box>
                                    
                                    <IconButton 
                                      size="small"
                                      onClick={(e) => handleMenuClick(e, subscription)}
                                    >
                                      <MoreVertIcon />
                                    </IconButton>
                                  </Box>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      )}
                    </Box>
                  </Collapse>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}

      {/* Menu de ações da assinatura */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          handleMenuClose();
          if (selectedSubscription) handleViewSubscription(selectedSubscription);
        }}>
          <InfoIcon fontSize="small" sx={{ mr: 1 }} />
          Ver Detalhes
        </MenuItem>
        {selectedSubscription?.status === 'ACTIVE' && (
          <MenuItem onClick={() => {
            handleMenuClose();
            if (selectedSubscription) handleCancelSubscription(selectedSubscription);
          }}>
            <CancelIcon fontSize="small" sx={{ mr: 1 }} />
            Cancelar Assinatura
          </MenuItem>
        )}
        <MenuItem onClick={() => {
          handleMenuClose();
          if (selectedSubscription) handleDeleteSubscription(selectedSubscription);
        }} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Excluir Assinatura
        </MenuItem>
      </Menu>

      <ClientForm 
        open={openForm} 
        onClose={() => setOpenForm(false)} 
        onSave={() => {
          setOpenForm(false);
          window.location.reload();
        }} 
        client={selectedClient || undefined}
      />

      {/* Formulário de nova assinatura */}
      {selectedClientForSubscription && (
        <SubscriptionForm
          open={openNewSubscription}
          onClose={() => {
            setOpenNewSubscription(false);
            setSelectedClientForSubscription(null);
          }}
          onSubmit={async (data) => {
            try {
              await subscriptionService.createSubscription({
                ...data,
                clientId: selectedClientForSubscription.id
              });
              showNotification("Assinatura criada com sucesso!", "success");
              setOpenNewSubscription(false);
              setSelectedClientForSubscription(null);
              window.location.reload();
            } catch {
              showNotification("Erro ao criar assinatura", "error");
            }
          }}
          clients={[selectedClientForSubscription]}
          title={`Nova Assinatura para ${selectedClientForSubscription.name}`}
        />
      )}

      {/* Diálogo para exibir detalhes da assinatura */}
      <Dialog
        open={openSubscriptionDialog}
        onClose={() => setOpenSubscriptionDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PlanIcon color="primary" />
            Detalhes do Plano
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedSubscription && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {selectedSubscription.therapyPlan?.name || "Plano"}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {selectedSubscription.therapyPlan?.description || ""}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Status:
                </Typography>
                <Chip 
                  label={
                    selectedSubscription.status === 'ACTIVE' ? 'Ativo' :
                    selectedSubscription.status === 'EXPIRED' ? 'Expirado' :
                    selectedSubscription.status === 'CANCELED' ? 'Cancelado' : 'Pendente'
                  }
                  size="small"
                  color={selectedSubscription.status === 'ACTIVE' ? 'success' : 'default'}
                  sx={{ mt: 0.5 }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Sessões:
                </Typography>
                <Typography variant="body1">
                  {selectedSubscription.remainingSessions} / {selectedSubscription.totalSessions}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Data de início:
                </Typography>
                <Typography variant="body1">
                  {formatDate(selectedSubscription.startDate)}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Data de término:
                </Typography>
                <Typography variant="body1">
                  {formatDate(selectedSubscription.endDate)}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Valor do plano:
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {selectedSubscription.therapyPlan ? 
                    new Intl.NumberFormat('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL' 
                    }).format(selectedSubscription.therapyPlan.totalPrice) : 
                    'Não informado'
                  }
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSubscriptionDialog(false)}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
});

export default Clients;