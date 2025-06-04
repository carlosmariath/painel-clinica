import { Container, Typography, Box } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import TherapistAvailabilityManager from '../components/TherapistAvailabilityManager';

const TherapistAvailability = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <Container>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>Gerenciamento de Disponibilidade</Typography>
        <Typography variant="body1" color="text.secondary">
          {isAdmin 
            ? "Gerencie a disponibilidade dos terapeutas em cada filial." 
            : "Configure seus horários de atendimento em cada filial."}
        </Typography>
      </Box>

      <TherapistAvailabilityManager 
        therapistId={!isAdmin ? user?.id : undefined}
        isAdmin={isAdmin}
      />
    </Container>
  );
};

export default TherapistAvailability; 