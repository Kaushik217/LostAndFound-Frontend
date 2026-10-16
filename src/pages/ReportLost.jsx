import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Button,
  TextField,
  MenuItem,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment,
  AssignmentTurnedIn,
  Search,
  School,
  Logout,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { getCategories, getLocations, createLostItem } from '../services/itemService';
import { logoutUser } from '../services/authService';

import { MIN_DESCRIPTION_LENGTH, validateDescription, getReportApiErrors } from '../utils/reportValidation';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Report Lost', icon: <Assignment />, path: '/report-lost' },
  { text: 'Report Found', icon: <AssignmentTurnedIn />, path: '/report-found' },
  { text: 'Search Reports', icon: <Search />, path: '/search-match' },
];

const ReportLost = ({ user, onLogout }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionTouched, setDescriptionTouched] = useState(false);
  const [descriptionApiError, setDescriptionApiError] = useState('');
  const descriptionError = descriptionApiError || (descriptionTouched ? validateDescription(description) : '');
  const [categoryId, setCategoryId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [dateOccurred, setDateOccurred] = useState('');
  
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchLookups = async () => {
      try {
        setLoading(true);
        const [catData, locData] = await Promise.all([getCategories(), getLocations()]);
        setCategories(catData);
        setLocations(locData);
      } catch (err) {
        setError('Failed to load categories or locations.');
      } finally {
        setLoading(false);
      }
    };
    fetchLookups();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    setDescriptionTouched(true);
    setDescriptionApiError('');
    if (validateDescription(description)) return;

    if (!name || !categoryId || !locationId || !dateOccurred) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setSubmitting(true);
      await createLostItem({
        name,
        description: description.trim(),
        categoryId: Number(categoryId),
        locationId: Number(locationId),
        dateOccurred,
      });
      setSuccess('Lost item reported successfully! Redirecting...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      const apiErrors = getReportApiErrors(err.response?.data);
      setDescriptionApiError(apiErrors.description);
      setError(apiErrors.general);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    if (onLogout) onLogout();
    navigate('/login');
  };

  const sidebar = (
    <Box>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: '1px solid #334155' }}>
        <School sx={{ fontSize: 28, color: '#38bdf8' }} />
        <Typography variant="subtitle1" fontWeight="bold" lineHeight={1.3}>
          Campus <br /> Lost & Found
        </Typography>
      </Box>

      <List sx={{ mt: 2 }}>
        {menuItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  backgroundColor: active ? '#0284c7' : 'transparent',
                  '&:hover': { backgroundColor: active ? '#0284c7' : '#1e293b' },
                }}
              >
                <ListItemIcon sx={{ color: '#ffffff', minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: active ? 'bold' : 'normal' }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  const drawerPaperSx = {
    width: drawerWidth,
    boxSizing: 'border-box',
    backgroundColor: '#0f172a',
    color: '#ffffff',
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': drawerPaperSx }}
      >
        {sidebar}
      </Drawer>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': drawerPaperSx,
        }}
      >
        {sidebar}
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, p: { xs: 2, md: 4 } }}>
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          {/* Header Row */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
              mb: 4,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                onClick={() => setMobileOpen(true)}
                sx={{ display: { md: 'none' } }}
                aria-label="Open menu"
              >
                <MenuIcon />
              </IconButton>
              <Box>
                <Typography variant="h5" fontWeight="bold" color="#0f172a">
                  Report Lost Item
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Provide details about your lost item.
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                avatar={<Avatar sx={{ bgcolor: '#0284c7' }}>{user?.name?.[0] || 'U'}</Avatar>}
                label={`${user?.name || 'User'} • ${user?.role || 'Student'}`}
                variant="outlined"
                sx={{ fontWeight: 'bold', backgroundColor: '#ffffff' }}
              />
              <Button
                variant="text"
                color="inherit"
                startIcon={<Logout />}
                onClick={handleLogout}
                sx={{ textTransform: 'none', color: '#64748b' }}
              >
                Logout
              </Button>
            </Box>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

          {/* Form Card */}
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', p: { xs: 2, md: 4 } }}>
            <CardContent>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <form onSubmit={handleSubmit}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      Item name *
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="e.g. Black wallet"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      Description *
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="Provide detailed description..."
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        setDescriptionApiError('');
                      }}
                      onBlur={() => setDescriptionTouched(true)}
                      error={Boolean(descriptionError)}
                      helperText={descriptionError || `Minimum ${MIN_DESCRIPTION_LENGTH} characters (${description.trim().length} entered)`}
                      required
                    />
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      Category *
                    </Typography>
                    <TextField
                      select
                      fullWidth
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      required
                      placeholder="Select category"
                    >
                      {categories.map((cat) => (
                        <MenuItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      Location *
                    </Typography>
                    <TextField
                      select
                      fullWidth
                      value={locationId}
                      onChange={(e) => setLocationId(e.target.value)}
                      required
                      placeholder="Select location"
                    >
                      {locations.map((loc) => (
                        <MenuItem key={loc.id} value={loc.id}>
                          {loc.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>

                  <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      Date lost *
                    </Typography>
                    <TextField
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      value={dateOccurred}
                      onChange={(e) => setDateOccurred(e.target.value)}
                      required
                    />
                  </Box>

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={submitting}
                    sx={{
                      backgroundColor: '#0d9488',
                      '&:hover': { backgroundColor: '#0f766e' },
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 'bold',
                      textTransform: 'none',
                      fontSize: '1rem',
                    }}
                  >
                    {submitting ? <CircularProgress size={24} color="inherit" /> : 'Report Lost Item'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default ReportLost;