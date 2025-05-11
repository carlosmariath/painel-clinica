import { useState, ReactNode } from "react";
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  useTheme,
  useMediaQuery,
  Divider,
  Collapse
} from "@mui/material";
import {
  Dashboard,
  EventAvailable,
  People,
  Person,
  Schedule,
  Menu,
  HelpOutline,
  Category,
  QuestionAnswer,
  ExpandLess,
  ExpandMore,
  Business,
  Settings,
  Lock,
  Engineering,
  LocalOffer,
  Payment,
  CardMembership
} from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Interface para os itens do menu
interface MenuItem {
  text: string;
  icon: ReactNode;
  path: string;
  children?: MenuItem[];
  roles?: string[]; // Opcionalmente restringir por perfis de usuário
}

// Array com os itens do menu
const menuItems: MenuItem[] = [
  { text: "Dashboard", icon: <Dashboard />, path: "/" },
  { 
    text: "Agendamentos", 
    icon: <EventAvailable />, 
    path: "/appointments-menu",
    children: [
      { text: "Lista de Agendamentos", icon: <EventAvailable />, path: "/appointments" },
      { text: "Calendário de Agendamentos", icon: <Schedule />, path: "/appointment-calendar" },
      { text: "Calendário Kanban", icon: <Schedule />, path: "/calendar" }
    ]
  },
  { text: "Clientes", icon: <Person />, path: "/clients" },
  { text: "Agenda do Terapeuta", icon: <Schedule />, path: "/therapist-schedule" },
  { 
    text: "Configurações", 
    icon: <Settings />, 
    path: "/settings-menu",
    children: [
      { text: "Filiais", icon: <Business />, path: "/branches", roles: ["ADMIN"] },
      { text: "Terapeutas", icon: <People />, path: "/therapists" },
      { text: "Serviços", icon: <Category />, path: "/services" },
      { text: "Usuários", icon: <Person />, path: "/users", roles: ["ADMIN"] },
      { text: "Perfis de Acesso", icon: <Lock />, path: "/roles", roles: ["ADMIN"] },
      { text: "Configurações do Sistema", icon: <Engineering />, path: "/system-settings", roles: ["ADMIN"] }
    ]
  },
  { 
    text: "Base de Conhecimento", 
    icon: <HelpOutline />, 
    path: "/knowledge",
    children: [
      { text: "Gerenciar Entradas", icon: <QuestionAnswer />, path: "/knowledge-entries" },
      { text: "Categorias", icon: <Category />, path: "/categories" },
      { text: "Perguntas Frequentes", icon: <HelpOutline />, path: "/frequent-questions" }
    ]
  },
  {
    text: 'Agenda',
    icon: <Schedule />,
    path: '/agenda',
    roles: ['ADMIN', 'THERAPIST', 'MANAGER', 'RECEPTIONIST']
  },
  {
    text: 'Planos de Terapia',
    icon: <LocalOffer />,
    path: '/planos',
    roles: ['ADMIN', 'MANAGER']
  },
  {
    text: 'Assinaturas',
    icon: <CardMembership />,
    path: '/assinaturas',
    roles: ['ADMIN', 'MANAGER', 'RECEPTIONIST']
  },
  {
    text: 'Finanças',
    icon: <Payment />,
    path: '/financas',
    roles: ['ADMIN', 'MANAGER', 'FINANCIAL']
  },
  {
    text: 'Demonstrações',
    icon: <Engineering />,
    path: '/demo-menu',
    children: [
      { text: 'Demo Planos', icon: <LocalOffer />, path: '/planos-demo' },
      { text: 'Demo Assinaturas', icon: <CardMembership />, path: '/assinaturas-demo' },
      { text: 'Demo Finanças', icon: <Payment />, path: '/financas-demo' }
    ]
  },
];

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const theme = useTheme();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({
    '/knowledge': false, // Definir como aberto se estiver em uma rota de conhecimento
    '/appointments-menu': false, // Inicialmente fechado
    '/settings-menu': false // Inicialmente fechado
  });

  const handleDrawerToggle = () => {
    // Função para toggle do drawer em dispositivos móveis
  };

  // Verificar se um item de menu está ativo com base em seu caminho ou caminhos de subitens
  const isMenuItemActive = (item: MenuItem): boolean => {
    // Para o Dashboard, verificar se está na rota raiz ou /dashboard
    if (item.path === "/" && (location.pathname === "/" || location.pathname === "/dashboard")) {
      return true;
    }
    
    if (location.pathname === item.path) return true;
    
    if (item.children) {
      return item.children.some(child => location.pathname === child.path);
    }
    
    return false;
  };

  // Lidar com clique em item de menu com submenu
  const handleSubMenuToggle = (path: string) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  // Efeito para abrir submenu automaticamente quando o caminho corresponde a um submenu
  useState(() => {
    // Verificar se estamos em alguma rota de conhecimento
    const isKnowledgeRoute = menuItems
      .find(item => item.path === '/knowledge')?.children
      ?.some(child => location.pathname === child.path) || false;
    
    // Verificar se estamos em alguma rota de agendamentos
    const isAppointmentsRoute = menuItems
      .find(item => item.path === '/appointments-menu')?.children
      ?.some(child => location.pathname === child.path) || false;
    
    // Verificar se estamos em alguma rota de configurações
    const isSettingsRoute = menuItems
      .find(item => item.path === '/settings-menu')?.children
      ?.some(child => location.pathname === child.path) || false;
    
    // Verificar se estamos na rota do calendário específico
    const isCalendarRoute = location.pathname === '/calendar';
    
    const newOpenSubmenus = { ...openSubmenus };
    
    if (isKnowledgeRoute) {
      newOpenSubmenus['/knowledge'] = true;
    }
    
    if (isAppointmentsRoute || isCalendarRoute) {
      newOpenSubmenus['/appointments-menu'] = true;
    }
    
    if (isSettingsRoute) {
      newOpenSubmenus['/settings-menu'] = true;
    }
    
    setOpenSubmenus(newOpenSubmenus);
  });

  // Renderizar um item de menu (com possíveis subitens)
  const renderMenuItem = (item: MenuItem) => {
    const isActive = isMenuItemActive(item);
    const hasChildren = item.children && item.children.length > 0;
    const isSubmenuOpen = openSubmenus[item.path] || false;
    
    // Verificar restrições de acesso baseadas em perfil
    if (item.roles && (!user?.role || !item.roles.includes(user.role))) {
      return null; // Não mostrar item se usuário não tem permissão
    }

    return (
      <ListItem 
        key={item.text} 
        disablePadding
        sx={{ display: 'block' }}
      >
        <ListItemButton
          onClick={hasChildren ? () => handleSubMenuToggle(item.path) : undefined}
          component={hasChildren ? 'div' : Link}
          to={hasChildren ? undefined : item.path}
          sx={{
            borderRadius: 1,
            mb: 0.5,
            backgroundColor: isActive ? theme.palette.primary.light + '20' : 'transparent',
            color: isActive ? theme.palette.primary.main : 'inherit',
            '&:hover': {
              backgroundColor: theme.palette.primary.light + '10',
            }
          }}
        >
          <ListItemIcon sx={{ color: isActive ? theme.palette.primary.main : 'inherit', minWidth: 40 }}>
            {item.icon}
          </ListItemIcon>
          <ListItemText 
            primary={item.text} 
            primaryTypographyProps={{ 
              fontWeight: isActive ? 600 : 400 
            }} 
          />
          {hasChildren && (
            isSubmenuOpen ? <ExpandLess /> : <ExpandMore />
          )}
        </ListItemButton>
        
        {hasChildren && (
          <Collapse in={isSubmenuOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children!.map((child) => {
                const isChildActive = location.pathname === child.path;
                
                return (
                  <ListItemButton
                    key={child.text}
                    component={Link}
                    to={child.path}
                    onClick={() => {
                      console.log('Navegando para:', child.path);
                    }}
                    sx={{
                      pl: 4,
                      borderRadius: 1,
                      mb: 0.5,
                      ml: 2,
                      backgroundColor: isChildActive ? theme.palette.primary.light + '20' : 'transparent',
                      color: isChildActive ? theme.palette.primary.main : 'inherit',
                      '&:hover': {
                        backgroundColor: theme.palette.primary.light + '10',
                      }
                    }}
                  >
                    <ListItemIcon sx={{ color: isChildActive ? theme.palette.primary.main : 'inherit', minWidth: 40 }}>
                      {child.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={child.text} 
                      primaryTypographyProps={{ 
                        fontWeight: isChildActive ? 600 : 400,
                        fontSize: '0.9rem'
                      }} 
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Collapse>
        )}
      </ListItem>
    );
  };

  const drawerContent = (
    <>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
          Painel Clínica
        </Typography>
        {isMobile && (
          <IconButton onClick={handleDrawerToggle}>
            <Menu />
          </IconButton>
        )}
      </Box>
      <Divider />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 64px)' }}>
        {/* Navegação principal */}
        <List component="nav" sx={{ p: 1, flexGrow: 1 }}>
          {menuItems.map((item) => renderMenuItem(item))}
        </List>

        {/* Rodapé com informações do usuário */}
        <Box sx={{ p: 2 }}>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
              {user?.name || 'Usuário'}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {user?.email || 'usuario@example.com'}
          </Typography>
        </Box>
      </Box>
    </>
  );

  return (
    <Box component="nav">
      <Drawer
        variant="permanent"
        sx={{
          width: 260,
          flexShrink: 0,
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: 260,
            boxSizing: 'border-box',
            borderRight: '1px solid rgba(0, 0, 0, 0.12)',
          },
        }}
      >
        {drawerContent}
      </Drawer>
      <Drawer
        variant="temporary"
        open={isMobile}
        onClose={handleDrawerToggle}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: 260,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;