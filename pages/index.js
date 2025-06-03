// Home Page Layout for Document Validation Tool

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import app from '../lib/firebase';
import { Box, Button, Typography, Grid, Paper } from '@mui/material';

const db = getFirestore(app);

export default function Home() {
  const router = useRouter();
  const [deals, setDeals] = useState([]);

  useEffect(() => {
    async function fetchDeals() {
      const querySnapshot = await getDocs(collection(db, 'deals'));
      const docs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDeals(docs);
    }
    fetchDeals();
  }, []);

  const handleNewProject = () => {
    const newDealId = Date.now().toString(); // temp ID until Firestore write
    router.push(`/deal/${newDealId}`);
  };

  return (
    <Box sx={{ padding: '2rem' }}>
      <Typography variant="h3" align="center" gutterBottom>
        📄 Document Validation Tool
      </Typography>

      <Box display="flex" justifyContent="center" mb={4}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleNewProject}
        >
          Start New Project
        </Button>
      </Box>

      <Typography variant="h5" gutterBottom>
        Previous Projects
      </Typography>

      <Grid container spacing={2}>
        {deals.map(deal => (
          <Grid item xs={12} sm={6} md={4} key={deal.id}>
            <Paper 
              sx={{ padding: '1rem', cursor: 'pointer' }} 
              onClick={() => router.push(`/deal/${deal.id}`)}
              elevation={3}
            >
              <Typography variant="h6">{deal.title || 'Untitled Deal'}</Typography>
              <Typography variant="body2" color="textSecondary">
                Created: {deal.createdAt || 'Unknown'}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
