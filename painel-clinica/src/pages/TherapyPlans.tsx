import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Chip,
  Grid,
  Card,
  CardContent,
  TablePagination,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { TherapyPlan, therapyPlanService } from '../services/therapyPlanService';
import { useBranch } from '../context/BranchContext';
import TherapyPlanForm from '../components/TherapyPlanForm';
import { CURRENCY_LOCALE, CURRENCY_OPTIONS } from '../config';

const TherapyPlans = () => {
  const { currentBranch } = useBranch();
  const [plans, setPlans] = useState<TherapyPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openForm, setOpenForm] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<TherapyPlan | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [planToDelete, setPlanToDelete] = useState<TherapyPlan | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Carregar planos
  useEffect(() => {
    loadPlans();
  }, [currentBranch]);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const data = await therapyPlanService.getPlans(currentBranch?.id);
      setPlans(data);
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlan = () => {
    setSelectedPlan(undefined);
    setOpenForm(true);
  };

  const handleEditPlan = (plan: TherapyPlan) => {
    setSelectedPlan(plan);
    setOpenForm(true);
  };

  const handleDeleteClick = (plan: TherapyPlan) => {
    setPlanToDelete(plan);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!planToDelete) return;
    
    try {
      await therapyPlanService.deletePlan(planToDelete.id);
      setPlans(plans.filter(plan => plan.id !== planToDelete.id));
      setDeleteDialogOpen(false);
      setPlanToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir plano:', error);
    }
  };

  const handleFormSubmit = async (data: Omit<TherapyPlan, 'id'>) => {
    try {
      if (selectedPlan) {
        // Atualizar plano existente
        await therapyPlanService.updatePlan(selectedPlan.id, data);
      } else {
        // Criar novo plano
        await therapyPlanService.createPlan(data);
      }
      // Recarregar lista de planos
      loadPlans();
    } catch (error) {
      console.error('Erro ao salvar plano:', error);
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Métricas dos planos
  const activePlansCount = plans.filter(plan => plan.isActive).length;
  const inactivePlansCount = plans.length - activePlansCount;
  const averagePrice = plans.length > 0
    ? plans.reduce((acc, plan) => acc + plan.price, 0) / plans.length
    : 0;
  const averageSessions = plans.length > 0
    ? plans.reduce((acc, plan) => acc + plan.sessionCount, 0) / plans.length
    : 0;

  // Aplicar paginação
  const displayedPlans = plans.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h4" component="h1" gutterBottom>
                Planos de Terapia
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
          </Grid>

          {/* Cards de métricas */}
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total de Planos
                </Typography>
                <Typography variant="h5" component="div">
                  {plans.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Planos Ativos
                </Typography>
                <Typography variant="h5" component="div" color="success.main">
                  {activePlansCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Preço Médio
                </Typography>
                <Typography variant="h5" component="div">
                  {new Intl.NumberFormat(CURRENCY_LOCALE, CURRENCY_OPTIONS).format(averagePrice)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Média de Sessões
                </Typography>
                <Typography variant="h5" component="div">
                  {averageSessions.toFixed(1)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Tabela de planos */}
          <Grid item xs={12}>
            <Paper elevation={2}>
              {loading ? (
                <Box display="flex" justifyContent="center" p={3}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Nome</TableCell>
                          <TableCell>Sessões</TableCell>
                          <TableCell>Validade (dias)</TableCell>
                          <TableCell align="right">Preço</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Filial</TableCell>
                          <TableCell align="center">Ações</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {displayedPlans.length > 0 ? (
                          displayedPlans.map((plan) => (
                            <TableRow key={plan.id}>
                              <TableCell>
                                <Typography variant="body2" fontWeight="medium">
                                  {plan.name}
                                </Typography>
                                {plan.description && (
                                  <Typography variant="caption" color="text.secondary">
                                    {plan.description}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>{plan.sessionCount}</TableCell>
                              <TableCell>{plan.validityDays}</TableCell>
                              <TableCell align="right">
                                {new Intl.NumberFormat(CURRENCY_LOCALE, CURRENCY_OPTIONS).format(plan.price)}
                              </TableCell>
                              <TableCell>
                                {plan.isActive ? (
                                  <Chip label="Ativo" color="success" size="small" />
                                ) : (
                                  <Chip label="Inativo" color="default" size="small" />
                                )}
                              </TableCell>
                              <TableCell>
                                {currentBranch?.id === plan.branchId ? currentBranch.name : plan.branchId}
                              </TableCell>
                              <TableCell align="center">
                                <Tooltip title="Editar">
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => handleEditPlan(plan)}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Excluir">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteClick(plan)}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} align="center">
                              <Box py={2}>
                                <Typography variant="subtitle1" color="text.secondary">
                                  Nenhum plano de terapia encontrado
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={plans.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Itens por página"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                  />
                </>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Formulário de plano */}
      <TherapyPlanForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedPlan}
        title={selectedPlan ? 'Editar Plano de Terapia' : 'Novo Plano de Terapia'}
      />

      {/* Diálogo de confirmação de exclusão */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir o plano "{planToDelete?.name}"?
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

export default TherapyPlans; 