import React from 'react';
import {
  Card, CardContent, Typography, Stack, Box, FormControl, InputLabel, Select, MenuItem, TextField, Button, InputAdornment, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BranchSelector from '../components/BranchSelector';

interface AppointmentListProps {
  appointments: any[];
  loading: boolean;
  onEdit: (appointment: any) => void;
  onDelete: (appointment: any) => void;
  clients: any[];
  therapists: any[];
  branches?: any[];
  filters?: any;
  onFilterChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange?: (e: any) => void;
  onBranchChange?: (branchId: string | null) => void;
  onResetFilters?: () => void;
}

const AppointmentList: React.FC<AppointmentListProps> = ({ 
  appointments, 
  clients, 
  therapists, 
  branches = [],
  filters, 
  onFilterChange, 
  onSelectChange, 
  onBranchChange,
  onResetFilters, 
  onEdit, 
  onDelete, 
  loading 
}) => {
  const formatarData = (dateString: string): string => {
    if (!dateString) return "";
    const data = new Date(dateString);
    return data.toLocaleDateString('pt-BR');
  };

  const getClientName = (clientId: string) => {
    return clients.find(client => client.id === clientId)?.name || "Cliente não encontrado";
  };

  const getTherapistName = (therapistId: string) => {
    return therapists.find(therapist => therapist.id === therapistId)?.name || "Terapeuta não encontrado";
  };

  const getBranchName = (branchId: string) => {
    return branches.find(branch => branch.id === branchId)?.name || "Filial não encontrada";
  };

  // Se os filtros estiverem disponíveis, exiba o card de filtros
  const showFilters = filters && onFilterChange && onSelectChange && onBranchChange && onResetFilters;

  return (
    <>
      {showFilters && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Filtros</Typography>
            <Stack spacing={2}>
              <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel id="cliente-label">Cliente</InputLabel>
                  <Select
                    labelId="cliente-label"
                    label="Cliente"
                    name="clientId"
                    value={filters.clientId}
                    onChange={onSelectChange}
                  >
                    <MenuItem value="">Todos os clientes</MenuItem>
                    {clients.map(client => (
                      <MenuItem key={client.id} value={client.id}>
                        {client.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel id="terapeuta-label">Terapeuta</InputLabel>
                  <Select
                    labelId="terapeuta-label"
                    label="Terapeuta"
                    name="therapistId"
                    value={filters.therapistId}
                    onChange={onSelectChange}
                  >
                    <MenuItem value="">Todos os terapeutas</MenuItem>
                    {therapists.map(therapist => (
                      <MenuItem key={therapist.id} value={therapist.id}>
                        {therapist.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <Box sx={{ width: '100%' }}>
                  <BranchSelector 
                    value={filters.branchId || ''} 
                    onChange={onBranchChange}
                    showAllOption={true}
                    label="Filial"
                  />
                </Box>
              </Box>

              <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 2 }}>
                <TextField
                  label="Data Inicial"
                  name="startDate"
                  type="date"
                  value={filters.startDate}
                  onChange={onFilterChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />

                <TextField
                  label="Data Final"
                  name="endDate"
                  type="date"
                  value={filters.endDate}
                  onChange={onFilterChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Box>

              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  label="Buscar"
                  name="searchTerm"
                  value={filters.searchTerm}
                  onChange={onFilterChange}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button variant="outlined" onClick={onResetFilters}>
                  Limpar Filtros
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) :
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Cliente</TableCell>
                <TableCell>Terapeuta</TableCell>
                <TableCell>Filial</TableCell>
                <TableCell>Data</TableCell>
                <TableCell>Horário Início</TableCell>
                <TableCell>Horário Fim</TableCell>
                <TableCell>Observações</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Nenhum agendamento encontrado.
                  </TableCell>
                </TableRow>
              ) :
                appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>{getClientName(appointment.clientId)}</TableCell>
                    <TableCell>{getTherapistName(appointment.therapistId)}</TableCell>
                    <TableCell>{getBranchName(appointment.branchId)}</TableCell>
                    <TableCell>{formatarData(appointment.date)}</TableCell>
                    <TableCell>{appointment.startTime}</TableCell>
                    <TableCell>{appointment.endTime}</TableCell>
                    <TableCell>
                      {appointment.notes && appointment.notes.length > 30
                        ? `${appointment.notes.substring(0, 30)}...`
                        : appointment.notes}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => onEdit(appointment)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => onDelete(appointment)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              }
            </TableBody>
          </Table>
        </TableContainer>
      }
    </>
  );
};

export default AppointmentList; 