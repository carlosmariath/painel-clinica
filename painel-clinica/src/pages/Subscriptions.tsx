import { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Chip,
  Grid,
  Card,
  CardContent,
  TablePagination,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { subscriptionService, Subscription, ConsumptionDetail, CreateSubscriptionDTO } from '../services/subscriptionService';
import { useBranch } from '../context/BranchContext';
import { useAuth } from '../context/AuthContext';
import SubscriptionForm from '../components/SubscriptionForm';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CURRENCY_LOCALE, CURRENCY_OPTIONS } from '../config';
import { getClients } from '../services/clientsService';
import { useSnackbar } from 'notistack';

// Interface para o cliente
interface Client {
  id: string;
  name: string;
  email: string;
}

const Subscriptions = () => {
  const { currentBranch } = useBranch();
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openForm, setOpenForm] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState<boolean>(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>('ACTIVE');
  const [detailsDialogOpen, setDetailsDialogOpen] = useState<boolean>(false);
  const [consumptionHistory, setConsumptionHistory] = useState<ConsumptionDetail[]>([]);
  const [loadingConsumption, setLoadingConsumption] = useState<boolean>(false);
  const isLoadingRef = useRef(false);

  // Carregar assinaturas
  useEffect(() => {
    // Evitar chamadas simultâneas ou duplicadas
    if (isLoadingRef.current) return;
    
    const fetchData = async () => {
      isLoadingRef.current = true;
      try {
        setLoading(true);
        await loadSubscriptions();
        await loadClients();
      } finally {
        setLoading(false);
        isLoadingRef.current = false;
      }
    };
    
    fetchData();
  }, [currentBranch, statusFilter]);

  const loadSubscriptions = async () => {
    try {
      let branchFilter;
      const isAdmin = user?.role === 'ADMIN';
      
      // Se for admin e selecionou uma filial específica, filtra por ela
      if (isAdmin) {
        // Administrador pode ver todas as filiais ou filtrar por uma específica
        branchFilter = currentBranch?.id || undefined;
      } else {
        // Não administrador só pode ver as filiais permitidas no JWT
        branchFilter = user?.allowedBranches || [];
      }
      
      const data = await subscriptionService.getSubscriptions(
        undefined, 
        statusFilter === 'ALL' ? undefined : statusFilter,
        branchFilter
      );
      setSubscriptions(data);
    } catch (_error) {
      console.error('Erro ao carregar assinaturas:', _error);
    }
  };

  const loadClients = async () => {
    try {
      // Buscar clientes da API
      const data = await getClients();
      setClients(data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      enqueueSnackbar('Erro ao carregar a lista de clientes', { 
        variant: 'error' 
      });
      // Fallback para alguns clientes de exemplo em caso de erro
      setClients([
        { id: '1', name: 'Cliente 1', email: 'cliente1@example.com' },
        { id: '2', name: 'Cliente 2', email: 'cliente2@example.com' },
      ]);
    }
  };

  const handleAddSubscription = () => {
    setOpenForm(true);
  };

  const handleCancelClick = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setCancelDialogOpen(true);
  };

  const handleDeleteClick = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setDeleteDialogOpen(true);
  };

  const handleShowDetails = async (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setDetailsDialogOpen(true);
    
    // Carregar histórico de consumo
    setLoadingConsumption(true);
    try {
      const history = await subscriptionService.getConsumptionHistory(subscription.id);
      setConsumptionHistory(history);
    } catch (error) {
      console.error('Erro ao carregar histórico de consumo:', error);
      setConsumptionHistory([]);
    } finally {
      setLoadingConsumption(false);
    }
  };

  const handleCancelConfirm = async () => {
    if (!selectedSubscription) return;
    
    try {
      await subscriptionService.cancelSubscription(selectedSubscription.id);
      // Atualizar a lista
      loadSubscriptions();
      setCancelDialogOpen(false);
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSubscription) return;
    
    try {
      await subscriptionService.deleteSubscription(selectedSubscription.id);
      // Atualizar a lista
      loadSubscriptions();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Erro ao excluir assinatura:', error);
    }
  };

  const handleFormSubmit = async (data: CreateSubscriptionDTO) => {
    try {
      await subscriptionService.createSubscription(data);
      
      // Recarregar lista
      await loadSubscriptions();
      setOpenForm(false);
      enqueueSnackbar('Assinatura criada com sucesso!', { 
        variant: 'success' 
      });
    } catch (error) {
      console.error('Erro ao criar assinatura:', error);
      enqueueSnackbar('Erro ao criar a assinatura. Tente novamente.', { 
        variant: 'error' 
      });
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleStatusFilterChange = (_event: React.SyntheticEvent, newValue: string) => {
    setStatusFilter(newValue);
  };

  // Formatar data
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      // Retorna a string original em caso de erro
      return dateString;
    }
  };

  // Obter cor do chip de status
  const getStatusColor = (status: string): "success" | "warning" | "error" | "default" => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'EXPIRED':
        return 'error';
      case 'CANCELED':
        return 'default';
      default:
        return 'default';
    }
  };

  // Obter texto do status
  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Ativo';
      case 'PENDING':
        return 'Pendente';
      case 'EXPIRED':
        return 'Expirado';
      case 'CANCELED':
        return 'Cancelado';
      default:
        return status;
    }
  };

  // Calcular dias restantes
  const getRemainingDays = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    return differenceInDays(end, today);
  };

  // Estatísticas das assinaturas
  const activeCount = subscriptions.filter(s => s.status === 'ACTIVE').length;
  const pendingCount = subscriptions.filter(s => s.status === 'PENDING').length;
  const expiredCount = subscriptions.filter(s => s.status === 'EXPIRED').length;
  const canceledCount = subscriptions.filter(s => s.status === 'CANCELED').length;

  // Aplicar paginação
  const displayedSubscriptions = subscriptions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h4" component="h1" gutterBottom>
                Assinaturas de Planos
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddSubscription}
              >
                Nova Assinatura
              </Button>
            </Box>
          </Grid>

          {/* Cards de estatísticas */}
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Assinaturas Ativas
                </Typography>
                <Typography variant="h5" component="div" color="success.main">
                  {activeCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Assinaturas Pendentes
                </Typography>
                <Typography variant="h5" component="div" color="warning.main">
                  {pendingCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Assinaturas Expiradas
                </Typography>
                <Typography variant="h5" component="div" color="error.main">
                  {expiredCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Assinaturas Canceladas
                </Typography>
                <Typography variant="h5" component="div" color="text.secondary">
                  {canceledCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Filtro de Status */}
          <Grid item xs={12}>
            <Paper sx={{ mb: 2 }}>
              <Tabs
                value={statusFilter}
                onChange={handleStatusFilterChange}
                indicatorColor="primary"
                textColor="primary"
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label="Ativas" value="ACTIVE" />
                <Tab label="Pendentes" value="PENDING" />
                <Tab label="Expiradas" value="EXPIRED" />
                <Tab label="Canceladas" value="CANCELED" />
                <Tab label="Todas" value="ALL" />
              </Tabs>
            </Paper>
          </Grid>

          {/* Tabela de assinaturas */}
          <Grid item xs={12}>
            <Paper elevation={2}>
              {loading ? (
                <Box display="flex" justifyContent="center" p={3}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Cliente</TableCell>
                          <TableCell>Plano</TableCell>
                          <TableCell>Período</TableCell>
                          <TableCell align="center">Sessões Restantes</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell align="center">Ações</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {displayedSubscriptions.length > 0 ? (
                          displayedSubscriptions.map((subscription) => (
                            <TableRow key={subscription.id}>
                              <TableCell>
                                {subscription.client?.name || 'Cliente não encontrado'}
                              </TableCell>
                              <TableCell>
                                {subscription.therapyPlan?.name || 'Plano não encontrado'}
                              </TableCell>
                              <TableCell>
                                <Box>
                                  <Typography variant="body2">
                                    {formatDate(subscription.startDate)} - {formatDate(subscription.endDate)}
                                  </Typography>
                                  {subscription.status === 'ACTIVE' && (
                                    <Typography variant="caption" color="text.secondary">
                                      {getRemainingDays(subscription.endDate)} dias restantes
                                    </Typography>
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell align="center">
                                <Typography variant="body2" fontWeight="medium">
                                  {subscription.remainingSessions} / {subscription.totalSessions}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={getStatusText(subscription.status)}
                                  color={getStatusColor(subscription.status)}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Tooltip title="Detalhes">
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => handleShowDetails(subscription)}
                                  >
                                    <InfoIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                {subscription.status === 'ACTIVE' && (
                                  <Tooltip title="Cancelar">
                                    <IconButton
                                      size="small"
                                      color="warning"
                                      onClick={() => handleCancelClick(subscription)}
                                    >
                                      <CancelIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                <Tooltip title="Excluir">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteClick(subscription)}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} align="center">
                              <Box py={2}>
                                <Typography variant="subtitle1" color="text.secondary">
                                  Nenhuma assinatura encontrada
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={subscriptions.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Itens por página"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                  />
                </>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Formulário de nova assinatura */}
      <SubscriptionForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={handleFormSubmit}
        clients={clients}
        title="Nova Assinatura de Plano"
      />

      {/* Diálogo de confirmação de cancelamento */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
      >
        <DialogTitle>Confirmar cancelamento</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja cancelar esta assinatura?
            O cliente não poderá mais utilizar as sessões restantes.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)} color="inherit">
            Voltar
          </Button>
          <Button onClick={handleCancelConfirm} color="warning">
            Cancelar Assinatura
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmação de exclusão */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir esta assinatura?
            Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de detalhes */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Detalhes da Assinatura</DialogTitle>
        <DialogContent>
          {selectedSubscription && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1">Informações Gerais</Typography>
                <Box mt={1}>
                  <Typography variant="body2">
                    <strong>Cliente:</strong> {selectedSubscription.client?.name}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Plano:</strong> {selectedSubscription.therapyPlan?.name}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Data de Início:</strong> {formatDate(selectedSubscription.startDate)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Data de Término:</strong> {formatDate(selectedSubscription.endDate)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Status:</strong> {getStatusText(selectedSubscription.status)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1">Detalhes das Sessões</Typography>
                <Box mt={1}>
                  <Typography variant="body2">
                    <strong>Sessões Totais:</strong> {selectedSubscription.totalSessions}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Sessões Restantes:</strong> {selectedSubscription.remainingSessions}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Sessões Utilizadas:</strong> {selectedSubscription.totalSessions - selectedSubscription.remainingSessions}
                  </Typography>
                  {selectedSubscription.therapyPlan && (
                    <Typography variant="body2">
                      <strong>Valor do Plano:</strong> {new Intl.NumberFormat(CURRENCY_LOCALE, CURRENCY_OPTIONS).format(selectedSubscription.therapyPlan.totalPrice)}
                    </Typography>
                  )}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" mt={2}>Histórico de Consumo</Typography>
                {loadingConsumption ? (
                  <Box display="flex" justifyContent="center" p={2}>
                    <CircularProgress size={24} />
                  </Box>
                ) : (
                  <TableContainer component={Paper} variant="outlined" sx={{ mt: 1 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Data</TableCell>
                          <TableCell>ID do Agendamento</TableCell>
                          <TableCell>Filial</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {consumptionHistory.length > 0 ? (
                          consumptionHistory.map((consumption) => (
                            <TableRow key={consumption.id}>
                              <TableCell>{formatDate(consumption.consumedAt)}</TableCell>
                              <TableCell>{consumption.appointmentId}</TableCell>
                              <TableCell>{consumption.branchId}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={3} align="center">
                              <Typography variant="body2" color="text.secondary">
                                Nenhum consumo registrado
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)} color="primary">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Subscriptions; 