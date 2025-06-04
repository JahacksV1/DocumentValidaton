import turso from '../../../lib/turso';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { dealId, filename, fileType, fileSize, uploadUrl } = req.body;
    const masterSheetId = Date.now().toString() + Math.random().toString(36).substr(2, 9);

    await turso.execute(
      "INSERT INTO master_sheets (id, deal_id, filename, file_type, file_size, upload_url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [masterSheetId, dealId, filename, fileType, fileSize, uploadUrl, new Date().toISOString()]
    );

    res.status(200).json({ success: true, masterSheetId });
  } catch (error) {
    console.error('Error saving master sheet:', error);
    res.status(500).json({ error: 'Failed to save master sheet' });
  }
} 