import React, { useState, useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, Chip, CircularProgress } from '@mui/material';
import { getFirestore, doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import Papa from 'papaparse';

const db = getFirestore();
const storage = getStorage();

export default function ValidationResults({ dealId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  useEffect(() => {
    if (!dealId) return;
    runValidation();
  }, [dealId]);

  const runValidation = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get master sheet
      const masterSheetDoc = await getDoc(doc(db, `deals/${dealId}/masterSheet`, 'data'));
      if (!masterSheetDoc.exists()) {
        throw new Error('Master sheet not found');
      }
      const masterSheet = masterSheetDoc.data().data;

      // Get documents
      const dealDoc = await getDoc(doc(db, 'deals', dealId));
      if (!dealDoc.exists()) {
        throw new Error('Deal not found');
      }
      const documents = dealDoc.data().documents || [];

      // Validate each document
      const validationResults = await Promise.all(documents.map(async (doc) => {
        const docUrl = doc.url;
        const response = await fetch(docUrl);
        const text = await response.text();
        
        // Parse document content (simplified for example)
        const matches = Object.entries(masterSheet).map(([key, expected]) => {
          const found = text.includes(expected) ? [expected] : [];
          return {
            key,
            expected,
            found,
            status: found.length > 0 ? 'PASS' : 'FAIL'
          };
        });

        return {
          document: doc.name,
          matches
        };
      }));

      // Calculate summary
      const summary = validationResults.reduce((acc, doc) => {
        doc.matches.forEach(match => {
          if (match.status === 'PASS') acc.passCount++;
          else acc.failCount++;
        });
        return acc;
      }, { passCount: 0, failCount: 0 });

      // Save validation run
      const validationRun = {
        timestamp: new Date().toISOString(),
        results: validationResults,
        ...summary,
        docCount: documents.length
      };

      await addDoc(collection(db, `deals/${dealId}/validationRuns`), validationRun);
      setResults(validationRun);
    } catch (err) {
      console.error('Validation error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!results) {
    return null;
  }

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1">
          Validation Summary: {results.passCount} Pass, {results.failCount} Fail
        </Typography>
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Document</TableCell>
            <TableCell>Key</TableCell>
            <TableCell>Expected</TableCell>
            <TableCell>Found</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {results.results.map((doc, docIndex) => (
            doc.matches.map((match, matchIndex) => (
              <TableRow key={`${docIndex}-${matchIndex}`}>
                {matchIndex === 0 && (
                  <TableCell rowSpan={doc.matches.length}>{doc.document}</TableCell>
                )}
                <TableCell>{match.key}</TableCell>
                <TableCell>{match.expected}</TableCell>
                <TableCell>{match.found.join(' | ') || '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={match.status}
                    color={match.status === 'PASS' ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
