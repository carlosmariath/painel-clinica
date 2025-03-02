import { useEffect, useState } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button } from "@mui/material";
import { createTherapist, updateTherapist } from "../services/threapistService";

interface TherapistFormProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  therapist?: any;
}

const TherapistForm = ({ open, onClose, onSave, therapist }: TherapistFormProps) => {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });

  useEffect(() => {
    if (therapist) {
      setFormData({ name: therapist.name, email: therapist.email, phone: therapist.phone || "" });
    } else {
      setFormData({ name: "", email: "", phone: "" });
    }
  }, [therapist]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (therapist) {
      await updateTherapist(therapist.id, formData);
    } else {
      await createTherapist(formData);
    }
    onSave();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{therapist ? "Editar Terapeuta" : "Novo Terapeuta"}</DialogTitle>
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

export default TherapistForm;