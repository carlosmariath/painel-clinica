import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, TextField, Button, Box, Typography, Alert, Paper, useTheme } from "@mui/material";
import { login } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const theme = useTheme();
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
    <Box 
      sx={{ 
        minHeight: "100vh", 
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2
      }}
    >
      <Container maxWidth="sm">
        <Paper 
          elevation={8}
          sx={{ 
            p: 4, 
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <Box sx={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center",
            textAlign: "center"
          }}>
            {/* Logo */}
            <Box mb={3}>
              <Logo size="large" variant="vertical" />
            </Box>
            
            {/* Título */}
            <Typography 
              variant="h4" 
              fontWeight="bold" 
              color="primary.main"
              gutterBottom
            >
              Bem-vindo de volta!
            </Typography>
            
            <Typography 
              variant="body1" 
              color="text.secondary" 
              mb={4}
            >
              Faça login para acessar o sistema de gestão
            </Typography>
            
            {/* Alert de erro */}
            {error && (
              <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
                {error}
              </Alert>
            )}
            
            {/* Formulário */}
            <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
              <TextField 
                fullWidth 
                label="E-mail" 
                margin="normal" 
                variant="outlined" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                sx={{ mb: 2 }}
              />
              
              <TextField 
                fullWidth 
                label="Senha" 
                margin="normal" 
                variant="outlined" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                required
                sx={{ mb: 3 }}
              />
              
              <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                size="large"
                fullWidth 
                disabled={loading}
                sx={{ 
                  py: 1.5,
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                  }
                }}
              >
                {loading ? "Processando..." : "Entrar no Sistema"}
              </Button>
            </Box>
            
            {/* Rodapé */}
            <Typography 
              variant="caption" 
              color="text.secondary" 
              mt={4}
              sx={{ opacity: 0.7 }}
            >
              © 2024 Painel Clínica. Todos os direitos reservados.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;