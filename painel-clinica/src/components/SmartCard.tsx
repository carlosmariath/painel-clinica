import {
  Card,
  CardContent,
  CardActions,
  CardHeader,
  Avatar,
  IconButton,
  Typography,
  Box,
  Chip,
  Skeleton,
  Fade,
  Collapse,
  Divider,
  useTheme,
  alpha,
  ButtonBase
} from '@mui/material';
import {
  MoreVert,
  ExpandMore,
  ExpandLess,
  TrendingUp,
  TrendingDown,
  Remove,
  Star,
  StarBorder
} from '@mui/icons-material';
import { useState, forwardRef } from 'react';

export type CardVariant = 'summary' | 'detail' | 'action' | 'metric' | 'list-item';
export type CardPriority = 'high' | 'medium' | 'low';
export type CardSize = 'compact' | 'normal' | 'expanded';

interface CardAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'text' | 'outlined' | 'contained';
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  disabled?: boolean;
}

interface CardMetric {
  value: string | number;
  label: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  format?: 'currency' | 'percentage' | 'number';
}

interface SmartCardProps {
  // Conteúdo básico
  title?: string;
  subtitle?: string;
  description?: string;
  children?: React.ReactNode;
  
  // Configuração visual
  variant?: CardVariant;
  priority?: CardPriority;
  size?: CardSize;
  elevation?: number;
  
  // Estados
  loading?: boolean;
  error?: string;
  success?: boolean;
  favorite?: boolean;
  selected?: boolean;
  
  // Interações
  onClick?: () => void;
  onFavorite?: (favorited: boolean) => void;
  expandable?: boolean;
  defaultExpanded?: boolean;
  
  // Header customizado
  avatar?: React.ReactNode;
  headerAction?: React.ReactNode;
  
  // Ações
  actions?: CardAction[];
  quickActions?: CardAction[];
  
  // Métricas (para variant='metric')
  metrics?: CardMetric[];
  
  // Status e badges
  status?: {
    label: string;
    color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  };
  badges?: Array<{
    label: string;
    color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  }>;
  
  // Styling
  sx?: any;
  headerSx?: any;
  contentSx?: any;
}

const SmartCard = forwardRef<HTMLDivElement, SmartCardProps>(({
  title,
  subtitle,
  description,
  children,
  variant = 'normal',
  priority = 'medium',
  size = 'normal',
  elevation = 1,
  loading = false,
  error,
  success = false,
  favorite = false,
  selected = false,
  onClick,
  onFavorite,
  expandable = false,
  defaultExpanded = false,
  avatar,
  headerAction,
  actions = [],
  quickActions = [],
  metrics = [],
  status,
  badges = [],
  sx,
  headerSx,
  contentSx,
  ...props
}, ref) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [favorited, setFavorited] = useState(favorite);

  // Configurações de tamanho
  const sizeConfig = {
    compact: { padding: 1, spacing: 1 },
    normal: { padding: 2, spacing: 1.5 },
    expanded: { padding: 3, spacing: 2 }
  };

  // Configurações de prioridade
  const priorityConfig = {
    high: {
      borderLeft: `4px solid ${theme.palette.error.main}`,
      background: alpha(theme.palette.error.main, 0.02)
    },
    medium: {
      borderLeft: `4px solid ${theme.palette.warning.main}`,
      background: alpha(theme.palette.warning.main, 0.02)
    },
    low: {
      borderLeft: `4px solid ${theme.palette.success.main}`,
      background: alpha(theme.palette.success.main, 0.02)
    }
  };

  const config = sizeConfig[size];
  const priorityStyle = priorityConfig[priority];

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleFavoriteClick = () => {
    const newFavorited = !favorited;
    setFavorited(newFavorited);
    onFavorite?.(newFavorited);
  };

  const renderTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp color="success" fontSize="small" />;
      case 'down':
        return <TrendingDown color="error" fontSize="small" />;
      default:
        return <Remove color="disabled" fontSize="small" />;
    }
  };

  const formatMetricValue = (value: string | number, format?: string) => {
    if (typeof value === 'number') {
      switch (format) {
        case 'currency':
          return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(value);
        case 'percentage':
          return `${value}%`;
        default:
          return value.toLocaleString('pt-BR');
      }
    }
    return value;
  };

  // Loading state
  if (loading) {
    return (
      <Card
        ref={ref}
        elevation={elevation}
        sx={{
          ...priorityStyle,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          ...sx
        }}
        {...props}
      >
        <CardHeader
          avatar={<Skeleton variant="circular" width={40} height={40} />}
          title={<Skeleton variant="text" width="60%" />}
          subheader={<Skeleton variant="text" width="40%" />}
          sx={headerSx}
        />
        <CardContent sx={{ pt: 0, ...contentSx }}>
          <Skeleton variant="text" width="100%" />
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="rectangular" width="100%" height={60} />
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card
        ref={ref}
        elevation={elevation}
        sx={{
          borderLeft: `4px solid ${theme.palette.error.main}`,
          background: alpha(theme.palette.error.main, 0.05),
          ...sx
        }}
        {...props}
      >
        <CardContent>
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Fade in timeout={300}>
      <Card
        ref={ref}
        component={onClick ? ButtonBase : 'div'}
        onClick={onClick}
        elevation={selected ? 3 : elevation}
        sx={{
          ...priorityStyle,
          position: 'relative',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: onClick ? 'pointer' : 'default',
          border: selected 
            ? `2px solid ${theme.palette.primary.main}`
            : `1px solid ${alpha(theme.palette.divider, 0.12)}`,
          background: success 
            ? alpha(theme.palette.success.main, 0.05)
            : priorityStyle.background,
          '&:hover': onClick ? {
            elevation: 3,
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[4],
          } : {},
          ...sx
        }}
        {...props}
      >
        {/* Header */}
        {(title || subtitle || avatar || status || badges.length > 0) && (
          <CardHeader
            avatar={avatar}
            title={
              <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                {title && (
                  <Typography 
                    variant={size === 'compact' ? 'body1' : 'h6'} 
                    component="div"
                    fontWeight={600}
                  >
                    {title}
                  </Typography>
                )}
                {status && (
                  <Chip
                    label={status.label}
                    color={status.color}
                    size="small"
                    variant="outlined"
                  />
                )}
                {badges.map((badge, index) => (
                  <Chip
                    key={index}
                    label={badge.label}
                    color={badge.color || 'default'}
                    size="small"
                    variant="filled"
                  />
                ))}
              </Box>
            }
            subheader={subtitle}
            action={
              <Box display="flex" alignItems="center" gap={1}>
                {/* Quick actions */}
                {quickActions.map((action, index) => (
                  <IconButton
                    key={index}
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      action.onClick();
                    }}
                    disabled={action.disabled}
                    sx={{
                      opacity: 0.7,
                      '&:hover': { opacity: 1 },
                    }}
                  >
                    {action.icon}
                  </IconButton>
                ))}

                {/* Favorite button */}
                {onFavorite && (
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFavoriteClick();
                    }}
                  >
                    {favorited ? <Star color="warning" /> : <StarBorder />}
                  </IconButton>
                )}

                {/* Expand button */}
                {expandable && (
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExpandClick();
                    }}
                  >
                    {expanded ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                )}

                {headerAction}
              </Box>
            }
            sx={{
              pb: description || children || metrics.length > 0 ? 1 : config.padding,
              ...headerSx
            }}
          />
        )}

        {/* Content */}
        <CardContent
          sx={{
            pt: (title || subtitle) ? 0 : config.padding,
            pb: actions.length > 0 ? 1 : config.padding,
            '&:last-child': {
              pb: config.padding,
            },
            ...contentSx
          }}
        >
          {/* Description */}
          {description && (
            <Typography variant="body2" color="text.secondary" paragraph>
              {description}
            </Typography>
          )}

          {/* Metrics */}
          {metrics.length > 0 && (
            <Box>
              <Box 
                display="grid" 
                gridTemplateColumns={`repeat(${Math.min(metrics.length, 3)}, 1fr)`}
                gap={2}
                mb={2}
              >
                {metrics.map((metric, index) => (
                  <Box key={index} textAlign="center">
                    <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                      <Typography variant="h6" fontWeight={700}>
                        {formatMetricValue(metric.value, metric.format)}
                      </Typography>
                      {metric.trend && renderTrendIcon(metric.trend)}
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {metric.label}
                    </Typography>
                    {metric.trendValue && (
                      <Typography 
                        variant="caption" 
                        color={
                          metric.trend === 'up' ? 'success.main' :
                          metric.trend === 'down' ? 'error.main' : 'text.secondary'
                        }
                        display="block"
                      >
                        {metric.trendValue}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
              {children && <Divider sx={{ mb: 2 }} />}
            </Box>
          )}

          {/* Expandable content */}
          {expandable ? (
            <Collapse in={expanded} timeout="auto" unmountOnExit>
              {children}
            </Collapse>
          ) : (
            children
          )}
        </CardContent>

        {/* Actions */}
        {actions.length > 0 && (
          <CardActions sx={{ px: config.padding, pb: config.padding }}>
            <Box display="flex" gap={1} flexWrap="wrap">
              {actions.map((action, index) => (
                <Chip
                  key={index}
                  label={action.label}
                  icon={action.icon}
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick();
                  }}
                  variant={action.variant === 'contained' ? 'filled' : 'outlined'}
                  color={action.color || 'primary'}
                  disabled={action.disabled}
                  clickable
                  size={size === 'compact' ? 'small' : 'medium'}
                />
              ))}
            </Box>
          </CardActions>
        )}
      </Card>
    </Fade>
  );
});

SmartCard.displayName = 'SmartCard';

export default SmartCard;