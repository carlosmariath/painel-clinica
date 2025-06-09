import { useState } from 'react';
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Collapse,
  Tooltip,
  Divider,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
  Chip,
  alpha
} from '@mui/material';
import {
  Dashboard,
  People,
  CalendarMonth,
  AccountBalance,
  Settings,
  MenuBook,
  ExpandLess,
  ExpandMore,
  ChevronLeft,
  ChevronRight,
  Notifications,
  Search,
  Add
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: MenuItem[];
  badge?: number;
  roles?: string[];
  quickAction?: () => void;
}

interface ModernSidebarProps {
  open: boolean;
  onClose: () => void;
  variant?: 'permanent' | 'temporary';
}

const ModernSidebar = ({ open, onClose, variant = 'permanent' }: ModernSidebarProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(['']);

  // Configurações do sidebar
  const sidebarWidth = collapsed ? 72 : 280;
  const miniWidth = 72;

  // Menu items com estrutura modernizada
  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Dashboard />,
      path: '/dashboard',
    },
    {
      id: 'patients',
      label: 'Pacientes',
      icon: <People />,
      path: '/clients',
      quickAction: () => navigate('/clients?action=new')
    },
    {
      id: 'appointments',
      label: 'Agenda',
      icon: <CalendarMonth />,
      badge: 3, // Notificações pendentes
      children: [
        { id: 'appointments-list', label: 'Lista de Agendamentos', path: '/appointments', icon: <></> },
        { id: 'calendar-view', label: 'Visualização Calendário', path: '/appointment-calendar', icon: <></> },
        { id: 'therapist-schedule', label: 'Minha Agenda', path: '/therapist-schedule', icon: <></> },
        { id: 'availability', label: 'Disponibilidade', path: '/therapist-availability', icon: <></> },
      ]
    },
    {
      id: 'finance',
      label: 'Financeiro',
      icon: <AccountBalance />,
      children: [
        { id: 'finance-overview', label: 'Visão Geral', path: '/financas', icon: <></> },
        { id: 'therapy-plans', label: 'Planos de Terapia', path: '/planos', icon: <></> },
        { id: 'subscriptions', label: 'Assinaturas', path: '/assinaturas', icon: <></> },
      ]
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: <Settings />,
      roles: ['ADMIN'],
      children: [
        { id: 'branches', label: 'Filiais', path: '/branches', icon: <></> },
        { id: 'therapists', label: 'Terapeutas', path: '/therapists', icon: <></> },
        { id: 'services', label: 'Serviços', path: '/services', icon: <></> },
        { id: 'users', label: 'Usuários', path: '/users', icon: <></> },
        { id: 'roles', label: 'Funções', path: '/roles', icon: <></> },
      ]
    },
    {
      id: 'knowledge',
      label: 'Base de Conhecimento',
      icon: <MenuBook />,
      children: [
        { id: 'knowledge-entries', label: 'Entradas', path: '/knowledge-entries', icon: <></> },
        { id: 'categories', label: 'Categorias', path: '/categories', icon: <></> },
        { id: 'faq', label: 'FAQ', path: '/frequent-questions', icon: <></> },
      ]
    }
  ];

  // Verifica se item está ativo
  const isActive = (item: MenuItem): boolean => {
    if (item.path && location.pathname === item.path) return true;
    if (item.children) {
      return item.children.some(child => child.path === location.pathname);
    }
    return false;
  };

  // Verifica se usuário tem permissão
  const hasPermission = (item: MenuItem): boolean => {
    if (!item.roles) return true;
    return item.roles.includes(user?.role || '');
  };

  // Toggle de item expandido
  const handleToggleExpand = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Navegação
  const handleNavigation = (item: MenuItem) => {
    if (item.path) {
      navigate(item.path);
      if (isMobile) onClose();
    } else if (item.children) {
      handleToggleExpand(item.id);
    }
  };

  // Quick action
  const handleQuickAction = (item: MenuItem, event: React.MouseEvent) => {
    event.stopPropagation();
    if (item.quickAction) {
      item.quickAction();
    }
  };

  // Renderizar item do menu
  const renderMenuItem = (item: MenuItem, isChild = false) => {
    if (!hasPermission(item)) return null;

    const active = isActive(item);
    const expanded = expandedItems.includes(item.id);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <Box key={item.id}>
        <ListItem 
          disablePadding 
          sx={{ 
            display: 'block',
            ml: isChild ? 2 : 0,
            mb: 0.5
          }}
        >
          <Tooltip 
            title={collapsed ? item.label : ''} 
            placement="right"
            arrow
          >
            <ListItemButton
              onClick={() => handleNavigation(item)}
              sx={{
                minHeight: isChild ? 40 : 48,
                borderRadius: 2,
                mx: 1,
                mb: 0.5,
                position: 'relative',
                background: active 
                  ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`
                  : 'transparent',
                border: active 
                  ? `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                  : '1px solid transparent',
                color: active ? theme.palette.primary.main : theme.palette.text.primary,
                '&:hover': {
                  background: active 
                    ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.primary.main, 0.08)} 100%)`
                    : alpha(theme.palette.action.hover, 0.08),
                  transform: 'translateX(2px)',
                },
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                pl: collapsed ? 2 : 2,
                pr: collapsed ? 2 : 1,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: collapsed ? 0 : 40,
                  justifyContent: 'center',
                  color: 'inherit',
                  mr: collapsed ? 0 : 1,
                }}
              >
                {item.icon}
              </ListItemIcon>

              {!collapsed && (
                <>
                  <ListItemText 
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: isChild ? '0.875rem' : '0.95rem',
                      fontWeight: active ? 600 : 500,
                    }}
                  />

                  {/* Badge de notificações */}
                  {item.badge && (
                    <Chip
                      label={item.badge}
                      size="small"
                      color="error"
                      sx={{
                        height: 20,
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                      }}
                    />
                  )}

                  {/* Quick action button */}
                  {item.quickAction && (
                    <IconButton
                      size="small"
                      onClick={(e) => handleQuickAction(item, e)}
                      sx={{
                        opacity: 0,
                        transition: 'opacity 0.2s',
                        '.MuiListItemButton-root:hover &': {
                          opacity: 1,
                        },
                      }}
                    >
                      <Add fontSize="small" />
                    </IconButton>
                  )}

                  {/* Expand/collapse icon */}
                  {hasChildren && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleExpand(item.id);
                      }}
                    >
                      {expanded ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  )}
                </>
              )}
            </ListItemButton>
          </Tooltip>
        </ListItem>

        {/* Submenu */}
        {hasChildren && !collapsed && (
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children?.map(child => renderMenuItem(child, true))}
            </List>
          </Collapse>
        )}
      </Box>
    );
  };

  // Conteúdo do sidebar
  const sidebarContent = (
    <Box
      sx={{
        width: sidebarWidth,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: `linear-gradient(135deg, 
          rgba(255, 255, 255, 0.98) 0%, 
          rgba(248, 250, 252, 0.98) 100%)`,
        backdropFilter: 'blur(20px)',
        borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: collapsed ? 1 : 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          minHeight: 72,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        {!collapsed && (
          <Logo size="small" variant="horizontal" />
        )}
        
        {collapsed && (
          <Logo size="small" variant="icon-only" />
        )}

        {!isMobile && !collapsed && (
          <IconButton
            onClick={() => setCollapsed(true)}
            size="small"
            sx={{
              background: alpha(theme.palette.primary.main, 0.1),
              '&:hover': {
                background: alpha(theme.palette.primary.main, 0.2),
              }
            }}
          >
            <ChevronLeft />
          </IconButton>
        )}
      </Box>

      {/* Collapsed expand button */}
      {collapsed && !isMobile && (
        <Box sx={{ p: 1, textAlign: 'center' }}>
          <IconButton
            onClick={() => setCollapsed(false)}
            size="small"
            sx={{
              background: alpha(theme.palette.primary.main, 0.1),
              '&:hover': {
                background: alpha(theme.palette.primary.main, 0.2),
              }
            }}
          >
            <ChevronRight />
          </IconButton>
        </Box>
      )}

      {/* Menu principal */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', py: 1 }}>
        <List disablePadding>
          {menuItems.map(item => renderMenuItem(item))}
        </List>
      </Box>

      {/* Footer - User info */}
      {!collapsed && (
        <Box
          sx={{
            p: 2,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            background: alpha(theme.palette.primary.main, 0.02),
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, #00D4FF 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.9rem'
              }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Box>
            <Box flex={1} minWidth={0}>
              <Typography variant="body2" fontWeight={600} noWrap>
                {user?.name || 'Usuário'}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {user?.role || 'Função'}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );

  // Retornar drawer baseado no variant
  if (isMobile || variant === 'temporary') {
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
          },
        }}
      >
        {sidebarContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: sidebarWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: sidebarWidth,
          boxSizing: 'border-box',
          border: 'none',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      }}
      open
    >
      {sidebarContent}
    </Drawer>
  );
};

export default ModernSidebar;