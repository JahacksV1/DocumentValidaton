import { getDocumentsForDeal } from '../../../lib/server-db-helpers';

export default async function handler(req, res) {
  const { dealId } = req.query;

  if (!dealId) {
    return res.status(400).json({ error: 'Deal ID is required' });
  }

  try {
    // Fetch all documents for the deal to show validation status
    const documents = await getDocumentsForDeal(dealId);
    
    // Create validation summary
    const validatedDocs = documents.filter(doc => doc.validated === true || doc.validated === 1);
    const failedDocs = documents.filter(doc => 
      doc.validation_log && doc.validation_log.toLowerCase().includes('failed')
    );
    
    const summary = {
      total: documents.length,
      validated: validatedDocs.length,
      failed: failedDocs.length,
      pending: documents.length - validatedDocs.length - failedDocs.length
    };
    
    return res.status(200).json({ 
      validations: documents,
      summary: summary
    });
  } catch (error) {
    console.error('Error fetching validations:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch validations',
      details: error.message 
    });
  }
} 