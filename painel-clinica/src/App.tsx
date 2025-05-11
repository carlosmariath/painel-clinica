import React from "react";
import AppRoutes from "./routes";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { SnackbarProvider } from 'notistack';
import { BranchProvider } from "./context/BranchContext";

// Configurar a localização padrão do dayjs
dayjs.locale('pt-br');

function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
      <ThemeProvider theme={theme}>
        <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
          <BranchProvider>
            <AppRoutes />
          </BranchProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </LocalizationProvider>
  );
}

export default App;