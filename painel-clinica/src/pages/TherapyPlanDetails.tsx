import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Divider,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardHeader
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { CURRENCY_LOCALE, CURRENCY_OPTIONS } from '../config';
import { therapyPlanService } from '../services/therapyPlanService';
import { branchService } from '../services/branchService';
import { TherapyPlan } from '../types/therapyPlan';
import { Branch } from '../types/branch';

const TherapyPlanDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<TherapyPlan | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [availableBranches, setAvailableBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [addBranchDialogOpen, setAddBranchDialogOpen] = useState<boolean>(false);
  const [removingBranchId, setRemovingBranchId] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Carregar dados do plano
  useEffect(() => {
    if (!id) return;
    
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Carregar detalhes do plano
        const planData = await therapyPlanService.getPlanById(id);
        setPlan(planData);
        
        // Carregar filiais disponíveis
        const branchesData = await branchService.getBranches();
        setAvailableBranches(branchesData);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Não foi possível carregar os detalhes do plano. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id]);

  const handleAddBranch = async () => {
    if (!id || !selectedBranchId || !plan) return;
    
    try {
      setActionLoading(true);
      
      // Verificar se a filial já está associada ao plano
      const isAlreadyAssociated = plan.branches.some(branch => branch.id === selectedBranchId);
      
      if (isAlreadyAssociated) {
        setError('Esta filial já está associada ao plano.');
        return;
      }
      
      // Adicionar a filial ao plano
      const updatedPlan = await therapyPlanService.addBranchToPlan(id, selectedBranchId);
      setPlan(updatedPlan);
      setSelectedBranchId('');
      setAddBranchDialogOpen(false);
    } catch (err) {
      console.error('Erro ao adicionar filial:', err);
      setError('Não foi possível adicionar a filial ao plano. Por favor, tente novamente.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveBranch = async () => {
    if (!id || !removingBranchId || !plan) return;
    
    try {
      setActionLoading(true);
      
      // Verificar se é a última filial
      if (plan.branches.length <= 1) {
        setError('Não é possível remover a última filial. O plano deve ter pelo menos uma filial associada.');
        setConfirmDialogOpen(false);
        setRemovingBranchId(null);
        return;
      }
      
      // Remover a filial do plano
      const updatedPlan = await therapyPlanService.removeBranchFromPlan(id, removingBranchId);
      setPlan(updatedPlan);
      setConfirmDialogOpen(false);
      setRemovingBranchId(null);
    } catch (err) {
      console.error('Erro ao remover filial:', err);
      setError('Não foi possível remover a filial do plano. Por favor, tente novamente.');
    } finally {
      setActionLoading(false);
    }
  };

  // Filial que não estão associadas ao plano
  const notAssociatedBranches = plan 
    ? availableBranches.filter(branch => !plan.branches.some(pb => pb.id === branch.id))
    : [];

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error && !plan) {
    return (
      <Container maxWidth="lg">
        <Box mt={4}>
          <Alert severity="error">{error}</Alert>
          <Box mt={2}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/therapy-plans')}
            >
              Voltar para a lista de planos
            </Button>
          </Box>
        </Box>
      </Container>
    );
  }

  if (!plan) {
    return (
      <Container maxWidth="lg">
        <Box mt={4}>
          <Alert severity="warning">Plano não encontrado.</Alert>
          <Box mt={2}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/therapy-plans')}
            >
              Voltar para a lista de planos
            </Button>
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        {/* Cabeçalho */}
        <Box display="flex" alignItems="center" mb={3}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/therapy-plans')}
            sx={{ mr: 2 }}
          >
            Voltar
          </Button>
          <Typography variant="h4" component="h1">
            Detalhes do Plano
          </Typography>
        </Box>
        
        {/* Mensagem de erro */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {/* Cartão com informações do plano */}
        <Card sx={{ mb: 4 }}>
          <CardHeader
            title={plan.name}
            subheader={
              <Chip 
                label={plan.isActive ? 'Ativo' : 'Inativo'} 
                color={plan.isActive ? 'success' : 'default'} 
                size="small" 
                sx={{ mt: 1 }}
              />
            }
          />
          <Divider />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  {plan.description || 'Sem descrição'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Detalhes do plano
                  </Typography>
                  
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      Preço:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {new Intl.NumberFormat(CURRENCY_LOCALE, CURRENCY_OPTIONS).format(plan.totalPrice)}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      Sessões:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {plan.totalSessions}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Validade:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {plan.validityDays} dias
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        
        {/* Seção de filiais */}
        <Box mb={4}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Filiais Associadas
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAddBranchDialogOpen(true)}
              disabled={notAssociatedBranches.length === 0}
            >
              Adicionar Filial
            </Button>
          </Box>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nome da Filial</TableCell>
                  <TableCell>Endereço</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {plan.branches.length > 0 ? (
                  plan.branches.map((branch) => {
                    // Busca informações completas da filial 
                    const fullBranch = availableBranches.find(b => b.id === branch.id);
                    
                    return (
                      <TableRow key={branch.id}>
                        <TableCell>{branch.name}</TableCell>
                        <TableCell>{fullBranch?.address || '-'}</TableCell>
                        <TableCell align="center">
                          <IconButton
                            color="error"
                            onClick={() => {
                              setRemovingBranchId(branch.id);
                              setConfirmDialogOpen(true);
                            }}
                            disabled={plan.branches.length <= 1}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      Nenhuma filial associada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
      
      {/* Diálogo para adicionar filial */}
      <Dialog open={addBranchDialogOpen} onClose={() => setAddBranchDialogOpen(false)}>
        <DialogTitle>Adicionar Filial</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="branch-select-label">Filial</InputLabel>
            <Select
              labelId="branch-select-label"
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value as string)}
              label="Filial"
            >
              {notAssociatedBranches.length > 0 ? (
                notAssociatedBranches.map((branch) => (
                  <MenuItem key={branch.id} value={branch.id}>
                    <ListItemText 
                      primary={branch.name} 
                      secondary={branch.address} 
                    />
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>
                  <ListItemText primary="Todas as filiais já estão associadas a este plano" />
                </MenuItem>
              )}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddBranchDialogOpen(false)} color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={handleAddBranch} 
            color="primary" 
            disabled={!selectedBranchId || actionLoading}
            startIcon={actionLoading ? <CircularProgress size={20} /> : null}
          >
            {actionLoading ? 'Adicionando...' : 'Adicionar'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Diálogo de confirmação para remover filial */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Confirmar Remoção</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja remover esta filial do plano?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={handleRemoveBranch} 
            color="error" 
            disabled={actionLoading}
            startIcon={actionLoading ? <CircularProgress size={20} /> : null}
          >
            {actionLoading ? 'Removendo...' : 'Remover'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TherapyPlanDetails; 