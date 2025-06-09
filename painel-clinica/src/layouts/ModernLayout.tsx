import { useState, useEffect } from 'react';
import {
  Box,
  useTheme,
  useMediaQuery,
  Fab,
  Zoom,
  Portal,
  Snackbar,
  Alert,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon
} from '@mui/material';
import {
  Add,
  Person,
  CalendarMonth,
  Assignment,
  Phone
} from '@mui/icons-material';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ModernSidebar from '../components/ModernSidebar';
import ModernBreadcrumb from '../components/ModernBreadcrumb';
import Header from '../components/Header';

interface QuickAction {
  icon: React.ReactNode;
  name: string;
  action: () => void;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
}

const ModernLayout = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  
  // Estados do layout
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  } | null>(null);

  // Atualizar sidebar baseado no tamanho da tela
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  // Quick actions contextuais baseadas na página atual
  const getQuickActions = (): QuickAction[] => {
    const basePath = location.pathname.split('/')[1];
    
    const actionMap: Record<string, QuickAction[]> = {
      'dashboard': [
        {
          icon: <Person />,
          name: 'Novo Paciente',
          action: () => navigate('/clients?action=new'),
          color: 'primary'
        },
        {
          icon: <CalendarMonth />,
          name: 'Agendar',
          action: () => navigate('/appointments?action=new'),
          color: 'secondary'
        },
        {
          icon: <Assignment />,
          name: 'Nova Nota',
          action: () => console.log('Nova nota'),
          color: 'info'
        }
      ],
      'clients': [
        {
          icon: <Person />,
          name: 'Novo Paciente',
          action: () => navigate('/clients?action=new'),
          color: 'primary'
        },
        {
          icon: <Phone />,
          name: 'Ligar',
          action: () => console.log('Ligar'),
          color: 'success'
        }
      ],
      'appointments': [
        {
          icon: <CalendarMonth />,
          name: 'Novo Agendamento',
          action: () => navigate('/appointments?action=new'),
          color: 'primary'
        }
      ]
    };

    return actionMap[basePath] || [
      {
        icon: <Add />,
        name: 'Ação Rápida',
        action: () => console.log('Ação rápida'),
        color: 'primary'
      }
    ];
  };

  const quickActions = getQuickActions();

  // Layout configurations
  const layoutConfig = {
    sidebarWidth: sidebarOpen ? (isMobile ? 280 : 280) : 72,
    headerHeight: 72,
    contentPadding: isMobile ? 16 : 24,
    bottomSpacing: isMobile ? 80 : 24, // Espaço para FAB mobile
  };

  // Handlers
  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleNotificationClose = () => {
    setNotification(null);
  };

  // Layout styles
  const layoutStyles = {
    root: {
      display: 'flex',
      minHeight: '100vh',
      background: theme.palette.background.default,
    },
    sidebar: {
      width: layoutConfig.sidebarWidth,
      flexShrink: 0,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
    main: {
      flexGrow: 1,
      display: 'flex',
      flexDirection: 'column' as const,
      marginLeft: isMobile ? 0 : undefined,
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
    header: {
      position: 'fixed' as const,
      top: 0,
      left: isMobile ? 0 : layoutConfig.sidebarWidth,
      right: 0,
      height: layoutConfig.headerHeight,
      zIndex: theme.zIndex.appBar,
      transition: theme.transitions.create('left', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
    breadcrumb: {
      marginTop: layoutConfig.headerHeight + 8,
      marginBottom: 16,
      marginLeft: layoutConfig.contentPadding,
      marginRight: layoutConfig.contentPadding,
    },
    content: {
      flexGrow: 1,
      padding: `0 ${layoutConfig.contentPadding}px ${layoutConfig.bottomSpacing}px`,
      marginTop: layoutConfig.headerHeight + 60, // Header + breadcrumb
      minHeight: `calc(100vh - ${layoutConfig.headerHeight + 60}px)`,
      position: 'relative' as const,
    },
    overlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: theme.zIndex.drawer - 1,
      opacity: isMobile && sidebarOpen ? 1 : 0,
      visibility: (isMobile && sidebarOpen ? 'visible' : 'hidden') as const,
      transition: 'all 0.3s ease',
    }
  };

  return (
    <Box sx={layoutStyles.root}>
      {/* Sidebar */}
      <Box sx={layoutStyles.sidebar}>
        <ModernSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          variant={isMobile ? 'temporary' : 'permanent'}
        />
      </Box>

      {/* Overlay para mobile */}
      {isMobile && (
        <Box
          sx={layoutStyles.overlay}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content area */}
      <Box sx={layoutStyles.main}>
        {/* Header fixo */}
        <Box sx={layoutStyles.header}>
          <Header />
        </Box>

        {/* Breadcrumb */}
        <Box sx={layoutStyles.breadcrumb}>
          <ModernBreadcrumb
            showBackButton={isMobile}
            showHomeButton={!isMobile}
          />
        </Box>

        {/* Content */}
        <Box sx={layoutStyles.content}>
          <Outlet />
        </Box>
      </Box>

      {/* FAB para mobile */}
      {isMobile && quickActions.length === 1 && (
        <Zoom in timeout={300}>
          <Fab
            color="primary"
            aria-label="quick-action"
            onClick={quickActions[0].action}
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: theme.zIndex.speedDial,
            }}
          >
            {quickActions[0].icon}
          </Fab>
        </Zoom>
      )}

      {/* Speed Dial para múltiplas ações */}
      {isMobile && quickActions.length > 1 && (
        <SpeedDial
          ariaLabel="quick-actions"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: theme.zIndex.speedDial,
          }}
          icon={<SpeedDialIcon />}
          onClose={() => setSpeedDialOpen(false)}
          onOpen={() => setSpeedDialOpen(true)}
          open={speedDialOpen}
        >
          {quickActions.map((action, index) => (
            <SpeedDialAction
              key={index}
              icon={action.icon}
              tooltipTitle={action.name}
              onClick={() => {
                action.action();
                setSpeedDialOpen(false);
              }}
              sx={{
                backgroundColor: theme.palette[action.color || 'primary'].main,
                color: theme.palette[action.color || 'primary'].contrastText,
                '&:hover': {
                  backgroundColor: theme.palette[action.color || 'primary'].dark,
                }
              }}
            />
          ))}
        </SpeedDial>
      )}

      {/* Desktop Quick Actions */}
      {!isMobile && quickActions.length > 0 && (
        <Portal>
          <Box
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              zIndex: theme.zIndex.speedDial,
            }}
          >
            {quickActions.slice(0, 3).map((action, index) => (
              <Zoom
                key={index}
                in
                timeout={300}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <Fab
                  size={index === 0 ? 'medium' : 'small'}
                  color={action.color || 'primary'}
                  aria-label={action.name}
                  onClick={action.action}
                  sx={{
                    boxShadow: theme.shadows[4],
                    '&:hover': {
                      transform: 'scale(1.1)',
                    },
                    transition: 'transform 0.2s ease',
                  }}
                >
                  {action.icon}
                </Fab>
              </Zoom>
            ))}
          </Box>
        </Portal>
      )}

      {/* Notification system */}
      <Snackbar
        open={!!notification}
        autoHideDuration={6000}
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ mt: 8 }}
      >
        {notification && (
          <Alert
            onClose={handleNotificationClose}
            severity={notification.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        )}
      </Snackbar>

      {/* Global loading indicator could be added here */}
      
      {/* Performance monitoring could be added here */}
    </Box>
  );
};

export default ModernLayout;