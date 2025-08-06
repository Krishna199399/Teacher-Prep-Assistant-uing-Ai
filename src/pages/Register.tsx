import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  Grid,
  Link,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  
  const { register, error, loading, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Check server status
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        // Use the root endpoint instead of the API path
        const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        const rootUrl = baseUrl.split('/api')[0]; // Get the base URL without '/api'
        
        console.log('Checking server connection at:', rootUrl);
        
        const response = await fetch(rootUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          // Set a short timeout to avoid long waits
          signal: AbortSignal.timeout(5000)
        });
        
        if (response.ok) {
          console.log('Server is online');
          setServerStatus('online');
        } else {
          console.error('Server returned error status:', response.status);
          setServerStatus('offline');
        }
      } catch (error) {
        console.error('Server connection error:', error);
        setServerStatus('offline');
      }
    };

    checkServerStatus();
  }, []);

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    let isValid = true;
    const errors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    // Validate name
    if (!name) {
      errors.name = 'Name is required';
      isValid = false;
    }

    // Validate email
    if (!email) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }

    // Validate password
    if (!password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    // Validate confirm password
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (confirmPassword !== password) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (validateForm()) {
      console.log('Form validation passed, attempting registration');
      await register(name, email, password);
    }
  };

  // Show server offline message
  if (serverStatus === 'offline') {
    return (
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Server Connection Error
          </Typography>
          <Alert severity="error" sx={{ mb: 2 }}>
            Cannot connect to the server. The backend server needs to be running at http://localhost:5000.
          </Alert>
          <Typography variant="body2" sx={{ mb: 3 }}>
            Please make sure:
            <ul>
              <li>The server application is running (run <code>npm start</code> in the server directory)</li>
              <li>MongoDB is running and accessible</li>
              <li>Your internet connection is working</li>
            </ul>
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={() => window.location.reload()}
              >
                Retry Connection
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="outlined"
                component={RouterLink}
                to="/"
              >
                Back to Home
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography component="h1" variant="h5" align="center" gutterBottom>
          Create Account
        </Typography>
        
        {serverStatus === 'checking' && (
          <Box display="flex" justifyContent="center" my={2}>
            <CircularProgress size={24} />
            <Typography variant="body2" sx={{ ml: 1 }}>
              Checking server connection...
            </Typography>
          </Box>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Full Name"
            name="name"
            autoComplete="name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={!!formErrors.name}
            helperText={formErrors.name}
            disabled={loading || serverStatus !== 'online'}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!formErrors.email}
            helperText={formErrors.email}
            disabled={loading || serverStatus !== 'online'}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!formErrors.password}
            helperText={formErrors.password}
            disabled={loading || serverStatus !== 'online'}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={!!formErrors.confirmPassword}
            helperText={formErrors.confirmPassword}
            disabled={loading || serverStatus !== 'online'}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading || serverStatus !== 'online'}
          >
            {loading ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                Creating Account...
              </>
            ) : (
              'Sign Up'
            )}
          </Button>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link component={RouterLink} to="/login" variant="body2">
                {'Already have an account? Sign In'}
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register; 