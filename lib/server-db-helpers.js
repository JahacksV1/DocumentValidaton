import { tursoClient } from './turso';

// Generate a unique ID
function generateId() {
  return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Save a master sheet document to Turso (server-side only)
export async function saveMasterSheetToTurso(dealId, fileData) {
  const db = await tursoClient();
  
  try {
    const documentId = generateId();
    const now = new Date().toISOString();
    
    await db.execute({
      sql: `INSERT INTO documents (id, deal_id, name, type, size, uploaded_at, validated, url) 
            VALUES (?, ?, ?, 'masterSheet', ?, ?, false, ?)`,
      args: [
        documentId,
        dealId,
        fileData.fileName || fileData.filename,
        fileData.fileSize || fileData.size,
        now,
        fileData.fileUrl || fileData.uploadUrl || fileData.url
      ]
    });
    
    console.log('Master sheet saved to Turso:', documentId);
    return documentId;
  } catch (error) {
    console.error('Error saving master sheet to Turso:', error);
    throw error;
  }
}

// Save a supporting document to Turso (server-side only)
export async function saveDocumentToTurso(dealId, fileData) {
  const db = await tursoClient();
  
  try {
    const documentId = generateId();
    const now = new Date().toISOString();
    
    await db.execute({
      sql: `INSERT INTO documents (id, deal_id, name, type, size, uploaded_at, validated, url) 
            VALUES (?, ?, ?, 'supporting', ?, ?, false, ?)`,
      args: [
        documentId,
        dealId,
        fileData.fileName || fileData.name,
        fileData.fileSize || fileData.size,
        now,
        fileData.fileUrl || fileData.url
      ]
    });
    
    console.log('Document saved to Turso:', documentId);
    return documentId;
  } catch (error) {
    console.error('Error saving document to Turso:', error);
    throw error;
  }
}

// Get all documents for a deal (server-side only)
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

// Run validation for a deal (Phase 3 - Simulated, server-side only)
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