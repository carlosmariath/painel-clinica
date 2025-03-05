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
  InputAdornment
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNotification } from "../components/Notification";
import { Category } from "../types/knowledgeTypes";
import * as knowledgeService from "../services/knowledgeService";

// Componente para o formulário de categorias
interface CategoryFormProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  category?: Category | null;
}

const CategoryForm = ({ open, onClose, onSave, category }: CategoryFormProps) => {
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
  }>({
    name: "",
    description: ""
  });
  
  const { showNotification } = useNotification();

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
        description: category.description || ""
      });
    } else {
      setFormData({
        name: "",
        description: ""
      });
    }
  }, [category]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (category) {
        await knowledgeService.updateCategory(category.id, formData);
        showNotification("Categoria atualizada com sucesso", "success");
      } else {
        await knowledgeService.createCategory(formData);
        showNotification("Categoria criada com sucesso", "success");
      }
      onSave();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar categoria:", error);
      showNotification("Erro ao salvar categoria", "error");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{category ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Nome da Categoria"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <TextField
            fullWidth
            label="Descrição"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={4}
          />

          {category && (
            <Typography variant="body2" color="text.secondary">
              Esta categoria possui {category._count.knowledgeEntries} entradas na base de conhecimento.
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Cancelar</Button>
        <Button 
          onClick={handleSubmit} 
          color="primary" 
          variant="contained"
          disabled={!formData.name}
        >
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Componente principal para gerenciamento de categorias
const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const categoriesData = await knowledgeService.getCategories();
      setCategories(categoriesData);
      setFilteredCategories(categoriesData);
      showNotification("Dados carregados com sucesso", "success");
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      showNotification("Erro ao carregar categorias", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (category: Category | null = null) => {
    setSelectedCategory(category);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedCategory(null);
  };

  const handleDelete = (category: Category) => {
    setCategoryToDelete(category);
    setOpenDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    
    try {
      await knowledgeService.deleteCategory(categoryToDelete.id);
      await fetchData();
      showNotification("Categoria excluída com sucesso", "success");
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
      showNotification("Erro ao excluir categoria", "error");
    } finally {
      setOpenDeleteConfirm(false);
      setCategoryToDelete(null);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const filtered = categories.filter(
        category => 
          category.name.toLowerCase().includes(term) || 
          category.description.toLowerCase().includes(term)
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  }, [searchTerm, categories]);

  // Ordenar categorias por número de entradas (do maior para o menor)
  const sortedCategories = [...filteredCategories].sort(
    (a, b) => b._count.knowledgeEntries - a._count.knowledgeEntries
  );

  return (
    <Box sx={{ p: 3, flexGrow: 1 }}>
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Categorias da Base de Conhecimento
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenForm()}
        >
          Nova Categoria
        </Button>
      </Box>

      {/* Filtro de busca */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <TextField
            fullWidth
            label="Buscar categorias"
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      {/* Lista de Categorias */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell align="center">Total de Entradas</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Nenhuma categoria encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                sortedCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <Typography fontWeight="medium">{category.name}</Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: "400px" }}>
                      <Typography noWrap>{category.description}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      {category._count.knowledgeEntries}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenForm(category)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(category)}
                        disabled={category._count.knowledgeEntries > 0}
                        title={category._count.knowledgeEntries > 0 ? "Não é possível excluir categorias com entradas" : "Excluir categoria"}
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
      )}

      {/* Formulário de Categoria */}
      <CategoryForm
        open={openForm}
        onClose={handleCloseForm}
        onSave={fetchData}
        category={selectedCategory}
      />

      {/* Diálogo de Confirmação de Exclusão */}
      <Dialog open={openDeleteConfirm} onClose={() => setOpenDeleteConfirm(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir a categoria "{categoryToDelete?.name}"? Esta ação não pode ser desfeita.
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

export default Categories; 