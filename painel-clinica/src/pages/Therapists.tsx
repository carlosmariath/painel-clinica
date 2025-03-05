import { useEffect, useState } from "react";
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  IconButton, 
  Button,
  Card,
  CardContent,
  Chip,
  Avatar,
  LinearProgress,
  Tooltip,
  useMediaQuery
} from "@mui/material";
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Add as AddIcon,
  MedicalServices as MedicalIcon,
} from "@mui/icons-material";
import { getTherapists, deleteTherapist } from "../services/threapistService";
import TherapistForm from "../components/TherapistForm";
import { useNotification } from "../components/Notification";
import theme from "../theme";

const Therapists = () => {
  const [therapists, setTherapists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState<any | null>(null);
  const { showNotification } = useNotification();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getTherapists();
        setTherapists(data);
      } catch (error) {
        console.error("Erro ao buscar terapeutas:", error);
        showNotification("Erro ao carregar terapeutas", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleOpenForm = (therapist?: any) => {
    setSelectedTherapist(therapist || null);
    setOpenForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este terapeuta?")) {
      try {
        await deleteTherapist(id);
        setTherapists(therapists.filter((therapist) => therapist.id !== id));
        showNotification("Terapeuta excluído com sucesso!", "success");
      } catch (error) {
        showNotification("Erro ao excluir terapeuta.", "error");
      }
    }
  };

  return (
    <Box>
      {/* Cabeçalho da página */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          mb: 4 
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 0 } }}>
          <Avatar 
            sx={{ 
              mr: 2, 
              bgcolor: theme.palette.secondary.light,
              color: theme.palette.secondary.main,
              width: 48,
              height: 48
            }}
          >
            <MedicalIcon fontSize="large" />
          </Avatar>
          <Typography variant="h4" fontWeight={700}>
            Terapeutas
          </Typography>
        </Box>
        
        <Button 
          variant="contained" 
          color="secondary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
          sx={{ 
            borderRadius: '8px',
            px: 3,
            py: 1,
            boxShadow: theme.shadows[2]
          }}
        >
          Novo Terapeuta
        </Button>
      </Box>

      {/* Indicador de carregamento */}
      {loading && <LinearProgress sx={{ mb: 2 }} color="secondary" />}

      {/* Tabela responsiva */}
      <Card
        elevation={2}
        sx={{
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <TableContainer 
            component={Paper} 
            elevation={0} 
            sx={{ 
              borderRadius: 0,
              height: '100%',
              minHeight: '50vh'
            }}
          >
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                  <TableCell sx={{ fontWeight: 600 }}>Nome</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>E-mail</TableCell>
                  <TableCell sx={{ fontWeight: 600, display: { xs: 'none', md: 'table-cell' } }}>Telefone</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Especialidade</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {therapists.length === 0 && !loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                      <Typography variant="body1" color="text.secondary">
                        Nenhum terapeuta cadastrado
                      </Typography>
                      <Button 
                        variant="outlined" 
                        color="secondary"
                        startIcon={<AddIcon />} 
                        onClick={() => handleOpenForm()}
                        sx={{ mt: 2 }}
                      >
                        Cadastrar Terapeuta
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  therapists.map((therapist) => (
                    <TableRow key={therapist.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            sx={{ 
                              mr: 2, 
                              bgcolor: theme.palette.secondary.light,
                              fontSize: '0.875rem',
                              width: 32,
                              height: 32
                            }}
                          >
                            {therapist.name?.charAt(0) || 'T'}
                          </Avatar>
                          <Typography variant="body1" fontWeight={500}>
                            {therapist.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{therapist.email}</TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                        {therapist.phone || "Não informado"}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={therapist.specialty || "Geral"} 
                          size="small" 
                          sx={{ 
                            bgcolor: theme.palette.info.light,
                            color: theme.palette.info.dark,
                            fontWeight: 500
                          }} 
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Editar">
                          <IconButton 
                            onClick={() => handleOpenForm(therapist)}
                            size="small"
                            sx={{ 
                              color: theme.palette.secondary.main,
                              bgcolor: theme.palette.secondary.light + '20',
                              mr: 1,
                              '&:hover': { bgcolor: theme.palette.secondary.light + '40' }
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton 
                            onClick={() => handleDelete(therapist.id)}
                            size="small"
                            sx={{ 
                              color: theme.palette.error.main,
                              bgcolor: theme.palette.error.light + '20',
                              '&:hover': { bgcolor: theme.palette.error.light + '40' }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <TherapistForm 
        open={openForm} 
        onClose={() => setOpenForm(false)} 
        onSave={() => {
          setOpenForm(false);
          // Recarregar a lista de terapeutas após salvar
          const fetchData = async () => {
            try {
              const data = await getTherapists();
              setTherapists(data);
              showNotification("Terapeuta salvo com sucesso!", "success");
            } catch (error) {
              showNotification("Erro ao atualizar a lista de terapeutas", "error");
            }
          };
          fetchData();
        }} 
        therapist={selectedTherapist} 
      />
    </Box>
  );
};

export default Therapists;