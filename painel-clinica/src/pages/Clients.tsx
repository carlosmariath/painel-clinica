import { useEffect, useState } from "react";
import { Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Button } from "@mui/material";
import { getClients, deleteClient } from "../services/clientsService";
import ClientForm from "../components/ClientForm";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useNotification } from "../components/Notification";

const Clients = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [openForm, setOpenForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getClients();
        setClients(data);
      } catch (error) {
        showNotification("Erro ao carregar clientes", "error");
      }
    };

    fetchData();
  }, []);

  const handleOpenForm = (client?: any) => {
    setSelectedClient(client || null);
    setOpenForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este cliente?")) {
      try {
        await deleteClient(id);
        setClients(clients.filter((client) => client.id !== id));
        showNotification("Cliente excluído com sucesso!", "success");
      } catch (error) {
        showNotification("Erro ao excluir cliente.", "error");
      }
    }
  };

  return (
    <Container>
      <Typography variant="h4" sx={{ mb: 3 }}>👥 Gerenciamento de Clientes</Typography>

      <Button variant="contained" color="primary" sx={{ mb: 2 }} onClick={() => handleOpenForm()}>
        <AddIcon /> Novo Cliente
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
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>{client.name}</TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>{client.phone || "Não informado"}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenForm(client)} title="Editar">
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(client.id)} title="Excluir">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <ClientForm open={openForm} onClose={() => setOpenForm(false)} onSave={() => setOpenForm(false)} client={selectedClient} />
    </Container>
  );
};

export default Clients;