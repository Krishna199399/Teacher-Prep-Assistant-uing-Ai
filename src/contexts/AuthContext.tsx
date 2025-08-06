import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loginUser, registerUser, getCurrentUser } from '../services/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!token);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load user on initial load if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await getCurrentUser();
          setUser(res.data.user);
          setIsAuthenticated(true);
        } catch (error) {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
          setError('Session expired. Please login again.');
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  // Login user
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const res = await loginUser(email, password);
      const { token, user } = res.data;
      
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      setIsAuthenticated(true);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // Register user
  const register = async (name: string, email: string, password: string) => {
    try {
      console.log('Attempting to register user:', { name, email });
      setLoading(true);
      
      console.log('Making API request to:', 
                  `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/register`);
      
      const res = await registerUser(name, email, password);
      console.log('Registration response:', res.data);
      
      if (!res.data || !res.data.token) {
        throw new Error('Invalid response format - missing token or user data');
      }
      
      const { token, user } = res.data;
      
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      setIsAuthenticated(true);
      setError(null);
      console.log('User registered successfully:', user);
    } catch (err: any) {
      console.error('Registration error:', err);
      
      if (err.response) {
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
        
        if (err.response.status === 400 && err.response.data?.message?.includes('exists')) {
          setError('A user with this email already exists. Please use a different email or login.');
        } else {
          setError(err.response.data?.message || 'Registration failed. Please try again.');
        }
      } else if (err.request) {
        console.error('Error request:', err.request);
        setError('No response from server. Please check your internet connection and try again.');
      } else {
        console.error('Error message:', err.message);
        setError(err.message || 'Registration failed. Please try again.');
      }
      
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        error,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 