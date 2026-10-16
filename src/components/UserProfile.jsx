import { Avatar, Box, Typography } from '@mui/material';

export default function UserProfile({ user }) {
  const name = user?.name || 'User';
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1, px: 1.5, bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 3, maxWidth: '100%', minWidth: 0 }}>
      <Avatar sx={{ width: 40, height: 40, bgcolor: '#e0f2fe', color: '#0369a1', fontSize: '0.95rem', fontWeight: 700 }}>{initials || 'U'}</Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" fontWeight={700} color="#0f172a" sx={{ overflowWrap: 'anywhere' }}>{name}</Typography>
        <Typography variant="caption" color="text.secondary">{user?.role || 'Student'}</Typography>
      </Box>
    </Box>
  );
}
