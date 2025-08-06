import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  IconButton, 
  Menu, 
  MenuItem,
  Avatar,
  useMediaQuery,
  useTheme,
  Divider,
  Tooltip
} from '@mui/material';
import { 
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Today as TodayIcon,
  Book as BookIcon,
  Assignment as AssignmentIcon,
  EventNote as EventNoteIcon,
  Logout as LogoutIcon,
  AccountCircle,
  Assessment as AssessmentIcon,
  Recommend as RecommendIcon
} from '@mui/icons-material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();
  
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };

  const handleLogout = () => {
    handleUserMenuClose();
    logout();
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', path: '/', icon: <DashboardIcon fontSize="small" /> },
    { text: 'Lesson Planner', path: '/lesson-planner', icon: <EventNoteIcon fontSize="small" /> },
    { text: 'Resources', path: '/resources', icon: <BookIcon fontSize="small" /> },
    { text: 'Grading', path: '/grading', icon: <AssignmentIcon fontSize="small" /> },
    { text: 'Calendar', path: '/calendar', icon: <TodayIcon fontSize="small" /> },
    { text: 'Assessments', path: '/assessments', icon: <AssessmentIcon fontSize="small" /> },
    { text: 'Resource Recommender', path: '/resource-recommender', icon: <RecommendIcon fontSize="small" /> },
  ];

  // If not authenticated, show limited header
  if (!isAuthenticated) {
    return (
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Teacher Prep Assistant
          </Typography>
          <Button color="inherit" component={Link} to="/login">
            Login
          </Button>
          <Button color="inherit" component={Link} to="/register">
            Register
          </Button>
        </Toolbar>
      </AppBar>
    );
  }

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Teacher Prep Assistant
        </Typography>
        
        {isMobile ? (
          <>
            <IconButton
              size="large"
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={handleMenu}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              {menuItems.map((item) => (
                <MenuItem 
                  key={item.path} 
                  onClick={handleClose} 
                  component={Link} 
                  to={item.path}
                  selected={location.pathname === item.path}
                >
                  <Box display="flex" alignItems="center">
                    {item.icon}
                    <Box ml={1}>{item.text}</Box>
                  </Box>
                </MenuItem>
              ))}
              <Divider />
              <MenuItem onClick={handleLogout}>
                <Box display="flex" alignItems="center">
                  <LogoutIcon fontSize="small" />
                  <Box ml={1}>Logout</Box>
                </Box>
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {menuItems.map((item) => (
              <Button 
                key={item.path}
                component={Link}
                to={item.path}
                color="inherit"
                sx={{ 
                  mx: 1,
                  fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                  borderBottom: location.pathname === item.path ? '2px solid white' : 'none'
                }}
                startIcon={item.icon}
              >
                {item.text}
              </Button>
            ))}
            
            <Tooltip title={user?.name || 'User Profile'}>
              <IconButton
                onClick={handleUserMenu}
                size="small"
                sx={{ ml: 2 }}
                aria-controls="user-menu"
                aria-haspopup="true"
                color="inherit"
              >
                <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>
            
            <Menu
              id="user-menu"
              anchorEl={userMenuAnchorEl}
              open={Boolean(userMenuAnchorEl)}
              onClose={handleUserMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem disabled>
                <Box display="flex" flexDirection="column">
                  <Typography variant="subtitle2">{user?.name}</Typography>
                  <Typography variant="body2" color="textSecondary">{user?.email}</Typography>
                </Box>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <Box display="flex" alignItems="center">
                  <LogoutIcon fontSize="small" />
                  <Box ml={1}>Logout</Box>
                </Box>
              </MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header; 