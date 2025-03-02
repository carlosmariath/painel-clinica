import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976D2", // Azul principal
    },
    secondary: {
      main: "#D32F2F", // Vermelho secundário
    },
    background: {
      default: "#F5F5F5", // Fundo claro padrão
      paper: "#FFFFFF",
    },
  },
  typography: {
    fontFamily: "Arial, sans-serif",
  },
});

export default theme;