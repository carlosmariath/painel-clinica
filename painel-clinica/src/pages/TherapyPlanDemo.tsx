import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { TherapyPlan } from '../services/therapyPlanService';
import TherapyPlanForm from '../components/TherapyPlanForm';
import { useBranch } from '../context/BranchContext';

/**
 * Página de demonstração para o módulo de Planos de Terapia
 * Essa página simula a integração com o backend usando dados mockados
 */
const TherapyPlanDemo = () => {
  const { currentBranch, branches } = useBranch();
  const [plans, setPlans] = useState<TherapyPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [openForm, setOpenForm] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<TherapyPlan | undefined>(undefined);

  // Simulação de carregamento de planos
  useEffect(() => {
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

    setLoading(true);
    // Simular um carregamento assíncrono
    setTimeout(() => {
      setPlans(mockPlans);
      setLoading(false);
    }, 500);
  }, [branches]);

  const handleAddPlan = () => {
    setSelectedPlan(undefined);
    setOpenForm(true);
  };

  const handleFormSubmit = (data: Omit<TherapyPlan, 'id'>) => {
    // Simular a criação/edição de um plano
    if (selectedPlan) {
      // Atualizando um plano existente
      const updatedPlans = plans.map(plan => 
        plan.id === selectedPlan.id ? { ...plan, ...data } : plan
      );
      setPlans(updatedPlans);
    } else {
      // Criando um novo plano
      const newPlan: TherapyPlan = {
        ...data,
        id: Math.random().toString(36).substr(2, 9) // ID aleatório para demonstração
      };
      setPlans([...plans, newPlan]);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" component="h1">
            Demonstração - Planos de Terapia
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddPlan}
          >
            Novo Plano
          </Button>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Planos Cadastrados
            </Typography>
            
            {plans.length === 0 ? (
              <Typography color="textSecondary">
                Nenhum plano cadastrado. Clique no botão "Novo Plano" para começar.
              </Typography>
            ) : (
              <Box>
                {plans.map((plan) => (
                  <Box 
                    key={plan.id} 
                    p={2} 
                    mb={2} 
                    border="1px solid #e0e0e0" 
                    borderRadius={1}
                  >
                    <Typography variant="h6">{plan.name}</Typography>
                    <Typography color="textSecondary" gutterBottom>
                      {plan.description}
                    </Typography>
                    <Typography>
                      <strong>Sessões:</strong> {plan.sessionCount} | 
                      <strong> Validade:</strong> {plan.validityDays} dias | 
                      <strong> Preço:</strong> R$ {plan.price.toFixed(2)} |
                      <strong> Status:</strong> {plan.isActive ? 'Ativo' : 'Inativo'}
                    </Typography>
                    <Box mt={1}>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        color="primary"
                        onClick={() => {
                          setSelectedPlan(plan);
                          setOpenForm(true);
                        }}
                      >
                        Editar
                      </Button>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        )}
      </Box>

      {/* Formulário de plano */}
      <TherapyPlanForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedPlan}
        title={selectedPlan ? 'Editar Plano de Terapia' : 'Novo Plano de Terapia'}
      />
    </Container>
  );
};

export default TherapyPlanDemo; 