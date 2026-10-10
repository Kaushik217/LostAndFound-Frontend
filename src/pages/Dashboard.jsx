import React, { useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {
  Add,
  Assignment,
  AssignmentTurnedIn,
  CheckCircle,
  Dashboard as DashboardIcon,
  Info,
  ListAlt,
  Logout,
  Menu as MenuIcon,
  School,
  Search,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { getDashboardData } from '../services/dashboardService';
import { logoutUser } from '../services/authService';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Report Lost', icon: <Assignment />, path: '/report-lost' },
  { text: 'Report Found', icon: <AssignmentTurnedIn />, path: '/report-found' },
  { text: 'Search Reports', icon: <Search />, path: '/search-match' },
];

// Status chip colours (background, text).
const STATUS_STYLES = {
  Open: { bg: '#fef3c7', color: '#d97706' },
  Matched: { bg: '#e0e7ff', color: '#4f46e5' },
  Claimed: { bg: '#cffafe', color: '#0891b2' },
  Resolved: { bg: '#d1fae5', color: '#047857' },
};

// The API sends UTC times without a "Z", so add it before converting.
const formatDate = (value) => {
  const utc = /Z|[+-]\d\d:\d\d$/.test(value) ? value : `${value}Z`;
  return new Date(utc).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

// One summary card: icon + number + label.
function StatCard({ icon, color, value, label }) {
  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ color, display: 'flex', '& svg': { fontSize: 38 } }}>{icon}</Box>
        <Box>
          <Typography variant="h5" fontWeight="bold" lineHeight={1.2}>
            {value ?? 0}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

const Dashboard = ({ user, onLogout }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setDashboardData(await getDashboardData());
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const handleLogout = () => {
    logoutUser();
    if (onLogout) onLogout();
    navigate('/login');
  };

  // Sidebar content, reused for the desktop and mobile drawers.
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
                  slotProps={{ primary: { fontSize: '0.9rem', fontWeight: active ? 'bold' : 'normal' } }}
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
      {/* Mobile drawer (opens with the menu button) */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': drawerPaperSx }}
      >
        {sidebar}
      </Drawer>

      {/* Desktop drawer (always visible) */}
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

      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, p: { xs: 2, md: 4 } }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
          {/* Header row */}
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
                  Dashboard
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Overview of lost and found reports on campus.
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                avatar={<Avatar sx={{ bgcolor: '#0284c7' }}>{user?.name?.[0] || 'U'}</Avatar>}
                label={`${user?.name || 'User'} • ${user?.role || 'Student'}`}
                variant="outlined"
                sx={{ fontWeight: 'bold' }}
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

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Stat cards: 2 columns on phone, 4 on desktop, all equal width */}
              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  mb: 4,
                  gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                }}
              >
                <StatCard icon={<ListAlt />} color="#0284c7" value={dashboardData?.totalReports} label="Total Reports" />
                <StatCard icon={<Assignment />} color="#ef4444" value={dashboardData?.lostReports} label="Lost" />
                <StatCard icon={<AssignmentTurnedIn />} color="#10b981" value={dashboardData?.foundReports} label="Found" />
                <StatCard icon={<Info />} color="#f59e0b" value={dashboardData?.openReports} label="Open" />
                <StatCard icon={<CheckCircle />} color="#6366f1" value={dashboardData?.matchedReports} label="Matched" />
                <StatCard icon={<CheckCircle />} color="#06b6d4" value={dashboardData?.claimedReports} label="Claimed" />
                <StatCard icon={<CheckCircle />} color="#10b981" value={dashboardData?.resolvedReports} label="Resolved" />
                <StatCard icon={<ListAlt />} color="#8b5cf6" value={dashboardData?.confirmedPairs} label="Confirmed Pairs" />
              </Box>

              {/* Action buttons */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => navigate('/report-lost')}
                  sx={{
                    backgroundColor: '#0d9488',
                    '&:hover': { backgroundColor: '#0f766e' },
                    px: 3,
                    py: 1.2,
                    borderRadius: 2,
                    fontWeight: 'bold',
                    textTransform: 'none',
                  }}
                >
                  Report Lost Item
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => navigate('/report-found')}
                  sx={{
                    color: '#0d9488',
                    borderColor: '#0d9488',
                    px: 3,
                    py: 1.2,
                    borderRadius: 2,
                    fontWeight: 'bold',
                    textTransform: 'none',
                  }}
                >
                  Report Found Item
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Search />}
                  onClick={() => navigate('/search-match')}
                  sx={{
                    px: 3,
                    py: 1.2,
                    borderRadius: 2,
                    fontWeight: 'bold',
                    textTransform: 'none',
                  }}
                >
                  Search & Match
                </Button>
              </Box>

              {/* Recent reports */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold" color="#0f172a">
                  Recent Reports
                </Typography>
                <Button variant="text" size="small" onClick={() => navigate('/search-match')}>
                  View all
                </Button>
              </Box>

              <TableContainer
                component={Paper}
                elevation={0}
                sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflowX: 'auto' }}
              >
                <Table>
                  <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell><strong>Item name</strong></TableCell>
                      <TableCell><strong>Type</strong></TableCell>
                      <TableCell><strong>Category</strong></TableCell>
                      <TableCell><strong>Date</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData?.recentReports?.length > 0 ? (
                      dashboardData.recentReports.map((report) => {
                        const statusStyle = STATUS_STYLES[report.status] || STATUS_STYLES.Open;
                        const isLost = report.type === 'Lost';
                        return (
                          <TableRow key={report.id} hover>
                            <TableCell><strong>{report.name}</strong></TableCell>
                            <TableCell>
                              <Chip
                                label={report.type}
                                size="small"
                                sx={{
                                  backgroundColor: isLost ? '#fecdd3' : '#d1fae5',
                                  color: isLost ? '#e11d48' : '#047857',
                                  fontWeight: 'bold',
                                }}
                              />
                            </TableCell>
                            <TableCell>{report.categoryName}</TableCell>
                            <TableCell>{formatDate(report.createdAt)}</TableCell>
                            <TableCell>
                              <Chip
                                label={report.status}
                                size="small"
                                sx={{
                                  backgroundColor: statusStyle.bg,
                                  color: statusStyle.color,
                                  fontWeight: 'bold',
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                          No recent reports available.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;