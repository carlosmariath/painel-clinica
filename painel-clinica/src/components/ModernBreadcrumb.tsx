import { 
  Breadcrumbs, 
  Typography, 
  Link, 
  Box, 
  Chip,
  IconButton,
  useTheme,
  alpha
} from '@mui/material';
import { 
  NavigateNext, 
  Home,
  ArrowBack,
  OpenInNew
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMemo } from 'react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  current?: boolean;
  external?: boolean;
}

interface ModernBreadcrumbProps {
  customItems?: BreadcrumbItem[];
  showBackButton?: boolean;
  showHomeButton?: boolean;
  maxItems?: number;
}

const ModernBreadcrumb = ({ 
  customItems, 
  showBackButton = true, 
  showHomeButton = true,
  maxItems = 4 
}: ModernBreadcrumbProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Mapeamento de rotas para breadcrumbs
  const routeMap: Record<string, BreadcrumbItem[]> = {
    '/dashboard': [
      { label: 'Dashboard', current: true, icon: <Home sx={{ fontSize: 16 }} /> }
    ],
    '/clients': [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Pacientes', current: true }
    ],
    '/appointments': [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Agendamentos', current: true }
    ],
    '/appointment-calendar': [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Agendamentos', href: '/appointments' },
      { label: 'Calendário', current: true }
    ],
    '/therapist-schedule': [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Agendamentos', href: '/appointments' },
      { label: 'Minha Agenda', current: true }
    ],
    '/therapist-availability': [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Agendamentos', href: '/appointments' },
      { label: 'Disponibilidade', current: true }
    ],
    '/financas': [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Financeiro', current: true }
    ],
    '/planos': [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Financeiro', href: '/financas' },
      { label: 'Planos de Terapia', current: true }
    ],
    '/assinaturas': [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Financeiro', href: '/financas' },
      { label: 'Assinaturas', current: true }
    ],
    '/branches': [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Configurações', current: true },
      { label: 'Filiais', current: true }
    ],
    '/therapists': [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Configurações' },
      { label: 'Terapeutas', current: true }
    ],
    '/services': [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Configurações' },
      { label: 'Serviços', current: true }
    ],
    '/users': [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Configurações' },
      { label: 'Usuários', current: true }
    ],
    '/user-settings': [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Configurações do Usuário', current: true }
    ],
    '/knowledge-entries': [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Base de Conhecimento', current: true },
      { label: 'Entradas', current: true }
    ],
    '/categories': [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Base de Conhecimento' },
      { label: 'Categorias', current: true }
    ],
    '/frequent-questions': [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Base de Conhecimento' },
      { label: 'Perguntas Frequentes', current: true }
    ]
  };

  // Gerar breadcrumbs automaticamente ou usar customItems
  const breadcrumbItems = useMemo(() => {
    if (customItems) return customItems;
    
    const pathSegments = location.pathname.split('/').filter(Boolean);
    
    // Verificar se existe mapeamento direto
    if (routeMap[location.pathname]) {
      return routeMap[location.pathname];
    }
    
    // Gerar breadcrumbs dinamicamente para rotas com parâmetros
    const items: BreadcrumbItem[] = [
      { label: 'Dashboard', href: '/dashboard' }
    ];
    
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      
      // Capitalizar e formatar o segmento
      const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      
      items.push({
        label,
        href: isLast ? undefined : currentPath,
        current: isLast
      });
    });
    
    return items;
  }, [location.pathname, customItems]);

  // Navegação
  const handleNavigation = (href: string, external?: boolean) => {
    if (external) {
      window.open(href, '_blank');
    } else {
      navigate(href);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleHome = () => {
    navigate('/dashboard');
  };

  // Limitar número de itens se necessário
  const displayItems = breadcrumbItems.length > maxItems 
    ? [
        breadcrumbItems[0],
        { label: '...', href: undefined },
        ...breadcrumbItems.slice(-maxItems + 2)
      ]
    : breadcrumbItems;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        py: 1,
        px: 2,
        background: alpha(theme.palette.background.paper, 0.8),
        backdropFilter: 'blur(10px)',
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        minHeight: 44,
      }}
    >
      {/* Botão de voltar */}
      {showBackButton && (
        <IconButton
          size="small"
          onClick={handleBack}
          sx={{
            background: alpha(theme.palette.primary.main, 0.1),
            '&:hover': {
              background: alpha(theme.palette.primary.main, 0.2),
            },
            mr: 1,
          }}
        >
          <ArrowBack fontSize="small" />
        </IconButton>
      )}

      {/* Botão home */}
      {showHomeButton && (
        <IconButton
          size="small"
          onClick={handleHome}
          sx={{
            background: alpha(theme.palette.secondary.main, 0.1),
            '&:hover': {
              background: alpha(theme.palette.secondary.main, 0.2),
            },
            mr: 1,
          }}
        >
          <Home fontSize="small" />
        </IconButton>
      )}

      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={
          <NavigateNext 
            fontSize="small" 
            sx={{ color: theme.palette.text.secondary }}
          />
        }
        sx={{ flexGrow: 1 }}
        maxItems={maxItems}
      >
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          const isEllipsis = item.label === '...';

          if (isEllipsis) {
            return (
              <Typography
                key={index}
                variant="body2"
                color="text.secondary"
                sx={{ cursor: 'default' }}
              >
                ...
              </Typography>
            );
          }

          if (isLast || !item.href) {
            return (
              <Box key={index} display="flex" alignItems="center" gap={1}>
                {item.icon}
                <Chip
                  label={item.label}
                  size="small"
                  variant={item.current ? 'filled' : 'outlined'}
                  color={item.current ? 'primary' : 'default'}
                  sx={{
                    fontWeight: item.current ? 600 : 500,
                    fontSize: '0.8rem',
                    height: 28,
                  }}
                />
              </Box>
            );
          }

          return (
            <Link
              key={index}
              component="button"
              variant="body2"
              onClick={() => handleNavigation(item.href!, item.external)}
              sx={{
                textDecoration: 'none',
                color: theme.palette.text.secondary,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                padding: '4px 8px',
                borderRadius: 1,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '0.875rem',
                transition: 'all 0.2s',
                '&:hover': {
                  color: theme.palette.primary.main,
                  background: alpha(theme.palette.primary.main, 0.08),
                  transform: 'translateY(-1px)',
                },
              }}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.external && <OpenInNew sx={{ fontSize: 12, ml: 0.5 }} />}
            </Link>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
};

export default ModernBreadcrumb;