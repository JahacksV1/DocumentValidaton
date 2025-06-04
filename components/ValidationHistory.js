import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, List, ListItem, ListItemText, 
  Chip, IconButton, Tooltip, Stack, Divider
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
      setValidationRuns(data.validationHistory || []);
    } catch (err) {
      console.error('Error fetching validation history:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (passed, failed) => {
    if (failed === 0 && passed > 0) return 'success';
    if (passed === 0 && failed > 0) return 'error';
    if (passed > 0 && failed > 0) return 'warning';
    return 'default';
  };

  const getStatusLabel = (passed, failed) => {
    if (failed === 0 && passed > 0) return `✅ ${passed} Passed`;
    if (passed === 0 && failed > 0) return `❌ ${failed} Failed`;
    if (passed > 0 && failed > 0) return `⚠️ ${passed} Pass / ${failed} Fail`;
    return 'No Results';
  };

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="textSecondary">Loading validation history...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">Error loading validation history</Typography>
      </Box>
    );
  }

  if (!validationRuns.length) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="textSecondary" gutterBottom>
          No validation runs yet
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Upload documents and run validation to see history
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, px: 2, pt: 1 }}>
        <Typography variant="body2" color="textSecondary">
          {validationRuns.length} validation{validationRuns.length !== 1 ? 's' : ''} run
        </Typography>
        <Tooltip title="Refresh">
          <IconButton onClick={fetchValidationHistory} size="small">
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <List dense>
        {validationRuns.map((run, index) => (
          <React.Fragment key={run.id}>
            <ListItem>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Chip
                      label={getStatusLabel(run.passed_documents, run.failed_documents)}
                      color={getStatusColor(run.passed_documents, run.failed_documents)}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                }
                secondary={
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="textSecondary">
                      {formatUploadDate(run.validation_date)}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {run.total_documents} document{run.total_documents !== 1 ? 's' : ''} processed
                    </Typography>
                  </Stack>
                }
              />
              
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
            </ListItem>
            
            {index < validationRuns.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
} 