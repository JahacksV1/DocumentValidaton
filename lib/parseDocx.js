import mammoth from 'mammoth';

export async function parseDocx(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    return {
      success: true,
      text: result.value,
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      }
    };
  } catch (error) {
    console.error('Error parsing DOCX:', error);
    return {
      success: false,
      error: error.message
    };
  }
} 