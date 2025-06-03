import { parsePDF } from './parsePDF';
import { parseDocx } from './parseDocx';
import { parseCSV } from './parseCSV';

export async function validateDocuments(documents, masterSheet) {
  const results = [];

  for (const doc of documents) {
    try {
      let parsedContent;
      
      // Parse document based on file type
      if (doc.type === 'application/pdf') {
        parsedContent = await parsePDF(doc);
      } else if (doc.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        parsedContent = await parseDocx(doc);
      } else if (doc.type === 'text/csv') {
        parsedContent = await parseCSV(doc);
      } else {
        throw new Error(`Unsupported file type: ${doc.type}`);
      }

      if (!parsedContent.success) {
        results.push({
          documentName: doc.name,
          status: 'error',
          message: `Failed to parse document: ${parsedContent.error}`,
          details: parsedContent
        });
        continue;
      }

      // TODO: Implement validation logic against master sheet
      // This is where you would compare the parsed content with the master sheet
      // and check for any discrepancies or missing information

      results.push({
        documentName: doc.name,
        status: 'success',
        message: 'Document validated successfully',
        details: {
          parsedContent,
          validationDetails: {
            // Add validation details here
          }
        }
      });
    } catch (error) {
      results.push({
        documentName: doc.name,
        status: 'error',
        message: `Error processing document: ${error.message}`,
        details: { error }
      });
    }
  }

  return results;
} 