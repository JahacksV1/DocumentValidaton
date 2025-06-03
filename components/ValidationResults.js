import React, { useEffect, useState } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getStorage, ref, getBytes } from 'firebase/storage';
import app from '../lib/firebase';
import { Box, Typography, Table, TableHead, TableBody, TableRow, TableCell, CircularProgress } from '@mui/material';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Set the worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const db = getFirestore(app);
const storage = getStorage(app);

export default function ValidationResults({ dealId }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    runValidation();
  }, []);

  const runValidation = async () => {
    setLoading(true);

    const dealRef = doc(db, 'deals', dealId);
    const dealSnap = await getDoc(dealRef);
    const { masterSheet = {}, documents = [] } = dealSnap.data();

    const validationResults = [];

    for (const docMeta of documents) {
      const storageRef = ref(storage, docMeta.path);
      const fileBuffer = await getBytes(storageRef);

      let textContent = '';

      if (docMeta.name.endsWith('.pdf')) {
        const pdf = await pdfjsLib.getDocument({ data: fileBuffer }).promise;
        for (let i = 0; i < pdf.numPages; i++) {
          const page = await pdf.getPage(i + 1);
          const text = await page.getTextContent();
          textContent += text.items.map(item => item.str).join(' ');
        }
      } else if (docMeta.name.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ arrayBuffer: fileBuffer });
        textContent = result.value;
      }

      const resultPerDoc = {
        document: docMeta.name,
        matches: []
      };

      Object.entries(masterSheet).forEach(([key, expected]) => {
        const [entity, field] = key.split(':');
        const regex = new RegExp(`${entity}\\s+${field}\\s*[:=]?\\s*([\\w.\\-]+)`, 'gi');
        const matches = [...textContent.matchAll(regex)];

        if (matches.length === 0) {
          resultPerDoc.matches.push({ key, status: 'missing' });
        } else {
          const allCorrect = matches.every(m => m[1] === expected);
          resultPerDoc.matches.push({ key, status: allCorrect ? 'correct' : 'mismatch' });
        }
      });

      validationResults.push(resultPerDoc);
    }

    setResults(validationResults);
    setLoading(false);
  };

  const getColor = (status) => {
    switch (status) {
      case 'correct': return '#4caf50'; // green
      case 'mismatch': return '#ff9800'; // orange
      case 'missing': return '#f44336'; // red
      default: return 'inherit';
    }
  };

  if (loading) {
    return (
      <Box mt={4}>
        <CircularProgress />
        <Typography variant="body2" mt={2}>Validating documents...</Typography>
      </Box>
    );
  }

  return (
    <Box mt={3}>
      {results.map(doc => (
        <Box key={doc.document} mb={4}>
          <Typography variant="h6">{doc.document}</Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Key</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {doc.matches.map((m, idx) => (
                <TableRow key={idx}>
                  <TableCell>{m.key}</TableCell>
                  <TableCell sx={{ color: getColor(m.status) }}>
                    {m.status.toUpperCase()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      ))}
    </Box>
  );
}
