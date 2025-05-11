import { useEffect, useState } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button } from "@mui/material";
import { createClient, updateClient } from "../services/clientsService";

interface ClientFormProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  client?: any;
}

const ClientForm = ({ open, onClose, onSave, client }: ClientFormProps) => {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });

  useEffect(() => {
    if (client) {
      setFormData({ name: client.name, email: client.email, phone: client.phone || "" });
    } else {
      setFormData({ name: "", email: "", phone: "" });
    }
  }, [client]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (client) {
      await updateClient(client.id, formData);
    } else {
      await createClient(formData);
    }
    onSave();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{client ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
      <DialogContent>
        <TextField fullWidth margin="normal" label="Nome" name="name" value={formData.name} onChange={handleChange} required />
        <TextField fullWidth margin="normal" label="E-mail" name="email" type="email" value={formData.email} onChange={handleChange} required />
        <TextField fullWidth margin="normal" label="Telefone" name="phone" value={formData.phone} onChange={handleChange} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancelar</Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">Salvar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClientForm;