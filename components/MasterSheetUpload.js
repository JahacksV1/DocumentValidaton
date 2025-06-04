import React, { useState } from 'react';
import { Box, Typography, Alert, CircularProgress } from '@mui/material';
import { UploadButton } from "@uploadthing/react";
import { saveMasterSheetToTurso } from '../lib/db-helpers';

export default function MasterSheetUpload({ dealId, onUploadComplete }) {
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleUploadComplete = async (res) => {
    console.log('UploadThing response:', res);
    
    if (!res || res.length === 0) {
      setError('No file data received from upload');
      return;
    }

    try {
      const file = res[0];
      
      // Extract server response data
      const fileData = {
        fileName: file.name || file.fileName,
        fileSize: file.size || file.fileSize,
        fileUrl: file.url || file.fileUrl,
        fileType: file.type || file.fileType || 'unknown',
      };
      
      console.log('Processed file data:', fileData);
      
      // Save to Turso
      await saveMasterSheetToTurso(dealId, fileData);
      
      setUploadSuccess(true);
      setError(null);
      
      // Reset success message after 3 seconds
      setTimeout(() => setUploadSuccess(false), 3000);
      
      if (onUploadComplete) {
        onUploadComplete(fileData);
      }
    } catch (error) {
      console.error("Error processing upload:", error);
      setError(error.message || "Error saving master sheet. Please try again.");
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {uploadSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Master sheet uploaded successfully!
        </Alert>
      )}
      
      {uploading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <CircularProgress size={20} />
          <Typography variant="body2">Uploading master sheet...</Typography>
        </Box>
      )}
      
      <UploadButton
        endpoint="documentUploader"
        onUploadBegin={() => {
          setUploading(true);
          setError(null);
        }}
        onClientUploadComplete={(res) => {
          setUploading(false);
          handleUploadComplete(res);
        }}
        onUploadError={(error) => {
          console.error("Upload error:", error);
          setUploading(false);
          setError(error.message || "Upload failed. Please try again.");
        }}
      />
      
      <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
        Accepts PDF and DOCX files up to 4MB
      </Typography>
    </Box>
  );
} 