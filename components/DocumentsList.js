import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, List, ListItem, ListItemText, 
  ListItemIcon, Chip, IconButton, Tooltip, 
  ListItemSecondaryAction, Divider
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
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

  const getValidationStatus = (document) => {
    // TODO: Add real validation status logic
    // For now, show "Awaiting Validation" for all documents
    return 'awaiting';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'validated':
        return <CheckCircleIcon sx={{ color: 'success.main', fontSize: 16 }} />;
      case 'failed':
        return <ErrorIcon sx={{ color: 'error.main', fontSize: 16 }} />;
      default:
        return <AccessTimeIcon sx={{ color: 'grey.500', fontSize: 16 }} />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'validated':
        return 'Validated';
      case 'failed':
        return 'Validation Failed';
      default:
        return 'Awaiting Validation';
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="textSecondary">Loading documents...</Typography>
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
    <Box>
      <List dense>
        {documents.map((doc, index) => {
          const validationStatus = getValidationStatus(doc);
          
          return (
            <React.Fragment key={doc.id}>
              <ListItem>
                <ListItemIcon>
                  {(doc.file_type || doc.fileType || '').includes('pdf') ? (
                    <PictureAsPdfIcon />
                  ) : (
                    <DescriptionIcon />
                  )}
                </ListItemIcon>
                
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {doc.name || doc.filename || doc.fileName}
                    </Typography>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" color="textSecondary">
                          {formatFileSize(doc.file_size || doc.fileSize || 0)}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          •
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {formatUploadDate(doc.createdAt || doc.created_at)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {getStatusIcon(validationStatus)}
                        <Typography variant="caption" color="textSecondary">
                          {getStatusText(validationStatus)}
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
                
                <ListItemSecondaryAction>
                  <Tooltip title="Download">
                    <IconButton 
                      edge="end" 
                      size="small"
                      onClick={() => handleDownload(doc)}
                      sx={{ mr: 0.5 }}
                    >
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton 
                      edge="end" 
                      size="small"
                      onClick={() => handleDelete(doc.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </ListItemSecondaryAction>
              </ListItem>
              
              {index < documents.length - 1 && <Divider />}
            </React.Fragment>
          );
        })}
      </List>
    </Box>
  );
} 