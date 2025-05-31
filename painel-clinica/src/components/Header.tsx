import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Avatar, 
  Menu, 
  MenuItem, 
  Box,
  Badge,
  Tooltip,
  Divider,
  ListItemIcon,
  useMediaQuery
} from "@mui/material";
import { 
  Notifications, 
  Person, 
  Settings, 
  Logout, 
  Search as SearchIcon,
  ArrowBackIos
} from "@mui/icons-material";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import theme from "../theme";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Para o menu do usuário
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  
  // Para o menu de notificações
  const [anchorElNotifications, setAnchorElNotifications] = useState<null | HTMLElement>(null);
  
  // Exemplo de notificações (em um app real, viria de um contexto ou API)
  const notifications = [
    { id: 1, message: "Novo agendamento confirmado", read: false },
    { id: 2, message: "Lembrete: 3 consultas amanhã", read: true }
  ];
  
  // Handlers para abrir/fechar menus
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };
  
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  
  const handleOpenNotifications = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNotifications(event.currentTarget);
  };
  
  const handleCloseNotifications = () => {
    setAnchorElNotifications(null);
  };

  const handleLogout = () => {
    handleCloseUserMenu();
    logout();
    navigate("/");
  };
  
  // Título da página baseado na rota atual
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/clients') return 'Clientes';
    if (path === '/therapists') return 'Terapeutas';
    if (path === '/appointments') return 'Agendamentos';
    if (path === '/therapist-schedule') return 'Minha Agenda';
    
    // Título padrão se nenhum dos casos acima
    return 'Painel Administrativo';
  };
  
  // Contagem de notificações não lidas
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AppBar 
      position="fixed" 
      elevation={0}
      sx={{ 
        width: { xs: '100%', md: `calc(100%)` }, 
        ml: { xs: 0, md: '0' },
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        borderBottom: `1px solid ${theme.palette.grey[200]}`,
        zIndex: (theme) => theme.zIndex.drawer - 1
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", height: 64 }}>
        {/* Título da página */}
        <Box display="flex" alignItems="center">
          {isMobile && location.pathname !== '/dashboard' && (
            <IconButton 
              edge="start" 
              color="inherit" 
              sx={{ mr: 1 }}
              onClick={() => navigate(-1)}
            >
              <ArrowBackIos fontSize="small" />
            </IconButton>
          )}
          <Typography variant="h5" fontWeight={600}>
            {getPageTitle()}
          </Typography>
        </Box>

        {/* Ícones de ação */}
        <Box display="flex" alignItems="center" gap={0.5}>
          {/* Pesquisa (placeholder para implementação futura) */}
          <Tooltip title="Pesquisar">
            <IconButton size="large" color="default">
              <SearchIcon />
            </IconButton>
          </Tooltip>
          
          {/* Notificações */}
          <Tooltip title="Notificações">
            <IconButton 
              size="large" 
              color="default"
              onClick={handleOpenNotifications}
            >
              <Badge badgeContent={unreadCount} color="primary">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>
          
          <Menu
            anchorEl={anchorElNotifications}
            open={Boolean(anchorElNotifications)}
            onClose={handleCloseNotifications}
            PaperProps={{
              elevation: 2,
              sx: {
                overflow: 'visible',
                mt: 1.5,
                width: 320,
                '& .MuiMenuItem-root': {
                  px: 2,
                  py: 1.5,
                  borderLeft: (theme) => 
                    `3px solid ${theme.palette.background.paper}`,
                  '&:hover': {
                    borderLeft: (theme) => 
                      `3px solid ${theme.palette.primary.main}`,
                  },
                },
              },
            }}
          >
            <Typography variant="subtitle1" fontWeight={600} sx={{ px: 2, pt: 2, pb: 1 }}>
              Notificações
            </Typography>
            <Divider />
            
            {notifications.length === 0 ? (
              <MenuItem>
                <Typography variant="body2">Nenhuma notificação no momento</Typography>
              </MenuItem>
            ) : (
              notifications.map((notification) => (
                <MenuItem 
                  key={notification.id}
                  sx={{
                    backgroundColor: notification.read ? 'inherit' : `${theme.palette.primary.light}15`,
                    borderLeft: notification.read 
                      ? `3px solid ${theme.palette.background.paper}` 
                      : `3px solid ${theme.palette.primary.main}`,
                  }}
                >
                  <Box>
                    <Typography variant="body2" fontWeight={notification.read ? 400 : 600}>
                      {notification.message}
                    </Typography>
                  </Box>
                </MenuItem>
              ))
            )}
            
            {notifications.length > 0 && (
              [
                <Divider key="divider" />,
                <Box key="box" sx={{ textAlign: 'center', p: 1 }}>
                  <Typography 
                    variant="body2" 
                    color="primary" 
                    sx={{ cursor: 'pointer', fontWeight: 500 }}
                    onClick={handleCloseNotifications}
                  >
                    Ver todas
                  </Typography>
                </Box>
              ]
            )}
          </Menu>
          
          {/* Avatar e menu do usuário */}
          <Tooltip title="Minha conta">
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0, ml: 1 }}>
              <Avatar 
                sx={{ 
                  width: 36, 
                  height: 36,
                  bgcolor: theme.palette.primary.main
                }}
              >
                {user?.name?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>
          </Tooltip>
          
          <Menu
            anchorEl={anchorElUser}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
            PaperProps={{
              elevation: 2,
              sx: {
                overflow: 'visible',
                mt: 1.5,
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 20,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                {user?.name || 'Usuário'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email || 'usuario@exemplo.com'}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/profile'); }}>
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              Meu Perfil
            </MenuItem>
            <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/settings'); }}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              Configurações
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Sair
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;