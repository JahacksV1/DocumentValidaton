import turso from '../../../lib/turso';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { dealId, name, url, type, fileSize, fileType } = req.body;
    const documentId = Date.now().toString() + Math.random().toString(36).substr(2, 9);

    await turso.execute(
      "INSERT INTO documents (id, dealId, name, url, type, createdAt) VALUES (?, ?, ?, ?, ?, ?)",
      [documentId, dealId, name, url, type, new Date().toISOString()]
    );

    if (type !== 'master') {
      console.log('Document metadata:', { fileSize, fileType });
    }

    res.status(200).json({ success: true, documentId });
  } catch (error) {
    console.error('Error saving document:', error);
    res.status(500).json({ error: 'Failed to save document' });
  }
} 