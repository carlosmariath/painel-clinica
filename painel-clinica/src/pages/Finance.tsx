import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Paper,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import { 
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
  FilterList as FilterListIcon,
  CalendarToday as CalendarTodayIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { useBranch } from '../context/BranchContext';
import { getBranches } from '../services/branchService';
import { Branch } from '../types/branch';
import { 
  FinancialTransaction, 
  TransactionType, 
  FinancialSummary,
  FinanceCategory,
  PaymentMethod,
  financeService 
} from '../services/financeService';
import TransactionsTable from '../components/TransactionsTable';
import TransactionForm from '../components/TransactionForm';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ptBR } from 'date-fns/locale';
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';
import { CURRENCY_LOCALE, CURRENCY_OPTIONS } from '../config';

// Interface para o cliente
interface Client {
  id: string;
  name: string;
  email: string;
}

const Finance = () => {
  const { currentBranch } = useBranch();
  const [activeTab, setActiveTab] = useState<string>('transactions');
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openForm, setOpenForm] = useState<boolean>(false);
  const [selectedTransaction, setSelectedTransaction] = useState<FinancialTransaction | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [transactionToDelete, setTransactionToDelete] = useState<FinancialTransaction | null>(null);
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(endOfMonth(new Date()));
  const [transactionType, setTransactionType] = useState<TransactionType | 'ALL'>('ALL');
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [categories, setCategories] = useState<FinanceCategory[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('ALL');
  const [branches, setBranches] = useState<Branch[]>([]);

  // Carregar dados financeiros
  useEffect(() => {
    if (activeTab === 'transactions') {
      loadTransactions();
    } else if (activeTab === 'summary') {
      loadSummary();
    }
  }, [currentBranch, activeTab, startDate, endDate, transactionType, selectedBranchId]);

  // Carregar categorias, métodos de pagamento, clientes e filiais ao montar
  useEffect(() => {
    Promise.all([
      financeService.getCategories(),
      financeService.getPaymentMethods(),
      loadClientsMock(),
      getBranches()
    ]).then(([categoriesData, methodsData, clientsData, branchesData]) => {
      setCategories(categoriesData);
      setPaymentMethods(methodsData);
      setClients(clientsData);
      setBranches(branchesData);
    }).catch(error => {
      console.error('Erro ao carregar dados auxiliares:', error);
    });
  }, []);

  const loadClientsMock = async (): Promise<Client[]> => {
    // Mock para clientes até existir uma API de clientes
    return [
      { id: '1', name: 'Cliente 1', email: 'cliente1@example.com' },
      { id: '2', name: 'Cliente 2', email: 'cliente2@example.com' },
      { id: '3', name: 'Cliente 3', email: 'cliente3@example.com' },
    ];
  };

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      const typeFilter = transactionType === 'ALL' ? undefined : transactionType;
      const branchFilter = selectedBranchId === 'ALL' ? undefined : selectedBranchId;
      
      const data = await financeService.getTransactions(
        formattedStartDate,
        formattedEndDate,
        typeFilter,
        undefined,
        branchFilter
      );
      setTransactions(data);
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    setLoading(true);
    try {
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      const branchFilter = selectedBranchId === 'ALL' ? undefined : selectedBranchId;
      
      const data = await financeService.getFinancialSummary(
        formattedStartDate,
        formattedEndDate,
        branchFilter
      );
      setSummary(data);
    } catch (error) {
      console.error('Erro ao carregar resumo financeiro:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  const handleAddTransaction = () => {
    setSelectedTransaction(null);
    setOpenForm(true);
  };

  const handleEditTransaction = (transaction: FinancialTransaction) => {
    setSelectedTransaction(transaction);
    setOpenForm(true);
  };

  const handleDeleteClick = (transaction: FinancialTransaction) => {
    setTransactionToDelete(transaction);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!transactionToDelete) return;
    
    try {
      await financeService.deleteTransaction(transactionToDelete.id);
      setTransactions(transactions.filter(t => t.id !== transactionToDelete.id));
      setDeleteDialogOpen(false);
      setTransactionToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
    }
  };

  const handleFormSubmit = async (data: Omit<FinancialTransaction, 'id' | 'client' | 'branch' | 'paymentMethod' | 'financeCategory'>) => {
    try {
      if (selectedTransaction) {
        // Atualizar transação existente
        await financeService.updateTransaction(selectedTransaction.id, data);
      } else {
        // Criar nova transação
        await financeService.createTransaction(data);
      }
      // Recarregar transações
      loadTransactions();
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
    }
  };

  const handleTypeFilterChange = (newType: TransactionType | 'ALL') => {
    setTransactionType(newType);
  };

  const handleBranchFilterChange = (event: SelectChangeEvent<string>) => {
    setSelectedBranchId(event.target.value);
  };

  const setPreviousMonth = () => {
    setStartDate(startOfMonth(subMonths(startDate, 1)));
    setEndDate(endOfMonth(subMonths(endDate, 1)));
  };

  const setNextMonth = () => {
    setStartDate(startOfMonth(addMonths(startDate, 1)));
    setEndDate(endOfMonth(addMonths(endDate, 1)));
  };

  const setCurrentMonth = () => {
    setStartDate(startOfMonth(new Date()));
    setEndDate(endOfMonth(new Date()));
  };

  // Formatação de moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(CURRENCY_LOCALE, {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Container maxWidth="xl">
      <Box my={4}>
        {/* Cabeçalho */}
        <Box mb={4}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box>
              <Typography variant="h4" component="h1" fontWeight="bold" color="primary.main">
                💰 Gestão Financeira
              </Typography>
              <Typography variant="body1" color="text.secondary" mt={1}>
                {selectedBranchId === 'ALL' 
                  ? 'Todas as filiais' 
                  : `Filial: ${branches.find(b => b.id === selectedBranchId)?.name || 'Filial selecionada'}`
                }
              </Typography>
            </Box>
            {activeTab === 'transactions' && (
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<AddIcon />}
                onClick={handleAddTransaction}
                sx={{ borderRadius: 2, px: 3 }}
              >
                Nova Transação
              </Button>
            )}
          </Box>

          {/* Tabs para navegação */}
          <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  py: 2,
                  fontSize: '1rem',
                  fontWeight: 600,
                },
              }}
            >
              <Tab 
                label="📊 Transações" 
                value="transactions"
                icon={<FilterListIcon />}
                iconPosition="start"
              />
              <Tab 
                label="📈 Resumo Financeiro" 
                value="summary"
                icon={<AccountBalanceIcon />}
                iconPosition="start"
              />
            </Tabs>
          </Paper>
        </Box>

        {/* Painel de Filtros */}
        <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
          <Box display="flex" alignItems="center" mb={2}>
            <CalendarTodayIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" fontWeight="bold">
              Filtros e Período
            </Typography>
          </Box>
          
          <Grid container spacing={3} alignItems="center">
            {/* Seleção de Data */}
            <Grid item xs={12} md={2}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                <DatePicker
                  label="Data inicial"
                  value={startDate}
                  onChange={(newValue) => newValue && setStartDate(newValue)}
                  slotProps={{ 
                    textField: { 
                      fullWidth: true, 
                      size: 'small',
                      variant: 'outlined'
                    } 
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                <DatePicker
                  label="Data final"
                  value={endDate}
                  onChange={(newValue) => newValue && setEndDate(newValue)}
                  slotProps={{ 
                    textField: { 
                      fullWidth: true, 
                      size: 'small',
                      variant: 'outlined'
                    } 
                  }}
                />
              </LocalizationProvider>
            </Grid>

            {/* Filtro de Filial */}
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="branch-filter-label">
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <BusinessIcon fontSize="small" />
                    Filial
                  </Box>
                </InputLabel>
                <Select
                  labelId="branch-filter-label"
                  value={selectedBranchId}
                  onChange={handleBranchFilterChange}
                  label="Filial"
                >
                  <MenuItem value="ALL">
                    <Box display="flex" alignItems="center" gap={1}>
                      <BusinessIcon fontSize="small" />
                      Todas as filiais
                    </Box>
                  </MenuItem>
                  {branches.map((branch) => (
                    <MenuItem key={branch.id} value={branch.id}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <BusinessIcon fontSize="small" />
                        {branch.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Filtros de Tipo - apenas na aba de transações */}
            <Grid item xs={12} md={3}>
              {activeTab === 'transactions' && (
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip 
                    label="Todos" 
                    variant={transactionType === 'ALL' ? 'filled' : 'outlined'}
                    color="primary"
                    onClick={() => handleTypeFilterChange('ALL')}
                    clickable
                  />
                  <Chip 
                    label="Receitas" 
                    variant={transactionType === 'REVENUE' ? 'filled' : 'outlined'}
                    color="success"
                    onClick={() => handleTypeFilterChange('REVENUE')}
                    clickable
                    icon={<TrendingUpIcon />}
                  />
                  <Chip 
                    label="Despesas" 
                    variant={transactionType === 'EXPENSE' ? 'filled' : 'outlined'}
                    color="error"
                    onClick={() => handleTypeFilterChange('EXPENSE')}
                    clickable
                    icon={<TrendingDownIcon />}
                  />
                </Stack>
              )}
            </Grid>

            {/* Navegação de Mês */}
            <Grid item xs={12} md={3}>
              <Box display="flex" justifyContent="flex-end" gap={1}>
                <Tooltip title="Mês anterior">
                  <IconButton 
                    onClick={setPreviousMonth}
                    size="small"
                    sx={{ bgcolor: 'background.paper' }}
                  >
                    <ArrowBackIcon />
                  </IconButton>
                </Tooltip>
                
                <Button
                  variant="contained"
                  size="small"
                  onClick={setCurrentMonth}
                  sx={{ borderRadius: 2, minWidth: 'auto', px: 2 }}
                >
                  Atual
                </Button>
                
                <Tooltip title="Próximo mês">
                  <IconButton 
                    onClick={setNextMonth}
                    size="small"
                    sx={{ bgcolor: 'background.paper' }}
                  >
                    <ArrowForwardIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Conteúdo da Tab de Transações */}
        {activeTab === 'transactions' && (
          <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            {loading ? (
              <Box display="flex" justifyContent="center" p={6}>
                <CircularProgress size={60} />
              </Box>
            ) : (
              <TransactionsTable
                transactions={transactions}
                onEdit={handleEditTransaction}
                onDelete={handleDeleteClick}
              />
            )}
          </Paper>
        )}

        {/* Conteúdo da Tab de Resumo Financeiro */}
        {activeTab === 'summary' && (
          <Box>
            {/* Título do Período */}
            <Box mb={4}>
              <Typography variant="h5" fontWeight="bold" align="center" gutterBottom>
                📊 Resumo Financeiro
              </Typography>
              <Typography variant="body1" color="text.secondary" align="center">
                Período: {format(startDate, 'dd/MM/yyyy')} a {format(endDate, 'dd/MM/yyyy')}
              </Typography>
            </Box>

            {loading ? (
              <Box display="flex" justifyContent="center" p={6}>
                <CircularProgress size={60} />
              </Box>
            ) : summary ? (
              <Grid container spacing={3}>
                {/* Cards de resumo melhorados */}
                <Grid item xs={12} md={4}>
                  <Card 
                    elevation={3}
                    sx={{ 
                      background: 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)',
                      color: 'white',
                      borderRadius: 3,
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'translateY(-4px)' }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="h6" fontWeight="bold" mb={1}>
                            Total de Receitas
                          </Typography>
                          <Typography variant="h4" component="div" fontWeight="bold">
                            {formatCurrency(summary.totalRevenue)}
                          </Typography>
                        </Box>
                        <TrendingUpIcon sx={{ fontSize: 48, opacity: 0.7 }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card 
                    elevation={3}
                    sx={{ 
                      background: 'linear-gradient(135deg, #f44336 0%, #ef5350 100%)',
                      color: 'white',
                      borderRadius: 3,
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'translateY(-4px)' }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="h6" fontWeight="bold" mb={1}>
                            Total de Despesas
                          </Typography>
                          <Typography variant="h4" component="div" fontWeight="bold">
                            {formatCurrency(summary.totalExpense)}
                          </Typography>
                        </Box>
                        <TrendingDownIcon sx={{ fontSize: 48, opacity: 0.7 }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card 
                    elevation={3}
                    sx={{ 
                      background: summary.balance >= 0 
                        ? 'linear-gradient(135deg, #2196f3 0%, #64b5f6 100%)'
                        : 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)',
                      color: 'white',
                      borderRadius: 3,
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'translateY(-4px)' }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="h6" fontWeight="bold" mb={1}>
                            Balanço do Período
                          </Typography>
                          <Typography variant="h4" component="div" fontWeight="bold">
                            {formatCurrency(summary.balance)}
                          </Typography>
                        </Box>
                        <AccountBalanceIcon sx={{ fontSize: 48, opacity: 0.7 }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Detalhamento por categoria */}
                {summary.byCategory.REVENUE && Object.keys(summary.byCategory.REVENUE).length > 0 && (
                  <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mt: 2 }}>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        💚 Receitas por Categoria
                      </Typography>
                      <Stack spacing={2}>
                        {Object.entries(summary.byCategory.REVENUE).map(([category, data]) => (
                          <Box 
                            key={category} 
                            sx={{ 
                              p: 2, 
                              borderRadius: 1, 
                              bgcolor: 'success.50',
                              border: '1px solid',
                              borderColor: 'success.200'
                            }}
                          >
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography fontWeight="medium">
                                {category}
                              </Typography>
                              <Chip 
                                label={`${data.count} transações`}
                                size="small"
                                color="success"
                                variant="outlined"
                              />
                            </Box>
                            <Typography variant="h6" fontWeight="bold" color="success.main" mt={1}>
                              {formatCurrency(data.total)}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Paper>
                  </Grid>
                )}

                {summary.byCategory.EXPENSE && Object.keys(summary.byCategory.EXPENSE).length > 0 && (
                  <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mt: 2 }}>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        ❤️ Despesas por Categoria
                      </Typography>
                      <Stack spacing={2}>
                        {Object.entries(summary.byCategory.EXPENSE).map(([category, data]) => (
                          <Box 
                            key={category} 
                            sx={{ 
                              p: 2, 
                              borderRadius: 1, 
                              bgcolor: 'error.50',
                              border: '1px solid',
                              borderColor: 'error.200'
                            }}
                          >
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography fontWeight="medium">
                                {category}
                              </Typography>
                              <Chip 
                                label={`${data.count} transações`}
                                size="small"
                                color="error"
                                variant="outlined"
                              />
                            </Box>
                            <Typography variant="h6" fontWeight="bold" color="error.main" mt={1}>
                              {formatCurrency(data.total)}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            ) : (
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 6, 
                  textAlign: 'center', 
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
                }}
              >
                <AccountBalanceIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Nenhuma informação financeira disponível
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Não há dados para o período selecionado: {format(startDate, 'dd/MM/yyyy')} a {format(endDate, 'dd/MM/yyyy')}
                </Typography>
              </Paper>
            )}
          </Box>
        )}
      </Box>

      {/* Formulário de Transação */}
      <TransactionForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedTransaction || undefined}
        clients={clients}
        title={selectedTransaction ? 'Editar Transação' : 'Nova Transação'}
      />

      {/* Diálogo de confirmação de exclusão */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir esta transação?
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
    </Container>
  );
};

export default Finance; 