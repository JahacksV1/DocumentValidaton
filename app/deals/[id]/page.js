import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import MasterSheetUpload from '@/components/MasterSheetUpload';
import DocumentsUpload from '@/components/DocumentsUpload';
import ValidationResults from '@/components/ValidationResults';
import turso from '@/lib/turso';

export default async function DealPage({ params }) {
  const dealId = params.id;
  
  // Fetch deal data
  const dealResult = await turso.execute(
    "SELECT * FROM deals WHERE id = ?",
    [dealId]
  );
  const deal = dealResult.rows[0];

  if (!deal) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography color="error">Deal not found</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {deal.name || 'Deal Documents'}
        </Typography>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Master Sheet
          </Typography>
          <MasterSheetUpload dealId={dealId} />
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Additional Documents
          </Typography>
          <DocumentsUpload dealId={dealId} />
        </Box>

        <ValidationResults dealId={dealId} />
      </Box>
    </Container>
  );
} 