import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Container, CircularProgress } from '@mui/material';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import LessonPlanner from './pages/LessonPlanner';
import ResourceLibrary from './pages/ResourceLibrary';
import GradingAssistant from './pages/GradingAssistant';
import CalendarView from './pages/CalendarView';
import AssessmentGenerator from './pages/AssessmentGenerator';
import ResourceRecommender from './pages/ResourceRecommender';
import Login from './pages/Login';
import Register from './pages/Register';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />
          
          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/lesson-planner" element={<ProtectedRoute><LessonPlanner /></ProtectedRoute>} />
          <Route path="/resources" element={<ProtectedRoute><ResourceLibrary /></ProtectedRoute>} />
          <Route path="/grading" element={<ProtectedRoute><GradingAssistant /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><CalendarView /></ProtectedRoute>} />
          <Route path="/assessments" element={<ProtectedRoute><AssessmentGenerator /></ProtectedRoute>} />
          <Route path="/resource-recommender" element={<ProtectedRoute><ResourceRecommender /></ProtectedRoute>} />
          
          {/* Redirect to login if no match */}
          <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
        </Routes>
      </Container>
      <Footer />
    </Box>
  );
}

export default App; 