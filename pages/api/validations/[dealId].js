import turso from '../../../lib/turso';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { dealId } = req.query;
    
    const result = await turso.execute(
      "SELECT * FROM validations WHERE dealId = ? ORDER BY runDate DESC",
      [dealId]
    );

    res.status(200).json({ validations: result.rows });
  } catch (error) {
    console.error('Error fetching validations:', error);
    res.status(500).json({ error: 'Failed to fetch validations' });
  }
} 