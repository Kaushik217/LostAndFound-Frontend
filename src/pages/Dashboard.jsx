import UserProfile from '../components/UserProfile';
import ReportDetailsDialog from '../components/ReportDetailsDialog';
import ReportTag from '../components/ReportTag';
import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
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
import { searchItems } from '../services/itemService';
import { getDashboardData } from '../services/dashboardService';
import { logoutUser } from '../services/authService';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Report Lost', icon: <Assignment />, path: '/report-lost' },
  { text: 'Report Found', icon: <AssignmentTurnedIn />, path: '/report-found' },
  { text: 'Search Reports', icon: <Search />, path: '/search-match' },
];

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
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportDetails, setReportDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState('');
  const [detailsAttempt, setDetailsAttempt] = useState(0);
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

  useEffect(() => {
    if (!selectedReport) return;
    let cancelled = false;
    // Use the existing search endpoint, which returns full report details.
    searchItems({ type: selectedReport.type })
      .then((items) => {
        if (cancelled) return;
        const item = items.find((item) => String(item.id) === String(selectedReport.id));
        if (!item) {
          setDetailsError('This report is no longer available.');
          return;
        }
        setReportDetails(item);
      })
      .catch(() => {
        if (!cancelled) setDetailsError('Unable to load report details. Please try again.');
      })
      .finally(() => {
        if (!cancelled) setDetailsLoading(false);
      });
    return () => { cancelled = true; };
  }, [selectedReport, detailsAttempt]);

  const handleViewDetails = (report) => {
    setReportDetails(null);
    setDetailsError('');
    setDetailsLoading(true);
    setSelectedReport(report);
  };

  const handleLogout = () => {
    logoutUser();
    if (onLogout) onLogout();
    navigate('/login');
  };

  // Sidebar content, reused for the desktop and mobile drawers.
  const sidebar = (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%', flex: 1 }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: '1px solid #334155' }}>
        <School sx={{ fontSize: 28, color: '#38bdf8' }} />
        <Typography className="app-logo" variant="subtitle1">
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
      <Box sx={{ mt: 'auto', p: 2, borderTop: '1px solid #334155' }}>
        <Button
          fullWidth
          startIcon={<Logout />}
          onClick={handleLogout}
          sx={{ justifyContent: 'flex-start', color: '#ffffff', textTransform: 'none', borderRadius: 2, px: 2, py: 1.2, '&:hover': { backgroundColor: '#1e293b' } }}
        >
          Logout
        </Button>
      </Box>
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
              <UserProfile user={user} />
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
                      <TableCell align="right"><strong>Details</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData?.recentReports?.length > 0 ? (
                      dashboardData.recentReports.map((report) => {
                        return (
                          <TableRow key={report.id} hover>
                            <TableCell><strong>{report.name}</strong></TableCell>
                            <TableCell>
                              <ReportTag kind="type" value={report.type} />
                            </TableCell>
                            <TableCell>{report.categoryName}</TableCell>
                            <TableCell>{formatDate(report.createdAt)}</TableCell>
                            <TableCell>
                              <ReportTag kind="status" value={report.status} />
                            </TableCell>
                            <TableCell align="right">
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleViewDetails(report)}
                                aria-label={`View details for ${report.name}`}
                                sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}
                              >
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
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

      {selectedReport && <ReportDetailsDialog
        user={user}
        open={Boolean(selectedReport)}
        selectedItem={reportDetails || selectedReport}
        onClose={() => setSelectedReport(null)}
        loading={detailsLoading}
        loadError={detailsError}
        onRetry={() => {
          setDetailsError('');
          setDetailsLoading(true);
          setDetailsAttempt((attempt) => attempt + 1);
        }}
        onUpdated={async () => {
          try {
            setDashboardData(await getDashboardData());
          } catch {
            setError('Report updated, but dashboard could not refresh. Please reload the page.');
          }
        }}
      />}
    </Box>
  );
};

export default Dashboard;
