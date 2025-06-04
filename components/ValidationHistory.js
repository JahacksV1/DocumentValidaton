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
      
      // For now, fetch all documents and group by validation status
      const response = await fetch(`/api/documents/list/${dealId}`);
      const masterResponse = await fetch(`/api/documents/master-sheets/${dealId}`);
      
      if (!response.ok || !masterResponse.ok) {
        throw new Error('Failed to fetch documents');
      }
      
      const data = await response.json();
      const masterData = await masterResponse.json();
      
      const allDocs = [...(data.documents || []), ...(masterData.documents || [])];
      
      // Group documents by validation runs (simplified for Phase 3)
      const validatedDocs = allDocs.filter(doc => doc.validated === true || doc.validated === 1);
      const failedDocs = allDocs.filter(doc => 
        doc.validation_log && doc.validation_log.toLowerCase().includes('failed')
      );
      
      // Create a summary for display
      if (validatedDocs.length > 0 || failedDocs.length > 0) {
        setValidationRuns([{
          id: 'current',
          validation_date: new Date().toISOString(),
          total_documents: allDocs.length,
          passed_documents: validatedDocs.length,
          failed_documents: failedDocs.length,
          documents: allDocs
        }]);
      } else {
        setValidationRuns([]);
      }
      
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
          Latest validation results
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
                      Last validation: {formatUploadDate(run.validation_date)}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {run.total_documents} document{run.total_documents !== 1 ? 's' : ''} processed
                    </Typography>
                    {run.documents && run.documents.length > 0 && (
                      <Typography variant="caption" color="textSecondary">
                        Documents: {run.documents.slice(0, 3).map(d => d.name).join(', ')}
                        {run.documents.length > 3 && ` and ${run.documents.length - 3} more`}
                      </Typography>
                    )}
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