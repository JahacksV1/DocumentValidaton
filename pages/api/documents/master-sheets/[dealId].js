import turso from '../../../../lib/turso';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { dealId } = req.query;
    
    const result = await turso.execute(
      "SELECT * FROM master_sheets WHERE deal_id = ? ORDER BY created_at DESC",
      [dealId]
    );

    res.status(200).json({ documents: result.rows });
  } catch (error) {
    console.error('Error fetching master sheets:', error);
    res.status(500).json({ error: 'Failed to fetch master sheets' });
  }
} 