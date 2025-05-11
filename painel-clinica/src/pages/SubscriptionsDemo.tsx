import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  CircularProgress,
  Grid,
  Chip,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Add as AddIcon,
  Info as InfoIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { TherapyPlan, Subscription } from '../services/therapyPlanService';
import { useBranch } from '../context/BranchContext';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Página de demonstração para o módulo de Assinaturas de Planos
 * Essa página simula a integração com o backend usando dados mockados
 */
const SubscriptionsDemo = () => {
  const { branches } = useBranch();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [plans, setPlans] = useState<TherapyPlan[]>([]);

  // Simulação de carregamento de planos e assinaturas
  useEffect(() => {
    // Simulando planos de terapia
    const mockPlans: TherapyPlan[] = [
      {
        id: '1',
        name: 'Plano Básico',
        description: 'Plano básico com 10 sessões',
        sessionCount: 10,
        validityDays: 90,
        price: 1000,
        isActive: true,
        branchId: branches[0]?.id || '1'
      },
      {
        id: '2',
        name: 'Plano Premium',
        description: 'Plano premium com 20 sessões',
        sessionCount: 20,
        validityDays: 180,
        price: 1800,
        isActive: true,
        branchId: branches[0]?.id || '1'
      }
    ];

    // Simulando assinaturas de planos
    const today = new Date();
    const mockSubscriptions: Subscription[] = [
      {
        id: '1',
        clientId: '1',
        therapyPlanId: '1',
        startDate: format(today, 'yyyy-MM-dd'),
        endDate: format(addDays(today, 90), 'yyyy-MM-dd'),
        status: 'ACTIVE',
        remainingSessions: 8,
        totalSessions: 10,
        client: {
          id: '1',
          name: 'João Silva',
          email: 'joao@example.com'
        },
        therapyPlan: mockPlans[0]
      },
      {
        id: '2',
        clientId: '2',
        therapyPlanId: '2',
        startDate: format(addDays(today, -30), 'yyyy-MM-dd'),
        endDate: format(addDays(today, 150), 'yyyy-MM-dd'),
        status: 'ACTIVE',
        remainingSessions: 15,
        totalSessions: 20,
        client: {
          id: '2',
          name: 'Maria Oliveira',
          email: 'maria@example.com'
        },
        therapyPlan: mockPlans[1]
      },
      {
        id: '3',
        clientId: '3',
        therapyPlanId: '1',
        startDate: format(addDays(today, -100), 'yyyy-MM-dd'),
        endDate: format(addDays(today, -10), 'yyyy-MM-dd'),
        status: 'EXPIRED',
        remainingSessions: 2,
        totalSessions: 10,
        client: {
          id: '3',
          name: 'Carlos Santos',
          email: 'carlos@example.com'
        },
        therapyPlan: mockPlans[0]
      }
    ];

    setLoading(true);
    // Simular um carregamento assíncrono
    setTimeout(() => {
      setPlans(mockPlans);
      setSubscriptions(mockSubscriptions);
      setLoading(false);
    }, 500);
  }, [branches]);

  // Simular cancelamento de assinatura
  const handleCancelSubscription = (subscriptionId: string) => {
    setSubscriptions(subscriptions.map(sub => 
      sub.id === subscriptionId ? { ...sub, status: 'CANCELED' } : sub
    ));
  };

  // Formatar data
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy', { locale: ptBR });
    } catch (_error) {
      return dateString;
    }
  };

  // Obter cor do chip de status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'PENDING': return 'warning';
      case 'EXPIRED': return 'error';
      case 'CANCELED': return 'default';
      default: return 'default';
    }
  };

  // Obter texto do status
  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Ativo';
      case 'PENDING': return 'Pendente';
      case 'EXPIRED': return 'Expirado';
      case 'CANCELED': return 'Cancelado';
      default: return status;
    }
  };

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" component="h1">
            Demonstração - Assinaturas de Planos
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => console.log('Adicionar nova assinatura')}
          >
            Nova Assinatura
          </Button>
        </Box>

        {/* Cards de estatísticas */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total de Assinaturas
                </Typography>
                <Typography variant="h5" component="div">
                  {subscriptions.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Assinaturas Ativas
                </Typography>
                <Typography variant="h5" component="div" color="success.main">
                  {subscriptions.filter(s => s.status === 'ACTIVE').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Assinaturas Expiradas
                </Typography>
                <Typography variant="h5" component="div" color="error.main">
                  {subscriptions.filter(s => s.status === 'EXPIRED').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Assinaturas Canceladas
                </Typography>
                <Typography variant="h5" component="div" color="text.secondary">
                  {subscriptions.filter(s => s.status === 'CANCELED').length}
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
                Lista de Assinaturas
              </Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Plano</TableCell>
                    <TableCell>Período</TableCell>
                    <TableCell align="center">Sessões</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {subscriptions.length > 0 ? (
                    subscriptions.map((subscription) => (
                      <TableRow key={subscription.id}>
                        <TableCell>
                          {subscription.client?.name || 'Cliente não encontrado'}
                        </TableCell>
                        <TableCell>
                          {subscription.therapyPlan?.name || 'Plano não encontrado'}
                        </TableCell>
                        <TableCell>
                          {formatDate(subscription.startDate)} - {formatDate(subscription.endDate)}
                        </TableCell>
                        <TableCell align="center">
                          {subscription.remainingSessions} / {subscription.totalSessions}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusText(subscription.status)}
                            color={getStatusColor(subscription.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Detalhes">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => console.log('Ver detalhes:', subscription.id)}
                            >
                              <InfoIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {subscription.status === 'ACTIVE' && (
                            <Tooltip title="Cancelar">
                              <IconButton
                                size="small"
                                color="warning"
                                onClick={() => handleCancelSubscription(subscription.id)}
                              >
                                <CancelIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Box py={2}>
                          <Typography>Nenhuma assinatura encontrada</Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default SubscriptionsDemo; 