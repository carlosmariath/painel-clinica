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
  Alert,
  Tooltip
} from "@mui/material";
import { 
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  LightbulbOutlined as SuggestionIcon
} from "@mui/icons-material";
import { 
  getTherapistSchedule, 
  updateTherapistSchedule, 
  getTherapistScheduleById, 
  updateTherapistScheduleById,
  getTherapists,
  getAllTherapistSchedules
} from "../services/threapistService";
import { getBranches } from "../services/branchService";
import { useNotification } from "../components/Notification";
import { Branch } from "../types/branch";
import { useBranch } from "../context/BranchContext";
import { useAuth } from "../context/AuthContext";

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

interface Therapist {
  id: string;
  name: string;
  email: string;
}

// Horários comerciais padrão para sugestão
const commercialHours = [
  { startTime: "08:00", endTime: "12:00" }, // Manhã
  { startTime: "13:00", endTime: "17:00" }  // Tarde
];

// Dias da semana comerciais (excluindo domingo)
const commercialDays = [1, 2, 3, 4, 5, 6]; // Segunda a Sábado

const TherapistSchedule = () => {
  const { showNotification } = useNotification();
  const { currentBranch } = useBranch();
  const { user } = useAuth();
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [selectedTherapistId, setSelectedTherapistId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [suggestingSchedule, setSuggestingSchedule] = useState(false);
  const [allSchedules, setAllSchedules] = useState<ScheduleItem[]>([]);
  const isAdmin = user?.role === 'ADMIN';

  // Buscar lista de terapeutas (apenas para admins)
  useEffect(() => {
    if (isAdmin) {
      const fetchTherapists = async () => {
        try {
          setLoading(true);
          const data = await getTherapists();
          setTherapists(data);
        } catch (error) {
          console.error("Erro ao carregar terapeutas:", error);
          showNotification("Erro ao carregar terapeutas", "error");
        } finally {
          setLoading(false);
        }
      };

      fetchTherapists();
    }
  }, [isAdmin]);

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
        let data;
        
        if (isAdmin && selectedTherapistId) {
          // Se for admin e tiver selecionado um terapeuta, buscar agenda do terapeuta específico
          data = await getTherapistScheduleById(selectedTherapistId, selectedBranchId);
        } else {
          // Caso contrário, buscar agenda do próprio terapeuta logado
          data = await getTherapistSchedule(selectedBranchId);
        }
        
        setSchedule(data);
      } catch (error) {
        console.error("Erro ao carregar horários:", error);
        showNotification("Erro ao carregar horários", "error");
      } finally {
        setLoading(false);
      }
    };

    // Se for admin, só buscar a agenda se tiver um terapeuta selecionado
    if (!isAdmin || (isAdmin && selectedTherapistId)) {
      fetchSchedule();
    } else {
      setSchedule([]);
    }
  }, [selectedBranchId, selectedTherapistId, isAdmin]);

  // Manipular mudança de filial
  const handleBranchChange = (event: SelectChangeEvent<string>) => {
    setSelectedBranchId(event.target.value);
  };

  // Manipular mudança de terapeuta (apenas para admins)
  const handleTherapistChange = (event: SelectChangeEvent<string>) => {
    setSelectedTherapistId(event.target.value);
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

  // Verificar se um horário já existe na agenda
  const scheduleExists = (
    dayOfWeek: number, 
    startTime: string, 
    endTime: string, 
    existingSchedules: ScheduleItem[]
  ): boolean => {
    return existingSchedules.some(
      item => 
        item.dayOfWeek === dayOfWeek &&
        item.startTime === startTime &&
        item.endTime === endTime
    );
  };

  // Verificar se há conflito com horários de outras filiais
  const hasConflict = (
    dayOfWeek: number, 
    startTime: string, 
    endTime: string, 
    allSchedules: ScheduleItem[]
  ): boolean => {
    return allSchedules.some((item: ScheduleItem) => {
      if (item.dayOfWeek !== dayOfWeek) return false;
      
      // Converte horários para minutos para facilitar comparação
      const itemStart = convertToMinutes(item.startTime);
      const itemEnd = convertToMinutes(item.endTime);
      const newStart = convertToMinutes(startTime);
      const newEnd = convertToMinutes(endTime);
      
      // Verifica se há sobreposição
      return (
        (newStart >= itemStart && newStart < itemEnd) || // Início do novo dentro do existente
        (newEnd > itemStart && newEnd <= itemEnd) || // Fim do novo dentro do existente
        (newStart <= itemStart && newEnd >= itemEnd) // Novo engloba o existente
      );
    });
  };

  // Converter horário (HH:MM) para minutos desde 00:00
  const convertToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Sugerir horários baseados em horário comercial e disponibilidade
  const handleSuggestSchedule = async () => {
    if (!selectedBranchId) {
      showNotification("Selecione uma filial primeiro", "warning");
      return;
    }

    try {
      setSuggestingSchedule(true);
      
      // Buscar todos os horários do terapeuta em todas as filiais
      const therapistId = isAdmin && selectedTherapistId ? selectedTherapistId : undefined;
      const allTherapistSchedules = await getAllTherapistSchedules(therapistId);
      
      // Filtra os horários para excluir os da filial atual
      const otherBranchesSchedules = allTherapistSchedules.filter(
        (item: ScheduleItem) => item.branchId !== selectedBranchId
      );
      
      // Sugestões baseadas em horário comercial
      const suggestions: ScheduleItem[] = [];
      
      // Para cada dia da semana comercial
      for (const day of commercialDays) {
        // Para cada faixa de horário comercial
        for (const hours of commercialHours) {
          // Verifica se esse horário já existe na agenda desta filial
          const alreadyExists = scheduleExists(
            day, 
            hours.startTime, 
            hours.endTime, 
            schedule
          );
          
          // Verifica se há conflito com horários em outras filiais
          const hasTimeConflict = hasConflict(
            day,
            hours.startTime,
            hours.endTime,
            otherBranchesSchedules
          );
          
          // Se não existir e não tiver conflito, adiciona como sugestão
          if (!alreadyExists && !hasTimeConflict) {
            suggestions.push({
              dayOfWeek: day,
              startTime: hours.startTime,
              endTime: hours.endTime,
              branchId: selectedBranchId
            });
          }
        }
      }
      
      // Adiciona as sugestões à agenda
      if (suggestions.length > 0) {
        setSchedule(prev => [...prev, ...suggestions]);
        showNotification(`${suggestions.length} horários sugeridos foram adicionados`, "success");
      } else {
        showNotification("Não foi possível sugerir novos horários disponíveis", "info");
      }
    } catch (error) {
      console.error("Erro ao sugerir horários:", error);
      showNotification("Erro ao sugerir horários", "error");
    } finally {
      setSuggestingSchedule(false);
    }
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
        
        if (isAdmin && selectedTherapistId) {
          // Se for admin e tiver selecionado um terapeuta, atualizar agenda do terapeuta específico
          await updateTherapistScheduleById(selectedTherapistId, scheduleItem);
        } else {
          // Caso contrário, atualizar agenda do próprio terapeuta logado
          await updateTherapistSchedule(scheduleItem);
        }
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
          {isAdmin 
            ? "Como administrador, você pode configurar os horários de atendimento para qualquer terapeuta."
            : "Configure os horários em que você estará disponível para atendimento em cada filial."}
        </Typography>
      </Box>
      
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={3}>
            {isAdmin && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="therapist-select-label">Terapeuta</InputLabel>
                  <Select
                    labelId="therapist-select-label"
                    value={selectedTherapistId}
                    label="Terapeuta"
                    onChange={handleTherapistChange}
                    disabled={loading}
                  >
                    <MenuItem value="" disabled>Selecione um terapeuta</MenuItem>
                    {therapists.map((therapist) => (
                      <MenuItem key={therapist.id} value={therapist.id}>
                        {therapist.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            
            <Grid item xs={12} md={isAdmin ? 6 : 12}>
              <FormControl fullWidth>
                <InputLabel id="branch-select-label">Filial</InputLabel>
                <Select
                  labelId="branch-select-label"
                  value={selectedBranchId}
                  label="Filial"
                  onChange={handleBranchChange}
                  disabled={loading || (isAdmin && !selectedTherapistId)}
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
      
      {isAdmin && !selectedTherapistId ? (
        <Alert severity="info">
          Selecione um terapeuta para configurar seus horários de atendimento.
        </Alert>
      ) : selectedBranchId ? (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Horários
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Sugere horários comerciais levando em conta a disponibilidade em outras filiais">
                <Button 
                  variant="outlined" 
                  color="secondary"
                  startIcon={<SuggestionIcon />} 
                  onClick={handleSuggestSchedule}
                  disabled={loading || suggestingSchedule}
                >
                  {suggestingSchedule ? 'Sugerindo...' : 'Sugerir Horários'}
                </Button>
              </Tooltip>
              <Button 
                variant="outlined" 
                startIcon={<AddIcon />} 
                onClick={handleAddSchedule}
                disabled={loading}
              >
                Adicionar Horário
              </Button>
            </Box>
          </Box>
          
          {schedule.length === 0 ? (
            <Alert severity="info" sx={{ mb: 3 }}>
              Nenhum horário configurado para esta filial. Clique em "Adicionar Horário" para começar ou use "Sugerir Horários" para obter sugestões de horários comerciais.
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