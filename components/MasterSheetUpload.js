import React, { useState } from 'react';
import { Box, Button, Typography, Alert } from '@mui/material';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import Papa from 'papaparse';

const storage = getStorage();
const db = getFirestore();

export default function MasterSheetUpload({ dealId }) {
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      // Upload file to Firebase Storage
      const storageRef = ref(storage, `deals/${dealId}/masterSheet/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      // Parse file content
      const text = await file.text();
      let masterSheetData;

      if (file.name.endsWith('.csv')) {
        const { data } = Papa.parse(text, { header: true });
        masterSheetData = data.reduce((acc, row) => {
          const [key, value] = Object.entries(row)[0];
          acc[key] = value;
          return acc;
        }, {});
      } else if (file.name.endsWith('.json')) {
        masterSheetData = JSON.parse(text);
      } else {
        throw new Error('Unsupported file format. Please upload a CSV or JSON file.');
      }

      // Store in Firestore
      await setDoc(doc(db, `deals/${dealId}/masterSheet`, 'data'), {
        data: masterSheetData,
        fileName: file.name,
        fileUrl: downloadURL,
        uploadedAt: new Date().toISOString()
      });

      // Clear the file input
      event.target.value = '';
    } catch (err) {
      console.error('Error uploading master sheet:', err);
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Box>
      <input
        type="file"
        accept=".csv,.json"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
        id="master-sheet-upload"
      />
      <label htmlFor="master-sheet-upload">
        <Button
          variant="contained"
          component="span"
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Upload Master Sheet'}
        </Button>
      </label>
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
}
