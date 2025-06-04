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
  Tooltip,
  Chip,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress
} from "@mui/material";
import { 
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  LightbulbOutlined as SuggestionIcon,
  CalendarViewWeek as CalendarIcon,
  ViewList as ListIcon,
  ContentCopy as CopyIcon,
  Compare as CompareIcon
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
import { checkScheduleConflicts } from "../services/availabilityService";

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

// Novo tipo para representar o modo de visualização
type ViewMode = 'list' | 'calendar' | 'compare';

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
  const isAdmin = user?.role === 'ADMIN';
  
  // Novos estados para suportar as novas funcionalidades
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [compareBranchId, setCompareBranchId] = useState<string>("");
  const [compareSchedule, setCompareSchedule] = useState<ScheduleItem[]>([]);
  const [dayFilter, setDayFilter] = useState<number | null>(null);
  const [fetchingCompare, setFetchingCompare] = useState(false);

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

  // Verificar conflitos ao mudar horário
  const handleScheduleChange = async (index: number, field: keyof ScheduleItem, value: string | number) => {
    // Atualizar o estado primeiro para refletir a mudança visualmente
    const updatedSchedule = [...schedule];
    updatedSchedule[index] = {
      ...updatedSchedule[index],
      [field]: value,
    };
    setSchedule(updatedSchedule);
    
    // Verificar se há conflitos com outros horários em outras filiais
    const currentItem = updatedSchedule[index];
    
    // Só verificar conflitos se todos os campos necessários estiverem preenchidos
    if (
      currentItem.dayOfWeek !== undefined && 
      currentItem.startTime && 
      currentItem.endTime && 
      currentItem.branchId
    ) {
      try {
        const therapistId = isAdmin && selectedTherapistId ? selectedTherapistId : user?.sub;
        if (!therapistId) return;
        
        const result = await checkScheduleConflicts(therapistId, {
          dayOfWeek: currentItem.dayOfWeek,
          startTime: currentItem.startTime,
          endTime: currentItem.endTime,
          branchId: currentItem.branchId,
          id: currentItem.id
        });
        
        if (result.hasConflict) {
          // Exibir aviso de conflito sem impedir a edição
          showNotification(
            `⚠️ Conflito: Você já tem um horário configurado para ${daysOfWeek.find(d => d.value === result.conflictInfo?.day)?.label} das ${result.conflictInfo?.time} na filial ${result.conflictInfo?.branchName}.`,
            "warning"
          );
        }
      } catch (error) {
        console.error("Erro ao verificar conflitos:", error);
      }
    }
  };

  // Manipular mudança em um item da agenda (simplificada, agora chama a verificação de conflitos)
  const handleChange = (index: number, field: keyof ScheduleItem, value: string | number) => {
    handleScheduleChange(index, field, value);
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

  // Salvar agenda com verificação de conflitos
  const handleSave = async () => {
    if (!selectedBranchId) {
      showNotification("Selecione uma filial primeiro", "warning");
      return;
    }
    
    try {
      setLoading(true);
      
      // Verificar conflitos para todos os horários antes de salvar
      const therapistId = isAdmin && selectedTherapistId ? selectedTherapistId : user?.sub;
      if (!therapistId) {
        throw new Error("ID do terapeuta não encontrado");
      }
      
      let hasConflicts = false;
      const conflictMessages = [];
      
      // Verificar cada horário por conflitos
      for (const item of schedule) {
        const result = await checkScheduleConflicts(therapistId, {
          dayOfWeek: item.dayOfWeek,
          startTime: item.startTime,
          endTime: item.endTime,
          branchId: item.branchId,
          id: item.id
        });
        
        if (result.hasConflict) {
          hasConflicts = true;
          conflictMessages.push(
            `• ${daysOfWeek.find(d => d.value === result.conflictInfo?.day)?.label} das ${result.conflictInfo?.time} na filial ${result.conflictInfo?.branchName}`
          );
        }
      }
      
      // Se encontrou conflitos, perguntar ao usuário se deseja continuar
      if (hasConflicts) {
        const confirmSave = window.confirm(
          `Foram encontrados conflitos de horário:\n${conflictMessages.join('\n')}\n\nDeseja salvar mesmo assim?`
        );
        
        if (!confirmSave) {
          setLoading(false);
          return;
        }
      }
      
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

  // Função para alternar o modo de visualização
  const handleViewModeChange = (event: React.MouseEvent<HTMLElement>, newMode: ViewMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
      
      // Se estiver mudando para o modo de comparação, carregue os dados para comparação
      if (newMode === 'compare' && selectedBranchId && !compareBranchId && branches.length > 1) {
        // Selecione automaticamente outra filial para comparação
        const otherBranch = branches.find(branch => branch.id !== selectedBranchId);
        if (otherBranch) {
          setCompareBranchId(otherBranch.id);
          fetchCompareSchedule(otherBranch.id);
        }
      }
    }
  };

  // Função para carregar a agenda da filial de comparação
  const fetchCompareSchedule = async (branchId: string) => {
    if (!branchId) return;
    
    try {
      setFetchingCompare(true);
      let data;
      
      if (isAdmin && selectedTherapistId) {
        data = await getTherapistScheduleById(selectedTherapistId, branchId);
      } else {
        data = await getTherapistSchedule(branchId);
      }
      
      setCompareSchedule(data);
    } catch (error) {
      console.error("Erro ao carregar horários para comparação:", error);
      showNotification("Erro ao carregar horários para comparação", "error");
    } finally {
      setFetchingCompare(false);
    }
  };

  // Manipular mudança na filial de comparação
  const handleCompareBranchChange = (event: SelectChangeEvent<string>) => {
    const newBranchId = event.target.value;
    setCompareBranchId(newBranchId);
    fetchCompareSchedule(newBranchId);
  };

  // Filtrar por dia da semana
  const handleDayFilterChange = (day: number | null) => {
    setDayFilter(day === dayFilter ? null : day);
  };

  // Copiar horários da filial de comparação
  const handleCopyFromBranch = () => {
    if (!compareBranchId || compareSchedule.length === 0) {
      showNotification("Não há horários para copiar", "warning");
      return;
    }

    // Criar cópias dos horários com o branchId correto
    const copiedSchedules = compareSchedule.map(item => ({
      ...item,
      branchId: selectedBranchId,
      id: undefined // Remover ID para que sejam criados novos registros
    }));

    // Verificar conflitos antes de adicionar
    const newSchedules = [...schedule];
    let conflictCount = 0;
    let addedCount = 0;

    for (const newItem of copiedSchedules) {
      const exists = scheduleExists(
        newItem.dayOfWeek,
        newItem.startTime,
        newItem.endTime,
        schedule
      );

      if (!exists) {
        newSchedules.push(newItem);
        addedCount++;
      } else {
        conflictCount++;
      }
    }

    setSchedule(newSchedules);
    
    if (addedCount > 0) {
      showNotification(`${addedCount} horários copiados com sucesso`, "success");
    }
    
    if (conflictCount > 0) {
      showNotification(`${conflictCount} horários não foram copiados por já existirem`, "info");
    }
  };

  // Renderizar a visualização em lista (visualização atual)
  const renderListView = () => {
    let filteredSchedule = schedule;
    
    // Aplicar filtro de dia se estiver selecionado
    if (dayFilter !== null) {
      filteredSchedule = schedule.filter(item => item.dayOfWeek === dayFilter);
    }
    
    return (
      <>
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle1">Filtrar por dia:</Typography>
          {daysOfWeek.map((day) => (
            <Chip
              key={day.value}
              label={day.label.split('-')[0]} // Abreviação do dia
              onClick={() => handleDayFilterChange(day.value)}
              color={dayFilter === day.value ? "primary" : "default"}
              variant={dayFilter === day.value ? "filled" : "outlined"}
              sx={{ cursor: 'pointer' }}
            />
          ))}
          {dayFilter !== null && (
            <Button 
              size="small" 
              onClick={() => setDayFilter(null)}
              variant="outlined"
            >
              Limpar Filtro
            </Button>
          )}
        </Box>
        
        {filteredSchedule.length === 0 ? (
          <Alert severity="info" sx={{ mb: 3 }}>
            {dayFilter !== null 
              ? `Nenhum horário configurado para ${daysOfWeek.find(d => d.value === dayFilter)?.label}.` 
              : "Nenhum horário configurado para esta filial. Clique em \"Adicionar Horário\" para começar ou use \"Sugerir Horários\" para obter sugestões de horários comerciais."}
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
                {filteredSchedule.map((item, index) => {
                  const realIndex = schedule.findIndex(s => 
                    s.dayOfWeek === item.dayOfWeek && 
                    s.startTime === item.startTime && 
                    s.endTime === item.endTime
                  );
                  
                  return (
                    <TableRow key={realIndex}>
                      <TableCell>
                        <FormControl fullWidth>
                          <Select
                            value={item.dayOfWeek}
                            onChange={(e) => handleChange(realIndex, "dayOfWeek", Number(e.target.value))}
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
                          onChange={(e) => handleChange(realIndex, "startTime", e.target.value)}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="time"
                          value={item.endTime}
                          onChange={(e) => handleChange(realIndex, "endTime", e.target.value)}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton 
                          color="error" 
                          onClick={() => handleRemoveSchedule(realIndex)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </>
    );
  };

  // Renderizar a visualização em calendário
  const renderCalendarView = () => {
    // Organizar horários por dia da semana
    const scheduleByDay: Record<number, ScheduleItem[]> = {};
    daysOfWeek.forEach(day => {
      scheduleByDay[day.value] = schedule.filter(
        item => item.dayOfWeek === day.value
      );
    });
    
    return (
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={1}>
          {daysOfWeek.map(day => (
            <Grid item xs={12} sm={6} md={3} lg={12/7} key={day.value}>
              <Card 
                sx={{ 
                  height: '100%', 
                  minHeight: 150,
                  bgcolor: day.value === 0 || day.value === 6 ? 'grey.100' : 'white' // Destacar fim de semana
                }}
              >
                <CardContent sx={{ pb: 1 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                    {day.label}
                  </Typography>
                  {scheduleByDay[day.value].length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mt: 2, textAlign: 'center' }}>
                      Nenhum horário
                    </Typography>
                  ) : (
                    <Stack spacing={1} sx={{ mt: 1 }}>
                      {scheduleByDay[day.value].map((item, idx) => (
                        <Chip
                          key={idx}
                          label={`${item.startTime} - ${item.endTime}`}
                          onDelete={() => {
                            const index = schedule.findIndex(s => 
                              s.dayOfWeek === item.dayOfWeek && 
                              s.startTime === item.startTime && 
                              s.endTime === item.endTime
                            );
                            handleRemoveSchedule(index);
                          }}
                          color="primary"
                          variant="outlined"
                          sx={{ width: '100%', justifyContent: 'space-between' }}
                        />
                      ))}
                    </Stack>
                  )}
                </CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 1 }}>
                  <Button 
                    size="small" 
                    startIcon={<AddIcon />}
                    onClick={() => {
                      const newSchedule: ScheduleItem = {
                        dayOfWeek: day.value,
                        startTime: "09:00",
                        endTime: "18:00",
                        branchId: selectedBranchId
                      };
                      setSchedule([...schedule, newSchedule]);
                    }}
                  >
                    Adicionar
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  // Renderizar a visualização de comparação
  const renderCompareView = () => {
    return (
      <>
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Filial para Comparação</InputLabel>
                <Select
                  value={compareBranchId}
                  onChange={handleCompareBranchChange}
                  label="Filial para Comparação"
                  disabled={fetchingCompare}
                >
                  {branches
                    .filter(branch => branch.id !== selectedBranchId)
                    .map((branch) => (
                      <MenuItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </MenuItem>
                    ))
                  }
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <Button
                variant="outlined"
                startIcon={<CopyIcon />}
                onClick={handleCopyFromBranch}
                disabled={!compareBranchId || compareSchedule.length === 0 || fetchingCompare}
                fullWidth
              >
                Copiar Horários desta Filial
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              {branches.find(b => b.id === selectedBranchId)?.name || "Filial Atual"}
            </Typography>
            {schedule.length === 0 ? (
              <Alert severity="info">Nenhum horário configurado</Alert>
            ) : (
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Dia</TableCell>
                      <TableCell>Horário</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {schedule.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          {daysOfWeek.find(d => d.value === item.dayOfWeek)?.label}
                        </TableCell>
                        <TableCell>
                          {item.startTime} - {item.endTime}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              {branches.find(b => b.id === compareBranchId)?.name || "Filial de Comparação"}
            </Typography>
            {fetchingCompare ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress size={30} />
              </Box>
            ) : compareSchedule.length === 0 ? (
              <Alert severity="info">Nenhum horário configurado</Alert>
            ) : (
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Dia</TableCell>
                      <TableCell>Horário</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {compareSchedule.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          {daysOfWeek.find(d => d.value === item.dayOfWeek)?.label}
                        </TableCell>
                        <TableCell>
                          {item.startTime} - {item.endTime}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Grid>
        </Grid>
      </>
    );
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={handleViewModeChange}
                aria-label="Modo de visualização"
                size="small"
              >
                <ToggleButton value="list" aria-label="lista">
                  <Tooltip title="Visualização em lista">
                    <ListIcon />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="calendar" aria-label="calendário">
                  <Tooltip title="Visualização em calendário">
                    <CalendarIcon />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="compare" aria-label="comparar">
                  <Tooltip title="Comparar com outra filial">
                    <CompareIcon />
                  </Tooltip>
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
            
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
              {viewMode !== 'calendar' && (
                <Button 
                  variant="outlined" 
                  startIcon={<AddIcon />} 
                  onClick={handleAddSchedule}
                  disabled={loading}
                >
                  Adicionar Horário
                </Button>
              )}
            </Box>
          </Box>
          
          {viewMode === 'list' && renderListView()}
          {viewMode === 'calendar' && renderCalendarView()}
          {viewMode === 'compare' && renderCompareView()}
          
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