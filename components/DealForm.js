import React, { useState } from 'react';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import app from '../lib/firebase';
import { Box, TextField, Button, Typography } from '@mui/material';

const db = getFirestore(app);

export default function DealForm({ dealId, onNext }) {
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;

    setSaving(true);
    try {
      await updateDoc(doc(db, 'deals', dealId), {
        title,
        updatedAt: new Date().toISOString()
      });
      onNext(); // Move to next step
    } catch (error) {
      console.error('Error saving deal title:', error);
    }
    setSaving(false);
  };

  return (
    <Box>
      <Typography variant="body1" gutterBottom>
        Give your project a name:
      </Typography>

      <TextField 
        label="Deal Name" 
        value={title} 
        onChange={(e) => setTitle(e.target.value)} 
        fullWidth 
        sx={{ mb: 2 }}
      />

      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? 'Saving...' : 'Save & Continue'}
      </Button>
    </Box>
  );
}
