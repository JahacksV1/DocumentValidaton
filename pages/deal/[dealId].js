import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getFirestore, doc, setDoc, getDoc, enableNetwork, disableNetwork } from 'firebase/firestore';
import app from '../../lib/firebase';
import { Box, Typography, Button, Divider, Alert } from '@mui/material';
import DealForm from '../../components/DealForm';
import MasterSheetUpload from '../../components/MasterSheetUpload';
import DocumentsUpload from '../../components/DocumentsUpload';
import dynamic from 'next/dynamic';

const ValidationResults = dynamic(() => import('../../components/ValidationResults'), { ssr: false });

const db = getFirestore(app);

export default function DealPage() {
  const router = useRouter();
  const { dealId } = router.query;

  const [dealData, setDealData] = useState(null);
  const [step, setStep] = useState(1); // Step 1 = form, 2 = upload, 3 = review
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (!dealId) return;

    async function loadOrCreateDeal() {
      try {
        const ref = doc(db, 'deals', dealId);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          await setDoc(ref, {
            title: `Untitled Deal`,
            createdAt: new Date().toISOString(),
          });
          setDealData({ title: 'Untitled Deal' });
        } else {
          setDealData(snap.data());
        }
        setError(null);
      } catch (err) {
        console.error('Error loading deal:', err);
        if (err.code === 'failed-precondition') {
          setError('Failed to connect to the database. Please check your internet connection.');
          setIsOffline(true);
        } else {
          setError('An error occurred while loading the deal.');
        }
      }
    }

    loadOrCreateDeal();
  }, [dealId]);

  const handleRetry = async () => {
    try {
      await enableNetwork(db);
      setIsOffline(false);
      setError(null);
      // Reload the page to retry loading the deal
      router.reload();
    } catch (err) {
      console.error('Error reconnecting:', err);
      setError('Failed to reconnect. Please try again later.');
    }
  };

  if (!dealId || !dealData) {
    return (
      <Box p={4}>
        {error ? (
          <Box>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
            {isOffline && (
              <Button variant="contained" onClick={handleRetry}>
                Retry Connection
              </Button>
            )}
          </Box>
        ) : (
          <Typography variant="h6">Loading deal page...</Typography>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ padding: '2rem' }}>
      <Typography variant="h4" gutterBottom>
        ✏️ Working on: {dealData.title}
      </Typography>

      <Divider sx={{ my: 3 }} />

      {step === 1 && (
        <>
          <Typography variant="h6">Step 1: Name this deal</Typography>
          <DealForm dealId={dealId} onNext={() => setStep(2)} />
        </>
      )}

      {step === 2 && (
        <>
          <Typography variant="h6" gutterBottom>Step 2: Upload your files</Typography>
          <MasterSheetUpload dealId={dealId} />
          <Box my={2} />
          <DocumentsUpload dealId={dealId} />
          <Box my={2}>
            <Button variant="contained" onClick={() => setStep(3)}>
              Run Validation
            </Button>
          </Box>
        </>
      )}

      {step === 3 && (
        <>
          <Typography variant="h6" gutterBottom>Step 3: Results</Typography>
          <ValidationResults dealId={dealId} />
        </>
      )}
    </Box>
  );
}
