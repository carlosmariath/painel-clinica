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
  MedicalServices,
  Menu,
  HelpOutline,
  Category,
  QuestionAnswer,
  ExpandLess,
  ExpandMore
} from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Interface para os itens do menu
interface MenuItem {
  text: string;
  icon: ReactNode;
  path: string;
  children?: MenuItem[];
}

// Array com os itens do menu
const menuItems: MenuItem[] = [
  { text: "Dashboard", icon: <Dashboard />, path: "/" },
  { text: "Agendamentos", icon: <EventAvailable />, path: "/appointments" },
  { text: "Terapeutas", icon: <People />, path: "/therapists" },
  { text: "Clientes", icon: <Person />, path: "/clients" },
  { text: "Agenda do Terapeuta", icon: <Schedule />, path: "/therapist-schedule" },
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
];

const Sidebar = () => {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [openMenu, setOpenMenu] = useState({
    users: false
  });
  const location = useLocation();
  const theme = useTheme();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({
    '/knowledge': false // Definir como aberto se estiver em uma rota de conhecimento
  });

  const handleDrawerToggle = () => {
    // Função para toggle do drawer em dispositivos móveis
  };

  const handleMenuToggle = (menu: keyof typeof openMenu) => {
    setOpenMenu({
      ...openMenu,
      [menu]: !openMenu[menu]
    });
  };

  const isActive = (path: string): boolean => {
    return location.pathname.startsWith(path);
  };

  // Verificar se o caminho ativo pertence a um item de menu ou subitem
  const isPathActive = (path: string): boolean => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  // Verificar se um item de menu está ativo com base em seu caminho ou caminhos de subitens
  const isMenuItemActive = (item: MenuItem): boolean => {
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
    
    if (isKnowledgeRoute) {
      setOpenSubmenus(prev => ({
        ...prev,
        '/knowledge': true
      }));
    }
  });

  // Renderizar um item de menu (com possíveis subitens)
  const renderMenuItem = (item: MenuItem) => {
    const isActive = isMenuItemActive(item);
    const hasChildren = item.children && item.children.length > 0;
    const isSubmenuOpen = openSubmenus[item.path] || false;

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