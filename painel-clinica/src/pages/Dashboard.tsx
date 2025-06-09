import { useEffect, useState } from "react";
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  CircularProgress, 
  Card, 
  CardContent, 
  CardHeader, 
  IconButton, 
  Divider,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Button,
  Chip} from "@mui/material";
import { 
  BarChart as BarChartIcon, 
  TrendingUp, 
  TrendingDown, 
  PeopleAlt, 
  Today, 
  Person,
  MoreVert,
  AttachMoney,
  Assignment,
  LocalHospital,
  CalendarMonth,
  Refresh
} from "@mui/icons-material";
import { 
  getFullDashboardData, 
  getRevenueChart 
} from "../services/dashboardService";
import { useNotification } from "../components/Notification";
import { useNavigate } from "react-router-dom";
import { 
  DashboardData} from "../types/dashboard";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  trend?: number;
  prefix?: string;
  onClick?: () => void;
}

const StatCard = ({ title, value, icon, color, subtitle, trend, prefix, onClick }: StatCardProps) => {
  const isPositiveTrend = trend && trend > 0;
  
  return (
    <Card 
      sx={{ 
        height: '100%', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        '&:hover': onClick ? {
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          transform: 'translateY(-2px)'
        } : {}
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography color="text.secondary" variant="body2" fontWeight={500}>
            {title}
          </Typography>
          <Avatar sx={{ bgcolor: `${color}.light`, width: 40, height: 40 }}>
            {icon}
          </Avatar>
        </Box>
        
        <Typography variant="h4" component="div" fontWeight={700} sx={{ mb: 1 }}>
          {prefix}{value}
        </Typography>
        
        {trend !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isPositiveTrend ? (
              <TrendingUp fontSize="small" sx={{ color: 'success.main', mr: 0.5 }} />
            ) : (
              <TrendingDown fontSize="small" sx={{ color: 'error.main', mr: 0.5 }} />
            )}
            <Typography 
              variant="body2" 
              sx={{ 
                color: isPositiveTrend ? 'success.main' : 'error.main',
                fontWeight: 500
              }}
            >
              {Math.abs(trend)}% {isPositiveTrend ? 'aumento' : 'redução'}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [chartPeriod, setChartPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const data = await getFullDashboardData();
      setDashboardData(data);
      
      // Buscar dados do gráfico com o período selecionado
      if (chartPeriod !== 'month') {
        const chartData = await getRevenueChart(chartPeriod);
        setDashboardData(prev => prev ? { ...prev, revenueChart: chartData } : null);
      }
    } catch (error) {
      showNotification("Erro ao carregar dados do dashboard", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [chartPeriod]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'canceled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmado';
      case 'pending':
        return 'Pendente';
      case 'canceled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  if (loading || !dashboardData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <BarChartIcon fontSize="large" color="primary" sx={{ mr: 1.5 }} />
          <Typography variant="h4" fontWeight={700}>
            Dashboard
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton 
            onClick={fetchData} 
            disabled={refreshing}
            sx={{ mr: 1 }}
          >
            <Refresh className={refreshing ? 'rotating' : ''} />
          </IconButton>
          <Button 
            variant="contained" 
            size="small"
            sx={{ 
              borderRadius: '20px',
              px: 2
            }}
          >
            Gerar Relatório
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Cards de estatísticas principais */}
        <Grid item xs={12}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" fontWeight={600} color="primary.main" gutterBottom>
              📊 Resumo Executivo
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard 
            title="Total de Atendimentos" 
            value={dashboardData.stats.totalAppointments} 
            icon={<Today fontSize="small" />}
            color="primary"
            subtitle="vs. mês anterior"
            trend={dashboardData.stats.appointmentsTrend}
            onClick={() => navigate('/appointments')}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard 
            title="Receita do Mês" 
            value={formatCurrency(dashboardData.stats.revenue.current)} 
            icon={<AttachMoney fontSize="small" />}
            color="success"
            subtitle="vs. mês anterior"
            trend={dashboardData.stats.revenueTrend}
            onClick={() => navigate('/financas')}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard 
            title="Clientes Ativos" 
            value={dashboardData.stats.activeClients} 
            icon={<PeopleAlt fontSize="small" />}
            color="secondary"
            subtitle={`${dashboardData.stats.newClients} novos`}
            trend={dashboardData.stats.clientsTrend}
            onClick={() => navigate('/clients')}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard 
            title="Taxa de Confirmação" 
            value={`${dashboardData.stats.confirmationRate}%`} 
            icon={<Assignment fontSize="small" />}
            color="info"
            subtitle="média do mês"
            onClick={() => navigate('/appointments')}
          />
        </Grid>
        
        {/* Taxa de confirmação detalhada */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardHeader 
              title="Status dos Agendamentos" 
              subheader="Últimos 30 dias"
              action={
                <Button 
                  size="small" 
                  color="primary"
                  onClick={() => navigate('/appointments')}
                >
                  Ver todos
                </Button>
              }
            />
            <Divider />
            <CardContent>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Taxa de Confirmação</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {dashboardData.stats.confirmationRate}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={dashboardData.stats.confirmationRate} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    mb: 2
                  }} 
                />
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center', 
                      bgcolor: 'grey.50',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: 'success.50',
                        transform: 'translateY(-2px)',
                        boxShadow: 2
                      }
                    }}
                    onClick={() => navigate('/appointments?status=confirmed')}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Confirmados
                    </Typography>
                    <Typography variant="h5" fontWeight={600} color="success.main">
                      {dashboardData.stats.confirmedSessions}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center', 
                      bgcolor: 'grey.50',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: 'warning.50',
                        transform: 'translateY(-2px)',
                        boxShadow: 2
                      }
                    }}
                    onClick={() => navigate('/appointments?status=pending')}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Pendentes
                    </Typography>
                    <Typography variant="h5" fontWeight={600} color="warning.main">
                      {dashboardData.stats.pendingSessions}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center', 
                      bgcolor: 'grey.50',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: 'error.50',
                        transform: 'translateY(-2px)',
                        boxShadow: 2
                      }
                    }}
                    onClick={() => navigate('/appointments?status=canceled')}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Cancelados
                    </Typography>
                    <Typography variant="h5" fontWeight={600} color="error.main">
                      {dashboardData.stats.canceledSessions}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Próximos agendamentos */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader 
              title="Próximos Atendimentos" 
              action={
                <Button 
                  size="small" 
                  color="primary"
                  onClick={() => navigate('/appointments')}
                >
                  Ver todos
                </Button>
              }
            />
            <Divider />
            <List sx={{ py: 0 }}>
              {dashboardData.upcomingAppointments.length > 0 ? (
                dashboardData.upcomingAppointments.map((appointment) => (
                  <ListItem 
                    key={appointment.id} 
                    divider
                    sx={{ 
                      cursor: 'pointer',
                      borderRadius: 1,
                      '&:hover': { 
                        bgcolor: 'action.hover' 
                      }
                    }}
                    onClick={() => navigate(`/appointments?appointment=${appointment.id}`)}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <Person />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" fontWeight={500}>
                            {appointment.clientName}
                          </Typography>
                          <Chip 
                            label={getStatusLabel(appointment.status)}
                            color={getStatusColor(appointment.status) as any}
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="caption" component="span">
                            {format(new Date(appointment.date), "d 'de' MMMM", { locale: ptBR })}
                            {' às '}
                            {appointment.time}
                          </Typography>
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            {appointment.service} • {appointment.therapistName}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText 
                    primary="Nenhum agendamento próximo"
                    secondary="Todos os agendamentos foram concluídos"
                    sx={{ textAlign: 'center', py: 2 }}
                  />
                </ListItem>
              )}
            </List>
            <Box sx={{ p: 2 }}>
              <Button 
                variant="outlined" 
                fullWidth
                onClick={() => navigate('/appointments')}
                startIcon={<CalendarMonth />}
              >
                Novo Agendamento
              </Button>
            </Box>
          </Card>
        </Grid>

        {/* Distribuição por Terapeuta */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Atendimentos por Terapeuta" 
              subheader="Este mês"
              action={
                <Button 
                  size="small" 
                  color="primary"
                  onClick={() => navigate('/therapists')}
                >
                  Ver todos
                </Button>
              }
            />
            <Divider />
            <CardContent>
              <List>
                {dashboardData.appointmentsByTherapist.map((therapist, index) => (
                  <ListItem 
                    key={therapist.therapistId} 
                    divider={index < dashboardData.appointmentsByTherapist.length - 1}
                    sx={{ 
                      cursor: 'pointer',
                      borderRadius: 1,
                      '&:hover': { 
                        bgcolor: 'action.hover' 
                      }
                    }}
                    onClick={() => navigate('/therapists')}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'secondary.light' }}>
                        <LocalHospital />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={therapist.therapistName}
                      secondary={`${therapist.count} atendimentos`}
                    />
                    <Box sx={{ minWidth: 100, textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight={600}>
                        {therapist.percentage}%
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={therapist.percentage} 
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Distribuição de Serviços */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Serviços Mais Procurados" 
              subheader="Este mês"
              action={
                <Button 
                  size="small" 
                  color="primary"
                  onClick={() => navigate('/services')}
                >
                  Ver todos
                </Button>
              }
            />
            <Divider />
            <CardContent>
              <List>
                {dashboardData.serviceDistribution.map((service, index) => (
                  <ListItem 
                    key={service.serviceId} 
                    divider={index < dashboardData.serviceDistribution.length - 1}
                    sx={{ 
                      cursor: 'pointer',
                      borderRadius: 1,
                      '&:hover': { 
                        bgcolor: 'action.hover' 
                      }
                    }}
                    onClick={() => navigate('/services')}
                  >
                    <ListItemText 
                      primary={service.serviceName}
                      secondary={`${service.count} agendamentos`}
                    />
                    <Box sx={{ minWidth: 100, textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight={600} color="primary">
                        {service.percentage}%
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={service.percentage} 
                        sx={{ mt: 1 }}
                        color="primary"
                      />
                    </Box>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* CSS para animação de rotação */}
      <style jsx>{`
        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .rotating {
          animation: rotate 1s linear infinite;
        }
      `}</style>
    </Box>
  );
};

export default Dashboard;