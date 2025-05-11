import { useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Chip,
  Box,
  Typography,
  TablePagination
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  AttachMoney as RevenueIcon,
  Money as ExpenseIcon
} from '@mui/icons-material';
import { FinancialTransaction, TransactionType } from '../services/financeService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TransactionsTableProps {
  transactions: FinancialTransaction[];
  onEdit: (transaction: FinancialTransaction) => void;
  onDelete: (transaction: FinancialTransaction) => void;
}

const TransactionsTable = ({ transactions, onEdit, onDelete }: TransactionsTableProps) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy', { locale: ptBR });
    } catch (_error) {
      return dateString;
    }
  };

  const getTransactionTypeChip = (type: TransactionType) => {
    return type === 'REVENUE' ? (
      <Chip
        icon={<RevenueIcon />}
        label="Receita"
        color="success"
        size="small"
      />
    ) : (
      <Chip
        icon={<ExpenseIcon />}
        label="Despesa"
        color="error"
        size="small"
      />
    );
  };

  // Aplicar paginação
  const displayedTransactions = transactions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Paper elevation={2}>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell width="120px">Tipo</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell>Categoria</TableCell>
              <TableCell align="right">Valor</TableCell>
              <TableCell width="100px" align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedTransactions.length > 0 ? (
              displayedTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{getTransactionTypeChip(transaction.type)}</TableCell>
                  <TableCell>{formatDate(transaction.date)}</TableCell>
                  <TableCell>
                    {transaction.description}
                    {transaction.client && (
                      <Typography variant="caption" display="block" color="text.secondary">
                        Cliente: {transaction.client.name}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {transaction.financeCategory?.name || transaction.category}
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      color={transaction.type === 'REVENUE' ? 'success.main' : 'error.main'}
                      fontWeight="medium"
                    >
                      {formatCurrency(transaction.amount)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Editar">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => onEdit(transaction)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onDelete(transaction)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Box py={2}>
                    <Typography variant="subtitle1" color="text.secondary">
                      Nenhuma transação encontrada
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={transactions.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Itens por página"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
      />
    </Paper>
  );
};

export default TransactionsTable; 