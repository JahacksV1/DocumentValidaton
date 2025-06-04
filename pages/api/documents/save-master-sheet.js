import { saveMasterSheetToTurso } from '../../../lib/server-db-helpers';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { dealId, filename, fileType, fileSize, uploadUrl } = req.body;

  if (!dealId || !filename || !uploadUrl) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const documentId = await saveMasterSheetToTurso(dealId, {
      fileName: filename,
      fileType,
      fileSize,
      fileUrl: uploadUrl
    });
    
    return res.status(200).json({ 
      success: true,
      documentId 
    });
  } catch (error) {
    console.error('Error saving master sheet:', error);
    return res.status(500).json({ 
      error: 'Failed to save master sheet',
      details: error.message 
    });
  }
} 