import { useEffect, useState } from "react";
import { 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  TextField, 
  Button, 
  MenuItem, 
  Checkbox, 
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  Box,
  Typography,
  Divider,
  Chip,
  OutlinedInput,
  FormHelperText
} from "@mui/material";
import { 
  createTherapist, 
  updateTherapist, 
  addServiceToTherapist, 
  removeServiceFromTherapist,
  addBranchToTherapist,
  removeBranchFromTherapist
} from "../services/threapistService";
import { getServices, Service } from "../services/serviceService";
import { getBranches } from "../services/branchService";
import { Branch } from "../types/branch";
import { useBranch } from "../context/BranchContext";

interface TherapistFormProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  therapist?: any;
}

const TherapistForm = ({ open, onClose, onSave, therapist }: TherapistFormProps) => {
  const { currentBranch } = useBranch();
  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    phone: "",
    specialty: ""
  });
  const [services, setServices] = useState<Service[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [servicesData, branchesData] = await Promise.all([
          getServices(),
          getBranches()
        ]);
        setServices(servicesData);
        setBranches(branchesData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    if (therapist) {
      console.log('Terapeuta recebido:', therapist);
      console.log('therapistBranches:', therapist.therapistBranches);
      console.log('therapistServices:', therapist.therapistServices);
      
      setFormData({ 
        name: therapist.name || "", 
        email: therapist.email || "", 
        phone: therapist.phone || "",
        specialty: therapist.specialty || ""
      });
      
      // Serviços associados
      console.log('Mapeando serviços...');
      setSelectedServices(
        therapist.therapistServices?.map((ts: any) => {
          console.log('Service:', ts);
          return ts.service?.id || ts.serviceId || ts.id;
        }) || []
      );
      
      // Filiais associadas
      console.log('Mapeando filiais...');
      setSelectedBranches(
        therapist.therapistBranches?.map((tb: any) => {
          console.log('Branch:', tb);
          return tb.branch?.id || tb.branchId || tb.id;
        }) || []
      );
    } else {
      setFormData({ 
        name: "", 
        email: "", 
        phone: "",
        specialty: ""
      });
      setSelectedServices([]);
      
      // Se não há terapeuta selecionado, usar a filial atual como padrão (se existir)
      setSelectedBranches(currentBranch ? [currentBranch.id] : []);
    }
  }, [therapist, currentBranch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleServiceChange = (event: any) => {
    setSelectedServices(event.target.value);
  };
  
  const handleBranchChange = (event: any) => {
    setSelectedBranches(event.target.value);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let therapistId = therapist?.id;
      
      if (therapist) {
        // Atualizar terapeuta existente
        await updateTherapist(therapist.id, formData);
      } else {
        // Criar novo terapeuta
        const res = await createTherapist({
          ...formData,
          branchIds: selectedBranches
        });
        therapistId = res.data.id;
      }
      
      // Se estamos atualizando um terapeuta existente
      if (therapistId && therapist) {
        // Atualizar filiais associadas
        if (therapist.therapistBranches) {
          // Remover filiais que não estão mais selecionadas
          for (const tb of therapist.therapistBranches) {
            const branchId = tb.branch?.id || tb.branchId || tb.id;
            if (!selectedBranches.includes(branchId)) {
              await removeBranchFromTherapist(therapistId, branchId);
            }
          }
        }
        
        // Adicionar novas filiais
        for (const branchId of selectedBranches) {
          if (!therapist.therapistBranches?.some((tb: any) => {
            const tbBranchId = tb.branch?.id || tb.branchId || tb.id;
            return tbBranchId === branchId;
          })) {
            await addBranchToTherapist(therapistId, branchId);
          }
        }
        
        // Atualizar serviços associados
        if (therapist.therapistServices) {
          // Remover serviços que não estão mais selecionados
          for (const ts of therapist.therapistServices) {
            const serviceId = ts.service?.id || ts.serviceId || ts.id;
            if (!selectedServices.includes(serviceId)) {
              await removeServiceFromTherapist(therapistId, serviceId);
            }
          }
        }
        
        // Adicionar novos serviços
        for (const serviceId of selectedServices) {
          if (!therapist.therapistServices?.some((ts: any) => {
            const tsServiceId = ts.service?.id || ts.serviceId || ts.id;
            return tsServiceId === serviceId;
          })) {
            await addServiceToTherapist(therapistId, serviceId);
          }
        }
      }
      
      onSave();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar terapeuta:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{therapist ? "Editar Terapeuta" : "Novo Terapeuta"}</DialogTitle>
      <DialogContent>
        <Box sx={{ my: 2 }}>
          <Typography variant="subtitle1" fontWeight={500} gutterBottom>
            Informações Básicas
          </Typography>
          <TextField 
            fullWidth 
            margin="normal" 
            label="Nome" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            required 
          />
          <TextField 
            fullWidth 
            margin="normal" 
            label="E-mail" 
            name="email" 
            type="email" 
            value={formData.email} 
            onChange={handleChange} 
            required 
          />
          <TextField 
            fullWidth 
            margin="normal" 
            label="Telefone" 
            name="phone" 
            value={formData.phone} 
            onChange={handleChange} 
          />
          <TextField 
            fullWidth 
            margin="normal" 
            label="Especialidade" 
            name="specialty" 
            value={formData.specialty} 
            onChange={handleChange} 
          />
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ my: 2 }}>
          <Typography variant="subtitle1" fontWeight={500} gutterBottom>
            Filiais
          </Typography>
          <FormControl fullWidth margin="normal">
            <InputLabel id="branches-label">Filiais</InputLabel>
            <Select
              labelId="branches-label"
              multiple
              value={selectedBranches}
              onChange={handleBranchChange}
              input={<OutlinedInput label="Filiais" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const branch = branches.find(b => b.id === value);
                    return (
                      <Chip 
                        key={value} 
                        label={branch ? branch.name : value}
                        size="small"
                      />
                    );
                  })}
                </Box>
              )}
            >
              {branches.map((branch) => (
                <MenuItem key={branch.id} value={branch.id}>
                  <Checkbox checked={selectedBranches.includes(branch.id)} />
                  <ListItemText primary={branch.name} secondary={branch.address} />
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>O terapeuta estará disponível nestas filiais</FormHelperText>
          </FormControl>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ my: 2 }}>
          <Typography variant="subtitle1" fontWeight={500} gutterBottom>
            Serviços Oferecidos
          </Typography>
          <FormControl fullWidth margin="normal">
            <InputLabel id="services-label">Serviços</InputLabel>
            <Select
              labelId="services-label"
              multiple
              value={selectedServices}
              onChange={handleServiceChange}
              input={<OutlinedInput label="Serviços" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const service = services.find(s => s.id === value);
                    return (
                      <Chip 
                        key={value} 
                        label={service ? service.name : value}
                        size="small"
                      />
                    );
                  })}
                </Box>
              )}
            >
              {services.map((service) => (
                <MenuItem key={service.id} value={service.id}>
                  <Checkbox checked={selectedServices.includes(service.id)} />
                  <ListItemText 
                    primary={service.name} 
                    secondary={`R$ ${service.price.toFixed(2)}`} 
                  />
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>Serviços que este terapeuta pode realizar</FormHelperText>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Cancelar</Button>
        <Button 
          onClick={handleSubmit} 
          color="primary" 
          variant="contained"
          disabled={loading || !formData.name || !formData.email || selectedBranches.length === 0}
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TherapistForm;