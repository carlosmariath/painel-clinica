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
import { AuthProvider } from "./context/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";

// Configurar a localização padrão do dayjs
dayjs.locale('pt-br');

function App() {
  return (
    <ErrorBoundary>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
        <ThemeProvider theme={theme}>
          <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
            <AuthProvider>
              <BranchProvider>
                <AppRoutes />
              </BranchProvider>
            </AuthProvider>
          </SnackbarProvider>
        </ThemeProvider>
      </LocalizationProvider>
    </ErrorBoundary>
  );
}

export default App;