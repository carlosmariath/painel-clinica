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
  Button
} from "@mui/material";
import { 
  BarChart, 
  TrendingUp, 
  TrendingDown, 
  PeopleAlt, 
  Today, 
  Person,
  MoreVert
} from "@mui/icons-material";
import { getDashboardStats } from "../services/dashboardService";
import { useNotification } from "../components/Notification";
import { useNavigate } from "react-router-dom";

// Interface para as props do StatCard
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  trend?: number;
}

// Componente para exibir um cartão de estatística
const StatCard = ({ title, value, icon, color, subtitle, trend }: StatCardProps) => {
  const isPositiveTrend = trend && trend > 0;
  
  return (
    <Card sx={{ height: '100%', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
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
          {value}
        </Typography>
        
        {trend && (
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
            <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
              {subtitle}
            </Typography>
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
  const [dashboardData, setDashboardData] = useState({
    totalAppointments: 0,
    confirmedSessions: 0,
    canceledSessions: 0,
    clientsCount: 0,
    // Dados de exemplo para completar o layout (para um projeto real, viriam da API)
    appointmentsTrend: 5.2,
    clientsTrend: 3.7,
    confirmationRate: 82,
    upcomingAppointments: [
      { id: 1, client: "Maria Silva", time: "14:30", date: "Hoje", avatarColor: "primary.main" },
      { id: 2, client: "João Oliveira", time: "10:00", date: "Amanhã", avatarColor: "secondary.main" },
      { id: 3, client: "Ana Santos", time: "15:45", date: "Quarta-feira", avatarColor: "success.main" }
    ]
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Em um projeto real, esta chamada traria todos os dados necessários
        const data = await getDashboardStats();
        setDashboardData(prev => ({
          ...prev,
          ...data
        }));
      } catch (error) {
        showNotification("Erro ao carregar dados da dashboard", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <BarChart fontSize="large" color="primary" sx={{ mr: 1.5 }} />
          <Typography variant="h4" fontWeight={700}>
            Dashboard
          </Typography>
        </Box>
        
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

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Cards de estatísticas */}
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Total de Atendimentos" 
              value={dashboardData.totalAppointments} 
              icon={<Today fontSize="small" />}
              color="primary"
              subtitle="vs. mês anterior"
              trend={dashboardData.appointmentsTrend}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Sessões Confirmadas" 
              value={dashboardData.confirmedSessions} 
              icon={<BarChart fontSize="small" />}
              color="success"
              subtitle="de todos agendamentos"
              trend={dashboardData.confirmationRate}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Cancelamentos" 
              value={dashboardData.canceledSessions} 
              icon={<TrendingDown fontSize="small" />}
              color="error"
              subtitle="comparado ao esperado"
              trend={-2.4}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Total de Clientes" 
              value={dashboardData.clientsCount} 
              icon={<PeopleAlt fontSize="small" />}
              color="secondary"
              subtitle="vs. mês anterior"
              trend={dashboardData.clientsTrend}
            />
          </Grid>
          
          {/* Taxa de confirmação */}
          <Grid item xs={12} md={8}>
            <Card sx={{ height: '100%' }}>
              <CardHeader 
                title="Taxa de Confirmação" 
                subheader="Últimos 30 dias"
                action={
                  <IconButton aria-label="configurações">
                    <MoreVert />
                  </IconButton>
                }
              />
              <Divider />
              <CardContent>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Taxa de Confirmação</Typography>
                    <Typography variant="body2" fontWeight={600}>{dashboardData.confirmationRate}%</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={dashboardData.confirmationRate} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      mb: 2
                    }} 
                  />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Total Agendado</Typography>
                    <Typography variant="h6" fontWeight={600}>{dashboardData.totalAppointments}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Confirmados</Typography>
                    <Typography variant="h6" fontWeight={600} color="success.main">{dashboardData.confirmedSessions}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Cancelados</Typography>
                    <Typography variant="h6" fontWeight={600} color="error.main">{dashboardData.canceledSessions}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Próximos agendamentos */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardHeader 
                title="Próximos Atendimentos" 
                action={
                  <Button size="small" color="primary">
                    Ver todos
                  </Button>
                }
              />
              <Divider />
              <List sx={{ py: 0 }}>
                {dashboardData.upcomingAppointments.map((appointment) => (
                  <ListItem key={appointment.id} divider>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: appointment.avatarColor }}>
                        <Person />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={appointment.client}
                      secondary={`${appointment.date}, ${appointment.time}`}
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </ListItem>
                ))}
              </List>
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Button 
                  variant="outlined" 
                  fullWidth
                  onClick={() => navigate('/appointments')}
                >
                  Gerenciar Agendamentos
                </Button>
              </Box>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Dashboard;