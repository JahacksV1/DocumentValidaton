import { tursoClient } from '../../../../lib/turso';

export default async function handler(req, res) {
  const { dealId } = req.query;

  if (!dealId) {
    return res.status(400).json({ error: 'Deal ID is required' });
  }

  try {
    const db = await tursoClient();
    
    // Fetch master sheet documents for the deal
    const result = await db.execute({
      sql: `SELECT * FROM documents 
            WHERE deal_id = ? AND type = 'masterSheet' 
            ORDER BY uploaded_at DESC`,
      args: [dealId]
    });
    
    return res.status(200).json({ 
      documents: result.rows || [] 
    });
  } catch (error) {
    console.error('Error fetching master sheets:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch master sheets',
      details: error.message 
    });
  }
} 