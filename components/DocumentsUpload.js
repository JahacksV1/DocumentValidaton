import React, { useState } from 'react';
import { getStorage, ref, uploadBytes } from 'firebase/storage';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';
import app from '../lib/firebase';
import { Box, Typography, Button, Input } from '@mui/material';

const storage = getStorage(app);
const db = getFirestore(app);

export default function DocumentsUpload({ dealId }) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    const uploadedMeta = [];

    for (const file of files) {
      const storageRef = ref(storage, `deals/${dealId}/${file.name}`);
      try {
        await uploadBytes(storageRef, file);

        uploadedMeta.push({
          name: file.name,
          type: file.type,
          size: file.size,
          path: `deals/${dealId}/${file.name}`,
        });
      } catch (err) {
        console.error('Upload failed for:', file.name, err);
      }
    }

    // Save metadata to Firestore
    const dealRef = doc(db, 'deals', dealId);
    const dealSnap = await getDoc(dealRef);
    const existingDocs = dealSnap.data().documents || [];

    await updateDoc(dealRef, {
      documents: [...existingDocs, ...uploadedMeta]
    });

    setUploadedFiles(uploadedMeta);
    setUploading(false);
  };

  return (
    <Box sx={{ my: 3 }}>
      <Typography variant="subtitle1" gutterBottom>
        Upload Bond Deal Documents (.pdf, .docx)
      </Typography>

      <Input 
        type="file" 
        inputProps={{ multiple: true, accept: '.pdf,.docx' }} 
        onChange={handleFileUpload} 
        disabled={uploading}
      />

      {uploadedFiles.length > 0 && (
        <Typography sx={{ mt: 1 }}>
          ✅ {uploadedFiles.length} document(s) uploaded successfully.
        </Typography>
      )}
    </Box>
  );
}
