import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getFirestore, doc, setDoc, getDoc, collection, query, orderBy, getDocs, enableNetwork, disableNetwork, updateDoc } from 'firebase/firestore';
import { getStorage, ref, deleteObject } from 'firebase/storage';
import app from '../../lib/firebase';
import { 
  Box, Typography, Button, Divider, Alert, Card, CardContent, 
  Table, TableHead, TableBody, TableRow, TableCell, Chip, 
  IconButton, Tooltip, Grid, Paper, Stack
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import UploadIcon from '@mui/icons-material/Upload';
import FolderIcon from '@mui/icons-material/Folder';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import MasterSheetUpload from '../../components/MasterSheetUpload';
import DocumentsUpload from '../../components/DocumentsUpload';
import dynamic from 'next/dynamic';

const ValidationResults = dynamic(() => import('../../components/ValidationResults'), { ssr: false });

const db = getFirestore(app);
const storage = getStorage(app);

export default function DealPage() {
  const router = useRouter();
  const { dealId } = router.query;

  const [dealData, setDealData] = useState(null);
  const [validationRuns, setValidationRuns] = useState([]);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

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

  useEffect(() => {
    if (!dealId) return;

    async function loadValidationRuns() {
      try {
        const runsRef = collection(db, `deals/${dealId}/validationRuns`);
        const q = query(runsRef, orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        const runs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setValidationRuns(runs);
      } catch (err) {
        console.error('Error loading validation runs:', err);
      }
    }

    loadValidationRuns();
  }, [dealId]);

  const handleRetry = async () => {
    try {
      await enableNetwork(db);
      setIsOffline(false);
      setError(null);
      router.reload();
    } catch (err) {
      console.error('Error reconnecting:', err);
      setError('Failed to reconnect. Please try again later.');
    }
  };

  const formatTimestamp = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const downloadCSV = (run) => {
    const header = ["Document", "Key", "Expected", "Found", "Status"];
    const rows = run.results.flatMap(doc =>
      doc.matches.map(match => [
        doc.document,
        match.key,
        match.expected,
        match.found.join(' | '),
        match.status
      ])
    );
    const csvContent = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ValidationRun_${run.timestamp}.csv`;
    link.click();
  };

  const handleDropboxUpload = () => {
    console.log('Dropbox upload handler - to be implemented with Dropbox Chooser SDK');
  };

  const handleRunValidation = async () => {
    setShowValidation(true);
    setTimeout(() => {
      loadValidationRuns();
    }, 2000);
  };

  const loadValidationRuns = async () => {
    if (!dealId) return;

    try {
      const runsRef = collection(db, `deals/${dealId}/validationRuns`);
      const q = query(runsRef, orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const runs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setValidationRuns(runs);
    } catch (err) {
      console.error('Error loading validation runs:', err);
    }
  };

  const handleDeleteDocument = async (docToDelete) => {
    try {
      const dealRef = doc(db, 'deals', dealId);
      const dealSnap = await getDoc(dealRef);
      const documents = dealSnap.data().documents || [];
      
      await updateDoc(dealRef, {
        documents: documents.filter(d => d.name !== docToDelete.name)
      });

      const storageRef = ref(storage, `deals/${dealId}/documents/${docToDelete.name}`);
      await deleteObject(storageRef);

      const updatedSnap = await getDoc(dealRef);
      setDealData(updatedSnap.data());
    } catch (err) {
      console.error('Error deleting document:', err);
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

  const hasMasterSheet = dealData.masterSheet && Object.keys(dealData.masterSheet).length > 0;
  const hasDocuments = dealData.documents && dealData.documents.length > 0;

  return (
    <Box sx={{ padding: '2rem' }}>
      <Typography variant="h4" gutterBottom>
        ✏️ Working on: {dealData.title}
      </Typography>

      <Divider sx={{ my: 3 }} />

      {/* Deal Overview with Master Sheet */}
      <Box mb={4}>
        <Typography variant="h6" gutterBottom>Deal Overview</Typography>
        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="body1">Creation Date: {dealData.createdAt}</Typography>
                <Typography variant="body1">Total Documents: {dealData.documents ? dealData.documents.length : 0}</Typography>
                {validationRuns.length > 0 && (
                  <Typography variant="body1">
                    Last Validation: {validationRuns[0].passCount} Pass, {validationRuns[0].failCount} Fail
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                {hasMasterSheet ? (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Master Sheet Preview</Typography>
                    <Table size="small">
                      <TableBody>
                        {Object.entries(dealData.masterSheet).slice(0, 5).map(([key, value]) => (
                          <TableRow key={key}>
                            <TableCell>{key}</TableCell>
                            <TableCell>{value}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      No master sheet uploaded yet
                    </Typography>
                    <MasterSheetUpload dealId={dealId} />
                  </Box>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

      {/* Upload Panel */}
      <Box mb={4}>
        <Typography variant="h6" gutterBottom>Upload Documents</Typography>
        <Paper sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<UploadFileIcon />}
                onClick={() => document.getElementById('single-file-upload').click()}
              >
                Upload Single File
              </Button>
              <Button
                variant="outlined"
                startIcon={<UploadIcon />}
                onClick={() => document.getElementById('multiple-file-upload').click()}
              >
                Upload Multiple Files
              </Button>
              <Button
                variant="outlined"
                startIcon={<FolderIcon />}
                onClick={handleDropboxUpload}
              >
                Import from Dropbox
              </Button>
            </Box>

            <DocumentsUpload dealId={dealId} onUploadComplete={() => {
              const dealRef = doc(db, 'deals', dealId);
              getDoc(dealRef).then(snap => {
                setDealData(snap.data());
              });
            }} />

            {hasDocuments && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>Uploaded Files</Typography>
                <Grid container spacing={1}>
                  {dealData.documents.map((doc, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Paper sx={{ p: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="body2" noWrap>{doc.name}</Typography>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteDocument(doc)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            <Button
              variant="contained"
              color="primary"
              startIcon={<PlayArrowIcon />}
              onClick={handleRunValidation}
              disabled={!hasMasterSheet || !hasDocuments}
              sx={{ mt: 2 }}
            >
              Run Validation
            </Button>
          </Stack>
        </Paper>
      </Box>

      {/* Validation Results */}
      {showValidation && (
        <Box mb={4}>
          <Typography variant="h6" gutterBottom>Validation Results</Typography>
          <ValidationResults dealId={dealId} />
        </Box>
      )}

      {/* Validation History */}
      {validationRuns.length > 0 && (
        <Box mb={4}>
          <Typography variant="h6" gutterBottom>Validation History</Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Run Date/Time</TableCell>
                <TableCell>Summary</TableCell>
                <TableCell>Documents</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {validationRuns.map(run => (
                <TableRow key={run.timestamp}>
                  <TableCell>{formatTimestamp(run.timestamp)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={`${run.passCount} Pass / ${run.failCount} Fail`}
                      color={run.failCount === 0 ? "success" : "warning"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{run.docCount} documents</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Export CSV">
                      <IconButton 
                        onClick={() => downloadCSV(run)}
                        size="small"
                        color="primary"
                      >
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View Report">
                      <IconButton 
                        onClick={() => {
                          setShowValidation(true);
                        }}
                        size="small"
                        color="primary"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </Box>
  );
}
