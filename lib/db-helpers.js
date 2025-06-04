// Helper functions for database operations

import { tursoClient } from './turso';

// Helper function to format file sizes
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Helper function to format upload dates
export function formatUploadDate(dateString) {
  if (!dateString) return 'Unknown date';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    if (diffHours < 1) {
      const diffMinutes = Math.ceil(diffTime / (1000 * 60));
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    }
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}

// Generate a unique ID
function generateId() {
  return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Client-side helper functions for API calls
export async function saveMasterSheetToTurso(dealId, fileData) {
  try {
    const response = await fetch('/api/documents/save-master-sheet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dealId,
        filename: fileData.fileName,
        fileType: fileData.fileType,
        fileSize: fileData.fileSize,
        uploadUrl: fileData.fileUrl,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save master sheet to database');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving master sheet:', error);
    throw error;
  }
}

export async function saveDocumentToTurso(dealId, fileData) {
  try {
    const response = await fetch('/api/documents/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dealId,
        name: fileData.fileName,
        url: fileData.fileUrl,
        type: 'supporting',
        fileSize: fileData.fileSize,
        fileType: fileData.fileType,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save document to database');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving document:', error);
    throw error;
  }
}

// Get all documents for a deal
export async function getDocumentsForDeal(dealId, type = null) {
  const db = await tursoClient();
  
  try {
    let query = 'SELECT * FROM documents WHERE deal_id = ?';
    const args = [dealId];
    
    if (type) {
      query += ' AND type = ?';
      args.push(type);
    }
    
    query += ' ORDER BY uploaded_at DESC';
    
    const result = await db.execute({
      sql: query,
      args: args
    });
    
    return result.rows || [];
  } catch (error) {
    console.error('Error fetching documents:', error);
    throw error;
  }
}

// Run validation for a deal (Phase 3 - Simulated)
export async function runValidation(dealId) {
  const db = await tursoClient();
  
  try {
    // Get all documents for the deal
    const documents = await getDocumentsForDeal(dealId);
    
    if (!documents.length) {
      return {
        success: false,
        message: 'No documents found for validation'
      };
    }
    
    // Find master sheet
    const masterSheet = documents.find(doc => doc.type === 'masterSheet');
    if (!masterSheet) {
      return {
        success: false,
        message: 'No master sheet found. Please upload a master sheet first.'
      };
    }
    
    // Find supporting documents
    const supportingDocs = documents.filter(doc => doc.type === 'supporting');
    
    // Simulate validation for each document
    const validationResults = [];
    
    // Validate master sheet
    await db.execute({
      sql: `UPDATE documents 
            SET validated = true, 
                validation_log = 'Master sheet validated successfully' 
            WHERE id = ?`,
      args: [masterSheet.id]
    });
    
    validationResults.push({
      id: masterSheet.id,
      name: masterSheet.name,
      type: 'masterSheet',
      validated: true,
      log: 'Master sheet validated successfully'
    });
    
    // Validate each supporting document
    for (const doc of supportingDocs) {
      // Simulate validation (Phase 3 - always pass)
      const validationLog = 'Simulated auto-validation successful';
      
      await db.execute({
        sql: `UPDATE documents 
              SET validated = true, 
                  validation_log = ? 
              WHERE id = ?`,
        args: [validationLog, doc.id]
      });
      
      validationResults.push({
        id: doc.id,
        name: doc.name,
        type: 'supporting',
        validated: true,
        log: validationLog
      });
    }
    
    return {
      success: true,
      message: 'Validation completed successfully',
      results: validationResults,
      summary: {
        total: documents.length,
        passed: documents.length,
        failed: 0,
        masterSheet: masterSheet.name,
        supportingDocs: supportingDocs.length
      }
    };
    
  } catch (error) {
    console.error('Error running validation:', error);
    throw error;
  }
} 