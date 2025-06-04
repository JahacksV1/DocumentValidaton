import turso from '../../../../lib/turso';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { dealId } = req.query;
    
    const result = await turso.execute(
      "SELECT * FROM validation_history WHERE deal_id = ? ORDER BY validation_date DESC",
      [dealId]
    );

    res.status(200).json({ validationHistory: result.rows });
  } catch (error) {
    console.error('Error fetching validation history:', error);
    res.status(500).json({ error: 'Failed to fetch validation history' });
  }
} 