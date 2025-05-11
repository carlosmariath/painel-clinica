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
  Chip,
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
  Pagination,
  Switch,
  FormControlLabel,
  SelectChangeEvent,
  Autocomplete
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNotification } from "../components/Notification";
import { KnowledgeEntry, Category, KnowledgeEntryFilters } from "../types/knowledgeTypes";
import * as knowledgeService from "../services/knowledgeService";

// Interface para o formulário
interface FormData {
  question: string;
  answer: string;
  categoryId: string;
  tags: string[];
  enabled: boolean;
}

// Componente para o formulário de entradas de conhecimento
interface KnowledgeFormProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  entry?: KnowledgeEntry | null;
  categories: Category[];
}

const KnowledgeForm = ({ open, onClose, onSave, entry, categories }: KnowledgeFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    question: "",
    answer: "",
    categoryId: "",
    tags: [],
    enabled: true
  });
  
  const { showNotification } = useNotification();

  useEffect(() => {
    if (entry) {
      setFormData({
        question: entry.question || "",
        answer: entry.answer || "",
        categoryId: entry.categoryId || "",
        tags: entry.tags || [],
        enabled: entry.enabled !== undefined ? entry.enabled : true
      });
    } else {
      setFormData({
        question: "",
        answer: "",
        categoryId: "",
        tags: [],
        enabled: true
      });
    }
  }, [entry]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const name = e.target.name as string;
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const name = e.target.name as string;
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, enabled: e.target.checked }));
  };

  const handleTagsChange = (event: React.SyntheticEvent, newValue: string[]) => {
    setFormData(prev => ({ ...prev, tags: newValue }));
  };

  const handleSubmit = async () => {
    try {
      if (entry) {
        await knowledgeService.updateKnowledgeEntry(entry.id, formData);
        showNotification("Entrada atualizada com sucesso", "success");
      } else {
        await knowledgeService.createKnowledgeEntry(formData);
        showNotification("Entrada criada com sucesso", "success");
      }
      onSave();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar entrada:", error);
      showNotification("Erro ao salvar entrada", "error");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{entry ? "Editar Entrada" : "Nova Entrada"}</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Pergunta"
            name="question"
            value={formData.question}
            onChange={handleChange}
            required
          />

          <TextField
            fullWidth
            label="Resposta"
            name="answer"
            value={formData.answer}
            onChange={handleChange}
            multiline
            rows={6}
            required
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

          <Autocomplete
            multiple
            freeSolo
            options={[]}
            value={formData.tags}
            onChange={handleTagsChange}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Tags"
                placeholder="Adicionar tag"
                helperText="Pressione Enter após cada tag"
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip 
                  label={option} 
                  {...getTagProps({ index })} 
                  color="primary" 
                  variant="outlined"
                  size="small"
                />
              ))
            }
          />

          <FormControlLabel
            control={
              <Switch
                checked={formData.enabled}
                onChange={handleSwitchChange}
                color="primary"
              />
            }
            label="Entrada ativa"
          />

          {entry && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Visualizações: {entry.viewCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Última atualização: {new Date(entry.updatedAt).toLocaleDateString('pt-BR')}
              </Typography>
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Cancelar</Button>
        <Button 
          onClick={handleSubmit} 
          color="primary" 
          variant="contained"
          disabled={!formData.question || !formData.answer}
        >
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Componente principal para gerenciamento de entradas de conhecimento
const KnowledgeEntries = () => {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<KnowledgeEntry | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<KnowledgeEntry | null>(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  
  // Filtros
  const [filters, setFilters] = useState<KnowledgeEntryFilters>({
    categoryId: "",
    searchTerm: "",
    enabled: "all"
  });
  
  const [filteredEntries, setFilteredEntries] = useState<KnowledgeEntry[]>([]);
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [entriesData, categoriesData] = await Promise.all([
        knowledgeService.getKnowledgeEntries(),
        knowledgeService.getCategories()
      ]);

      setEntries(entriesData);
      setFilteredEntries(entriesData);
      setCategories(categoriesData);
      showNotification("Dados carregados com sucesso", "success");
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      showNotification("Erro ao carregar dados da base de conhecimento", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (entry: KnowledgeEntry | null = null) => {
    setSelectedEntry(entry);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedEntry(null);
  };

  const handleDelete = (entry: KnowledgeEntry) => {
    setEntryToDelete(entry);
    setOpenDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!entryToDelete) return;
    
    try {
      await knowledgeService.deleteKnowledgeEntry(entryToDelete.id);
      await fetchData();
      showNotification("Entrada excluída com sucesso", "success");
    } catch (error) {
      console.error("Erro ao excluir entrada:", error);
      showNotification("Erro ao excluir entrada", "error");
    } finally {
      setOpenDeleteConfirm(false);
      setEntryToDelete(null);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const name = e.target.name as string;
    const value = e.target.value as string;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const name = e.target.name as string;
    const value = e.target.value;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleEnabledStatusChange = (entry: KnowledgeEntry) => {
    knowledgeService.updateKnowledgeEntry(entry.id, { enabled: !entry.enabled })
      .then(() => {
        fetchData();
        showNotification(`Entrada ${!entry.enabled ? 'ativada' : 'desativada'} com sucesso`, "success");
      })
      .catch((error) => {
        console.error("Erro ao atualizar status:", error);
        showNotification("Erro ao atualizar status da entrada", "error");
      });
  };

  useEffect(() => {
    // Quando os filtros mudam, buscar novamente da API
    if (Object.keys(filters).length > 0) {
      fetchData();
    }
  }, [filters]);

  const resetFilters = () => {
    setFilters({
      categoryId: "",
      searchTerm: "",
      enabled: "all"
    });
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    // Atualizar os filtros para incluir a paginação
    setFilters(prev => ({
      ...prev,
      page: value,
      limit: rowsPerPage
    }));
  };

  // Paginação
  const paginatedEntries = filteredEntries;
  const pageCount = Math.ceil(filteredEntries.length / rowsPerPage);

  return (
    <Box sx={{ p: 3, flexGrow: 1 }}>
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Base de Conhecimento
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenForm()}
        >
          Nova Entrada
        </Button>
      </Box>

      {/* Filtros */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Filtros</Typography>
          <Stack spacing={2}>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel id="category-filter-label">Categoria</InputLabel>
                <Select
                  labelId="category-filter-label"
                  label="Categoria"
                  name="categoryId"
                  value={filters.categoryId || ""}
                  onChange={handleSelectChange}
                >
                  <MenuItem value="">Todas as categorias</MenuItem>
                  {categories.map(category => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name} ({category._count.knowledgeEntries})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  label="Status"
                  name="enabled"
                  value={filters.enabled?.toString() || "all"}
                  onChange={handleSelectChange}
                >
                  <MenuItem value="all">Todos</MenuItem>
                  <MenuItem value="true">Ativo</MenuItem>
                  <MenuItem value="false">Inativo</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Buscar"
                name="searchTerm"
                value={filters.searchTerm || ""}
                onChange={handleFilterChange}
                fullWidth
                placeholder="Pesquisar por pergunta, resposta ou tag..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <Button variant="outlined" onClick={resetFilters}>
                Limpar Filtros
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Lista de Entradas */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Pergunta</TableCell>
                  <TableCell>Categoria</TableCell>
                  <TableCell>Tags</TableCell>
                  <TableCell align="center">Visualizações</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Nenhuma entrada encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell sx={{ maxWidth: "300px" }}>
                        <Typography noWrap>{entry.question}</Typography>
                      </TableCell>
                      <TableCell>
                        {entry.category ? entry.category.name : "Sem categoria"}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                          {entry.tags.slice(0, 3).map((tag, index) => (
                            <Chip 
                              key={index} 
                              label={tag} 
                              size="small" 
                              variant="outlined"
                            />
                          ))}
                          {entry.tags.length > 3 && (
                            <Chip 
                              label={`+${entry.tags.length - 3}`} 
                              size="small" 
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <VisibilityIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                          {entry.viewCount}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Switch
                          checked={entry.enabled}
                          onChange={() => handleEnabledStatusChange(entry)}
                          color="primary"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenForm(entry)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(entry)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Paginação */}
          {pageCount > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <Pagination 
                count={pageCount} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
                showFirstButton 
                showLastButton
              />
            </Box>
          )}
        </>
      )}

      {/* Formulário de Entrada */}
      <KnowledgeForm
        open={openForm}
        onClose={handleCloseForm}
        onSave={fetchData}
        entry={selectedEntry}
        categories={categories}
      />

      {/* Diálogo de Confirmação de Exclusão */}
      <Dialog open={openDeleteConfirm} onClose={() => setOpenDeleteConfirm(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir esta entrada da base de conhecimento? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteConfirm(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={confirmDelete} color="error">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KnowledgeEntries; 