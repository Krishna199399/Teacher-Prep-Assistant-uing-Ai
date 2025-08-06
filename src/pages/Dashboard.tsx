import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Typography, 
  Card, 
  CardContent, 
  CardActionArea,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  useTheme,
  Avatar,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress,
  Stack,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  Snackbar,
  Alert,
  Fab
} from '@mui/material';
import { 
  EventNote as EventNoteIcon,
  Assignment as AssignmentIcon,
  Notifications as NotificationsIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  Today as TodayIcon,
  EmojiEvents as TrophyIcon,
  QueryStats as StatsIcon,
  AutoGraph as GraphIcon,
  MoreHoriz as MoreIcon,
  Add as AddIcon,
  Check as CheckIcon,
  Done as DoneIcon,
  CalendarMonth as CalendarIcon,
  Visibility as ViewIcon,
  LowPriority as LowIcon,
  PriorityHigh as HighIcon,
  ChatBubble as MeetingIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Sync as SyncIcon,
  Assessment as AssessmentIcon,
  Recommend as RecommendIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { 
  getDashboardStats, 
  getUpcomingDeadlines, 
  getRecentActivities,
  toggleDeadlineStatus,
  getProgressBreakdown,
  addDeadline,
  DeadlineItem,
  ActivityItem,
  resetDashboardData,
  initializeSampleData,
  deleteDeadline,
  updateDashboardStat,
  syncDashboardStats,
  logActivity,
  clearActivityStore
} from '../services/dashboardService';
import api from '../services/api';
import { directSyncCall, getAuthDetails } from '../utils/syncUtils';

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    lessonsCreated: 0,
    assignmentsGraded: 0,
    upcomingEvents: 0,
    resourcesUsed: 0,
    weeklyProgress: 0
  });
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<DeadlineItem[]>([]);
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [progressData, setProgressData] = useState<{
    completed: number;
    inProgress: number;
    overdue: number;
    upcoming: number;
  }>({
    completed: 0,
    inProgress: 0,
    overdue: 0,
    upcoming: 0
  });
  
  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [newDeadline, setNewDeadline] = useState({
    task: '',
    date: '',
    category: 'planning',
    priority: 'medium',
    completed: false
  });
  const [formErrors, setFormErrors] = useState({
    task: false,
    date: false
  });
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  // Quick action cards
  const quickActions = [
    { 
      title: 'Create Lesson Plan', 
      icon: <EventNoteIcon fontSize="large" sx={{ color: theme.palette.primary.main }} />,
      description: 'Design new lesson plans with AI assistance', 
      link: '/lesson-planner',
      color: '#2196f3'
    },
    { 
      title: 'Grade Assignments', 
      icon: <AssignmentIcon fontSize="large" sx={{ color: theme.palette.primary.main }} />,
      description: 'Auto-grade and provide feedback', 
      link: '/grading',
      color: '#ff9800'
    },
    { 
      title: 'Browse Resources', 
      icon: <SchoolIcon fontSize="large" sx={{ color: theme.palette.primary.main }} />,
      description: 'Find teaching materials and activities', 
      link: '/resources',
      color: '#4caf50'
    },
    { 
      title: 'Manage Calendar', 
      icon: <TodayIcon fontSize="large" sx={{ color: theme.palette.primary.main }} />,
      description: 'Schedule and organize your teaching events', 
      link: '/calendar',
      color: '#9c27b0'
    },
    { 
      title: 'Create Assessments', 
      icon: <AssessmentIcon fontSize="large" sx={{ color: theme.palette.primary.main }} />,
      description: 'Generate quizzes, tests, and rubrics with AI', 
      link: '/assessments',
      color: '#e91e63'
    },
    { 
      title: 'Find Resources', 
      icon: <RecommendIcon fontSize="large" sx={{ color: theme.palette.primary.main }} />,
      description: 'Get AI-powered resource recommendations', 
      link: '/resource-recommender',
      color: '#009688'
    },
  ];

  // Load dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Clear any previous activities to start fresh
        clearActivityStore();
        
        // First, force a direct sync call to ensure dashboard stats are real
        try {
          await directSyncCall();
          console.log('Initial direct sync completed');
        } catch (syncError) {
          console.error('Error in initial sync:', syncError);
        }
        
        // Force a sync of all stats with the database to ensure they're up to date
        try {
          await api.put('/dashboard/sync', { 
            noMockData: true, 
            useRealDataOnly: true,
            forceRealData: true 
          });
          console.log('Dashboard stats synced with database using real data only');
        } catch (apiError) {
          console.error('Error syncing dashboard:', apiError);
        }
        
        // Fetch all data in parallel with explicit no-mock settings
        const [statsData, deadlines, activities, progress] = await Promise.all([
          getDashboardStats(),
          getUpcomingDeadlines(),
          getRecentActivities(),
          getProgressBreakdown()
        ]);
        
        console.log('Loaded dashboard data:', { stats: statsData });
        console.log('Loaded deadlines:', deadlines);
        
        // Just use the real data from the API, no forced values
        setStats(statsData);
        setUpcomingDeadlines(deadlines);
        setRecentActivities(activities);
        setProgressData(progress as {
          completed: number;
          inProgress: number;
          overdue: number;
          upcoming: number;
        });
        
        // Set loading to false
        setLoading(false);
        
        // Add a delayed refresh to ensure all data is synced
        setTimeout(async () => {
          console.log('Performing delayed refresh to ensure all data is synced');
          try {
            // Re-fetch deadlines
            const refreshedDeadlines = await getUpcomingDeadlines();
            console.log('Refreshed deadlines:', refreshedDeadlines);
            
            // Update UI if we found deadlines
            if (refreshedDeadlines.length > 0) {
              setUpcomingDeadlines(refreshedDeadlines);
            }
          } catch (refreshError) {
            console.error('Error in delayed refresh:', refreshError);
          }
        }, 2000); // 2 second delay
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load dashboard data',
          severity: 'error'
        });
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Add a delayed effect to specifically check for assignments
  useEffect(() => {
    // Function to fetch assignments specifically
    const checkForAssignments = async () => {
      try {
        console.log('Specifically checking for assignments');
        
        // Fetch assignment data directly
        const response = await api.get('/assignments');
        if (response.data && response.data.data && response.data.data.length > 0) {
          console.log('Found assignments:', response.data.data);
          
          // Log activity for each assignment that doesn't have a corresponding activity
          const assignments = response.data.data;
          for (const assignment of assignments.slice(0, 5)) {
            // Create a unique activity ID for this assignment
            const activityId = `assignment_created_${assignment._id}`;
            
            // Log a new activity for this assignment
            await logActivity(
              `Created assignment: ${assignment.title || assignment.name}`,
              'grade',
              `Subject: ${assignment.subject || 'General'}, Total Points: ${assignment.totalPoints || 100}`
            );
          }
          
          // Refresh the activities list
          const updatedActivities = await getRecentActivities();
          setRecentActivities(updatedActivities);
        }
      } catch (error) {
        console.error('Error checking for assignments:', error);
      }
    };
    
    // Wait 3 seconds after initial load then check for assignments
    const timer = setTimeout(() => {
      checkForAssignments();
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle marking a task as complete
  const handleCompleteTask = async (id: string) => {
    try {
      const result = await toggleDeadlineStatus(id);
      
      if (result) {
        // Find the task to use its title in the activity log
        const task = upcomingDeadlines.find(t => t.id === id);
        if (task) {
          // Log this activity 
          await logActivity(
            `${task.completed ? 'Reopened' : 'Completed'} task: ${task.task}`,
            'deadline'  // Use 'deadline' icon type for consistency
          );
        }
      }
      
      // Refresh all data to ensure consistency
      const [updatedDeadlines, updatedProgressData, updatedStats, updatedActivities] = await Promise.all([
        getUpcomingDeadlines(),
        getProgressBreakdown(),
        getDashboardStats(),
        getRecentActivities()
      ]);
      
      setUpcomingDeadlines(updatedDeadlines);
      setProgressData(updatedProgressData as {
        completed: number;
        inProgress: number;
        overdue: number;
        upcoming: number;
      });
      setStats(updatedStats);
      setRecentActivities(updatedActivities);
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Task status updated',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error toggling task status:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update task status',
        severity: 'error'
      });
    }
  };
  
  // Calculate days remaining for a deadline
  const getDaysRemaining = (dateStr: string) => {
    const deadline = new Date(dateStr);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get activity icon based on type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'lesson':
        return <EventNoteIcon color="primary" />;
      case 'resource':
        return <SchoolIcon sx={{ color: theme.palette.success.main }} />;
      case 'grade':
        return <AssignmentIcon sx={{ color: theme.palette.warning.main }} />;
      case 'meeting':
        return <MeetingIcon sx={{ color: theme.palette.secondary.main }} />;
      case 'deadline':
        return <TodayIcon sx={{ color: theme.palette.error.main }} />;
      case 'assessment':
        return <AssessmentIcon sx={{ color: theme.palette.info.main }} />;
      default:
        return <CheckCircleIcon color="primary" />;
    }
  };
  
  // Get category icon based on value
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'grading':
        return <AssignmentIcon fontSize="small" />;
      case 'planning':
        return <EditIcon fontSize="small" />;
      case 'meeting':
        return <MeetingIcon fontSize="small" />;
      default:
        return <CheckCircleIcon fontSize="small" />;
    }
  };

  // Get priority icon based on value
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <HighIcon fontSize="small" color="error" />;
      case 'low':
        return <LowIcon fontSize="small" color="success" />;
      default:
        return <HighIcon fontSize="small" color="warning" />;
    }
  };

  // Get chip color based on days remaining
  const getDeadlineChipColor = (dateStr: string): 'error' | 'warning' | 'primary' => {
    const days = getDaysRemaining(dateStr);
    if (days < 0) return 'error';  // Overdue
    if (days <= 1) return 'error'; // Due today or tomorrow
    if (days <= 3) return 'warning'; // Due soon
    return 'primary'; // Due later
  };
  
  // Handle opening the new deadline dialog
  const handleOpenDialog = () => {
    setOpenDialog(true);
    setFormErrors({ task: false, date: false });
    setNewDeadline({
      task: '',
      date: '',
      category: 'planning',
      priority: 'medium',
      completed: false
    });
  };
  
  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  // Handle form input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | 
    { target: { name?: string; value: unknown } }
  ) => {
    const { name, value } = e.target;
    if (name) {
      setNewDeadline({
        ...newDeadline,
        [name]: value
      });
    }
  };
  
  // Handle form submission
  const handleSubmitDeadline = async () => {
    // Validate form
    let hasError = false;
    const errors = {
      task: false,
      date: false
    };
    
    if (!newDeadline.task.trim()) {
      errors.task = true;
      hasError = true;
    }
    
    if (!newDeadline.date) {
      errors.date = true;
      hasError = true;
    }
    
    if (hasError) {
      setFormErrors(errors);
      return;
    }
    
    try {
      // Reset errors
      setFormErrors({ task: false, date: false });
      
      console.log('Creating deadline with data:', newDeadline);
      
      // Add deadline
      const createdDeadline = await addDeadline({
        task: newDeadline.task,
        date: newDeadline.date,
        category: newDeadline.category as DeadlineItem['category'],
        priority: newDeadline.priority as DeadlineItem['priority'],
        completed: false
      });
      
      console.log('Created deadline:', createdDeadline);
      
      // Log this activity (in addition to what addDeadline already logs)
      await logActivity(
        `Added new ${newDeadline.category} deadline: ${newDeadline.task}`,
        'deadline',  // Use 'deadline' icon type
        `Due date: ${newDeadline.date}, Priority: ${newDeadline.priority}`
      );
      
      // Reset form
      setNewDeadline({
        task: '',
        date: '',
        category: 'planning',
        priority: 'medium',
        completed: false
      });
      
      // Close dialog
      setOpenDialog(false);
      
      // Refresh data
      console.log('Refreshing deadline data after creation');
      
      try {
        // First, get fresh data from each endpoint
        const updatedDeadlines = await getUpcomingDeadlines();
        console.log('Updated deadlines after creation:', updatedDeadlines);
        
        const updatedProgressData = await getProgressBreakdown();
        const updatedStats = await getDashboardStats();
        const updatedActivities = await getRecentActivities();
        
        // Force addition of new deadline if it's not in the list
        let deadlinesToDisplay = updatedDeadlines;
        const deadlineExists = updatedDeadlines.some(d => d.id === createdDeadline.id);
        
        if (!deadlineExists && createdDeadline.id) {
          console.log('Adding newly created deadline to list since it was not returned by API');
          deadlinesToDisplay = [...updatedDeadlines, createdDeadline];
        }
        
        // Update UI
        setUpcomingDeadlines(deadlinesToDisplay);
        setProgressData(updatedProgressData as {
          completed: number;
          inProgress: number;
          overdue: number;
          upcoming: number;
        });
        setStats(updatedStats);
        setRecentActivities(updatedActivities);
        
        // Force a refresh of the dashboard stats
        await directSyncCall();
      } catch (refreshError) {
        console.error('Error refreshing data after deadline creation:', refreshError);
      }
      
      setSnackbar({
        open: true,
        message: 'Task added successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error adding task:', error);
      setSnackbar({
        open: true,
        message: 'Failed to add task',
        severity: 'error'
      });
    }
  };
  
  // Handle snackbar close
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // Add this new function to handle reset of dashboard data
  const handleResetDashboard = async () => {
    try {
      resetDashboardData();
      
      // Show message
      setSnackbar({
        open: true,
        message: 'Dashboard has been reset',
        severity: 'info'
      });
      
      // Refresh data
      const [statsData, deadlines, activities, progress] = await Promise.all([
        getDashboardStats(),
        getUpcomingDeadlines(),
        getRecentActivities(),
        getProgressBreakdown()
      ]);
      
      setStats(statsData);
      setUpcomingDeadlines(deadlines);
      setRecentActivities(activities);
      setProgressData(progress as {
        completed: number;
        inProgress: number;
        overdue: number;
        upcoming: number;
      });
    } catch (error) {
      console.error('Error resetting dashboard:', error);
      setSnackbar({
        open: true,
        message: 'Failed to reset dashboard',
        severity: 'error'
      });
    }
  };

  // Add the handleDeleteTask function after handleCompleteTask
  const handleDeleteTask = async (id: string) => {
    try {
      // Find the task to use its title in the activity log
      const task = upcomingDeadlines.find(t => t.id === id);
      
      const success = await deleteDeadline(id);
      
      if (success && task) {
        // Log this activity
        await logActivity(
          `Deleted task: ${task.task}`,
          'deadline'  // Use 'deadline' icon type for consistency
        );
      }
      
      // Refresh all data to ensure consistency
      const [updatedDeadlines, updatedProgressData, updatedStats, updatedActivities] = await Promise.all([
        getUpcomingDeadlines(),
        getProgressBreakdown(),
        getDashboardStats(),
        getRecentActivities()
      ]);
      
      setUpcomingDeadlines(updatedDeadlines);
      setProgressData(updatedProgressData as {
        completed: number;
        inProgress: number;
        overdue: number;
        upcoming: number;
      });
      setStats(updatedStats);
      setRecentActivities(updatedActivities);
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Task deleted',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete task',
        severity: 'error'
      });
    }
  };

  // Function to check for assignments and add activities for them
  const handleRefreshAssignments = async () => {
    try {
      console.log('Refreshing assignments data...');
      
      // Fetch assignment data directly
      const response = await api.get('/assignments');
      if (response.data && response.data.data && response.data.data.length > 0) {
        console.log('Found assignments for refresh:', response.data.data.length);
        
        // Log activity for assignments
        let assignmentCount = 0;
        for (const assignment of response.data.data.slice(0, 10)) {
          // Log a new activity for this assignment if it doesn't already exist
          await logActivity(
            `Created assignment: ${assignment.title || assignment.name}`,
            'grade',
            `Subject: ${assignment.subject || 'General'}, Total Points: ${assignment.totalPoints || 100}`
          );
          assignmentCount++;
        }
        
        console.log(`Added activities for ${assignmentCount} assignments`);
        
        // Make sure dashboard stats reflect assignment count
        if (assignmentCount > 0) {
          await api.put('/dashboard/assignmentsGraded', { 
            value: response.data.data.length
          });
        }
      }
      
      // Refresh the activities list
      const updatedActivities = await getRecentActivities();
      setRecentActivities(updatedActivities);
      
    } catch (error) {
      console.error('Error refreshing assignments:', error);
    }
  };

  // Add this new function to manually refresh data
  const handleRefreshDashboard = async () => {
    try {
      setLoading(true);
      
      // First make a direct call to force sync with backend data only
      await directSyncCall();
      console.log('Forced sync with backend data completed');
      
      // Make a direct API call to ensure no mock data is used
      try {
        const response = await api.put('/dashboard/sync', { 
          noMockData: true, 
          useRealDataOnly: true,
          forceRealData: true
        });
        console.log('Direct dashboard sync response:', response.data);
      } catch (apiError) {
        console.error('Error in direct API call:', apiError);
      }
      
      // Refresh assignments specifically
      await handleRefreshAssignments();
      
      // Now fetch the data (should be real data only)
      console.log('Fetching real data only');
      const [statsData, deadlines, activities, progress] = await Promise.all([
        getDashboardStats(),
        getUpcomingDeadlines(),
        getRecentActivities(),
        getProgressBreakdown()
      ]);
      
      console.log('Retrieved data:', { 
        stats: statsData,
        deadlines,
        activities,
        progress
      });
      
      // Update UI with real data only
      setStats(statsData);
      setUpcomingDeadlines(deadlines);
      setRecentActivities(activities);
      setProgressData(progress as {
        completed: number;
        inProgress: number,
        overdue: number,
        upcoming: number
      });
      
      // Show message
      setSnackbar({
        open: true,
        message: 'Dashboard refreshed with real data only',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
      setSnackbar({
        open: true,
        message: 'Failed to refresh dashboard',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Add this new function to force sync the dashboard
  const handleForceSyncDashboard = async () => {
    try {
      setLoading(true);
      
      // Show starting message
      console.log('Starting force sync operation...');
      setSnackbar({
        open: true,
        message: 'Syncing dashboard data...',
        severity: 'info'
      });
      
      try {
        // Check auth details first
        const authInfo = getAuthDetails();
        console.log('Auth details:', authInfo);
        
        // Use direct sync utility with explicit no-mock flags
        await directSyncCall();
        console.log('Direct sync completed');
        
        // Make a second direct API call to ensure no mock data 
        const response = await api.put('/dashboard/sync', {
          noMockData: true,
          useRealDataOnly: true,
          forceRealData: true
        });
        console.log('Second direct sync response:', response.data);
        
        // Refresh data
        console.log('Fetching updated dashboard stats...');
        const statsData = await getDashboardStats();
        console.log('Updated stats:', statsData);
        setStats(statsData);
        
        // Refresh all data
        const [deadlines, activities, progress] = await Promise.all([
          getUpcomingDeadlines(),
          getRecentActivities(),
          getProgressBreakdown()
        ]);
        
        setUpcomingDeadlines(deadlines);
        setRecentActivities(activities);
        setProgressData(progress as {
          completed: number;
          inProgress: number;
          overdue: number;
          upcoming: number;
        });
        
        // Show success message
        setSnackbar({
          open: true,
          message: 'Dashboard force synced successfully',
          severity: 'success'
        });
      } catch (apiError: any) {
        console.error('API Error details:', apiError);
        console.error('API Error response:', apiError.response);
        
        // Show detailed error message
        setSnackbar({
          open: true,
          message: `Force sync failed: ${apiError.response?.data?.message || apiError.message || 'Unknown error'}`,
          severity: 'error'
        });
      }
    } catch (error: any) {
      console.error('General error in force sync function:', error);
      setSnackbar({
        open: true,
        message: `Error: ${error.message || 'Unknown error'}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Format activity date to show in a more readable format
  const formatActivityDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      // Show relative time for recent activities
      if (diffMins < 60) {
        return diffMins <= 1 ? 'Just now' : `${diffMins} minutes ago`;
      } else if (diffHours < 24) {
        return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
      } else if (diffDays < 7) {
        return diffDays === 1 ? 'Yesterday' : `${diffDays} days ago`;
      } else {
        // Format as Month Day, Year
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        });
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateStr;
    }
  };

  return (
    <Fade in={!loading} timeout={800}>
      <Box>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box 
              sx={{ 
                mb: 4, 
                p: 3, 
                borderRadius: 2,
                background: 'linear-gradient(120deg, #1976d2 0%, #2196f3 100%)',
                color: 'white',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" component="h1" fontWeight="bold">
                    Welcome to Teacher Prep Assistant
                  </Typography>
                  <Typography variant="subtitle1" sx={{ mt: 1, opacity: 0.9 }}>
                    Your all-in-one platform for streamlining class preparation and teaching tasks.
                  </Typography>
                </Box>
                <Avatar 
                  sx={{ 
                    width: 64, 
                    height: 64, 
                    bgcolor: 'white', 
                    color: theme.palette.primary.main,
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                  }}
                >
                  K
                </Avatar>
              </Box>
            </Box>

            {/* Stats Row */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ 
                  p: 2, 
                  textAlign: 'center', 
                  borderTop: `3px solid ${theme.palette.primary.main}`,
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)'
                  }
                }}>
                  <EventNoteIcon fontSize="large" color="primary" />
                  <Typography variant="h4" sx={{ my: 1, fontWeight: 'bold' }}>
                    {stats.lessonsCreated}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Lessons Created
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ 
                  p: 2, 
                  textAlign: 'center', 
                  borderTop: `3px solid ${theme.palette.warning.main}`,
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)'
                  }
                }}>
                  <AssignmentIcon fontSize="large" sx={{ color: theme.palette.warning.main }} />
                  <Typography variant="h4" sx={{ my: 1, fontWeight: 'bold' }}>
                    {stats.assignmentsGraded}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Assignments Graded
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ 
                  p: 2, 
                  textAlign: 'center', 
                  borderTop: `3px solid ${theme.palette.success.main}`,
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)'
                  }
                }}>
                  <SchoolIcon fontSize="large" sx={{ color: theme.palette.success.main }} />
                  <Typography variant="h4" sx={{ my: 1, fontWeight: 'bold' }}>
                    {stats.resourcesUsed}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Resources Used
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ 
                  p: 2, 
                  textAlign: 'center', 
                  borderTop: `3px solid ${theme.palette.secondary.main}`,
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)'
                  }
                }}>
                  <CalendarIcon fontSize="large" color="secondary" />
                  <Typography variant="h4" sx={{ my: 1, fontWeight: 'bold' }}>
                    {stats.upcomingEvents}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Upcoming Events
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Weekly Progress Tracker */}
            <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="medium">
                  <GraphIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Weekly Progress
                </Typography>
                <Chip 
                  label={`${stats.weeklyProgress}%`} 
                  color={stats.weeklyProgress < 50 ? 'warning' : 'success'} 
                  size="small"
                  variant="outlined" 
                />
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={stats.weeklyProgress} 
                sx={{ height: 10, borderRadius: 5, mb: 2 }} 
              />
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6} sm={3}>
                  <Box display="flex" alignItems="center">
                    <CheckCircleIcon color="success" sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="body2">Completed: {progressData.completed}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box display="flex" alignItems="center">
                    <CheckCircleIcon color="warning" sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="body2">In Progress: {progressData.inProgress}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box display="flex" alignItems="center">
                    <CheckCircleIcon color="error" sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="body2">Overdue: {progressData.overdue}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box display="flex" alignItems="center">
                    <CheckCircleIcon color="info" sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="body2">Upcoming: {progressData.upcoming}</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Quick Action Cards */}
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <TrophyIcon sx={{ mr: 1 }} color="primary" />
              Quick Actions
            </Typography>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {quickActions.map((action, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      transition: 'all 0.3s ease',
                      borderRadius: 2,
                      ':hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    <CardActionArea component={Link} to={action.link} sx={{ height: '100%' }}>
                      <Box sx={{ 
                        height: 4, 
                        backgroundColor: action.color 
                      }} />
                      <CardContent sx={{ textAlign: 'center', p: 3 }}>
                        <Avatar
                          sx={{
                            bgcolor: `${action.color}15`, // Light version of color
                            width: 60,
                            height: 60,
                            margin: '0 auto 16px',
                            p: 2
                          }}
                        >
                          {action.icon}
                        </Avatar>
                        <Typography variant="h6" component="div" fontWeight="bold">
                          {action.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {action.description}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Dashboard Bottom Row */}
            <Grid container spacing={3}>
              {/* Upcoming Deadlines */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, height: '100%', borderRadius: 2 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center">
                      <NotificationsIcon color="warning" sx={{ mr: 1 }} />
                      <Typography variant="h6" fontWeight="medium">Upcoming Deadlines</Typography>
                    </Box>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      startIcon={<AddIcon />}
                      onClick={handleOpenDialog}
                    >
                      Add New
                    </Button>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  {upcomingDeadlines.length === 0 ? (
                    <Box p={2} textAlign="center">
                      <Typography color="text.secondary">No upcoming deadlines</Typography>
                    </Box>
                  ) : (
                    <List>
                      {upcomingDeadlines.map((item) => {
                        const daysRemaining = getDaysRemaining(item.date);
                        const chipColor = getDeadlineChipColor(item.date);
                        
                        return (
                          <ListItem 
                            key={item.id}
                            secondaryAction={
                              <Box>
                                <IconButton 
                                  edge="end" 
                                  aria-label="complete"
                                  onClick={() => item.id && handleCompleteTask(item.id)}
                                  color={item.completed ? 'primary' : 'default'}
                                  sx={{ mr: 1 }}
                                >
                                  <CheckCircleIcon />
                                </IconButton>
                                <IconButton 
                                  edge="end" 
                                  aria-label="delete"
                                  onClick={() => item.id && handleDeleteTask(item.id)}
                                  color="error"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                            }
                            sx={{ 
                              borderLeft: `4px solid ${theme.palette[chipColor].main}`,
                              bgcolor: item.completed ? 'action.hover' : 'background.paper',
                              textDecoration: item.completed ? 'line-through' : 'none',
                              opacity: item.completed ? 0.7 : 1,
                              mb: 1,
                              borderRadius: 1,
                              transition: 'all 0.2s ease-in-out',
                              pr: 9 // Increase padding to accommodate two buttons
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <Tooltip title={`${item.category.charAt(0).toUpperCase() + item.category.slice(1)}`}>
                                {getCategoryIcon(item.category)}
                              </Tooltip>
                            </ListItemIcon>
                            <ListItemText 
                              primary={
                                <Box display="flex" alignItems="center">
                                  <Typography
                                    variant="body1"
                                    style={{ 
                                      textDecoration: item.completed ? 'line-through' : 'none',
                                      marginRight: 8
                                    }}
                                  >
                                    {item.task}
                                  </Typography>
                                  <Tooltip title={`Priority: ${item.priority}`}>
                                    {getPriorityIcon(item.priority)}
                                  </Tooltip>
                                </Box>
                              }
                              secondary={`Due: ${item.date}`}
                            />
                          </ListItem>
                        );
                      })}
                    </List>
                  )}
                  <Button 
                    variant="text" 
                    color="primary" 
                    component={Link} 
                    to="/calendar"
                    endIcon={<ViewIcon />}
                    sx={{ mt: 1 }}
                  >
                    View all deadlines
                  </Button>
                </Paper>
              </Grid>

              {/* Recent Activities */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, height: '100%', borderRadius: 2 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center">
                      <EventNoteIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6" fontWeight="medium">Recent Activities</Typography>
                    </Box>
                    <IconButton size="small">
                      <MoreIcon />
                    </IconButton>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  {recentActivities.length === 0 ? (
                    <Box p={2} textAlign="center">
                      <Typography color="text.secondary">No recent activities</Typography>
                    </Box>
                  ) : (
                    <List>
                      {recentActivities.map((item) => (
                        <ListItem 
                          key={item.id} 
                          sx={{ 
                            px: 2, 
                            py: 1.5,
                            borderRadius: 1,
                            mb: 1,
                            bgcolor: 'rgba(33, 150, 243, 0.04)',
                            ':hover': {
                              bgcolor: 'rgba(33, 150, 243, 0.08)',
                            }
                          }}
                        >
                          <ListItemIcon>
                            {getActivityIcon(item.icon)}
                          </ListItemIcon>
                          <ListItemText 
                            primary={item.activity} 
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  {formatActivityDate(item.date)}
                                </Typography>
                                {item.details && (
                                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                    {item.details}
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                  <Box display="flex" justifyContent="center" mt={2}>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      component={Link} 
                      to="/lesson-planner"
                      sx={{ borderRadius: 2 }}
                    >
                      Start New Activity
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
            
            {/* Add New Deadline Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
              <DialogTitle>Add New Deadline</DialogTitle>
              <DialogContent>
                <Box mt={1}>
                  <TextField
                    autoFocus
                    margin="dense"
                    name="task"
                    label="Task Title"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={newDeadline.task}
                    onChange={handleInputChange}
                    error={formErrors.task}
                    helperText={formErrors.task ? "Task title is required" : ""}
                    sx={{ mb: 2 }}
                  />
                  
                  <TextField
                    margin="dense"
                    name="date"
                    label="Due Date"
                    type="date"
                    fullWidth
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    value={newDeadline.date}
                    onChange={handleInputChange}
                    error={formErrors.date}
                    helperText={formErrors.date ? "Due date is required" : ""}
                    sx={{ mb: 2 }}
                  />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel id="category-label">Category</InputLabel>
                        <Select
                          labelId="category-label"
                          name="category"
                          value={newDeadline.category}
                          label="Category"
                          onChange={(e) => handleInputChange(e)}
                        >
                          <MenuItem value="planning">Planning</MenuItem>
                          <MenuItem value="grading">Grading</MenuItem>
                          <MenuItem value="meeting">Meeting</MenuItem>
                          <MenuItem value="other">Other</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel id="priority-label">Priority</InputLabel>
                        <Select
                          labelId="priority-label"
                          name="priority"
                          value={newDeadline.priority}
                          label="Priority"
                          onChange={(e) => handleInputChange(e)}
                        >
                          <MenuItem value="high">High</MenuItem>
                          <MenuItem value="medium">Medium</MenuItem>
                          <MenuItem value="low">Low</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>
              </DialogContent>
              <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={handleCloseDialog}>Cancel</Button>
                <Button 
                  variant="contained" 
                  onClick={handleSubmitDeadline}
                  color="primary"
                >
                  Add Deadline
                </Button>
              </DialogActions>
            </Dialog>
            
            {/* Snackbar for notifications */}
            <Snackbar 
              open={snackbar.open} 
              autoHideDuration={6000} 
              onClose={handleCloseSnackbar}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
              <Alert 
                onClose={handleCloseSnackbar} 
                severity={snackbar.severity} 
                variant="filled"
              >
                {snackbar.message}
              </Alert>
            </Snackbar>

            {/* Dashboard Action Buttons */}
            <Box sx={{ position: 'fixed', bottom: 20, right: 20, display: 'flex', gap: 2 }}>
              <Tooltip title="Force Sync Dashboard">
                <Fab 
                  color="success" 
                  onClick={handleForceSyncDashboard}
                  aria-label="force sync dashboard"
                >
                  <SyncIcon />
                </Fab>
              </Tooltip>
              <Tooltip title="Refresh Dashboard Data">
                <Fab 
                  color="primary" 
                  onClick={handleRefreshDashboard}
                  aria-label="refresh dashboard"
                >
                  <RefreshIcon />
                </Fab>
              </Tooltip>
              <Tooltip title="Reset Dashboard Data">
                <Fab 
                  color="secondary" 
                  onClick={handleResetDashboard}
                  aria-label="reset dashboard"
                >
                  <DeleteIcon />
                </Fab>
              </Tooltip>
            </Box>
          </>
        )}
      </Box>
    </Fade>
  );
};

export default Dashboard; 