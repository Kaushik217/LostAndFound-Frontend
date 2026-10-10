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
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment,
  AssignmentTurnedIn,
  Search,
  School,
  Logout,
  Menu as MenuIcon,
  Clear,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  getCategories,
  getLocations,
  searchItems,
  confirmMatchPair,
  updateItemStatus,
} from '../services/itemService';
import { logoutUser } from '../services/authService';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Report Lost', icon: <Assignment />, path: '/report-lost' },
  { text: 'Report Found', icon: <AssignmentTurnedIn />, path: '/report-found' },
  { text: 'Search Reports', icon: <Search />, path: '/search-match' },
];

const SearchMatch = ({ user, onLogout }) => {
  const [keyword, setKeyword] = useState('');
  const [type, setType] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [status, setStatus] = useState('');

  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  // Modal State for View Details
  const [selectedItem, setSelectedItem] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  // Confirm Pair Dialog State
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [foundItemIdToMatch, setFoundItemIdToMatch] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    loadLookupsAndItems();
  }, []);

  const loadLookupsAndItems = async () => {
    try {
      setLoading(true);
      const [catData, locData, itemData] = await Promise.all([
        getCategories(),
        getLocations(),
        searchItems(),
      ]);
      setCategories(catData);
      setLocations(locData);
      setItems(itemData);
    } catch (err) {
      setError('Failed to load items or lookup data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      const results = await searchItems({
        search: keyword,
        type: type || undefined,
        categoryId: categoryId || undefined,
        locationId: locationId || undefined,
        status: status || undefined,
      });
      setItems(results);
    } catch (err) {
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    setKeyword('');
    setType('');
    setCategoryId('');
    setLocationId('');
    setStatus('');
    await loadLookupsAndItems();
  };

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedItem(null);
  };

  // Confirm Match Handler
  const handleConfirmPairSubmit = async () => {
    setError('');
    setSuccess('');
    try {
      const lostId = selectedItem.type === 'Lost' ? selectedItem.id : Number(foundItemIdToMatch);
      const foundId = selectedItem.type === 'Found' ? selectedItem.id : Number(foundItemIdToMatch);

      await confirmMatchPair(lostId, foundId);

      setSuccess('Match confirmed successfully! Dashboard counts updated.');
      setOpenConfirmDialog(false);
      setOpenModal(false);
      loadLookupsAndItems();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to confirm match.');
    }
  };

  // Update Status Handler
  const handleUpdateStatus = async (newStatus) => {
    setError('');
    setSuccess('');
    try {
      await updateItemStatus(selectedItem.id, newStatus);

      setSuccess(`Status updated to ${newStatus} successfully!`);
      setOpenModal(false);
      loadLookupsAndItems();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status.');
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
        <Box sx={{ maxWidth: 900, mx: 'auto' }}>
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
                  Search Reports
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Find lost and found items reported on campus.
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

          {/* Search Filters Card */}
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', p: 3, mb: 4 }}>
            <form onSubmit={handleSearch}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Keyword
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search by name or description..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Type
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="Lost">Lost</MenuItem>
                    <MenuItem value="Found">Found</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Category
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    <MenuItem value="">All</MenuItem>
                    {categories.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Location
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    value={locationId}
                    onChange={(e) => setLocationId(e.target.value)}
                  >
                    <MenuItem value="">All</MenuItem>
                    {locations.map((loc) => (
                      <MenuItem key={loc.id} value={loc.id}>
                        {loc.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Status
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="Open">Open</MenuItem>
                    <MenuItem value="Matched">Matched</MenuItem>
                    <MenuItem value="Claimed">Claimed</MenuItem>
                    <MenuItem value="Resolved">Resolved</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} display="flex" gap={2} mt={1}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Search />}
                    sx={{ backgroundColor: '#0d9488', '&:hover': { backgroundColor: '#0f766e' }, textTransform: 'none', fontWeight: 'bold' }}
                  >
                    Search
                  </Button>
                  <Button
                    type="button"
                    variant="outlined"
                    startIcon={<Clear />}
                    onClick={handleClear}
                    sx={{ textTransform: 'none', fontWeight: 'bold', color: '#334155', borderColor: '#cbd5e1' }}
                  >
                    Clear
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Card>

          {/* Results Header */}
          <Typography variant="subtitle1" fontWeight="bold" color="#0f172a" gutterBottom>
            {items.length} {items.length === 1 ? 'result' : 'results'} found
          </Typography>

          {/* Results List */}
          {loading ? (
            <Box display="flex" justifyContent="center" py={6}>
              <CircularProgress />
            </Box>
          ) : (
            <Box display="flex" flexDirection="column" gap={2}>
              {items.map((item) => {
                const isLost = item.type === 'Lost';
                return (
                  <Card key={item.id} elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', p: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                      <Box>
                        <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                          <Typography variant="subtitle1" fontWeight="bold" color="#0f172a">
                            {item.name}
                          </Typography>
                          <Chip
                            label={item.type}
                            size="small"
                            sx={{
                              backgroundColor: isLost ? '#fecdd3' : '#d1fae5',
                              color: isLost ? '#e11d48' : '#047857',
                              fontWeight: 'bold',
                            }}
                          />
                          <Chip
                            label={item.status}
                            size="small"
                            sx={{
                              backgroundColor: item.status === 'Open' ? '#fef3c7' : '#e0f2fe',
                              color: item.status === 'Open' ? '#d97706' : '#0284c7',
                              fontWeight: 'bold',
                            }}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {item.locationName} • {item.dateOccurred}
                        </Typography>
                      </Box>

                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleViewDetails(item)}
                        sx={{ textTransform: 'none', borderColor: '#0d9488', color: '#0d9488', fontWeight: 'bold', '&:hover': { backgroundColor: '#f0fdfa' } }}
                      >
                        View Details
                      </Button>
                    </Box>
                  </Card>
                );
              })}
            </Box>
          )}
        </Box>
      </Box>

      {/* Item Details Modal */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', backgroundColor: '#f8fafc' }}>
          Item Details #{selectedItem?.id}
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ mt: 2 }}>
          {selectedItem && (
            <Box display="flex" flexDirection="column" gap={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">Item Name</Typography>
                <Typography variant="h6" fontWeight="bold">{selectedItem.name}</Typography>
              </Box>

              <Box display="flex" gap={2}>
                <Chip
                  label={`Type: ${selectedItem.type}`}
                  color={selectedItem.type === 'Lost' ? 'error' : 'success'}
                  variant="outlined"
                />
                <Chip
                  label={`Status: ${selectedItem.status}`}
                  color="warning"
                  variant="outlined"
                />
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">Category</Typography>
                <Typography variant="body1" fontWeight="500">{selectedItem.categoryName}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">Location</Typography>
                <Typography variant="body1" fontWeight="500">{selectedItem.locationName}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">Date Occurred</Typography>
                <Typography variant="body1" fontWeight="500">{selectedItem.dateOccurred}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">Description</Typography>
                <Typography variant="body2" sx={{ backgroundColor: '#f1f5f9', p: 2, borderRadius: 2, mt: 0.5 }}>
                  {selectedItem.description}
                </Typography>
              </Box>

              {/* Workflow Action Buttons Inside Details Modal */}
              {selectedItem.status === 'Open' && (
                <Box mt={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={() => setOpenConfirmDialog(true)}
                    sx={{ backgroundColor: '#0d9488', textTransform: 'none', fontWeight: 'bold' }}
                  >
                    Confirm Pair (Match)
                  </Button>
                </Box>
              )}

              {selectedItem.status === 'Matched' && (
                <Box mt={2} display="flex" gap={2}>
                  <Button
                    variant="contained"
                    color="info"
                    fullWidth
                    onClick={() => handleUpdateStatus('Claimed')}
                    sx={{ textTransform: 'none', fontWeight: 'bold' }}
                  >
                    Mark as Claimed
                  </Button>
                </Box>
              )}

              {selectedItem.status === 'Claimed' && (
                <Box mt={2} display="flex" gap={2}>
                  <Button
                    variant="contained"
                    color="success"
                    fullWidth
                    onClick={() => handleUpdateStatus('Resolved')}
                    sx={{ textTransform: 'none', fontWeight: 'bold' }}
                  >
                    Mark as Resolved
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2, backgroundColor: '#f8fafc' }}>
          <Button onClick={handleCloseModal} variant="contained" sx={{ backgroundColor: '#0f172a', textTransform: 'none' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Pair Dialog */}
      <Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Confirm this Pair?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Enter the corresponding opposite item ID (e.g. if this is Lost item #{selectedItem?.id}, enter Found item ID) to confirm match.
          </Typography>
          <TextField
            fullWidth
            size="small"
            label="Opposite Item ID"
            type="number"
            value={foundItemIdToMatch}
            onChange={(e) => setFoundItemIdToMatch(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenConfirmDialog(false)} variant="outlined" color="inherit">
            Cancel
          </Button>
          <Button onClick={handleConfirmPairSubmit} variant="contained" sx={{ backgroundColor: '#0d9488' }}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SearchMatch;