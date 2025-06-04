import { getDocumentsForDeal } from '../../../../lib/server-db-helpers';

export default async function handler(req, res) {
  const { dealId } = req.query;

  if (!dealId) {
    return res.status(400).json({ error: 'Deal ID is required' });
  }

  try {
    // Fetch supporting documents for the deal
    const documents = await getDocumentsForDeal(dealId, 'supporting');
    
    return res.status(200).json({ 
      documents: documents || [] 
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch documents',
      details: error.message 
    });
  }
} 