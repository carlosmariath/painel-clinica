import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { getServices, createService, updateService, deleteService } from '../services/serviceService';
import { useSnackbar } from 'notistack';
import BranchSelector from '../components/BranchSelector';
import { useBranch } from '../context/BranchContext';
import { Service } from '../types/service';

const Services: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { currentBranch } = useBranch();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    averageDuration: 60,
    branchId: ''
  });

  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await getServices();
      setServices(data);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
      enqueueSnackbar('Erro ao carregar serviços', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleOpenForm = (service: Service | null = null) => {
    if (service) {
      setSelectedService(service);
      setFormData({
        name: service.name,
        description: service.description || '',
        price: service.price,
        averageDuration: service.averageDuration,
        branchId: service.branchId || currentBranch?.id || ''
      });
    } else {
      setSelectedService(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        averageDuration: 60,
        branchId: currentBranch?.id || ''
      });
    }
    setOpenForm(true);
  };

  const handleOpenDelete = (service: Service) => {
    setSelectedService(service);
    setOpenDelete(true);
  };

  const handleCloseDialog = () => {
    setOpenForm(false);
    setOpenDelete(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'price' || name === 'averageDuration' ? parseFloat(value) : value
    });
  };

  const handleBranchChange = (branchId: string | null) => {
    setFormData({
      ...formData,
      branchId: branchId || ''
    });
  };

  const handleSaveService = async () => {
    try {
      if (selectedService) {
        await updateService(selectedService.id, formData);
        enqueueSnackbar('Serviço atualizado com sucesso', { variant: 'success' });
      } else {
        await createService(formData);
        enqueueSnackbar('Serviço criado com sucesso', { variant: 'success' });
      }
      handleCloseDialog();
      fetchServices();
    } catch (error) {
      console.error('Erro ao salvar serviço:', error);
      enqueueSnackbar('Erro ao salvar serviço', { variant: 'error' });
    }
  };

  const handleDeleteService = async () => {
    if (!selectedService) return;
    
    try {
      await deleteService(selectedService.id);
      enqueueSnackbar('Serviço excluído com sucesso', { variant: 'success' });
      handleCloseDialog();
      fetchServices();
    } catch (error) {
      console.error('Erro ao excluir serviço:', error);
      enqueueSnackbar('Erro ao excluir serviço', { variant: 'error' });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Serviços</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
        >
          Novo Serviço
        </Button>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>Descrição</TableCell>
                  <TableCell>Preço</TableCell>
                  <TableCell>Duração (min)</TableCell>
                  <TableCell>Filial</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {services.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Nenhum serviço encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  services.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>{service.name}</TableCell>
                      <TableCell>{service.description || '-'}</TableCell>
                      <TableCell>R$ {service.price.toFixed(2)}</TableCell>
                      <TableCell>{service.averageDuration}</TableCell>
                      <TableCell>{service.branchId || 'Todas'}</TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => handleOpenForm(service)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleOpenDelete(service)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Formulário para criar/editar serviço */}
      <Dialog open={openForm} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {selectedService ? 'Editar Serviço' : 'Novo Serviço'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Nome"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Descrição"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            multiline
            rows={3}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Preço"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleInputChange}
            InputProps={{
              startAdornment: <InputAdornment position="start">R$</InputAdornment>,
            }}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Duração Média (minutos)"
            name="averageDuration"
            type="number"
            value={formData.averageDuration}
            onChange={handleInputChange}
            required
          />
          <Box sx={{ mt: 2 }}>
            <BranchSelector
              value={formData.branchId}
              onChange={handleBranchChange}
              showAllOption={true}
              label="Filial"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={handleSaveService}
            color="primary"
            variant="contained"
            disabled={!formData.name || formData.price <= 0}
          >
            {selectedService ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmação para exclusão */}
      <Dialog open={openDelete} onClose={handleCloseDialog}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir o serviço "{selectedService?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleDeleteService} color="error" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Services; 