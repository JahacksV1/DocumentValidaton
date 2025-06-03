import React, { useState } from 'react';
import { Box, Button, Typography, Alert, CircularProgress } from '@mui/material';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import app from '../lib/firebase';

const storage = getStorage(app);
const db = getFirestore(app);

export default function DocumentsUpload({ dealId }) {
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = async (event, isMultiple = false) => {
    const files = isMultiple ? Array.from(event.target.files) : [event.target.files[0]];
    if (!files.length) return;

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const uploadPromises = files.map(async (file, index) => {
        // Upload to Firebase Storage
        const storageRef = ref(storage, `deals/${dealId}/documents/${file.name}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);

        // Update progress
        setUploadProgress(((index + 1) / files.length) * 100);

        return {
          name: file.name,
          size: file.size,
          type: file.type,
          url: downloadURL,
          uploadedAt: new Date().toISOString()
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);

      // Store metadata in Firestore
      const dealRef = doc(db, 'deals', dealId);
      await updateDoc(dealRef, {
        documents: arrayUnion(...uploadedFiles)
      });

      // Clear the file input
      event.target.value = '';
    } catch (err) {
      console.error('Error uploading documents:', err);
      setError(err.message);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Box>
      <input
        type="file"
        id="single-file-upload"
        onChange={(e) => handleFileUpload(e, false)}
        style={{ display: 'none' }}
      />
      <input
        type="file"
        id="multiple-file-upload"
        onChange={(e) => handleFileUpload(e, true)}
        multiple
        style={{ display: 'none' }}
      />
      {isUploading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
          <CircularProgress variant="determinate" value={uploadProgress} />
          <Typography variant="body2">
            Uploading... {Math.round(uploadProgress)}%
          </Typography>
        </Box>
      )}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
}
