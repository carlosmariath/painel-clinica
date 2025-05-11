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
  Paper
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useBranch } from '../context/BranchContext';
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

  // Carregar dados financeiros
  useEffect(() => {
    if (activeTab === 'transactions') {
      loadTransactions();
    } else if (activeTab === 'summary') {
      loadSummary();
    }
  }, [currentBranch, activeTab, startDate, endDate, transactionType]);

  // Carregar categorias, métodos de pagamento e clientes ao montar
  useEffect(() => {
    Promise.all([
      financeService.getCategories(),
      financeService.getPaymentMethods(),
      loadClientsMock()
    ]).then(([categoriesData, methodsData, clientsData]) => {
      setCategories(categoriesData);
      setPaymentMethods(methodsData);
      setClients(clientsData);
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
      
      const data = await financeService.getTransactions(
        formattedStartDate,
        formattedEndDate,
        typeFilter,
        undefined,
        currentBranch?.id
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
      
      const data = await financeService.getFinancialSummary(
        formattedStartDate,
        formattedEndDate,
        currentBranch?.id
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
    <Container maxWidth="lg">
      <Box my={4}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h4" component="h1" gutterBottom>
                Finanças
              </Typography>
              {activeTab === 'transactions' && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleAddTransaction}
                >
                  Nova Transação
                </Button>
              )}
            </Box>
          </Grid>

          {/* Tabs para navegação */}
          <Grid item xs={12}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              <Tab label="Transações" value="transactions" />
              <Tab label="Resumo Financeiro" value="summary" />
            </Tabs>
            <Divider />
          </Grid>

          {/* Filtros de data */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={3}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                    <DatePicker
                      label="Data inicial"
                      value={startDate}
                      onChange={(newValue) => newValue && setStartDate(newValue)}
                      slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} md={3}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                    <DatePicker
                      label="Data final"
                      value={endDate}
                      onChange={(newValue) => newValue && setEndDate(newValue)}
                      slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} md={3}>
                  {activeTab === 'transactions' && (
                    <Box>
                      <Button 
                        variant={transactionType === 'ALL' ? 'contained' : 'outlined'} 
                        color="primary"
                        size="small"
                        onClick={() => handleTypeFilterChange('ALL')}
                        sx={{ mr: 1 }}
                      >
                        Todos
                      </Button>
                      <Button 
                        variant={transactionType === 'REVENUE' ? 'contained' : 'outlined'} 
                        color="success"
                        size="small"
                        onClick={() => handleTypeFilterChange('REVENUE')}
                        sx={{ mr: 1 }}
                      >
                        Receitas
                      </Button>
                      <Button 
                        variant={transactionType === 'EXPENSE' ? 'contained' : 'outlined'} 
                        color="error"
                        size="small"
                        onClick={() => handleTypeFilterChange('EXPENSE')}
                      >
                        Despesas
                      </Button>
                    </Box>
                  )}
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box display="flex" justifyContent="flex-end">
                    <Button
                      size="small"
                      onClick={setPreviousMonth}
                      sx={{ mr: 1 }}
                    >
                      Mês Anterior
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={setCurrentMonth}
                      sx={{ mr: 1 }}
                    >
                      Mês Atual
                    </Button>
                    <Button
                      size="small"
                      onClick={setNextMonth}
                    >
                      Próximo Mês
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Conteúdo da Tab de Transações */}
          {activeTab === 'transactions' && (
            <Grid item xs={12}>
              {loading ? (
                <Box display="flex" justifyContent="center" p={3}>
                  <CircularProgress />
                </Box>
              ) : (
                <TransactionsTable
                  transactions={transactions}
                  onEdit={handleEditTransaction}
                  onDelete={handleDeleteClick}
                />
              )}
            </Grid>
          )}

          {/* Conteúdo da Tab de Resumo Financeiro */}
          {activeTab === 'summary' && (
            <>
              <Grid item xs={12}>
                <Box mb={3}>
                  <Typography variant="h5" gutterBottom>
                    Resumo do Período: {format(startDate, 'dd/MM/yyyy')} a {format(endDate, 'dd/MM/yyyy')}
                  </Typography>
                </Box>
              </Grid>

              {loading ? (
                <Grid item xs={12}>
                  <Box display="flex" justifyContent="center" p={3}>
                    <CircularProgress />
                  </Box>
                </Grid>
              ) : summary ? (
                <>
                  {/* Cards de resumo */}
                  <Grid item xs={12} md={4}>
                    <Card sx={{ bgcolor: 'success.light' }}>
                      <CardContent>
                        <Typography color="white" gutterBottom>
                          Total de Receitas
                        </Typography>
                        <Typography variant="h4" component="div" color="white">
                          {formatCurrency(summary.totalRevenue)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card sx={{ bgcolor: 'error.light' }}>
                      <CardContent>
                        <Typography color="white" gutterBottom>
                          Total de Despesas
                        </Typography>
                        <Typography variant="h4" component="div" color="white">
                          {formatCurrency(summary.totalExpense)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card sx={{ bgcolor: summary.balance >= 0 ? 'primary.light' : 'warning.light' }}>
                      <CardContent>
                        <Typography color="white" gutterBottom>
                          Balanço do Período
                        </Typography>
                        <Typography variant="h4" component="div" color="white">
                          {formatCurrency(summary.balance)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Detalhamento por categoria */}
                  {summary.byCategory.REVENUE && Object.keys(summary.byCategory.REVENUE).length > 0 && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom mt={3}>
                        Receitas por Categoria
                      </Typography>
                      <Paper elevation={1} sx={{ p: 2 }}>
                        {Object.entries(summary.byCategory.REVENUE).map(([category, data]) => (
                          <Box key={category} display="flex" justifyContent="space-between" mb={1}>
                            <Typography>
                              {category} ({data.count})
                            </Typography>
                            <Typography fontWeight="bold" color="success.main">
                              {formatCurrency(data.total)}
                            </Typography>
                          </Box>
                        ))}
                      </Paper>
                    </Grid>
                  )}

                  {summary.byCategory.EXPENSE && Object.keys(summary.byCategory.EXPENSE).length > 0 && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom mt={3}>
                        Despesas por Categoria
                      </Typography>
                      <Paper elevation={1} sx={{ p: 2 }}>
                        {Object.entries(summary.byCategory.EXPENSE).map(([category, data]) => (
                          <Box key={category} display="flex" justifyContent="space-between" mb={1}>
                            <Typography>
                              {category} ({data.count})
                            </Typography>
                            <Typography fontWeight="bold" color="error.main">
                              {formatCurrency(data.total)}
                            </Typography>
                          </Box>
                        ))}
                      </Paper>
                    </Grid>
                  )}
                </>
              ) : (
                <Grid item xs={12}>
                  <Paper sx={{ p: 3 }}>
                    <Typography align="center">
                      Nenhuma informação financeira disponível para o período selecionado.
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </>
          )}
        </Grid>
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