import turso from '../../../lib/turso';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name } = req.body;
    const dealId = Date.now().toString();

    await turso.execute(
      "INSERT INTO deals (id, name, createdAt) VALUES (?, ?, ?)",
      [dealId, name, new Date().toISOString()]
    );

    res.status(200).json({ dealId });
  } catch (error) {
    console.error('Error creating deal:', error);
    res.status(500).json({ error: 'Failed to create deal' });
  }
} 