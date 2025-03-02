import { useEffect, useState } from "react";
import { Container, Typography, Grid, Paper, CircularProgress } from "@mui/material";
import { BarChart } from "@mui/icons-material";
import { getDashboardStats } from "../services/dashboardService";
import { useNotification } from "../components/Notification";

const Dashboard = () => {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalAppointments: 0,
    confirmedSessions: 0,
    canceledSessions: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDashboardStats();
        setDashboardData(data);
      } catch (error) {
        showNotification("Erro ao carregar dados da dashboard", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <BarChart fontSize="large" />
        Dashboard
      </Typography>

      {loading ? (
        <CircularProgress sx={{ mt: 3 }} />
      ) : (
        <Grid container spacing={3} sx={{ mt: 3, justifyContent: "center" }}>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 3, textAlign: "center", backgroundColor: "#E3F2FD" }}>
              <Typography variant="h6">Total de Atendimentos</Typography>
              <Typography variant="h4">{dashboardData.totalAppointments}</Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 3, textAlign: "center", backgroundColor: "#C8E6C9" }}>
              <Typography variant="h6">Sessões Confirmadas</Typography>
              <Typography variant="h4">{dashboardData.confirmedSessions}</Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 3, textAlign: "center", backgroundColor: "#FFCDD2" }}>
              <Typography variant="h6">Cancelamentos</Typography>
              <Typography variant="h4">{dashboardData.canceledSessions}</Typography>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default Dashboard;