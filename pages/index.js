// Home Page Layout for Document Validation Tool

import React from 'react';
import { Box, Typography, Container, Paper, Button } from '@mui/material';
import Link from 'next/link';
import turso from '../lib/turso';
import DealForm from '../components/DealForm';

export default function Home({ deals }) {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          📄 Document Validation Tool
        </Typography>
        
        <Box sx={{ mb: 4 }}>
          <DealForm />
        </Box>

        <Typography variant="h5" gutterBottom>
          Previous Projects
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
          {deals.map(deal => (
            <Link key={deal.id} href={`/deal/${deal.id}`} passHref style={{ textDecoration: 'none' }}>
              <Paper 
                sx={{ 
                  padding: '1rem', 
                  cursor: 'pointer',
                  '&:hover': { elevation: 6 }
                }} 
                elevation={3}
              >
                <Typography variant="h6">{deal.name || 'Untitled Deal'}</Typography>
                <Typography variant="body2" color="textSecondary">
                  Created: {new Date(deal.createdAt).toLocaleDateString()}
                </Typography>
              </Paper>
            </Link>
          ))}
        </Box>
      </Box>
    </Container>
  );
}

export async function getServerSideProps() {
  try {
    const result = await turso.execute("SELECT * FROM deals ORDER BY createdAt DESC");
    return {
      props: {
        deals: result.rows
      }
    };
  } catch (error) {
    console.error('Error fetching deals:', error);
    return {
      props: {
        deals: []
      }
    };
  }
}
