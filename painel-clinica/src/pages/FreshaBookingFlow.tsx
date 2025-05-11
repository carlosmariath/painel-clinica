import React, { useState, useContext } from 'react';
import {
  Box, Typography, TextField, Card, CardContent, Avatar, Grid, Button, Stack, IconButton, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import BranchSelector from '../components/BranchSelector';
import { BranchContext } from '../context/BranchContext';

interface FreshaBookingFlowProps {
  clients: any[];
  therapists: any[];
  servicesList: any[];
  onSave: (payload: any) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

const FreshaBookingFlow: React.FC<FreshaBookingFlowProps> = ({ clients, therapists, servicesList, onSave, onCancel, loading }) => {
  const branchContext = useContext(BranchContext);
  const [freshaStep, setFreshaStep] = useState(1);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedTherapist, setSelectedTherapist] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(
    branchContext?.currentBranch?.id || null
  );
  const [buscaCliente, setBuscaCliente] = useState("");
  const [buscaTerapeuta, setBuscaTerapeuta] = useState("");

  // Determinar o número total de passos
  const totalSteps = 5; // 1-Filial, 2-Cliente, 3-Serviço/Terapeuta, 4-Data/Hora, 5-Confirmação

  // Verificar se o passo atual está completo para habilitar o botão de próximo
  const isStepComplete = () => {
    switch (freshaStep) {
      case 1: // Seleção de filial
        return !!selectedBranch;
      case 2: // Seleção de cliente
        return !!selectedClient;
      case 3: // Seleção de serviço/terapeuta
        return !!selectedService && !!selectedTherapist;
      case 4: // Seleção de data/hora
        return !!selectedDate && !!selectedTimeSlot;
      case 5: // Confirmação
        return true;
      default:
        return false;
    }
  };

  // Função para avançar para o próximo passo
  const handleNext = () => {
    if (freshaStep < totalSteps) {
      setFreshaStep(freshaStep + 1);
    } else {
      // Último passo - salvar agendamento
      const appointmentData = {
        clientId: selectedClient,
        therapistId: selectedTherapist,
        serviceId: selectedService?.id,
        date: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
        startTime: selectedTimeSlot || '',
        endTime: '', // Calcular com base no tempo do serviço
        branchId: selectedBranch
      };
      
      onSave(appointmentData);
    }
  };

  // Função para voltar ao passo anterior
  const handleBack = () => {
    if (freshaStep > 1) {
      setFreshaStep(freshaStep - 1);
    }
  };

  // Renderizar o passo atual
  const renderStep = () => {
    switch (freshaStep) {
      case 1: // Seleção de filial
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Selecione a filial</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Escolha a filial onde o atendimento será realizado
            </Typography>
            
            <BranchSelector
              value={selectedBranch || ''}
              onChange={(branchId) => setSelectedBranch(branchId)}
              showAllOption={false}
              label="Filial para atendimento"
            />
          </Box>
        );
        
      case 2: // Seleção de cliente
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Selecione o cliente</Typography>
            <TextField
              label="Buscar cliente"
              value={buscaCliente}
              onChange={e => setBuscaCliente(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            />
            <Box sx={{ maxHeight: '400px', overflow: 'auto' }}>
              {clients
                .filter(client =>
                  client.name.toLowerCase().includes(buscaCliente.toLowerCase()) ||
                  client.email.toLowerCase().includes(buscaCliente.toLowerCase())
                )
                .map(client => (
                  <Card key={client.id} sx={{ mb: 2, cursor: 'pointer', border: selectedClient === client.id ? '2px solid #1976d2' : '1px solid #eee', bgcolor: selectedClient === client.id ? 'primary.light' : 'background.paper', transition: 'border 0.2s' }} onClick={() => setSelectedClient(selectedClient === client.id ? null : client.id)}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2 }}>{client.name.charAt(0)}</Avatar>
                      <Box>
                        <Typography variant="subtitle1">{client.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{client.email}</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
            </Box>
          </Box>
        );
      // Implementar os outros passos conforme necessário
      default:
        return (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6">Passo {freshaStep} em desenvolvimento</Typography>
          </Box>
        );
    }
  };

  // Renderizar o indicador de progresso
  const renderStepIndicator = () => {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <Box
            key={index}
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              mx: 0.5,
              bgcolor: index + 1 === freshaStep ? 'primary.main' : 'grey.300',
            }}
          />
        ))}
      </Box>
    );
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="md">
      <DialogTitle>
        Agendamento - Passo {freshaStep} de {totalSteps}
      </DialogTitle>
      <DialogContent dividers sx={{ flexGrow: 1, overflow: 'auto' }}>
        {renderStepIndicator()}
        {renderStep()}
      </DialogContent>
      <DialogActions>
        <Button 
          variant="outlined" 
          onClick={freshaStep === 1 ? onCancel : handleBack} 
          disabled={loading}
        >
          {freshaStep === 1 ? 'Cancelar' : 'Voltar'}
        </Button>
        <Button 
          variant="contained" 
          onClick={handleNext} 
          disabled={loading || !isStepComplete()}
        >
          {freshaStep === totalSteps ? 'Finalizar' : 'Próximo'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FreshaBookingFlow; 