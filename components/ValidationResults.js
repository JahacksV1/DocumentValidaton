import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip, Stack } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

export default function ValidationResults({ dealId }) {
  const [validations, setValidations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchValidations() {
      try {
        const response = await fetch(`/api/validations/${dealId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch validations');
        }
        
        const data = await response.json();
        setValidations(data.validations || []);
      } catch (err) {
        console.error('Error fetching validations:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (dealId) {
      fetchValidations();
    }
  }, [dealId]);

  const getLatestValidation = () => {
    if (!validations.length) return null;
    return validations[validations.length - 1];
  };

  const getStatusDisplay = (validation) => {
    if (!validation) {
      return {
        icon: <AccessTimeIcon sx={{ color: 'grey.500' }} />,
        text: 'No validation runs yet',
        color: 'default',
        description: 'Upload documents and run validation to see results'
      };
    }

    // Parse validation result if it exists
    let result = {};
    try {
      result = validation.result ? JSON.parse(validation.result) : {};
    } catch (e) {
      console.error('Failed to parse validation result:', e);
    }

    const documentCount = result.documentCount || 0;
    const passedCount = result.passedCount || 0;
    const failedCount = documentCount - passedCount;

    if (failedCount === 0 && documentCount > 0) {
      return {
        icon: <CheckCircleIcon sx={{ color: 'success.main' }} />,
        text: 'All Documents Valid',
        color: 'success',
        description: `${documentCount} documents passed validation`
      };
    } else if (failedCount > 0) {
      return {
        icon: <ErrorIcon sx={{ color: 'error.main' }} />,
        text: 'Validation Issues Found',
        color: 'error',
        description: `${failedCount} of ${documentCount} documents failed validation`
      };
    } else {
      return {
        icon: <AccessTimeIcon sx={{ color: 'warning.main' }} />,
        text: 'Validation In Progress',
        color: 'warning',
        description: 'Please wait for validation to complete'
      };
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="textSecondary">Loading validation status...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">Error loading validation status</Typography>
      </Box>
    );
  }

  const latestValidation = getLatestValidation();
  const status = getStatusDisplay(latestValidation);

  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={2} alignItems="center">
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
        
        {latestValidation && (
          <Typography variant="caption" color="textSecondary">
            Last run: {new Date(latestValidation.runDate).toLocaleString()}
          </Typography>
        )}
      </Stack>
    </Box>
  );
}
