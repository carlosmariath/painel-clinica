import { Drawer, List, ListItem, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, Box, IconButton } from "@mui/material";
import { Dashboard, People, EventAvailable, Brightness4, Brightness7, Schedule } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { useTheme, ThemeProvider, createTheme } from "@mui/material/styles";
import { useState } from "react";
import CssBaseline from "@mui/material/CssBaseline";

const Sidebar = () => {
    const [darkMode, setDarkMode] = useState(false);
    const theme = createTheme({ palette: { mode: darkMode ? "dark" : "light" } });

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ display: "flex", height: "100vh" }}>
                {/* 🔹 Ajuste do tamanho do Drawer */}
                <Drawer
                    variant="permanent"
                    sx={{
                        width: 220,
                        flexShrink: 0,
                        "& .MuiDrawer-paper": { width: 220, boxSizing: "border-box", backgroundColor: theme.palette.background.default },
                    }}
                >
                    <Toolbar />
                    <List>
                        <ListItem component={Link} to="/dashboard" sx={{ cursor: "pointer" }}>
                            <ListItemIcon><Dashboard /></ListItemIcon>
                            <ListItemText primary="Dashboard" />
                        </ListItem>
                        <ListItem component={Link} to="/clients" sx={{ cursor: "pointer" }}>
                            <ListItemIcon><People /></ListItemIcon>
                            <ListItemText primary="Clientes" />
                        </ListItem>
                        <ListItem component={Link} to="/therapists" sx={{ cursor: "pointer" }}>
                            <ListItemIcon><People /></ListItemIcon>
                            <ListItemText primary="Terapeutas" />
                        </ListItem>
                        <ListItem component={Link} to="/appointments" sx={{ cursor: "pointer" }}>
                            <ListItemIcon><EventAvailable /></ListItemIcon>
                            <ListItemText primary="Agendamentos" />
                        </ListItem>
                        <ListItem component={Link} to="/therapist-schedule" sx={{ cursor: "pointer" }}>
                            <ListItemIcon><Schedule /></ListItemIcon>
                            <ListItemText primary="Minha Disponibilidade" />
                        </ListItem>
                    </List>
                </Drawer>

                {/* 🔹 Ajuste do layout principal */}
                <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                    <AppBar position="fixed" sx={{ width: `calc(100% - 220px)`, ml: "220px", backgroundColor: theme.palette.primary.main }}>
                        <Toolbar>
                            <Typography variant="h6" sx={{ flexGrow: 1 }}>
                                Painel Administrativo
                            </Typography>
                            <IconButton onClick={() => setDarkMode(!darkMode)} color="inherit">
                                {darkMode ? <Brightness7 /> : <Brightness4 />}
                            </IconButton>
                        </Toolbar>
                    </AppBar>

                    {/* 🔹 Espaçamento para não sobrepor */}
                    <Toolbar />
                </Box>
            </Box>
        </ThemeProvider>
    );
};

export default Sidebar;