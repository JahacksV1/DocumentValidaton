import { saveDocumentToTurso } from '../../../lib/server-db-helpers';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { dealId, name, url, type, fileSize, fileType } = req.body;

  if (!dealId || !name || !url) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const documentId = await saveDocumentToTurso(dealId, {
      fileName: name,
      fileUrl: url,
      fileSize,
      fileType
    });
    
    return res.status(200).json({ 
      success: true,
      documentId 
    });
  } catch (error) {
    console.error('Error saving document:', error);
    return res.status(500).json({ 
      error: 'Failed to save document',
      details: error.message 
    });
  }
} 