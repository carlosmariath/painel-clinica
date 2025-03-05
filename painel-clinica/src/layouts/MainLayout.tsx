import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Outlet } from "react-router-dom";
import { Box, Container, useMediaQuery, CssBaseline, ThemeProvider } from "@mui/material";
import theme from "../theme";
import { useEffect, useState } from "react";

const MainLayout = () => {
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [pageReady, setPageReady] = useState(false);

  // Efeito para animar a entrada de conteúdo
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        display: "flex", 
        minHeight: "100vh",
        backgroundColor: theme.palette.background.default 
      }}>
        {/* Sidebar */}
        <Sidebar />

        {/* Conteúdo principal */}
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            width: { xs: '100%', md: `calc(100% - 280px)` },
            ml: { xs: 0, md: '0px' },
            transition: "all 0.3s ease",
            opacity: pageReady ? 1 : 0,
            transform: pageReady ? 'translateY(0)' : 'translateY(10px)',
          }}
        >
          <Header />
          <Container 
            maxWidth="xl" 
            sx={{ 
              mt: '64px',
              pt: 4, 
              pb: 6,
              px: { xs: 2, sm: 3, md: 4 },
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Outlet />
          </Container>
          
          {/* Rodapé opcional */}
          <Box 
            component="footer" 
            sx={{ 
              p: 2, 
              textAlign: 'center',
              borderTop: `1px solid ${theme.palette.grey[200]}`,
              mt: 'auto',
              display: { xs: 'none', sm: 'block' }, // Oculta em dispositivos muito pequenos
            }}
          >
            <Box sx={{ 
              maxWidth: 'xl', 
              mx: 'auto', 
              fontSize: '0.875rem',
              color: theme.palette.text.secondary 
            }}>
              © {new Date().getFullYear()} Clínica App • Desenvolvido com ❤️
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default MainLayout;