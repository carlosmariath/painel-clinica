import { useEffect, useState } from "react";
import { 
  Container, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Button, 
  Box,
  IconButton, 
  MenuItem, 
  TextField,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Alert
} from "@mui/material";
import { 
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon 
} from "@mui/icons-material";
import { getTherapistSchedule, updateTherapistSchedule } from "../services/threapistService";
import { getBranches } from "../services/branchService";
import { useNotification } from "../components/Notification";
import { Branch } from "../types/branch";
import { useBranch } from "../context/BranchContext";

const daysOfWeek = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda-feira" },
  { value: 2, label: "Terça-feira" },
  { value: 3, label: "Quarta-feira" },
  { value: 4, label: "Quinta-feira" },
  { value: 5, label: "Sexta-feira" },
  { value: 6, label: "Sábado" },
];

interface ScheduleItem {
  id?: string; // Opcional, pois pode ser gerado pelo backend
  dayOfWeek: number; // 0 = Domingo, 1 = Segunda...
  startTime: string; // Formato "HH:mm"
  endTime: string; // Formato "HH:mm"
  branchId: string; // ID da filial
}

const TherapistSchedule = () => {
  const { showNotification } = useNotification();
  const { currentBranch } = useBranch();
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Buscar filiais disponíveis para o terapeuta
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoading(true);
        const data = await getBranches();
        setBranches(data);
        
        // Se existe filial atual no contexto, usar como padrão
        if (currentBranch) {
          setSelectedBranchId(currentBranch.id);
        } else if (data.length > 0) {
          setSelectedBranchId(data[0].id);
        }
      } catch (error) {
        console.error("Erro ao carregar filiais:", error);
        showNotification("Erro ao carregar filiais", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, [currentBranch]);

  // Buscar agenda quando a filial selecionada mudar
  useEffect(() => {
    if (!selectedBranchId) return;
    
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        const data = await getTherapistSchedule(selectedBranchId);
        setSchedule(data);
      } catch (error) {
        console.error("Erro ao carregar horários:", error);
        showNotification("Erro ao carregar horários", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [selectedBranchId]);

  // Manipular mudança de filial
  const handleBranchChange = (event: SelectChangeEvent<string>) => {
    setSelectedBranchId(event.target.value);
  };

  // Manipular mudança em um item da agenda
  const handleChange = (index: number, field: keyof ScheduleItem, value: string | number) => {
    setSchedule((prevSchedule) => {
      const updatedSchedule = [...prevSchedule];
      updatedSchedule[index] = {
        ...updatedSchedule[index],
        [field]: value,
      };
      return updatedSchedule;
    });
  };

  // Adicionar novo horário
  const handleAddSchedule = () => {
    if (!selectedBranchId) {
      showNotification("Selecione uma filial primeiro", "warning");
      return;
    }
    
    const newSchedule: ScheduleItem = {
      dayOfWeek: 1, // Segunda-feira como padrão
      startTime: "09:00",
      endTime: "18:00",
      branchId: selectedBranchId
    };
    
    setSchedule([...schedule, newSchedule]);
  };

  // Remover horário
  const handleRemoveSchedule = (index: number) => {
    setSchedule(schedule.filter((_, i) => i !== index));
  };

  // Salvar agenda
  const handleSave = async () => {
    if (!selectedBranchId) {
      showNotification("Selecione uma filial primeiro", "warning");
      return;
    }
    
    try {
      setLoading(true);
      // Para cada horário, faz uma requisição separada
      for (const item of schedule) {
        // Certifica-se que o branchId está definido
        const scheduleItem = {
          ...item,
          branchId: selectedBranchId
        };
        
        await updateTherapistSchedule(scheduleItem);
      }
      
      showNotification("Horários salvos com sucesso!", "success");
    } catch (error) {
      console.error("Erro ao salvar horários:", error);
      showNotification("Erro ao salvar horários", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>Configuração de Disponibilidade</Typography>
        <Typography variant="body1" color="text.secondary">
          Configure os horários em que você estará disponível para atendimento em cada filial.
        </Typography>
      </Box>
      
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="branch-select-label">Filial</InputLabel>
                <Select
                  labelId="branch-select-label"
                  value={selectedBranchId}
                  label="Filial"
                  onChange={handleBranchChange}
                  disabled={loading}
                >
                  {branches.map((branch) => (
                    <MenuItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      {selectedBranchId ? (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Horários
            </Typography>
            <Button 
              variant="outlined" 
              startIcon={<AddIcon />} 
              onClick={handleAddSchedule}
              disabled={loading}
            >
              Adicionar Horário
            </Button>
          </Box>
          
          {schedule.length === 0 ? (
            <Alert severity="info" sx={{ mb: 3 }}>
              Nenhum horário configurado para esta filial. Clique em "Adicionar Horário" para começar.
            </Alert>
          ) : (
            <TableContainer component={Paper} sx={{ mb: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Dia da Semana</TableCell>
                    <TableCell>Hora Inicial</TableCell>
                    <TableCell>Hora Final</TableCell>
                    <TableCell align="center">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {schedule.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <FormControl fullWidth>
                          <Select
                            value={item.dayOfWeek}
                            onChange={(e) => handleChange(index, "dayOfWeek", Number(e.target.value))}
                          >
                            {daysOfWeek.map((day) => (
                              <MenuItem key={day.value} value={day.value}>
                                {day.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="time"
                          value={item.startTime}
                          onChange={(e) => handleChange(index, "startTime", e.target.value)}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="time"
                          value={item.endTime}
                          onChange={(e) => handleChange(index, "endTime", e.target.value)}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton 
                          color="error" 
                          onClick={() => handleRemoveSchedule(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              onClick={handleSave} 
              variant="contained" 
              startIcon={<SaveIcon />}
              disabled={loading || schedule.length === 0}
            >
              {loading ? 'Salvando...' : 'Salvar Horários'}
            </Button>
          </Box>
        </>
      ) : (
        <Alert severity="warning">
          Selecione uma filial para configurar os horários de atendimento.
        </Alert>
      )}
    </Container>
  );
};

export default TherapistSchedule;