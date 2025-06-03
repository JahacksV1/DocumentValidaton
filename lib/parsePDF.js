import * as pdfjsLib from 'pdfjs-dist';

// Set the worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export async function parsePDF(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map(item => item.str);
      text += strings.join(' ') + '\n';
    }
    
    return {
      success: true,
      text,
      metadata: {
        numPages: pdf.numPages,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      }
    };
  } catch (error) {
    console.error('Error parsing PDF:', error);
    return {
      success: false,
      error: error.message
    };
  }
} 