import { useEffect, useState } from "react";
import { Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Button } from "@mui/material";
import { getTherapists, deleteTherapist } from "../services/threapistService";
import TherapistForm from "../components/TherapistForm";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

const Therapists = () => {
  const [therapists, setTherapists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getTherapists();
        setTherapists(data);
      } catch (error) {
        console.error("Erro ao buscar terapeutas:", error);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleOpenForm = (therapist?: any) => {
    setSelectedTherapist(therapist || null);
    setOpenForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este terapeuta?")) {
      await deleteTherapist(id);
      setTherapists(therapists.filter((therapist) => therapist.id !== id));
    }
  };

  return (
    <Container>
      <Typography variant="h4" sx={{ mb: 3 }}>🧑‍⚕️ Gerenciamento de Terapeutas</Typography>

      <Button variant="contained" color="primary" sx={{ mb: 2 }} onClick={() => handleOpenForm()}>
        <AddIcon /> Novo Terapeuta
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>E-mail</TableCell>
              <TableCell>Telefone</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {therapists.map((therapist) => (
              <TableRow key={therapist.id}>
                <TableCell>{therapist.name}</TableCell>
                <TableCell>{therapist.email}</TableCell>
                <TableCell>{therapist.phone || "Não informado"}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenForm(therapist)} title="Editar">
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(therapist.id)} title="Excluir">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TherapistForm open={openForm} onClose={() => setOpenForm(false)} onSave={() => setOpenForm(false)} therapist={selectedTherapist} />
    </Container>
  );
};

export default Therapists;