import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, List, ListItem, ListItemText, 
  ListItemIcon, Chip, IconButton, Tooltip, Paper 
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import { formatFileSize, formatUploadDate } from '../lib/db-helpers';

export default function DocumentsList({ dealId, documentType = 'all' }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, [dealId, documentType]);

  const fetchDocuments = async () => {
    if (!dealId) return;
    
    try {
      setLoading(true);
      const endpoint = documentType === 'master' 
        ? `/api/documents/master-sheets/${dealId}`
        : `/api/documents/list/${dealId}`;
        
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (document) => {
    window.open(document.url || document.upload_url, '_blank');
  };

  const handleDelete = async (documentId) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete document');
      }
      
      // Refresh the list
      fetchDocuments();
    } catch (err) {
      console.error('Error deleting document:', err);
      alert('Failed to delete document');
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>Loading documents...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">Error: {error}</Typography>
      </Box>
    );
  }

  if (!documents.length) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="textSecondary">
          No {documentType === 'master' ? 'master sheets' : 'documents'} uploaded yet.
        </Typography>
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {documentType === 'master' ? 'Master Sheets' : 'Uploaded Documents'}
      </Typography>
      
      <List>
        {documents.map((doc) => (
          <ListItem
            key={doc.id}
            secondaryAction={
              <Box>
                <Tooltip title="Download">
                  <IconButton 
                    edge="end" 
                    aria-label="download"
                    onClick={() => handleDownload(doc)}
                    sx={{ mr: 1 }}
                  >
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton 
                    edge="end" 
                    aria-label="delete"
                    onClick={() => handleDelete(doc.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            }
          >
            <ListItemIcon>
              <DescriptionIcon />
            </ListItemIcon>
            <ListItemText
              primary={doc.name || doc.filename}
              secondary={
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Typography variant="caption">
                    {formatUploadDate(doc.createdAt || doc.created_at)}
                  </Typography>
                  <Chip 
                    label={formatFileSize(doc.file_size || 0)} 
                    size="small" 
                    variant="outlined"
                  />
                  {doc.type && (
                    <Chip 
                      label={doc.type === 'master' ? 'Master' : 'Document'} 
                      size="small" 
                      color={doc.type === 'master' ? 'primary' : 'default'}
                    />
                  )}
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
} 