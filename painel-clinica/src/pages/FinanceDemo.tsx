import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  CircularProgress,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { FinancialTransaction, TransactionType } from '../services/financeService';
import TransactionsTable from '../components/TransactionsTable';
import { useBranch } from '../context/BranchContext';

/**
 * Página de demonstração para o módulo Financeiro
 * Essa página simula a integração com o backend usando dados mockados
 */
const FinanceDemo = () => {
  const { branches } = useBranch();
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Simulação de carregamento de transações
  useEffect(() => {
    const mockTransactions: FinancialTransaction[] = [
      {
        id: '1',
        type: 'REVENUE',
        amount: 150,
        description: 'Pagamento de consulta',
        category: 'Consulta',
        date: new Date().toISOString(),
        branchId: branches[0]?.id || '1',
        clientId: '1',
        client: {
          id: '1',
          name: 'João Silva',
          email: 'joao@example.com'
        }
      },
      {
        id: '2',
        type: 'EXPENSE',
        amount: 50,
        description: 'Material de escritório',
        category: 'Materiais',
        date: new Date().toISOString(),
        branchId: branches[0]?.id || '1'
      },
      {
        id: '3',
        type: 'REVENUE',
        amount: 200,
        description: 'Pagamento de terapia',
        category: 'Terapia',
        date: new Date().toISOString(),
        branchId: branches[0]?.id || '1',
        clientId: '2',
        client: {
          id: '2',
          name: 'Maria Oliveira',
          email: 'maria@example.com'
        }
      }
    ];

    setLoading(true);
    // Simular um carregamento assíncrono
    setTimeout(() => {
      setTransactions(mockTransactions);
      setLoading(false);
    }, 500);
  }, [branches]);

  const handleEditTransaction = (transaction: FinancialTransaction) => {
    console.log('Editar transação:', transaction);
    // Aqui seria implementada a lógica para abrir o formulário de edição
  };

  const handleDeleteTransaction = (transaction: FinancialTransaction) => {
    console.log('Excluir transação:', transaction);
    // Aqui simulamos a exclusão da transação
    setTransactions(transactions.filter(t => t.id !== transaction.id));
  };

  // Calcular resumo financeiro
  const totalRevenue = transactions
    .filter(t => t.type === 'REVENUE')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const balance = totalRevenue - totalExpense;

  // Função para formatação de moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" component="h1">
            Demonstração - Finanças
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => console.log('Adicionar nova transação')}
          >
            Nova Transação
          </Button>
        </Box>

        {/* Cards de resumo */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: 'success.light' }}>
              <CardContent>
                <Typography color="white" gutterBottom>
                  Total de Receitas
                </Typography>
                <Typography variant="h5" component="div" color="white">
                  {formatCurrency(totalRevenue)}
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
                <Typography variant="h5" component="div" color="white">
                  {formatCurrency(totalExpense)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: balance >= 0 ? 'primary.light' : 'warning.light' }}>
              <CardContent>
                <Typography color="white" gutterBottom>
                  Balanço
                </Typography>
                <Typography variant="h5" component="div" color="white">
                  {formatCurrency(balance)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <Paper elevation={2}>
            <Box p={2}>
              <Typography variant="h6" gutterBottom>
                Transações
              </Typography>
            </Box>
            <TransactionsTable
              transactions={transactions}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
            />
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default FinanceDemo; 