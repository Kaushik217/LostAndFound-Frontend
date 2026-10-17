import {
  Assignment,
  AssignmentTurnedIn,
  Clear,
  Dashboard as DashboardIcon,
  Logout,
  Menu as MenuIcon,
  School,
  Search,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../App.css";
import ReportDetailsDialog from "../components/ReportDetailsDialog";
import ReportTag from "../components/ReportTag";
import UserProfile from "../components/UserProfile";
import { logoutUser } from "../services/authService";
import {
  getCategories,
  getLocations,
  searchItems,
} from "../services/itemService";

const drawerWidth = 240;

const menuItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
  { text: "Report Lost", icon: <Assignment />, path: "/report-lost" },
  { text: "Report Found", icon: <AssignmentTurnedIn />, path: "/report-found" },
  { text: "Search Reports", icon: <Search />, path: "/search-match" },
];

const SearchMatch = ({ user, onLogout }) => {
  const [keyword, setKeyword] = useState("");
  const [type, setType] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [status, setStatus] = useState("");

  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  // Modal State for View Details
  const [selectedItem, setSelectedItem] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;
    Promise.all([getCategories(), getLocations(), searchItems()])
      .then(([catData, locData, itemData]) => {
        if (cancelled) return;
        setCategories(catData);
        setLocations(locData);
        setItems(itemData);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load items or lookup data.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const loadLookupsAndItems = async () => {
    try {
      setError("");
      setLoading(true);
      const [catData, locData, itemData] = await Promise.all([
        getCategories(),
        getLocations(),
        searchItems(),
      ]);
      setCategories(catData);
      setLocations(locData);
      setItems(itemData);
    } catch {
      setError("Failed to load items or lookup data.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    try {
      setError("");
      setLoading(true);
      const results = await searchItems({
        search: keyword,
        type: type || undefined,
        categoryId: categoryId || undefined,
        locationId: locationId || undefined,
        status: status || undefined,
      });
      setItems(results);
    } catch {
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    setKeyword("");
    setType("");
    setCategoryId("");
    setLocationId("");
    setStatus("");
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

  const handleLogout = () => {
    logoutUser();
    if (onLogout) onLogout();
    navigate("/login");
  };

  const sidebar = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100%",
        flex: 1,
      }}
    >
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          borderBottom: "1px solid #334155",
        }}
      >
        <School sx={{ fontSize: 28, color: "#38bdf8" }} />
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
                  backgroundColor: active ? "#0284c7" : "transparent",
                  "&:hover": {
                    backgroundColor: active ? "#0284c7" : "#1e293b",
                  },
                }}
              >
                <ListItemIcon sx={{ color: "#ffffff", minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: "0.9rem",
                    fontWeight: active ? "bold" : "normal",
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Box sx={{ mt: "auto", p: 2, borderTop: "1px solid #334155" }}>
        <Button
          fullWidth
          startIcon={<Logout />}
          onClick={handleLogout}
          sx={{
            justifyContent: "flex-start",
            color: "#ffffff",
            textTransform: "none",
            borderRadius: 2,
            px: 2,
            py: 1.2,
            "&:hover": { backgroundColor: "#1e293b" },
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  const drawerPaperSx = {
    width: drawerWidth,
    boxSizing: "border-box",
    backgroundColor: "#0f172a",
    color: "#ffffff",
  };

  return (
    <Box className="search-match">
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": drawerPaperSx,
        }}
      >
        {sidebar}
      </Drawer>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": drawerPaperSx,
        }}
      >
        {sidebar}
      </Drawer>

      <Box component="main" className="search-match__main">
        <Box className="search-match__container">
          {/* Header Row */}
          <Box className="search-match__header">
            <Box className="search-match__heading">
              <IconButton
                onClick={() => setMobileOpen(true)}
                sx={{ display: { md: "none" } }}
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

            <Box className="search-match__account">
              <UserProfile user={user} />
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          {/* Search Filters Card */}
          <Card elevation={0} className="search-match__filters">
            <form onSubmit={handleSearch}>
              <Box className="search-match__filter-grid">
                <Box className="search-match__keyword">
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    gutterBottom
                  >
                    Keyword
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search by name or description..."
                    slotProps={{ htmlInput: { "aria-label": "Keyword" } }}
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                  />
                </Box>

                <Box className="search-match__field">
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    gutterBottom
                  >
                    Type
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    slotProps={{
                      htmlInput: { "aria-label": "Type" },
                      select: { displayEmpty: true },
                    }}
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="Lost">Lost</MenuItem>
                    <MenuItem value="Found">Found</MenuItem>
                  </TextField>
                </Box>

                <Box className="search-match__field">
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    gutterBottom
                  >
                    Category
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    slotProps={{
                      htmlInput: { "aria-label": "Category" },
                      select: { displayEmpty: true },
                    }}
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
                </Box>

                <Box className="search-match__field">
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    gutterBottom
                  >
                    Location
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    slotProps={{
                      htmlInput: { "aria-label": "Location" },
                      select: { displayEmpty: true },
                    }}
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
                </Box>

                <Box className="search-match__field">
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    gutterBottom
                  >
                    Status
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    slotProps={{
                      htmlInput: { "aria-label": "Status" },
                      select: { displayEmpty: true },
                    }}
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="Open">Open</MenuItem>
                    <MenuItem value="Matched">Matched</MenuItem>
                    <MenuItem value="Claimed">Claimed</MenuItem>
                    <MenuItem value="Resolved">Resolved</MenuItem>
                  </TextField>
                </Box>

                <Box className="search-match__filter-actions">
                  <Button
                    disabled={loading}
                    type="submit"
                    variant="contained"
                    startIcon={<Search />}
                    sx={{
                      backgroundColor: "#0d9488",
                      "&:hover": { backgroundColor: "#0f766e" },
                      textTransform: "none",
                      fontWeight: "bold",
                    }}
                  >
                    Search
                  </Button>
                  <Button
                    disabled={loading}
                    type="button"
                    variant="outlined"
                    startIcon={<Clear />}
                    onClick={handleClear}
                    sx={{
                      textTransform: "none",
                      fontWeight: "bold",
                      color: "#334155",
                      borderColor: "#cbd5e1",
                    }}
                  >
                    Clear
                  </Button>
                </Box>
              </Box>
            </form>
          </Card>

          {/* Results Header */}
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            color="#0f172a"
            gutterBottom
          >
            {items.length} {items.length === 1 ? "result" : "results"} found
          </Typography>

          {/* Results List */}
          {loading ? (
            <Box display="flex" justifyContent="center" py={6}>
              <CircularProgress />
            </Box>
          ) : items.length === 0 ? (
            <Card elevation={0} className="search-match__empty">
              <Search fontSize="large" color="action" />
              <Typography variant="h6" fontWeight="bold">
                No reports found
              </Typography>
              <Typography color="text.secondary">
                Try another search or clear your filters.
              </Typography>
              <Button onClick={handleClear}>Clear filters</Button>
            </Card>
          ) : (
            <Box className="search-match__results">
              {items.map((item) => {
                return (
                  <Card
                    key={item.id}
                    elevation={0}
                    className="search-match__result"
                  >
                    <Box className="search-match__result-row">
                      <Box className="search-match__result-info">
                        <Box className="search-match__result-title">
                          <Typography
                            variant="subtitle1"
                            fontWeight="bold"
                            color="#0f172a"
                          >
                            {item.name}
                          </Typography>
                          <ReportTag kind="type" value={item.type} />
                          <ReportTag kind="status" value={item.status} />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {item.locationName} • {item.dateOccurred}
                        </Typography>
                      </Box>

                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleViewDetails(item)}
                        sx={{
                          textTransform: "none",
                          borderColor: "#0d9488",
                          color: "#0d9488",
                          fontWeight: "bold",
                          "&:hover": { backgroundColor: "#f0fdfa" },
                        }}
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

      {openModal && (
        <ReportDetailsDialog
          user={user}
          open={openModal}
          selectedItem={selectedItem}
          onClose={handleCloseModal}
          onUpdated={async () => {
            await loadLookupsAndItems();
            setSuccess("Report updated successfully!");
          }}
        />
      )}
    </Box>
  );
};

export default SearchMatch;
