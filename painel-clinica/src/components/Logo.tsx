import { Box, Typography, useTheme, keyframes } from '@mui/material';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'horizontal' | 'vertical' | 'icon-only';
  color?: 'primary' | 'white' | 'inherit';
  animated?: boolean;
}

// Animação de pulso suave
const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.4);
  }
  50% {
    transform: scale(1.02);
    box-shadow: 0 0 0 8px rgba(25, 118, 210, 0.1);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0);
  }
`;

// Animação de rotação suave
const rotateAnimation = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const Logo = ({ 
  size = 'medium', 
  variant = 'horizontal',
  color = 'primary',
  animated = false
}: LogoProps) => {
  const theme = useTheme();

  const sizeConfig = {
    small: {
      iconSize: 32,
      fontSize: '1.1rem',
      spacing: 1.5,
      containerSize: 40
    },
    medium: {
      iconSize: 40,
      fontSize: '1.4rem',
      spacing: 2,
      containerSize: 50
    },
    large: {
      iconSize: 56,
      fontSize: '2rem',
      spacing: 2.5,
      containerSize: 70
    }
  };

  const colorConfig = {
    primary: theme.palette.primary.main,
    white: '#ffffff',
    inherit: 'inherit'
  };

  const config = sizeConfig[size];
  const logoColor = colorConfig[color];

  // Ícone futurista customizado usando SVG
  const FuturisticIcon = () => (
    <svg
      width={config.iconSize}
      height={config.iconSize}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Círculo externo com gradiente */}
      <defs>
        <linearGradient id="outerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00D4FF" />
          <stop offset="100%" stopColor="#0099CC" />
        </linearGradient>
        <linearGradient id="innerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E3F2FD" />
        </linearGradient>
      </defs>
      
      {/* Anel externo */}
      <circle 
        cx="50" 
        cy="50" 
        r="45" 
        fill="url(#outerGradient)" 
        opacity="0.1"
      />
      
      {/* Hexágono central */}
      <polygon 
        points="50,20 70,35 70,65 50,80 30,65 30,35" 
        fill="url(#innerGradient)" 
        stroke="url(#outerGradient)" 
        strokeWidth="2"
      />
      
      {/* Cruz médica moderna */}
      <rect x="46" y="35" width="8" height="30" fill="#1976D2" rx="2" />
      <rect x="35" y="46" width="30" height="8" fill="#1976D2" rx="2" />
      
      {/* Pontos de conexão */}
      <circle cx="50" cy="25" r="3" fill="#00D4FF" />
      <circle cx="75" cy="40" r="3" fill="#00D4FF" />
      <circle cx="75" cy="60" r="3" fill="#00D4FF" />
      <circle cx="50" cy="75" r="3" fill="#00D4FF" />
      <circle cx="25" cy="60" r="3" fill="#00D4FF" />
      <circle cx="25" cy="40" r="3" fill="#00D4FF" />
      
      {/* Linha de conexão (animada se necessário) */}
      {animated && (
        <circle 
          cx="50" 
          cy="50" 
          r="35" 
          fill="none" 
          stroke="#00D4FF" 
          strokeWidth="1" 
          strokeDasharray="4 4"
          opacity="0.6"
        >
          <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="rotate"
            from="0 50 50"
            to="360 50 50"
            dur="8s"
            repeatCount="indefinite"
          />
        </circle>
      )}
    </svg>
  );

  if (variant === 'icon-only') {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: config.containerSize,
          height: config.containerSize,
          borderRadius: '16px',
          background: `linear-gradient(135deg, 
            rgba(25, 118, 210, 0.1) 0%, 
            rgba(0, 212, 255, 0.1) 100%)`,
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(25, 118, 210, 0.2)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          animation: animated ? `${pulseAnimation} 3s ease-in-out infinite` : 'none',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(25, 118, 210, 0.25)',
          },
        }}
      >
        <FuturisticIcon />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: variant === 'vertical' ? 'column' : 'row',
        gap: config.spacing,
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-1px)',
        },
      }}
    >
      {/* Ícone futurista */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: config.containerSize,
          height: config.containerSize,
          borderRadius: '16px',
          background: `linear-gradient(135deg, 
            rgba(25, 118, 210, 0.1) 0%, 
            rgba(0, 212, 255, 0.1) 100%)`,
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(25, 118, 210, 0.2)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          animation: animated ? `${pulseAnimation} 3s ease-in-out infinite` : 'none',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(25, 118, 210, 0.25)',
          },
        }}
      >
        <FuturisticIcon />
      </Box>

      {/* Texto do Logo */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: variant === 'vertical' ? 'center' : 'flex-start',
        }}
      >
        <Typography
          variant="h6"
          component="span"
          sx={{
            fontSize: config.fontSize,
            fontWeight: 700,
            color: logoColor,
            lineHeight: 1.1,
            fontFamily: '"Inter", "Roboto", sans-serif',
            letterSpacing: '-0.02em',
            background: color === 'primary' ? 
              `linear-gradient(135deg, ${theme.palette.primary.main} 0%, #00D4FF 100%)` : 
              'inherit',
            backgroundClip: color === 'primary' ? 'text' : 'inherit',
            WebkitBackgroundClip: color === 'primary' ? 'text' : 'inherit',
            WebkitTextFillColor: color === 'primary' ? 'transparent' : 'inherit',
          }}
        >
          HealthSync
        </Typography>
        <Typography
          variant="caption"
          component="span"
          sx={{
            fontSize: config.fontSize === '1.1rem' ? '0.7rem' : 
                     config.fontSize === '1.4rem' ? '0.8rem' : '0.9rem',
            color: color === 'white' ? 'rgba(255,255,255,0.8)' : 'rgba(25, 118, 210, 0.7)',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontFamily: '"Inter", "Roboto", sans-serif',
            marginTop: variant === 'vertical' ? 0.5 : 0,
          }}
        >
          Smart Management
        </Typography>
      </Box>
    </Box>
  );
};

export default Logo;