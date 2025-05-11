import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Paper, 
  Button, 
  Container, 
  Grid, 
  TextField, 
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Box,
  TablePagination,
  FormControlLabel,
  Switch,
  CircularProgress
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon
} from '@mui/icons-material';
import { getBranches, createBranch, updateBranch, deactivateBranch, getBranchSummary } from '../services/branchService';
import { Branch, BranchWithStats } from '../types/branch';
import { useSnackbar } from 'notistack';
import axios from 'axios';

interface ApiErrorResponse {
  message: string;
  statusCode: number;
}

const Branches: React.FC = () => {
  // Estados
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [branchDetails, setBranchDetails] = useState<BranchWithStats | null>(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const { enqueueSnackbar } = useSnackbar();

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: ''
  });

  // Função auxiliar para extrair mensagem de erro da resposta da API
  const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error) && error.response?.data) {
      // Tentar extrair a mensagem de erro da resposta da API
      const errorData = error.response.data as ApiErrorResponse;
      return errorData.message || 'Ocorreu um erro na operação';
    }
    
    return 'Ocorreu um erro na comunicação com o servidor';
  };

  // Buscar filiais
  const fetchBranches = async () => {
    setLoading(true);
    try {
      const data = await getBranches(includeInactive);
      setBranches(data);
    } catch (error: unknown) {
      console.error('Erro ao buscar filiais:', error);
      enqueueSnackbar(getErrorMessage(error), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Buscar detalhes da filial
  const fetchBranchDetails = async (id: string) => {
    try {
      const data = await getBranchSummary(id);
      setBranchDetails(data);
      setOpenDetailsDialog(true);
    } catch (error: unknown) {
      console.error('Erro ao buscar detalhes da filial:', error);
      enqueueSnackbar(getErrorMessage(error), { variant: 'error' });
    }
  };

  // Carregar filiais quando o componente é montado
  useEffect(() => {
    fetchBranches();
  }, [includeInactive]);

  // Manipuladores para os diálogos
  const handleCreateDialogOpen = () => {
    setFormData({ name: '', address: '', phone: '', email: '' });
    setOpenCreateDialog(true);
  };

  const handleEditDialogOpen = (branch: Branch) => {
    setSelectedBranch(branch);
    setFormData({
      name: branch.name,
      address: branch.address,
      phone: branch.phone,
      email: branch.email || ''
    });
    setOpenEditDialog(true);
  };

  const handleDeleteDialogOpen = (branch: Branch) => {
    setSelectedBranch(branch);
    setOpenDeleteDialog(true);
  };

  const handleDetailsDialogOpen = (branchId: string) => {
    fetchBranchDetails(branchId);
  };

  const handleDialogClose = () => {
    setOpenCreateDialog(false);
    setOpenEditDialog(false);
    setOpenDeleteDialog(false);
    setOpenDetailsDialog(false);
    setSelectedBranch(null);
    setBranchDetails(null);
  };

  // Manipuladores de formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Ações CRUD
  const handleCreateBranch = async () => {
    try {
      await createBranch(formData);
      enqueueSnackbar('Filial criada com sucesso!', { variant: 'success' });
      handleDialogClose();
      fetchBranches();
    } catch (error: unknown) {
      console.error('Erro ao criar filial:', error);
      enqueueSnackbar(getErrorMessage(error), { variant: 'error' });
    }
  };

  const handleUpdateBranch = async () => {
    if (!selectedBranch) return;
    
    try {
      await updateBranch(selectedBranch.id, formData);
      enqueueSnackbar('Filial atualizada com sucesso!', { variant: 'success' });
      handleDialogClose();
      fetchBranches();
    } catch (error: unknown) {
      console.error('Erro ao atualizar filial:', error);
      enqueueSnackbar(getErrorMessage(error), { variant: 'error' });
    }
  };

  const handleDeactivateBranch = async () => {
    if (!selectedBranch) return;
    
    try {
      await deactivateBranch(selectedBranch.id);
      enqueueSnackbar('Filial desativada com sucesso!', { variant: 'success' });
      handleDialogClose();
      fetchBranches();
    } catch (error: unknown) {
      console.error('Erro ao desativar filial:', error);
      enqueueSnackbar(getErrorMessage(error), { variant: 'error' });
    }
  };

  const handleReactivateBranch = async () => {
    if (!selectedBranch) return;
    
    try {
      await updateBranch(selectedBranch.id, { isActive: true });
      enqueueSnackbar('Filial reativada com sucesso!', { variant: 'success' });
      handleDialogClose();
      fetchBranches();
    } catch (error: unknown) {
      console.error('Erro ao reativar filial:', error);
      enqueueSnackbar(getErrorMessage(error), { variant: 'error' });
    }
  };

  // Manipuladores de paginação
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Renderização da tabela
  const renderBranchesTable = () => {
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, branches.length - page * rowsPerPage);
    
    return (
      <>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Status</TableCell>
                <TableCell>Nome</TableCell>
                <TableCell>Endereço</TableCell>
                <TableCell>Telefone</TableCell>
                <TableCell>Email</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {branches
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((branch) => (
                <TableRow key={branch.id} hover>
                  <TableCell>
                    {branch.isActive ? (
                      <Chip 
                        icon={<ActiveIcon fontSize="small" />} 
                        label="Ativa" 
                        size="small" 
                        color="success" 
                      />
                    ) : (
                      <Chip 
                        icon={<InactiveIcon fontSize="small" />} 
                        label="Inativa" 
                        size="small" 
                        color="error" 
                      />
                    )}
                  </TableCell>
                  <TableCell>{branch.name}</TableCell>
                  <TableCell>{branch.address}</TableCell>
                  <TableCell>{branch.phone}</TableCell>
                  <TableCell>{branch.email || '-'}</TableCell>
                  <TableCell align="center">
                    <IconButton 
                      size="small" 
                      color="primary" 
                      onClick={() => handleDetailsDialogOpen(branch.id)}
                      title="Ver detalhes"
                    >
                      <i className="material-icons">info</i>
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="primary" 
                      onClick={() => handleEditDialogOpen(branch)}
                      title="Editar"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    {branch.isActive ? (
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => handleDeleteDialogOpen(branch)}
                        title="Desativar"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    ) : (
                      <IconButton 
                        size="small" 
                        color="success" 
                        onClick={() => {
                          setSelectedBranch(branch);
                          handleReactivateBranch();
                        }}
                        title="Reativar"
                      >
                        <ActiveIcon fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
              {branches.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="subtitle1" color="textSecondary">
                      Nenhuma filial encontrada
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={branches.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Itens por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" gutterBottom component="h2">
            Gerenciamento de Filiais
          </Typography>
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={includeInactive}
                  onChange={(e) => setIncludeInactive(e.target.checked)}
                  color="primary"
                />
              }
              label="Incluir inativas"
            />
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={handleCreateDialogOpen}
            >
              Nova Filial
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            {loading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : (
              renderBranchesTable()
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Diálogo de Criação */}
      <Dialog open={openCreateDialog} onClose={handleDialogClose} fullWidth maxWidth="sm">
        <DialogTitle>Nova Filial</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Nome"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <TextField
            margin="dense"
            name="address"
            label="Endereço"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.address}
            onChange={handleInputChange}
            required
          />
          <TextField
            margin="dense"
            name="phone"
            label="Telefone"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.phone}
            onChange={handleInputChange}
            required
          />
          <TextField
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={formData.email}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="inherit">Cancelar</Button>
          <Button 
            onClick={handleCreateBranch} 
            color="primary" 
            variant="contained"
            disabled={!formData.name || !formData.address || !formData.phone}
          >
            Criar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de Edição */}
      <Dialog open={openEditDialog} onClose={handleDialogClose} fullWidth maxWidth="sm">
        <DialogTitle>Editar Filial</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Nome"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <TextField
            margin="dense"
            name="address"
            label="Endereço"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.address}
            onChange={handleInputChange}
            required
          />
          <TextField
            margin="dense"
            name="phone"
            label="Telefone"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.phone}
            onChange={handleInputChange}
            required
          />
          <TextField
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={formData.email}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="inherit">Cancelar</Button>
          <Button 
            onClick={handleUpdateBranch} 
            color="primary" 
            variant="contained"
            disabled={!formData.name || !formData.address || !formData.phone}
          >
            Atualizar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de Confirmação para Desativação */}
      <Dialog open={openDeleteDialog} onClose={handleDialogClose}>
        <DialogTitle>Desativar Filial</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja desativar a filial {selectedBranch?.name}? 
            Esta ação não pode ser desfeita diretamente.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="inherit">Cancelar</Button>
          <Button onClick={handleDeactivateBranch} color="error" variant="contained">
            Desativar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de Detalhes da Filial */}
      <Dialog open={openDetailsDialog} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>Detalhes da Filial</DialogTitle>
        <DialogContent>
          {branchDetails ? (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Nome:</strong> {branchDetails.name}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Endereço:</strong> {branchDetails.address}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Telefone:</strong> {branchDetails.phone}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Email:</strong> {branchDetails.email || '-'}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Status:</strong> {branchDetails.isActive ? 'Ativa' : 'Inativa'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Estatísticas
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Paper elevation={2} sx={{ p: 2, flex: '1 0 40%', textAlign: 'center' }}>
                    <Typography variant="h6" color="primary">
                      {branchDetails.stats.therapists}
                    </Typography>
                    <Typography variant="body2">Terapeutas</Typography>
                  </Paper>
                  <Paper elevation={2} sx={{ p: 2, flex: '1 0 40%', textAlign: 'center' }}>
                    <Typography variant="h6" color="primary">
                      {branchDetails.stats.users}
                    </Typography>
                    <Typography variant="body2">Usuários</Typography>
                  </Paper>
                  <Paper elevation={2} sx={{ p: 2, flex: '1 0 40%', textAlign: 'center' }}>
                    <Typography variant="h6" color="primary">
                      {branchDetails.stats.services}
                    </Typography>
                    <Typography variant="body2">Serviços</Typography>
                  </Paper>
                  <Paper elevation={2} sx={{ p: 2, flex: '1 0 40%', textAlign: 'center' }}>
                    <Typography variant="h6" color="primary">
                      {branchDetails.stats.activeAppointments}
                    </Typography>
                    <Typography variant="body2">Agendamentos Ativos</Typography>
                  </Paper>
                </Box>
              </Grid>
            </Grid>
          ) : (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">Fechar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Branches; 