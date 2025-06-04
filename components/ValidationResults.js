import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';

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
        setValidations(data.validations);
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

  if (loading) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography>Loading validation results...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography color="error">Error: {error}</Typography>
      </Box>
    );
  }

  if (!validations.length) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography color="textSecondary">No validation runs yet.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Run Date</TableCell>
            <TableCell>Summary</TableCell>
            <TableCell>Document Count</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {validations.map((validation) => (
            <TableRow key={validation.id}>
              <TableCell>
                {new Date(validation.runDate).toLocaleString()}
              </TableCell>
              <TableCell>{validation.summary}</TableCell>
              <TableCell>
                {validation.result ? JSON.parse(validation.result).documentCount || 0 : 0}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
