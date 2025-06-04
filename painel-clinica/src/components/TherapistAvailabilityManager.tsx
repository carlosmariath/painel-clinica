import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  SelectChangeEvent,
  ButtonGroup,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  DeleteSweep as DeleteSweepIcon,
  CalendarViewWeek as CalendarIcon,
  ViewList as ListIcon,
  LightbulbOutlined as SuggestionIcon,
  ContentCopy as CopyIcon,
  Compare as CompareIcon
} from '@mui/icons-material';
import { 
  updateTherapistSchedule, 
  updateTherapistScheduleById,
  removeTherapistSchedule,
  getTherapists,
  getAllTherapistSchedules,
  removeAllTherapistSchedulesFromBranch
} from '../services/threapistService';
import { getBranches } from '../services/branchService';
import { useNotification } from './Notification';
import { Branch } from '../types/branch';
import { checkScheduleConflicts } from '../services/availabilityService';

const daysOfWeek = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda-feira" },
  { value: 2, label: "Terça-feira" },
  { value: 3, label: "Quarta-feira" },
  { value: 4, label: "Quinta-feira" },
  { value: 5, label: "Sexta-feira" },
  { value: 6, label: "Sábado" },
];

interface Therapist {
  id: string;
  name: string;
}

interface ScheduleItem {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  branchId: string;
}

interface ScheduleByBranch {
  [branchId: string]: ScheduleItem[];
}

interface TherapistAvailabilityManagerProps {
  therapistId?: string;  // Opcional para administradores
  isAdmin?: boolean;
}

// Novo tipo para representar o modo de visualização
type ViewMode = 'list' | 'calendar' | 'compare';

// Horários comerciais padrão para sugestão
const commercialHours = [
  { startTime: "08:00", endTime: "12:00" }, // Manhã
  { startTime: "13:00", endTime: "17:00" }  // Tarde
];

// Dias da semana comerciais (excluindo domingo)
const commercialDays = [1, 2, 3, 4, 5, 6]; // Segunda a Sábado

const TherapistAvailabilityManager: React.FC<TherapistAvailabilityManagerProps> = ({ 
  therapistId: propTherapistId, 
  isAdmin = false 
}) => {
  const { showNotification } = useNotification();
  const [selectedTherapistId, setSelectedTherapistId] = useState<string>(propTherapistId || '');
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [scheduleByBranch, setScheduleByBranch] = useState<ScheduleByBranch>({});
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<ScheduleItem | null>(null);
  const [currentScheduleItem, setCurrentScheduleItem] = useState<ScheduleItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Novos estados para funcionalidades avançadas
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [compareBranchId, setCompareBranchId] = useState<string>('');
  const [compareSchedule, setCompareSchedule] = useState<ScheduleItem[]>([]);
  const [dayFilter, setDayFilter] = useState<number | null>(null);
  const [fetchingCompare, setFetchingCompare] = useState(false);
  const [suggestingSchedule, setSuggestingSchedule] = useState(false);

  // Carregar terapeutas se for admin
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
  }, [isAdmin, showNotification]);

  // Carregar filiais
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoading(true);
        const data = await getBranches();
        setBranches(data);
        if (data.length > 0) {
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
  }, [showNotification]);

  // Carregar horários quando o terapeuta ou filial mudar
  useEffect(() => {
    const therapistToFetch = isAdmin ? selectedTherapistId : propTherapistId;
    if (!therapistToFetch || branches.length === 0) return;

    fetchAllSchedules();
  }, [isAdmin, selectedTherapistId, propTherapistId, branches]);

  // Lidar com a seleção de terapeuta
  const handleTherapistChange = (event: SelectChangeEvent<string>) => {
    setSelectedTherapistId(event.target.value);
  };

  // Lidar com a seleção de filial
  const handleBranchChange = (event: SelectChangeEvent<string>) => {
    setSelectedBranchId(event.target.value);
  };

  // Abrir o diálogo para adicionar novo horário
  const handleOpenAddDialog = () => {
    // Configuração padrão para novo horário
    setCurrentScheduleItem({
      dayOfWeek: 1, // Segunda-feira
      startTime: '09:00',
      endTime: '18:00',
      branchId: selectedBranchId
    });
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  // Abrir o diálogo para editar um horário existente
  const handleOpenEditDialog = (item: ScheduleItem) => {
    setCurrentScheduleItem({...item});
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  // Fechar o diálogo
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setCurrentScheduleItem(null);
  };

  // Lidar com mudanças nos campos do formulário
  const handleScheduleItemChange = (field: keyof ScheduleItem, value: string | number) => {
    if (!currentScheduleItem) return;
    
    setCurrentScheduleItem({
      ...currentScheduleItem,
      [field]: value
    });
  };

  // Abrir o diálogo de confirmação de exclusão
  const handleOpenDeleteDialog = (item: ScheduleItem) => {
    setScheduleToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  // Fechar o diálogo de confirmação de exclusão
  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setScheduleToDelete(null);
  };

  // Remover um horário
  const handleDeleteSchedule = async () => {
    if (!scheduleToDelete) return;

    const therapistToUpdate = isAdmin ? selectedTherapistId : propTherapistId;
    if (!therapistToUpdate) return;
    
    // Verificar se o item tem um ID (necessário para excluir no backend)
    if (!scheduleToDelete.id) {
      showNotification("Não é possível remover um horário que ainda não foi salvo", "warning");
      handleCloseDeleteDialog();
      return;
    }

    try {
      setLoading(true);
      
      // Chamar o endpoint de remoção no backend
      await removeTherapistSchedule(therapistToUpdate, scheduleToDelete.id);
      
      // Atualizar o estado local
      setScheduleByBranch(prevState => {
        const newState = {...prevState};
        const branchId = scheduleToDelete.branchId;
        
        newState[branchId] = newState[branchId].filter(scheduleItem => 
          scheduleItem.id !== scheduleToDelete.id
        );
        
        return newState;
      });

      showNotification("Horário removido com sucesso", "success");
      handleCloseDeleteDialog();
    } catch (error) {
      console.error("Erro ao remover horário:", error);
      showNotification("Erro ao remover horário", "error");
      handleCloseDeleteDialog();
    } finally {
      setLoading(false);
    }
  };

  // Salvar um horário (adicionar ou editar)
  const handleSaveSchedule = async () => {
    if (!currentScheduleItem) return;

    const therapistToUpdate = isAdmin ? selectedTherapistId : propTherapistId;
    if (!therapistToUpdate) {
      showNotification("Terapeuta não selecionado", "error");
      return;
    }

    // Validações básicas
    if (currentScheduleItem.startTime >= currentScheduleItem.endTime) {
      showNotification("Hora inicial deve ser menor que hora final", "error");
      return;
    }

    try {
      setLoading(true);

      // Preparar dados para envio
      const scheduleData: {
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        branchId: string;
        id?: string;
      } = {
        dayOfWeek: currentScheduleItem.dayOfWeek,
        startTime: currentScheduleItem.startTime,
        endTime: currentScheduleItem.endTime,
        branchId: currentScheduleItem.branchId || selectedBranchId,
      };

      // Se estiver editando, incluir o ID
      if (isEditing && currentScheduleItem.id) {
        scheduleData.id = currentScheduleItem.id;
      }

      // Enviar para a API
      try {
        if (isAdmin) {
          await updateTherapistScheduleById(therapistToUpdate, scheduleData);
        } else {
          await updateTherapistSchedule(scheduleData);
        }
      } catch (apiError: unknown) {
        // Verificar se a resposta tem mensagem de erro
        const errorObj = apiError as { response?: { data?: { message?: string } } };
        const errorMessage = errorObj.response?.data?.message || 
                           "Erro ao salvar horário. Verifique se não há conflitos.";
        showNotification(errorMessage, "error");
        return;
      }

      // Recarregar todos os horários para garantir sincronização
      await fetchAllSchedules();

      showNotification(`Horário ${isEditing ? 'atualizado' : 'adicionado'} com sucesso`, "success");
      handleCloseDialog();
    } catch (error) {
      console.error(`Erro ao ${isEditing ? 'atualizar' : 'adicionar'} horário:`, error);
      showNotification(`Erro ao ${isEditing ? 'atualizar' : 'adicionar'} horário`, "error");
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar todos os horários
  const fetchAllSchedules = async () => {
    const therapistToFetch = isAdmin ? selectedTherapistId : propTherapistId;
    if (!therapistToFetch || branches.length === 0) return;

    try {
      setLoading(true);
      console.log("Buscando todos os horários para o terapeuta:", therapistToFetch);
      
      // Limpar o estado atual para evitar dados desatualizados
      setScheduleByBranch({});
      
      // Usar a API que busca todos os horários de uma vez
      const allSchedules = await getAllTherapistSchedules(therapistToFetch);
      console.log("Todos os horários obtidos:", allSchedules);
      
      // Organizar por filial
      const schedulesGrouped: ScheduleByBranch = {};
      
      // Inicializar arrays vazios para cada filial
      branches.forEach(branch => {
        schedulesGrouped[branch.id] = [];
      });
      
      // Distribuir os horários por filial
      if (Array.isArray(allSchedules)) {
        allSchedules.forEach((schedule: ScheduleItem) => {
          if (schedule.branchId && schedulesGrouped[schedule.branchId]) {
            schedulesGrouped[schedule.branchId].push(schedule);
          }
        });
      } else {
        console.warn("Dados recebidos não são um array:", allSchedules);
      }
      
      console.log("Horários organizados por filial:", schedulesGrouped);
      setScheduleByBranch(schedulesGrouped);
    } catch (error) {
      console.error("Erro ao carregar horários:", error);
      showNotification("Erro ao carregar horários", "error");
    } finally {
      setLoading(false);
    }
  };

  // Função para deletar todos os horários de uma filial
  const handleDeleteAllSchedules = async (branchId: string) => {
    const schedules = scheduleByBranch[branchId] || [];
    
    // Verificar se há horários para excluir
    if (schedules.length === 0) {
      showNotification("Não há horários para remover nesta filial", "info");
      return;
    }
    
    // Pedir confirmação explícita com o número de horários
    if (!window.confirm(`Tem certeza que deseja remover todos os ${schedules.length} horários desta filial? Esta ação não pode ser desfeita.`)) {
      return;
    }

    const therapistToUpdate = isAdmin ? selectedTherapistId : propTherapistId;
    if (!therapistToUpdate) {
      showNotification("Terapeuta não selecionado", "error");
      return;
    }
    
    try {
      setLoading(true);
      
      // Usar a nova função de exclusão em lote
      const result = await removeAllTherapistSchedulesFromBranch(therapistToUpdate, branchId);
      
      // Recarregar todos os horários
      await fetchAllSchedules();

      // Exibir mensagem de sucesso
      if (result.deleted === 0) {
        showNotification("Nenhum horário encontrado para excluir", "info");
      } else {
        showNotification(`${result.deleted} horários removidos com sucesso`, "success");
      }
    } catch (error) {
      console.error("Erro ao remover horários:", error);
      showNotification("Erro ao remover horários", "error");
    } finally {
      setLoading(false);
    }
  };

  // Renderizar a tabela de horários para uma filial específica
  const renderScheduleTable = (branchId: string) => {
    const schedules = scheduleByBranch[branchId] || [];
    
    if (schedules.length === 0) {
      return (
        <Alert severity="info" sx={{ my: 2 }}>
          Nenhum horário configurado para esta filial.
        </Alert>
      );
    }

    return (
      <TableContainer component={Paper} sx={{ my: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
          <Button
            color="error"
            startIcon={<DeleteSweepIcon />}
            onClick={() => handleDeleteAllSchedules(branchId)}
            disabled={loading}
          >
            Deletar Todos os Horários
          </Button>
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Dia da Semana</TableCell>
              <TableCell>Horário</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {schedules.map((item) => (
              <TableRow key={item.id || `${item.dayOfWeek}-${item.startTime}-${item.endTime}`}>
                <TableCell>
                  {daysOfWeek.find(day => day.value === item.dayOfWeek)?.label}
                </TableCell>
                <TableCell>
                  {item.startTime} - {item.endTime}
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                    <Tooltip title="Editar">
                      <IconButton 
                        color="primary" 
                        onClick={() => handleOpenEditDialog(item)}
                        disabled={loading}
                        size="medium"
                        sx={{ '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.1)' } }}
                      >
                        <EditIcon fontSize="medium" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Remover">
                      <IconButton 
                        color="error" 
                        onClick={() => handleOpenDeleteDialog(item)}
                        disabled={loading}
                        size="medium"
                        sx={{ '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.1)' } }}
                      >
                        <DeleteIcon fontSize="medium" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // Manipular mudança de modo de visualização
  const handleViewModeChange = (event: React.MouseEvent<HTMLElement>, newMode: ViewMode | null) => {
    if (newMode !== null) {
      setViewMode(newMode);
      
      // Resetar filtros e estados específicos ao mudar de modo
      if (newMode === 'compare' && !compareBranchId && branches.length > 0) {
        // Selecionar outra filial para comparação
        const otherBranch = branches.find(b => b.id !== selectedBranchId);
        if (otherBranch) {
          setCompareBranchId(otherBranch.id);
          fetchCompareSchedule(otherBranch.id);
        }
      }
      
      if (newMode !== 'compare') {
        setCompareSchedule([]);
      }
    }
  };
  
  // Buscar horários de filial para comparação
  const fetchCompareSchedule = async (branchId: string) => {
    const therapistToFetch = isAdmin ? selectedTherapistId : propTherapistId;
    if (!therapistToFetch) return;
    
    try {
      setFetchingCompare(true);
      const data = await getAllTherapistSchedules(therapistToFetch);
      
      // Filtrar apenas os horários da filial selecionada para comparação
      const filteredData = data.filter((item: ScheduleItem) => item.branchId === branchId);
      
      setCompareSchedule(filteredData);
    } catch (error) {
      console.error("Erro ao carregar horários para comparação:", error);
      showNotification("Erro ao carregar horários para comparação", "error");
    } finally {
      setFetchingCompare(false);
    }
  };
  
  // Manipular mudança de filial para comparação
  const handleCompareBranchChange = (event: SelectChangeEvent<string>) => {
    const branchId = event.target.value;
    setCompareBranchId(branchId);
    fetchCompareSchedule(branchId);
  };
  
  // Filtrar por dia da semana
  const handleDayFilterChange = (day: number | null) => {
    setDayFilter(day === dayFilter ? null : day);
  };
  
  // Copiar horários de uma filial para outra
  const handleCopyFromBranch = () => {
    if (!compareBranchId || compareSchedule.length === 0) {
      showNotification("Não há horários para copiar", "warning");
      return;
    }
    
    // Verificar se há horários na filial de destino
    const destinationSchedules = scheduleByBranch[selectedBranchId] || [];
    
    if (destinationSchedules.length > 0) {
      if (!window.confirm(`A filial de destino já possui ${destinationSchedules.length} horários. Deseja continuar e adicionar os horários copiados?`)) {
        return;
      }
    }
    
    // Criar novos horários baseados nos da filial de origem, mas para a filial de destino
    const newSchedules = compareSchedule.map(item => ({
      dayOfWeek: item.dayOfWeek,
      startTime: item.startTime,
      endTime: item.endTime,
      branchId: selectedBranchId
    }));
    
    // Verificar por duplicações antes de adicionar
    const finalSchedulesToAdd = newSchedules.filter(newItem => {
      return !destinationSchedules.some(existingItem => 
        existingItem.dayOfWeek === newItem.dayOfWeek && 
        existingItem.startTime === newItem.startTime && 
        existingItem.endTime === newItem.endTime
      );
    });
    
    if (finalSchedulesToAdd.length === 0) {
      showNotification("Todos os horários já existem na filial de destino", "info");
      return;
    }
    
    // Adicionar ao estado local (serão salvos quando o usuário clicar em Salvar)
    setScheduleByBranch(prev => ({
      ...prev,
      [selectedBranchId]: [...(prev[selectedBranchId] || []), ...finalSchedulesToAdd]
    }));
    
    showNotification(`${finalSchedulesToAdd.length} horários copiados com sucesso. Clique em Salvar para confirmar.`, "success");
  };
  
  // Sugerir horários comerciais
  const handleSuggestSchedule = () => {
    setSuggestingSchedule(true);
    
    // Verificar horários existentes
    const existingSchedules = scheduleByBranch[selectedBranchId] || [];
    
    // Criar sugestões de horários comerciais
    const suggestedSchedules: ScheduleItem[] = [];
    
    // Para cada dia comercial, adicionar os horários padrão
    commercialDays.forEach(day => {
      commercialHours.forEach(hours => {
        // Verificar se esse horário já existe
        const exists = existingSchedules.some(
          item => item.dayOfWeek === day && 
                 item.startTime === hours.startTime && 
                 item.endTime === hours.endTime
        );
        
        if (!exists) {
          suggestedSchedules.push({
            dayOfWeek: day,
            startTime: hours.startTime,
            endTime: hours.endTime,
            branchId: selectedBranchId
          });
        }
      });
    });
    
    if (suggestedSchedules.length === 0) {
      showNotification("Todos os horários comerciais já estão configurados", "info");
      setSuggestingSchedule(false);
      return;
    }
    
    // Adicionar as sugestões ao estado
    setScheduleByBranch(prev => ({
      ...prev,
      [selectedBranchId]: [...(prev[selectedBranchId] || []), ...suggestedSchedules]
    }));
    
    showNotification(`${suggestedSchedules.length} horários comerciais sugeridos. Clique em Salvar para confirmar.`, "success");
    setSuggestingSchedule(false);
  };

  // Renderizar visualização em calendário
  const renderCalendarView = () => {
    const schedules = scheduleByBranch[selectedBranchId] || [];
    
    if (schedules.length === 0) {
      return (
        <Alert severity="info" sx={{ my: 2 }}>
          Nenhum horário configurado para esta filial.
        </Alert>
      );
    }
    
    // Agrupar por dia da semana
    const schedulesByDay: Record<number, ScheduleItem[]> = {};
    
    daysOfWeek.forEach(day => {
      schedulesByDay[day.value] = schedules.filter(item => item.dayOfWeek === day.value);
    });
    
    return (
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {daysOfWeek.map(day => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={day.value}>
            <Paper
              sx={{
                p: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: day.value === 0 ? '#fff8e1' : 'white'
              }}
            >
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                {day.label}
                <Chip 
                  size="small" 
                  label={schedulesByDay[day.value].length} 
                  color="primary"
                  sx={{ ml: 1 }}
                />
              </Typography>
              
              {schedulesByDay[day.value].length === 0 ? (
                <Box sx={{ p: 1, textAlign: 'center', color: 'text.secondary' }}>
                  <Typography variant="body2">Sem horários</Typography>
                </Box>
              ) : (
                <Box sx={{ flexGrow: 1 }}>
                  {schedulesByDay[day.value]
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map((item, index) => (
                      <Box 
                        key={item.id || `${day.value}-${index}`}
                        sx={{ 
                          p: 1, 
                          mb: 1, 
                          border: '1px solid', 
                          borderColor: 'divider',
                          borderRadius: 1,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <Typography variant="body2">
                          {item.startTime} - {item.endTime}
                        </Typography>
                        <Box>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenEditDialog(item)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleOpenDeleteDialog(item)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    ))}
                </Box>
              )}
              
              <Button 
                startIcon={<AddIcon />} 
                onClick={() => {
                  setCurrentScheduleItem({
                    dayOfWeek: day.value,
                    startTime: '09:00',
                    endTime: '18:00',
                    branchId: selectedBranchId
                  });
                  setIsEditing(false);
                  setIsDialogOpen(true);
                }}
                sx={{ mt: 'auto' }}
                size="small"
              >
                Adicionar
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    );
  };

  // Renderizar visualização de comparação
  const renderCompareView = () => {
    const currentSchedules = scheduleByBranch[selectedBranchId] || [];
    const otherBranchName = branches.find(b => b.id === compareBranchId)?.name || 'Outra filial';
    
    return (
      <Box sx={{ mt: 2 }}>
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Filial para comparação</InputLabel>
                <Select
                  value={compareBranchId}
                  onChange={handleCompareBranchChange}
                  label="Filial para comparação"
                  disabled={fetchingCompare || loading}
                >
                  {branches
                    .filter(branch => branch.id !== selectedBranchId)
                    .map(branch => (
                      <MenuItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                startIcon={<CopyIcon />}
                onClick={handleCopyFromBranch}
                disabled={!compareBranchId || compareSchedule.length === 0}
              >
                Copiar horários para {branches.find(b => b.id === selectedBranchId)?.name}
              </Button>
            </Grid>
          </Grid>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              {branches.find(b => b.id === selectedBranchId)?.name} ({currentSchedules.length} horários)
            </Typography>
            {currentSchedules.length === 0 ? (
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
                    {currentSchedules
                      .sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime))
                      .map(item => (
                        <TableRow key={item.id || `${item.dayOfWeek}-${item.startTime}`}>
                          <TableCell>{daysOfWeek.find(d => d.value === item.dayOfWeek)?.label}</TableCell>
                          <TableCell>{item.startTime} - {item.endTime}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              {otherBranchName} ({compareSchedule.length} horários)
              {fetchingCompare && <CircularProgress size={20} sx={{ ml: 2 }} />}
            </Typography>
            {!compareBranchId ? (
              <Alert severity="info">Selecione uma filial para comparação</Alert>
            ) : compareSchedule.length === 0 && !fetchingCompare ? (
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
                    {compareSchedule
                      .sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime))
                      .map(item => (
                        <TableRow key={item.id || `${item.dayOfWeek}-${item.startTime}`}>
                          <TableCell>{daysOfWeek.find(d => d.value === item.dayOfWeek)?.label}</TableCell>
                          <TableCell>{item.startTime} - {item.endTime}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Grid>
        </Grid>
      </Box>
    );
  };

  return (
    <Box>
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={3}>
            {isAdmin && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Terapeuta</InputLabel>
                  <Select
                    value={selectedTherapistId}
                    onChange={handleTherapistChange}
                    label="Terapeuta"
                    disabled={loading}
                  >
                    <MenuItem value="" disabled>Selecione um terapeuta</MenuItem>
                    {therapists.map(therapist => (
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
                <InputLabel>Filial</InputLabel>
                <Select
                  value={selectedBranchId}
                  onChange={handleBranchChange}
                  label="Filial"
                  disabled={loading || (isAdmin && !selectedTherapistId)}
                >
                  {branches.map(branch => (
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
          Selecione um terapeuta para gerenciar sua disponibilidade.
        </Alert>
      ) : loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              {branches.find(b => b.id === selectedBranchId)?.name || 'Filial selecionada'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={handleViewModeChange}
                size="small"
                aria-label="modo de visualização"
              >
                <ToggleButton value="list" aria-label="visualização em lista">
                  <Tooltip title="Visualização em lista">
                    <ListIcon />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="calendar" aria-label="visualização em calendário">
                  <Tooltip title="Visualização em calendário">
                    <CalendarIcon />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="compare" aria-label="comparar filiais">
                  <Tooltip title="Comparar filiais">
                    <CompareIcon />
                  </Tooltip>
                </ToggleButton>
              </ToggleButtonGroup>
              
              <ButtonGroup>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={handleOpenAddDialog}
                  disabled={loading}
                >
                  Adicionar Horário
                </Button>
                <Button 
                  variant="outlined"
                  startIcon={<SuggestionIcon />}
                  onClick={handleSuggestSchedule}
                  disabled={loading || suggestingSchedule}
                >
                  Sugerir Horários
                </Button>
                {Object.keys(scheduleByBranch).length > 0 && viewMode === 'list' && (
                  <Button 
                    variant="outlined" 
                    color="error"
                    startIcon={<DeleteSweepIcon />}
                    onClick={() => handleDeleteAllSchedules(selectedBranchId)}
                    disabled={loading}
                  >
                    Deletar Todos
                  </Button>
                )}
              </ButtonGroup>
            </Box>
          </Box>

          {viewMode === 'list' && renderScheduleTable(selectedBranchId)}
          {viewMode === 'calendar' && renderCalendarView()}
          {viewMode === 'compare' && renderCompareView()}

          <Box sx={{ mt: 4 }}>
            <Typography variant="subtitle1" gutterBottom>
              Todas as Filiais
            </Typography>
            <Tabs
              value={selectedBranchId}
              onChange={(_, value) => setSelectedBranchId(value)}
              variant="scrollable"
              scrollButtons="auto"
            >
              {branches.map(branch => (
                <Tab 
                  key={branch.id} 
                  value={branch.id} 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {branch.name}
                      <Chip 
                        size="small" 
                        label={(scheduleByBranch[branch.id] || []).length} 
                        color="primary"
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  } 
                />
              ))}
            </Tabs>
          </Box>
        </>
      )}

      {/* Diálogos existentes */}
      <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {isEditing ? 'Editar Horário' : 'Adicionar Novo Horário'}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Filial</InputLabel>
            <Select
              value={currentScheduleItem?.branchId || ''}
              onChange={(e) => handleScheduleItemChange('branchId', e.target.value)}
              label="Filial"
            >
              {branches.map(branch => (
                <MenuItem key={branch.id} value={branch.id}>
                  {branch.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Dia da Semana</InputLabel>
            <Select
              value={currentScheduleItem?.dayOfWeek || 1}
              onChange={(e) => handleScheduleItemChange('dayOfWeek', Number(e.target.value))}
              label="Dia da Semana"
            >
              {daysOfWeek.map(day => (
                <MenuItem key={day.value} value={day.value}>
                  {day.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                label="Hora Inicial"
                type="time"
                fullWidth
                value={currentScheduleItem?.startTime || ''}
                onChange={(e) => handleScheduleItemChange('startTime', e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Hora Final"
                type="time"
                fullWidth
                value={currentScheduleItem?.endTime || ''}
                onChange={(e) => handleScheduleItemChange('endTime', e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={handleSaveSchedule} 
            color="primary" 
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={loading}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para confirmar exclusão */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          {scheduleToDelete && (
            <Typography>
              Tem certeza que deseja excluir o horário de {" "}
              {daysOfWeek.find(day => day.value === scheduleToDelete.dayOfWeek)?.label}, {" "}
              {scheduleToDelete.startTime} - {scheduleToDelete.endTime}?
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteSchedule}
            color="error"
            variant="contained"
            startIcon={<DeleteIcon />}
            disabled={loading}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TherapistAvailabilityManager; 