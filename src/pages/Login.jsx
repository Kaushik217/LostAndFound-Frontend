import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  InputAdornment,
  Container,
  Chip,
  Divider,
  Link,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  LockOutlined,
  EmailOutlined,
  School,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import { loginUser } from '../services/authService';

const Login = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!email || !password) {
            setError('Please fill both email and password.');
            return;
        }

        setLoading(true);

        try {
            const data = await loginUser(email, password);
            setLoading(false);
            if (onLoginSuccess) {
                onLoginSuccess(data);
            }
        } catch (err) {
            setLoading(false);
            setError(err.message || 'Invalid email or password. Please try again.');
        }
    };

    const fillDemoUser = (demoEmail, demoPassword) => {
        setEmail(demoEmail);
        setPassword(demoPassword);
        setError('');
    };

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', p: 2 }}>
            <Container maxWidth="xs">
                <Card elevation={12} sx={{ borderRadius: 4, p: 3, backgroundColor: '#ffffff', overflow: 'visible' }}>
                    <CardContent sx={{ p: 4 }}>
                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                            <Box sx={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto', color: '#ffffff', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)' }}>
                                <School fontSize="large" />
                            </Box>
                            <Typography variant="h5" component="h1" sx={{ fontWeight: '700', color: '#1e293b', mb: 1 }}>
                                Student Items Lost & Found Portal
                            </Typography>
                        </Box>

                        {error && (
                            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                                {error}
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit}>
                            <TextField 
                                fullWidth
                                label="Email Address"
                                variant="outlined"
                                margin="normal"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                            />
                            <TextField
                                fullWidth
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                variant="outlined"
                                margin="normal"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                slotProps={{
                                    input: {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }
                                }}
                            />
                            <Button type="submit"
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    disabled={loading}
                                    sx={{
                                        mt: 3,
                                        mb: 2,
                                        py: 1.5,
                                        borderRadius: 2,
                                        fontWeight: 'bold',
                                        backgroundColor: '#2563eb',
                                        '&:hover': { backgroundColor: '#1d4ed8' },
                                        textTransform: 'none',
                                    }}
                            >
                                {loading ? <CircularProgress size={26} color="inherit" /> : 'Login'}
                            </Button>
                        </form>

                        {/* Registration Link Option */}
                        <Box sx={{ textAlign: 'center', mt: 1, mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                Not registered yet?{' '}
                                <Link component="button" variant="body2" onClick={() => navigate('/register')} sx={{ fontWeight: 'bold', color: '#2563eb', textDecoration: 'none' }}>
                                    Create an account
                                </Link>
                            </Typography>
                        </Box>

                        <Divider sx={{ my: 2 }}>
                            <Typography variant="caption" color="text.secondary">
                                DEMO LOGIN CREDS
                            </Typography>
                        </Divider>

                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                            <Chip
                                label="Student Account"
                                clickable
                                color="primary"
                                variant="outlined"
                                size="small"
                                onClick={() => fillDemoUser('student@example.com', 'Demo123!')}
                            />
                            <Chip
                                label="Admin Account"
                                clickable
                                color="secondary"
                                variant="outlined"
                                size="small"
                                onClick={() => fillDemoUser('admin@example.com', 'Demo123!')}
                            />
                        </Box>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
};
export default Login;