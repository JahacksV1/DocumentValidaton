import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip, Stack, Button, CircularProgress, Alert } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

export default function ValidationResults({ dealId, onValidationComplete }) {
  const [validationStatus, setValidationStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationSummary, setValidationSummary] = useState(null);

  const runValidation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/validations/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dealId }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to run validation');
      }
      
      setValidationSummary(data.summary);
      setValidationStatus('completed');
      
      // Notify parent component to refresh documents
      if (onValidationComplete) {
        onValidationComplete();
      }
      
    } catch (err) {
      console.error('Error running validation:', err);
      setError(err.message);
      setValidationStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = () => {
    if (loading) {
      return {
        icon: <CircularProgress size={20} />,
        text: 'Running Validation...',
        color: 'primary',
        description: 'Please wait while we validate your documents'
      };
    }

    if (error) {
      return {
        icon: <ErrorIcon sx={{ color: 'error.main' }} />,
        text: 'Validation Error',
        color: 'error',
        description: error
      };
    }

    if (validationStatus === 'completed' && validationSummary) {
      const allPassed = validationSummary.failed === 0;
      
      return {
        icon: allPassed ? 
          <CheckCircleIcon sx={{ color: 'success.main' }} /> : 
          <ErrorIcon sx={{ color: 'error.main' }} />,
        text: allPassed ? 'All Documents Valid' : 'Validation Issues Found',
        color: allPassed ? 'success' : 'error',
        description: allPassed ? 
          `${validationSummary.passed} documents passed validation` :
          `${validationSummary.failed} of ${validationSummary.total} documents failed validation`
      };
    }

    return {
      icon: <AccessTimeIcon sx={{ color: 'grey.500' }} />,
      text: 'Ready to Validate',
      color: 'default',
      description: 'Click "Run Validation" to check your documents'
    };
  };

  const status = getStatusDisplay();

  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={3} alignItems="center">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {status.icon}
          <Chip 
            label={status.text}
            color={status.color}
            variant="outlined"
            size="medium"
          />
        </Box>
        
        <Typography variant="body2" color="textSecondary" textAlign="center">
          {status.description}
        </Typography>
        
        {validationSummary && (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="textSecondary" display="block">
              Master Sheet: {validationSummary.masterSheet}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Supporting Documents: {validationSummary.supportingDocs}
            </Typography>
          </Box>
        )}
        
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<PlayArrowIcon />}
          onClick={runValidation}
          disabled={loading}
          sx={{
            mt: 2,
            px: 4,
            py: 1.5,
            fontSize: '16px',
            fontWeight: 500,
            textTransform: 'none',
            borderRadius: 2,
            boxShadow: 2,
            '&:hover': {
              boxShadow: 4
            }
          }}
        >
          {loading ? 'Running Validation...' : 'Run Validation'}
        </Button>
      </Stack>
    </Box>
  );
}
