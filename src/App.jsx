import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ReportLost from './pages/ReportLost';
import { getCurrentUser } from './services/authService';
import ReportFound from './pages/ReportFound';
import SearchMatch from './pages/SearchMatch';
import Register from './pages/Register';

function AppRoutes() {
  const navigate = useNavigate();
  // Start from the saved user so a page refresh keeps the login.
  const [user, setUser] = useState(getCurrentUser());

  const handleLoginSuccess = (data) => {
    setUser(data);
    navigate('/dashboard', { replace: true });
  };

  const handleLogout = () => {
    setUser(null);
    navigate('/login', { replace: true });
  };

  return (
    <Routes>
      {/* Root redirection */}
      <Route
        path="/"
        element={
          user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
        }
      />

      {/* Login Page */}
      <Route
        path="/login"
        element={
          user ? <Navigate to="/dashboard" replace /> : <Login onLoginSuccess={handleLoginSuccess} />
        }
      />

      {/* Registration Screen Route */}
      <Route
        path="/register"
        element={
          user ? <Navigate to="/dashboard" replace /> : <Register />
        }
      />

      {/* Dashboard Screen */}
      <Route
        path="/dashboard"
        element={
          user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />
        }
      />

      {/* Report Lost Screen */}
      <Route
        path="/report-lost"
        element={
          user ? <ReportLost user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />
        }
      />
      {/* Report Found Screen */}
      <Route
        path="/report-found"
        element={
        user ? <ReportFound user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />
        }
      />

      <Route
        path="/search-match"
        element={
        user ? <SearchMatch user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />
        }
      />

      {/* Wildcard Route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}