import { Close } from '@mui/icons-material';
import { useState } from 'react';
import { Alert, Box, Button, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, TextField, Typography } from '@mui/material';
import ReportTag from './ReportTag';
import { confirmMatchPair, updateItemStatus } from '../services/itemService';
import '../App.css';

export default function ReportDetailsDialog({ open, selectedItem, user, onClose, onUpdated, loading = false, loadError = '', onRetry }) {
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [foundItemIdToMatch, setFoundItemIdToMatch] = useState('');
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleConfirmPairSubmit = async () => {
    if (!canConfirmPair) return;

    const oppositeId = Number(foundItemIdToMatch);
    if (!Number.isInteger(oppositeId) || oppositeId <= 0) {
      setActionError('Enter a valid opposite item ID.');
      return;
    }
    setActionError('');
    setBusy(true);
    try {
      await confirmMatchPair(
        selectedItem.type === 'Lost' ? selectedItem.id : oppositeId,
        selectedItem.type === 'Found' ? selectedItem.id : oppositeId,
      );
      setOpenConfirmDialog(false);
      onClose();
      await onUpdated();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to confirm match.');
    } finally {
      setBusy(false);
    }
  };

  const handleUpdateStatus = async (status) => {
    if (status === 'Claimed' && !canMarkClaimed) return;
    if (status === 'Resolved' && !canMarkResolved) return;

    setActionError('');
    setBusy(true);
    try {
      await updateItemStatus(selectedItem.id, status);
      onClose();
      await onUpdated();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setBusy(false);
    }
  };

  const closeDetails = () => {
    if (!busy) onClose();
  };
  const closeConfirmation = () => {
    if (!busy) {
      setOpenConfirmDialog(false);
      setActionError('');
    }
  };
  const paperSx = { borderRadius: 3, m: 2, width: 'calc(100% - 32px)', maxHeight: 'calc(100% - 32px)' };
  const buttonSx = { textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 3, py: 1 };
  const canAct = !loading && !loadError && selectedItem;
  const isStudentOwner = user?.role === 'Student'
    && user.userId != null
    && selectedItem?.reporterId != null
    && String(user.userId) === String(selectedItem.reporterId);
  const canConfirmPair = canAct
    && selectedItem.type === 'Lost'
    && selectedItem.status === 'Open'
    && (user?.role === 'Admin' || isStudentOwner);
  const lostReportOwnerId = selectedItem?.type === 'Lost'
    ? selectedItem.reporterId
    : selectedItem?.lostReportOwnerId;
  const isLostReportOwner = user?.userId != null
    && lostReportOwnerId != null
    && String(user.userId) === String(lostReportOwnerId);
  const canMarkClaimed = canAct
    && selectedItem.status === 'Matched'
    && (user?.role === 'Admin' || isLostReportOwner);
  const canMarkResolved = canAct
    && selectedItem.status === 'Claimed'
    && (user?.role === 'Admin' || isLostReportOwner);

  return (
    <>
      <Dialog open={open} onClose={closeDetails} maxWidth="sm" fullWidth
        aria-labelledby="report-details-title" slotProps={{ paper: { sx: paperSx } }}>
        <DialogTitle component="div" sx={{ p: { xs: 2, sm: 3 }, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, borderBottom: '1px solid #e2e8f0' }}>
          <Box>
            <Typography id="report-details-title" component="h2" variant="h6" fontWeight={700}>Report details</Typography>
            <Typography variant="body2" color="text.secondary">Report #{selectedItem?.id}</Typography>
          </Box>
          <IconButton aria-label="Close report details" onClick={closeDetails} disabled={busy}><Close /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3 }, overflowWrap: 'anywhere' }}>
          {loading && <Box display="flex" justifyContent="center" py={5}><CircularProgress aria-label="Loading report details" /></Box>}
          {loadError && <Alert severity="error" action={<Button onClick={onRetry} color="inherit">Retry</Button>}>{loadError}</Alert>}
          {actionError && !openConfirmDialog && <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert>}
          {canAct && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
              <Box>
                <Typography variant="h5" component="h3" fontWeight={700} color="#0f172a" sx={{ mb: 1.5 }}>{selectedItem.name}</Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  <ReportTag kind="type" value={selectedItem.type} showPrefix />
                  <ReportTag kind="status" value={selectedItem.status} showPrefix />
                </Box>
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
                {[
                  ['Category', selectedItem.categoryName],
                  ['Location', selectedItem.locationName],
                  ['Date occurred', selectedItem.dateOccurred],
                ].map(([label, value]) => (
                  <Box key={label}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>{label}</Typography>
                    <Typography variant="body1" fontWeight={500}>{value || 'Not provided'}</Typography>
                  </Box>
                ))}
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Description</Typography>
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{selectedItem.description || 'No description provided.'}</Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, sm: 3 }, gap: 1, borderTop: '1px solid #e2e8f0', bgcolor: '#f8fafc', flexWrap: 'wrap', '& > :not(style) ~ :not(style)': { ml: 0 } }}>
          <Button disabled={busy} onClick={closeDetails} variant="outlined" color="inherit" sx={buttonSx}>Close</Button>
          {canConfirmPair && (
            <Button disabled={busy} variant="contained" onClick={() => { setActionError(''); setOpenConfirmDialog(true); }} sx={{ ...buttonSx, bgcolor: '#0d9488', '&:hover': { bgcolor: '#0f766e' } }}>Confirm Pair (Match)</Button>
          )}
          {(canMarkClaimed || canMarkResolved) && (
            <Button disabled={busy} variant="contained" color={selectedItem.status === 'Matched' ? 'info' : 'success'} onClick={() => handleUpdateStatus(selectedItem.status === 'Matched' ? 'Claimed' : 'Resolved')} sx={buttonSx}>
              {busy ? 'Updating…' : selectedItem.status === 'Matched' ? 'Mark as Claimed' : 'Mark as Resolved'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
      <Dialog open={openConfirmDialog} onClose={closeConfirmation} maxWidth="xs" fullWidth aria-labelledby="confirm-pair-title" slotProps={{ paper: { sx: paperSx } }}>
        <DialogTitle id="confirm-pair-title" sx={{ fontWeight: 700 }}>Confirm report match</DialogTitle>
        <DialogContent>
          {actionError && <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert>}
          <Typography variant="body2" color="text.secondary">
            Match {selectedItem?.type?.toLowerCase()} report #{selectedItem?.id} with its corresponding {selectedItem?.type === 'Lost' ? 'found' : 'lost'} report.
          </Typography>
          <TextField autoFocus fullWidth label={selectedItem?.type === 'Lost' ? 'Found report ID' : 'Lost report ID'} type="number" value={foundItemIdToMatch} disabled={busy}
            onChange={(e) => setFoundItemIdToMatch(e.target.value)} helperText="Enter the ID of the report you want to pair." sx={{ mt: 3 }} />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button disabled={busy} onClick={closeConfirmation} color="inherit" sx={buttonSx}>Cancel</Button>
          <Button disabled={busy} onClick={handleConfirmPairSubmit} variant="contained" sx={{ ...buttonSx, bgcolor: '#0d9488', '&:hover': { bgcolor: '#0f766e' } }}>{busy ? 'Confirming…' : 'Confirm match'}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
