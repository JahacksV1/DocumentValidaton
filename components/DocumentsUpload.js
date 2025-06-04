import React, { useState } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { UploadDropzone } from "@uploadthing/react";

export default function DocumentsUpload({ dealId, onUploadComplete }) {
  const [error, setError] = useState(null);

  const handleUploadComplete = async (res) => {
    try {
      // Save document metadata using API
      await Promise.all(
        res.map(file => 
          fetch('/api/documents/save', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              dealId,
              name: file.name,
              url: file.url,
              type: 'deal'
            }),
          })
        )
      );
      
      console.log("Files uploaded and metadata saved:", res);
      if (onUploadComplete) onUploadComplete();
    } catch (error) {
      console.error("Error saving document metadata:", error);
      setError("Error saving document metadata. Please try again.");
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <UploadDropzone
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
