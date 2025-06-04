import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Typography, Container, Paper, Grid } from '@mui/material';
import DocumentsUpload from '../../components/DocumentsUpload';
import MasterSheetUpload from '../../components/MasterSheetUpload';
import ValidationResults from '../../components/ValidationResults';
import ValidationHistory from '../../components/ValidationHistory';
import DocumentsList from '../../components/DocumentsList';

export default function DealPage() {
  const router = useRouter();
  const { dealId } = router.query;
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function fetchDeal() {
      if (!dealId) return;
      
      try {
        const response = await fetch(`/api/deals/${dealId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setDeal(null);
          } else {
            throw new Error('Failed to fetch deal');
          }
        } else {
          const data = await response.json();
          setDeal(data.deal);
        }
      } catch (error) {
        console.error('Error fetching deal:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDeal();
  }, [dealId]);

  const handleUploadComplete = () => {
    // Refresh all components
    setRefreshKey(prev => prev + 1);
    console.log('Upload completed, refreshing components');
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography>Loading...</Typography>
        </Box>
      </Container>
    );
  }

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
          {deal.name || 'Untitled Deal'}
        </Typography>

        {/* Upload Sections - Top Row */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Master Sheet Upload - Top Left */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Master Sheet Upload
              </Typography>
              <MasterSheetUpload 
                dealId={dealId} 
                onUploadComplete={handleUploadComplete}
              />
              
              {/* Master Sheets List */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" component="h3" gutterBottom>
                  Master Sheets
                </Typography>
                <DocumentsList 
                  key={`master-${refreshKey}`} 
                  dealId={dealId} 
                  documentType="master" 
                />
              </Box>
            </Paper>
          </Grid>

          {/* Documents Upload - Top Right */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Upload Documents
              </Typography>
              <DocumentsUpload 
                dealId={dealId}
                onUploadComplete={handleUploadComplete}
              />
              
              {/* Documents List */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" component="h3" gutterBottom>
                  Documents
                </Typography>
                <DocumentsList 
                  key={`docs-${refreshKey}`} 
                  dealId={dealId} 
                  documentType="all" 
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Validation Sections - Bottom Row */}
        <Grid container spacing={3}>
          {/* Current Validation Status */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                ✅ Current Validation Status
              </Typography>
              <ValidationResults key={refreshKey} dealId={dealId} />
            </Paper>
          </Grid>

          {/* Validation History */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                📜 Validation History
              </Typography>
              <ValidationHistory key={refreshKey} dealId={dealId} />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
