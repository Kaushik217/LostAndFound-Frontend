import { Chip } from '@mui/material';

const palettes = {
  type: {
    Lost: { backgroundColor: '#fecdd3', color: '#9f1239' },
    Found: { backgroundColor: '#d1fae5', color: '#065f46' },
  },
  status: {
    Open: { backgroundColor: '#fef3c7', color: '#92400e' },
    Matched: { backgroundColor: '#e0e7ff', color: '#3730a3' },
    Claimed: { backgroundColor: '#cffafe', color: '#155e75' },
    Resolved: { backgroundColor: '#d1fae5', color: '#065f46' },
  },
};

export default function ReportTag({ kind, value, showPrefix = false, size = 'small' }) {
  const palette = palettes[kind]?.[value] || { backgroundColor: '#e2e8f0', color: '#334155' };
  const prefix = kind === 'type' ? 'Type' : 'Status';
  return (
    <Chip
      label={showPrefix ? `${prefix}: ${value || 'Unknown'}` : value || 'Unknown'}
      size={size}
      sx={{ ...palette, fontWeight: 'bold' }}
    />
  );
}
