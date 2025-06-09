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
  useMediaQuery,
  Chip,
  InputBase,
  alpha,
  Paper,
  Slide,
  Fade
} from "@mui/material";
import { 
  Notifications, 
  Person, 
  Settings, 
  Logout, 
  Search as SearchIcon,
  ArrowBackIos,
  KeyboardArrowDown,
  DashboardCustomize,
  Menu as MenuIcon,
  Close as CloseIcon,
  FiberManualRecord
} from "@mui/icons-material";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import theme from "../theme";
import Logo from "./Logo";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Estados para menus
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [anchorElNotifications, setAnchorElNotifications] = useState<null | HTMLElement>(null);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  
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
    if (path === '/financas') return 'Finanças';
    if (path === '/user-settings') return 'Configurações';
    if (path === '/branches') return 'Filiais';
    
    return 'Painel Administrativo';
  };

  // Ícone da página baseado na rota atual
  const getPageIcon = () => {
    const path = location.pathname;
    
    if (path === '/dashboard') return '📊';
    if (path === '/clients') return '👥';
    if (path === '/therapists') return '👨‍⚕️';
    if (path === '/appointments') return '📅';
    if (path === '/therapist-schedule') return '🗓️';
    if (path === '/financas') return '💰';
    if (path === '/user-settings') return '⚙️';
    if (path === '/branches') return '🏢';
    
    return '🏥';
  };
  
  // Contagem de notificações não lidas
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AppBar 
      position="fixed" 
      elevation={0}
      sx={{ 
        width: '100%',
        background: `linear-gradient(135deg, 
          rgba(255, 255, 255, 0.95) 0%, 
          rgba(248, 250, 252, 0.95) 100%)`,
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        color: theme.palette.text.primary,
        zIndex: theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar 
        sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          height: 72,
          px: { xs: 2, md: 4 }
        }}
      >
        {/* Logo e Navegação */}
        <Box display="flex" alignItems="center" gap={3}>
          {isMobile && location.pathname !== '/dashboard' && (
            <IconButton 
              edge="start" 
              color="inherit" 
              sx={{ 
                mr: 1,
                background: alpha(theme.palette.primary.main, 0.1),
                '&:hover': {
                  background: alpha(theme.palette.primary.main, 0.2),
                }
              }}
              onClick={() => navigate(-1)}
            >
              <ArrowBackIos fontSize="small" />
            </IconButton>
          )}
          
          <Logo size="small" variant="horizontal" animated />
          
          {/* Breadcrumb moderno */}
          <Box 
            sx={{ 
              display: { xs: 'none', lg: 'flex' },
              alignItems: 'center',
              gap: 1,
              ml: 2
            }}
          >
            <Chip
              icon={<DashboardCustomize sx={{ fontSize: 16 }} />}
              label="Painel"
              size="small"
              variant="outlined"
              sx={{
                borderColor: alpha(theme.palette.primary.main, 0.3),
                color: theme.palette.text.secondary,
                fontSize: '0.75rem',
              }}
            />
            <KeyboardArrowDown 
              sx={{ 
                fontSize: 16, 
                color: theme.palette.text.secondary,
                transform: 'rotate(-90deg)'
              }} 
            />
            <Paper
              elevation={0}
              sx={{
                px: 2,
                py: 0.5,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <Typography sx={{ fontSize: 18 }}>
                {getPageIcon()}
              </Typography>
              <Typography 
                variant="body2" 
                fontWeight={600}
                color="primary.main"
              >
                {getPageTitle()}
              </Typography>
            </Paper>
          </Box>
        </Box>

        {/* Ações do usuário */}
        <Box display="flex" alignItems="center" gap={1}>
          {/* Campo de pesquisa expandível */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
            <Fade in={!searchExpanded}>
              <Tooltip title="Pesquisar">
                <IconButton 
                  onClick={() => setSearchExpanded(true)}
                  sx={{
                    background: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': {
                      background: alpha(theme.palette.primary.main, 0.2),
                    }
                  }}
                >
                  <SearchIcon />
                </IconButton>
              </Tooltip>
            </Fade>
            
            <Slide direction="left" in={searchExpanded} mountOnEnter unmountOnExit>
              <Paper
                elevation={2}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  width: 300,
                  height: 40,
                  pl: 2,
                  borderRadius: 3,
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                }}
              >
                <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                <InputBase
                  placeholder="Pesquisar..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onBlur={() => {
                    if (!searchValue) setSearchExpanded(false);
                  }}
                  autoFocus
                  sx={{ ml: 1, flex: 1, fontSize: '0.9rem' }}
                />
                <IconButton 
                  size="small" 
                  onClick={() => {
                    setSearchExpanded(false);
                    setSearchValue('');
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Paper>
            </Slide>
          </Box>
          
          {/* Notificações modernizadas */}
          <Tooltip title="Notificações">
            <IconButton 
              onClick={handleOpenNotifications}
              sx={{
                background: alpha(theme.palette.primary.main, 0.1),
                '&:hover': {
                  background: alpha(theme.palette.primary.main, 0.2),
                }
              }}
            >
              <Badge 
                badgeContent={unreadCount} 
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    background: 'linear-gradient(135deg, #ff4757 0%, #ff3742 100%)',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '0.7rem',
                    minWidth: 18,
                    height: 18,
                  }
                }}
              >
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>
          
          <Menu
            anchorEl={anchorElNotifications}
            open={Boolean(anchorElNotifications)}
            onClose={handleCloseNotifications}
            PaperProps={{
              elevation: 8,
              sx: {
                overflow: 'visible',
                mt: 1.5,
                width: 380,
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                '& .MuiMenuItem-root': {
                  px: 2,
                  py: 1.5,
                  borderRadius: 2,
                  mx: 1,
                  mb: 0.5,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: alpha(theme.palette.primary.main, 0.08),
                    transform: 'translateX(4px)',
                  },
                },
              },
            }}
          >
            <Box sx={{ px: 2, pt: 2, pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" fontWeight={700}>
                🔔 Notificações
              </Typography>
              {unreadCount > 0 && (
                <Chip 
                  label={`${unreadCount} nova${unreadCount > 1 ? 's' : ''}`}
                  size="small"
                  color="error"
                  sx={{ fontSize: '0.7rem', height: 20 }}
                />
              )}
            </Box>
            <Divider sx={{ mx: 1 }} />
            
            {notifications.length === 0 ? (
              <MenuItem>
                <Box sx={{ textAlign: 'center', py: 2, width: '100%' }}>
                  <Typography variant="body2" color="text.secondary">
                    📭 Nenhuma notificação no momento
                  </Typography>
                </Box>
              </MenuItem>
            ) : (
              notifications.map((notification) => (
                <MenuItem 
                  key={notification.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.5,
                    background: notification.read 
                      ? 'transparent' 
                      : alpha(theme.palette.primary.main, 0.05),
                    border: notification.read 
                      ? 'none' 
                      : `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  }}
                >
                  <FiberManualRecord
                    sx={{
                      fontSize: 8,
                      color: notification.read ? 'transparent' : 'error.main',
                      mt: 1
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography 
                      variant="body2" 
                      fontWeight={notification.read ? 400 : 600}
                      sx={{ lineHeight: 1.4 }}
                    >
                      {notification.message}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ mt: 0.5, display: 'block' }}
                    >
                      Há 5 minutos
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
          
          {/* Avatar e menu do usuário modernizado */}
          <Tooltip title="Minha conta">
            <IconButton 
              onClick={handleOpenUserMenu} 
              sx={{ 
                p: 0.5, 
                ml: 1,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                }
              }}
            >
              <Paper
                elevation={2}
                sx={{
                  borderRadius: '50%',
                  p: 0.5,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, #00D4FF 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Avatar 
                  sx={{ 
                    width: 36, 
                    height: 36,
                    backgroundColor: 'white',
                    color: theme.palette.primary.main,
                    fontWeight: 'bold',
                    fontSize: '1.1rem'
                  }}
                >
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </Avatar>
              </Paper>
            </IconButton>
          </Tooltip>
          
          <Menu
            anchorEl={anchorElUser}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
            PaperProps={{
              elevation: 8,
              sx: {
                overflow: 'visible',
                mt: 1.5,
                minWidth: 280,
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 20,
                  width: 10,
                  height: 10,
                  bgcolor: 'rgba(255, 255, 255, 0.95)',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                },
                '& .MuiMenuItem-root': {
                  borderRadius: 2,
                  mx: 1,
                  mb: 0.5,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: alpha(theme.palette.primary.main, 0.08),
                    transform: 'translateX(4px)',
                  },
                },
              },
            }}
          >
            {/* Cabeçalho do perfil */}
            <Box sx={{ px: 3, py: 2 }}>
              <Box display="flex" alignItems="center" gap={2} mb={1}>
                <Avatar 
                  sx={{ 
                    width: 48, 
                    height: 48,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, #00D4FF 100%)`,
                    fontSize: '1.2rem',
                    fontWeight: 'bold'
                  }}
                >
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {user?.name || 'Usuário'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.role || 'Função'}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                {user?.email || 'usuario@exemplo.com'}
              </Typography>
            </Box>
            
            <Divider sx={{ mx: 1 }} />
            
            <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/profile'); }}>
              <ListItemIcon>
                <Person sx={{ color: 'primary.main' }} />
              </ListItemIcon>
              <Typography fontWeight={500}>Meu Perfil</Typography>
            </MenuItem>
            
            <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/user-settings'); }}>
              <ListItemIcon>
                <Settings sx={{ color: 'primary.main' }} />
              </ListItemIcon>
              <Typography fontWeight={500}>Configurações</Typography>
            </MenuItem>
            
            <Divider sx={{ mx: 1, my: 1 }} />
            
            <MenuItem 
              onClick={handleLogout}
              sx={{
                color: 'error.main',
                '&:hover': {
                  background: alpha('#ff4757', 0.08),
                },
              }}
            >
              <ListItemIcon>
                <Logout sx={{ color: 'error.main' }} />
              </ListItemIcon>
              <Typography fontWeight={500}>Sair da conta</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;