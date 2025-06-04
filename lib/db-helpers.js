// Helper functions for database operations

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
        type: 'deal',
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

// Utility functions
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatUploadDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
} 