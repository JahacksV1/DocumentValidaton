import React, { useState } from 'react';
import { Box, Typography, Alert, CircularProgress, Chip } from '@mui/material';
import { UploadDropzone } from "@uploadthing/react";
import { saveDocumentToTurso, formatFileSize } from '../lib/db-helpers';

export default function DocumentsUpload({ dealId, onUploadComplete }) {
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleUploadComplete = async (res) => {
    console.log('UploadThing response:', res);
    
    if (!res || res.length === 0) {
      setError('No files received from upload');
      return;
    }

    try {
      const savedFiles = [];
      
      // Process each uploaded file
      for (const file of res) {
        const fileData = {
          fileName: file.name || file.fileName,
          fileSize: file.size || file.fileSize,
          fileUrl: file.url || file.fileUrl,
          fileType: file.type || file.fileType || 'unknown',
        };
        
        console.log('Processing file:', fileData);
        
        // Save to Turso
        await saveDocumentToTurso(dealId, fileData);
        savedFiles.push(fileData);
      }
      
      setUploadedFiles(prev => [...prev, ...savedFiles]);
      setError(null);
      
      if (onUploadComplete) {
        onUploadComplete(savedFiles);
      }
    } catch (error) {
      console.error("Error processing uploads:", error);
      setError(error.message || "Error saving documents. Please try again.");
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {uploading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <CircularProgress size={20} />
          <Typography variant="body2">Uploading documents...</Typography>
        </Box>
      )}
      
      <UploadDropzone
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
      
      {uploadedFiles.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Recently uploaded files:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {uploadedFiles.map((file, index) => (
              <Chip
                key={index}
                label={`${file.fileName} (${formatFileSize(file.fileSize)})`}
                size="small"
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
