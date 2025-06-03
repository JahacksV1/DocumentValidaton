import csv from 'csv-parser';
import { Readable } from 'stream';

export async function parseCSV(file) {
  return new Promise((resolve, reject) => {
    const results = [];
    const stream = Readable.from(file.stream());
    
    stream
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        resolve({
          success: true,
          data: results,
          metadata: {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            rowCount: results.length
          }
        });
      })
      .on('error', (error) => {
        console.error('Error parsing CSV:', error);
        reject({
          success: false,
          error: error.message
        });
      });
  });
} 