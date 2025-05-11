import React from 'react';
import { Box, Typography } from '@mui/material';
import BranchSelector from './BranchSelector';
import { useBranch } from '../context/BranchContext';

interface BranchSwitcherProps {
  variant?: 'compact' | 'full';
}

/**
 * Componente para trocar entre filiais no topo da aplicação
 */
const BranchSwitcher: React.FC<BranchSwitcherProps> = ({ variant = 'full' }) => {
  // Usar o hook useBranch que já trata erros quando o contexto não está disponível
  const { currentBranch, loading, isAdmin } = useBranch();
  
  // Se o usuário não tiver permissão, mostrar apenas a filial atual sem poder trocar
  if (!isAdmin) {
    if (variant === 'compact' || !currentBranch) return null;
    
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          py: 0.5, 
          px: 1, 
          borderRadius: 1,
          bgcolor: 'background.paper'
        }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
          Filial:
        </Typography>
        <Typography variant="body2" fontWeight="medium">
          {currentBranch?.name || '-'}
        </Typography>
      </Box>
    );
  }

  // Versão compacta (para mobile)
  if (variant === 'compact') {
    return (
      <Box sx={{ minWidth: 120 }}>
        <BranchSelector 
          useGlobalContext={true} 
          showAllOption={true} 
          disabled={loading}
          size="small" 
        />
      </Box>
    );
  }

  // Versão completa (para desktop)
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
        Filial:
      </Typography>
      <BranchSelector 
        useGlobalContext={true} 
        showAllOption={true} 
        disabled={loading}
        size="small" 
      />
    </Box>
  );
};

export default BranchSwitcher; 