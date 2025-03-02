import { AppBar, Toolbar, Typography, IconButton, Avatar, Menu, MenuItem, Box } from "@mui/material";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <AppBar position="fixed" sx={{ width: `calc(100% - 240px)`, ml: "240px" }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6">Painel Administrativo</Typography>

        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="body1">{user ? `Olá, ${user.name}` : "Carregando..."}</Typography>
          <IconButton onClick={handleMenuOpen}>
            <Avatar />
          </IconButton>
        </Box>

        <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
          <MenuItem onClick={handleLogout}>Sair</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;