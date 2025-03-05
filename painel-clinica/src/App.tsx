import React from "react";
import AppRoutes from "./routes";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import Sidebar from "./components/Sidebar";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import KnowledgeEntries from "./pages/KnowledgeEntries";
import Categories from "./pages/Categories";
import FrequentQuestions from "./pages/FrequentQuestions";

// Configurar a localização padrão do dayjs
dayjs.locale('pt-br');

function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
      <ThemeProvider theme={theme}>
        <Sidebar />
        <AppRoutes />
      </ThemeProvider>
    </LocalizationProvider>
  );
}

export default App;