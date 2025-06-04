import React, { useState } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { UploadButton } from "@uploadthing/react";

export default function MasterSheetUpload({ dealId, onUploadComplete }) {
  const [error, setError] = useState(null);

  const handleUploadComplete = async (res) => {
    try {
      const file = res[0]; // Master sheet is a single file
      
      // Save document metadata using API
      const response = await fetch('/api/documents/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dealId,
          name: file.name,
          url: file.url,
          type: 'master'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save master sheet');
      }
      
      console.log("Master sheet uploaded and metadata saved:", file);
      if (onUploadComplete) onUploadComplete();
    } catch (error) {
      console.error("Error saving master sheet metadata:", error);
      setError("Error saving master sheet metadata. Please try again.");
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <UploadButton
        endpoint="documentUploader"
        onClientUploadComplete={handleUploadComplete}
        onUploadError={(error) => {
          console.error("Upload error:", error);
          setError(error.message);
        }}
      />
    </Box>
  );
} 