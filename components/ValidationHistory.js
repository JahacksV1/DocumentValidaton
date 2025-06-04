import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Table, TableHead, TableBody, TableRow, 
  TableCell, Chip, IconButton, Tooltip, Paper 
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';
import { formatUploadDate } from '../lib/db-helpers';

export default function ValidationHistory({ dealId }) {
  const [validationRuns, setValidationRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchValidationHistory();
  }, [dealId]);

  const fetchValidationHistory = async () => {
    if (!dealId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/validations/history/${dealId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch validation history');
      }
      
      const data = await response.json();
      setValidationRuns(data.validationHistory);
    } catch (err) {
      console.error('Error fetching validation history:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (passed, failed) => {
    if (failed === 0) return 'success';
    if (passed === 0) return 'error';
    return 'warning';
  };

  const getStatusLabel = (passed, failed) => {
    return `${passed} Pass / ${failed} Fail`;
  };

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>Loading validation history...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">Error: {error}</Typography>
      </Box>
    );
  }

  if (!validationRuns.length) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="textSecondary">No validation runs yet.</Typography>
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Validation History
        </Typography>
        <Tooltip title="Refresh">
          <IconButton onClick={fetchValidationHistory} size="small">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Run Date/Time</TableCell>
            <TableCell>Summary</TableCell>
            <TableCell>Documents</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {validationRuns.map((run) => (
            <TableRow key={run.id}>
              <TableCell>
                {formatUploadDate(run.validation_date)}
              </TableCell>
              <TableCell>
                <Chip
                  label={getStatusLabel(run.passed_documents, run.failed_documents)}
                  color={getStatusColor(run.passed_documents, run.failed_documents)}
                  size="small"
                />
              </TableCell>
              <TableCell>
                {run.total_documents} documents
              </TableCell>
              <TableCell align="right">
                <Tooltip title="View Details">
                  <IconButton 
                    size="small"
                    onClick={() => {
                      // TODO: Implement view details functionality
                      console.log('View details for run:', run.id);
                    }}
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
} 