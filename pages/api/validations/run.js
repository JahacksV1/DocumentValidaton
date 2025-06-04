import { runValidation } from '../../../lib/db-helpers';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { dealId } = req.body;

  if (!dealId) {
    return res.status(400).json({ error: 'Deal ID is required' });
  }

  try {
    const result = await runValidation(dealId);
    
    if (!result.success) {
      return res.status(400).json({ 
        error: result.message 
      });
    }
    
    return res.status(200).json({
      success: true,
      message: result.message,
      results: result.results,
      summary: result.summary
    });
  } catch (error) {
    console.error('Error running validation:', error);
    return res.status(500).json({ 
      error: 'Failed to run validation',
      details: error.message 
    });
  }
} 