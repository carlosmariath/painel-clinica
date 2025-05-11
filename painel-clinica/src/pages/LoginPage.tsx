import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, TextField, Button, Box, Typography, Alert } from "@mui/material";
import { login } from "../services/authService";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Faz login via API e obtém o token
      const token = await login(email, password);
      
      // Atualiza o contexto de autenticação
      authLogin(token);
      
      // Navega para o dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error("Erro ao fazer login:", err);
      setError("Email ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100vh", justifyContent: "center" }}>
        <Typography variant="h5" gutterBottom>Login</Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField fullWidth label="Email" margin="normal" variant="outlined" value={email} onChange={(e) => setEmail(e.target.value)} />
          <TextField fullWidth label="Senha" margin="normal" variant="outlined" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            fullWidth 
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? "Processando..." : "Entrar"}
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default LoginPage;