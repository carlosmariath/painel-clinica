import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  InputAdornment,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Tooltip,
  SelectChangeEvent,
  FormControlLabel,
  Checkbox
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useNotification } from "../components/Notification";
import { FrequentQuestion, Category, FrequentQuestionFilters } from "../types/knowledgeTypes";
import * as knowledgeService from "../services/knowledgeService";

// Componente para o formulário de conversão de pergunta para entrada
interface ConversionFormProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  question: FrequentQuestion | null;
  categories: Category[];
}

const ConversionForm = ({ open, onClose, onSave, question, categories }: ConversionFormProps) => {
  const [formData, setFormData] = useState<{
    answer: string;
    categoryId: string;
  }>({
    answer: "",
    categoryId: ""
  });
  
  const { showNotification } = useNotification();

  useEffect(() => {
    if (question) {
      setFormData({
        answer: "",
        categoryId: ""
      });
    }
  }, [question]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const name = e.target.name as string;
    const value = e.target.value as string;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const name = e.target.name as string;
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!question) return;
    
    try {
      await knowledgeService.convertToKnowledgeEntry(question.id, {
        answer: formData.answer,
        categoryId: formData.categoryId || null
      });
      showNotification("Pergunta convertida com sucesso", "success");
      onSave();
      onClose();
    } catch (error) {
      console.error("Erro ao converter pergunta:", error);
      showNotification("Erro ao converter pergunta", "error");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Converter Pergunta para Base de Conhecimento</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <Box sx={{ p: 2, bgcolor: "background.default", borderRadius: 1 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Pergunta Frequente
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {question?.question}
            </Typography>
            <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Frequência: {question?.count} ocorrências
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Última ocorrência: {question?.lastAskedAt ? new Date(question.lastAskedAt).toLocaleDateString('pt-BR') : ""}
              </Typography>
            </Box>
          </Box>

          <TextField
            fullWidth
            label="Resposta"
            name="answer"
            value={formData.answer}
            onChange={handleChange}
            multiline
            rows={6}
            required
            placeholder="Digite uma resposta completa para esta pergunta..."
          />

          <FormControl fullWidth>
            <InputLabel id="category-label">Categoria</InputLabel>
            <Select
              labelId="category-label"
              label="Categoria"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleSelectChange}
            >
              <MenuItem value="">Nenhuma categoria</MenuItem>
              {categories.map(category => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Cancelar</Button>
        <Button 
          onClick={handleSubmit} 
          color="primary" 
          variant="contained"
          disabled={!formData.answer}
        >
          Converter para Base de Conhecimento
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Componente principal para análise de perguntas frequentes
const FrequentQuestions = () => {
  const [questions, setQuestions] = useState<FrequentQuestion[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<FrequentQuestion | null>(null);
  
  // Filtros
  const [filters, setFilters] = useState<FrequentQuestionFilters>({
    onlyWithoutAnswer: true,
    searchTerm: ""
  });
  
  const [filteredQuestions, setFilteredQuestions] = useState<FrequentQuestion[]>([]);
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [questionsData, categoriesData] = await Promise.all([
        knowledgeService.getFrequentQuestions(filters),
        knowledgeService.getCategories()
      ]);

      setQuestions(questionsData);
      setFilteredQuestions(questionsData);
      setCategories(categoriesData);
      showNotification("Dados carregados com sucesso", "success");
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      showNotification("Erro ao carregar perguntas frequentes", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (question: FrequentQuestion) => {
    setSelectedQuestion(question);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedQuestion(null);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    if (name === "onlyWithoutAnswer") {
      setFilters(prev => ({ ...prev, [name]: checked }));
    } else {
      setFilters(prev => ({ ...prev, [name]: value }));
    }
  };

  useEffect(() => {
    // Quando os filtros mudam, buscar novamente da API
    if (Object.keys(filters).length > 0) {
      fetchData();
    }
  }, [filters]);

  // Formatação da data para exibição
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Box sx={{ p: 3, flexGrow: 1 }}>
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Análise de Perguntas Frequentes
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Identifique perguntas comuns e adicione-as à base de conhecimento
          </Typography>
        </Box>
      </Box>

      {/* Filtros */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Stack spacing={2}>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <TextField
                label="Buscar"
                name="searchTerm"
                value={filters.searchTerm || ""}
                onChange={handleFilterChange}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.onlyWithoutAnswer || false}
                    onChange={handleFilterChange}
                    name="onlyWithoutAnswer"
                  />
                }
                label="Apenas sem resposta"
              />
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Lista de Perguntas Frequentes */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Pergunta</TableCell>
                <TableCell align="center">Frequência</TableCell>
                <TableCell align="center">Última Ocorrência</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Origem</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredQuestions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Nenhuma pergunta frequente encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                filteredQuestions.map((question) => (
                  <TableRow key={question.id}>
                    <TableCell sx={{ maxWidth: "400px" }}>
                      <Typography noWrap>{question.question}</Typography>
                    </TableCell>
                    <TableCell align="center">{question.count}</TableCell>
                    <TableCell align="center">{formatDate(question.lastAskedAt)}</TableCell>
                    <TableCell align="center">
                      {question.knowledgeId ? (
                        <Chip 
                          label="Na base" 
                          color="success" 
                          size="small" 
                          variant="outlined"
                        />
                      ) : (
                        <Chip 
                          label="Sem resposta" 
                          color="warning" 
                          size="small" 
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={question.autoDetected ? "Detectada automaticamente pelo sistema" : "Adicionada manualmente pela equipe"}>
                        <Chip 
                          label={question.autoDetected ? "Automática" : "Manual"} 
                          color={question.autoDetected ? "primary" : "default"} 
                          size="small" 
                          variant="outlined"
                          icon={question.autoDetected ? <InfoOutlinedIcon /> : undefined}
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        startIcon={<PlaylistAddIcon />}
                        variant="outlined"
                        size="small"
                        onClick={() => handleOpenForm(question)}
                        disabled={question.knowledgeId !== null}
                        color="primary"
                      >
                        Converter
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Formulário de Conversão */}
      <ConversionForm
        open={openForm}
        onClose={handleCloseForm}
        onSave={fetchData}
        question={selectedQuestion}
        categories={categories}
      />
    </Box>
  );
};

export default FrequentQuestions; 