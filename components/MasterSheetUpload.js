import React, { useState } from 'react';
import Papa from 'papaparse';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import app from '../lib/firebase';
import { Box, Button, Typography, Input } from '@mui/material';

const db = getFirestore(app);

export default function MasterSheetUpload({ dealId }) {
  const [csvData, setCsvData] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (result) => {
        const parsed = result.data;
        setCsvData(parsed);
        await saveToFirestore(parsed);
      },
      error: (err) => {
        console.error('CSV parsing error:', err.message);
      }
    });
  };

  const saveToFirestore = async (rows) => {
    setUploading(true);

    const masterSheet = {};
    rows.forEach(row => {
      const entity = row.Entity?.trim();
      const field = row.Field?.trim();
      const expected = row.ExpectedValue?.trim();

      if (entity && field && expected) {
        masterSheet[`${entity}:${field}`] = expected;
      }
    });

    try {
      const dealRef = doc(db, 'deals', dealId);
      await updateDoc(dealRef, { masterSheet });
      console.log('Master sheet uploaded successfully!');
    } catch (err) {
      console.error('Error saving master sheet:', err);
    }

    setUploading(false);
  };

  return (
    <Box sx={{ my: 3 }}>
      <Typography variant="subtitle1" gutterBottom>
        Upload Master Sheet (.csv)
      </Typography>

      <Input 
        type="file" 
        accept=".csv" 
        onChange={handleFileChange} 
        disabled={uploading}
      />

      {csvData.length > 0 && (
        <Typography sx={{ mt: 1 }}>
          ✅ {csvData.length} records parsed and saved to Firestore.
        </Typography>
      )}
    </Box>
  );
}
