import React, { useState } from 'react';
import { 
  Box, Typography, Alert, CircularProgress, Button, Stack, Divider 
} from '@mui/material';
import { UploadButton, UploadDropzone } from "@uploadthing/react";
import { saveDocumentToTurso, formatFileSize } from '../lib/db-helpers';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FolderIcon from '@mui/icons-material/Folder';

export default function DocumentsUpload({ dealId, onUploadComplete }) {
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMode, setUploadMode] = useState(null); // 'single', 'multiple', 'dropbox'

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
      
      setError(null);
      setUploadMode(null); // Reset upload mode
      
      if (onUploadComplete) {
        onUploadComplete(savedFiles);
      }
    } catch (error) {
      console.error("Error processing uploads:", error);
      setError(error.message || "Error saving documents. Please try again.");
    }
  };

  const handleDropboxImport = () => {
    // TODO: Implement Dropbox integration
    alert('Dropbox import feature coming soon!');
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
      
      {!uploadMode && (
        <Stack spacing={2}>
          {/* Upload Single File Button */}
          <UploadButton
            endpoint="documentUploader"
            onUploadBegin={() => {
              setUploading(true);
              setError(null);
              setUploadMode('single');
            }}
            onClientUploadComplete={(res) => {
              setUploading(false);
              handleUploadComplete(res);
            }}
            onUploadError={(error) => {
              console.error("Upload error:", error);
              setUploading(false);
              setError(error.message || "Upload failed. Please try again.");
              setUploadMode(null);
            }}
            appearance={{
              button: {
                background: "#059669",
                color: "white",
                padding: "12px 24px",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "500",
                border: "none",
                cursor: "pointer",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }
            }}
          >
            <FileUploadIcon />
            Upload Single File
          </UploadButton>

          {/* Upload Multiple Files Button */}
          <Button
            variant="contained"
            startIcon={<CloudUploadIcon />}
            onClick={() => setUploadMode('multiple')}
            sx={{
              background: "#7c3aed",
              color: "white",
              padding: "12px 24px",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "500",
              textTransform: "none",
              '&:hover': {
                background: "#6d28d9"
              }
            }}
          >
            Upload Multiple Files
          </Button>

          {/* Import from Dropbox Button */}
          <Button
            variant="outlined"
            startIcon={<FolderIcon />}
            onClick={handleDropboxImport}
            sx={{
              padding: "12px 24px",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "500",
              textTransform: "none",
              borderColor: "#6b7280",
              color: "#6b7280",
              '&:hover': {
                borderColor: "#374151",
                color: "#374151"
              }
            }}
          >
            Import from Dropbox
          </Button>
        </Stack>
      )}

      {/* Multiple Files Upload Dropzone */}
      {uploadMode === 'multiple' && (
        <Box>
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
              setUploadMode(null);
            }}
          />
          <Button
            onClick={() => setUploadMode(null)}
            sx={{ mt: 2 }}
            variant="text"
          >
            Cancel
          </Button>
        </Box>
      )}
    </Box>
  );
}
