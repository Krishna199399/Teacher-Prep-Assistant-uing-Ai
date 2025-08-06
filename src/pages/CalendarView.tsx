import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  Card,
  CardContent,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  ToggleButtonGroup,
  ToggleButton,
  Stack,
  Avatar,
  Tooltip,
  InputAdornment,
  Zoom,
  Fade,
  Badge,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Snackbar,
  Alert,
  Switch,
  Fab
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  Today as TodayIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Add as AddIcon,
  EventNote as EventNoteIcon,
  Assignment as AssignmentIcon,
  Group as GroupIcon,
  Book as BookIcon,
  CalendarMonth as CalendarIcon,
  ViewList as ListIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  FilterList as FilterIcon,
  Notifications as NotificationIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO, getDay, addDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarEvent } from '../types/calendarTypes';
import { 
  groupEventsByDate, 
  getEventChipColor, 
  getEventGradient 
} from '../utils/calendarUtils';
import EventCard from '../components/calendar/EventCard';
import EventForm from '../components/calendar/EventForm';
import {
  getCalendarEvents,
  addCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  resetCalendarEvents
} from '../services/calendarService';

const CalendarView: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Add loading state
  const [loading, setLoading] = useState(true);
  
  // Calendar state
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);
  const [viewMode, setViewMode] = useState<'month' | 'list'>('list');
  const [selectedFilters, setSelectedFilters] = useState<string[]>(['assessment', 'meeting', 'deadline', 'lesson']);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // New event form state
  const [openEventDialog, setOpenEventDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [eventForm, setEventForm] = useState<Partial<CalendarEvent>>({
    title: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    type: 'meeting',
    className: '',
    description: '',
    location: '',
    startTime: '',
    endTime: '',
    isAllDay: false,
    reminder: false
  });
  
  // Feedback state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  // Load events from localStorage on component mount
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const calendarEvents = await getCalendarEvents();
        setEvents(calendarEvents);
        setFilteredEvents(calendarEvents);
      } catch (error) {
        console.error('Error loading calendar events:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load calendar events',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadEvents();
  }, []);

  // Calendar data calculations
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Add empty slots for the days of the week before the first day of the month
  const firstDayOfMonth = getDay(monthStart);
  const daysToAdd = Array.from({ length: firstDayOfMonth }, (_, i) => 
    addDays(monthStart, -firstDayOfMonth + i)
  );
  
  // Create the full calendar grid with previous, current, and next month days
  const calendarGrid = [...daysToAdd, ...calendarDays];
  
  // Group events by date
  const eventsByDate = groupEventsByDate(filteredEvents);
  
  // Get the dates for list view (for simplicity, just showing within a range)
  const listViewDays = eachDayOfInterval({ 
    start: addDays(new Date(), -3), 
    end: addDays(new Date(), 14) 
  });
  
  // Filter events based on filters and search query
  useEffect(() => {
    let filtered = events;
    
    // Apply type filters
    if (selectedFilters.length > 0) {
      filtered = filtered.filter(event => selectedFilters.includes(event.type));
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(query) ||
        event.className.toLowerCase().includes(query) ||
        (event.description && event.description.toLowerCase().includes(query)) ||
        (event.location && event.location.toLowerCase().includes(query))
      );
    }
    
    setFilteredEvents(filtered);
  }, [events, selectedFilters, searchQuery]);
  
  // Handle month navigation
  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };
  
  const handleToday = () => {
    setCurrentDate(new Date());
  };
  
  // Handle view mode switch
  const handleViewModeChange = (
    _: React.MouseEvent<HTMLElement>,
    newMode: 'month' | 'list' | null
  ) => {
    if (newMode) {
      setViewMode(newMode);
    }
  };
  
  // Handle filter selection
  const handleFilterChange = (
    _: React.MouseEvent<HTMLElement>,
    newFilters: string[]
  ) => {
    setSelectedFilters(newFilters);
  };
  
  // Event form handlers
  const handleOpenEventDialog = (event?: CalendarEvent) => {
    if (event) {
      setEditingEvent(event);
      setEventForm({
        ...event
      });
    } else {
      setEditingEvent(null);
      setEventForm({
        title: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        type: 'meeting',
        className: '',
        description: '',
        location: '',
        startTime: '',
        endTime: '',
        isAllDay: false,
        reminder: false
      });
    }
    setOpenEventDialog(true);
  };
  
  const handleCloseEventDialog = () => {
    setOpenEventDialog(false);
    setEditingEvent(null);
  };
  
  const handleEventFormChange = (field: keyof CalendarEvent, value: any) => {
    setEventForm(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSaveEvent = async () => {
    if (!eventForm.title || !eventForm.date) {
      setSnackbar({
        open: true,
        message: 'Please provide a title and date',
        severity: 'error'
      });
      return;
    }
    
    try {
      if (editingEvent) {
        // Update existing event
        const updatedEvent = await updateCalendarEvent({
          ...editingEvent,
          ...eventForm as Omit<CalendarEvent, 'id'>
        } as CalendarEvent);
        
        // Update local state
        setEvents(prevEvents => 
          prevEvents.map(event => event.id === updatedEvent.id ? updatedEvent : event)
        );
        
        setSnackbar({
          open: true,
          message: 'Event updated successfully',
          severity: 'success'
        });
      } else {
        // Create new event
        const newEvent = await addCalendarEvent(eventForm as Omit<CalendarEvent, 'id'>);
        
        // Update local state
        setEvents(prevEvents => [...prevEvents, newEvent]);
        
        setSnackbar({
          open: true,
          message: 'Event added successfully',
          severity: 'success'
        });
      }
      
      handleCloseEventDialog();
    } catch (error) {
      console.error('Error saving event:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save event',
        severity: 'error'
      });
    }
  };
  
  const handleDeleteEvent = async () => {
    if (editingEvent) {
      try {
        const success = await deleteCalendarEvent(editingEvent.id);
        
        if (success) {
          // Update local state
          setEvents(prevEvents => prevEvents.filter(event => event.id !== editingEvent.id));
          
          setSnackbar({
            open: true,
            message: 'Event deleted successfully',
            severity: 'success'
          });
          
          handleCloseEventDialog();
        } else {
          setSnackbar({
            open: true,
            message: 'Event not found',
            severity: 'error'
          });
        }
      } catch (error) {
        console.error('Error deleting event:', error);
        setSnackbar({
          open: true,
          message: 'Failed to delete event',
          severity: 'error'
        });
      }
    }
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  // Handle day cell click in month view
  const handleDayCellClick = (day: Date) => {
    setCurrentDate(day);
    const newEventForm: Partial<CalendarEvent> = {
      title: '',
      date: format(day, 'yyyy-MM-dd'),
      type: 'meeting',
      className: '',
      description: '',
      location: '',
      startTime: '',
      endTime: '',
      isAllDay: false,
      reminder: false
    };
    setEventForm(newEventForm);
    handleOpenEventDialog();
  };

  // Add a function to reset calendar events
  const handleResetCalendar = async () => {
    try {
      await resetCalendarEvents();
      
      // Reload events
      const calendarEvents = await getCalendarEvents();
      setEvents(calendarEvents);
      setFilteredEvents(calendarEvents);
      
      setSnackbar({
        open: true,
        message: 'Calendar reset to default events',
        severity: 'info'
      });
    } catch (error) {
      console.error('Error resetting calendar:', error);
      setSnackbar({
        open: true,
        message: 'Failed to reset calendar',
        severity: 'error'
      });
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Typography variant="h4" component="h1" gutterBottom>
              Calendar
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" paragraph>
              Manage your teaching schedule, deadlines, and events
            </Typography>
            
            {/* Calendar Header */}
            <Paper 
              elevation={2} 
              sx={{ 
                p: 2, 
                mb: 3, 
                background: 'linear-gradient(to right, #f6f7f9, #ffffff)'
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'flex-start' : 'center', 
                justifyContent: 'space-between', 
                gap: 2
              }}>
                {/* Left section */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    startIcon={<AddIcon />} 
                    variant="contained" 
                    color="primary"
                    onClick={() => handleOpenEventDialog()}
                  >
                    Add Event
                  </Button>
                  
                  <Button
                    variant="outlined"
                    onClick={handleToday}
                  >
                    Today
                  </Button>
                </Box>
                
                {/* Middle section */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton onClick={handlePreviousMonth}>
                    <ChevronLeftIcon />
                  </IconButton>
                  <Typography variant="h6" sx={{ mx: 2, minWidth: 150, textAlign: 'center' }}>
                    {format(currentDate, 'MMMM yyyy')}
                  </Typography>
                  <IconButton onClick={handleNextMonth}>
                    <ChevronRightIcon />
                  </IconButton>
                </Box>
                
                {/* Right section */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                  <TextField
                    placeholder="Search events..."
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                      sx: { borderRadius: 4 }
                    }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  
                  <ToggleButtonGroup
                    size="small"
                    value={viewMode}
                    exclusive
                    onChange={handleViewModeChange}
                    aria-label="view mode"
                  >
                    <ToggleButton value="month" aria-label="month view">
                      <CalendarIcon fontSize="small" />
                    </ToggleButton>
                    <ToggleButton value="list" aria-label="list view">
                      <ListIcon fontSize="small" />
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              </Box>
              
              {/* Filters */}
              <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <ToggleButtonGroup
                  size="small"
                  value={selectedFilters}
                  onChange={handleFilterChange}
                  aria-label="event filters"
                  sx={{ flexWrap: 'wrap' }}
                >
                  <ToggleButton value="assessment" aria-label="assessments">
                    <Chip 
                      label="Assessments" 
                      size="small" 
                      icon={<AssignmentIcon />} 
                      color={selectedFilters.includes('assessment') ? 'error' : 'default'} 
                      variant={selectedFilters.includes('assessment') ? 'filled' : 'outlined'} 
                    />
                  </ToggleButton>
                  <ToggleButton value="meeting" aria-label="meetings">
                    <Chip 
                      label="Meetings" 
                      size="small" 
                      icon={<GroupIcon />} 
                      color={selectedFilters.includes('meeting') ? 'primary' : 'default'} 
                      variant={selectedFilters.includes('meeting') ? 'filled' : 'outlined'} 
                    />
                  </ToggleButton>
                  <ToggleButton value="deadline" aria-label="deadlines">
                    <Chip 
                      label="Deadlines" 
                      size="small" 
                      icon={<TodayIcon />} 
                      color={selectedFilters.includes('deadline') ? 'warning' : 'default'} 
                      variant={selectedFilters.includes('deadline') ? 'filled' : 'outlined'} 
                    />
                  </ToggleButton>
                  <ToggleButton value="lesson" aria-label="lessons">
                    <Chip 
                      label="Lessons" 
                      size="small" 
                      icon={<BookIcon />} 
                      color={selectedFilters.includes('lesson') ? 'success' : 'default'} 
                      variant={selectedFilters.includes('lesson') ? 'filled' : 'outlined'} 
                    />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Paper>
            
            {/* Calendar Content */}
            <Box component="section">
              <AnimatePresence mode="wait">
                {viewMode === 'month' ? (
                  <motion.div
                    key="month-view"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Grid container spacing={1} sx={{ mb: 4 }}>
                      {/* Week days header */}
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <Grid item xs={12/7} key={day}>
                          <Box sx={{ p: 1, textAlign: 'center', fontWeight: 500 }}>
                            {day}
                          </Box>
                        </Grid>
                      ))}
                      
                      {/* Calendar grid */}
                      {calendarGrid.map((day, index) => {
                        const dayStr = format(day, 'yyyy-MM-dd');
                        const isCurrentMonth = isSameMonth(day, currentDate);
                        const isToday = isSameDay(day, new Date());
                        const eventsToday = eventsByDate[dayStr] || [];
                        
                        return (
                          <Grid item xs={12/7} key={index}>
                            <Paper 
                              elevation={0} 
                              sx={{
                                height: 140,
                                p: 1,
                                opacity: isCurrentMonth ? 1 : 0.4,
                                bgcolor: isToday ? 'rgba(33, 150, 243, 0.08)' : 'transparent',
                                border: isToday ? '1px solid rgba(33, 150, 243, 0.5)' : '1px solid #f0f0f0',
                                borderRadius: 1,
                                overflow: 'hidden',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                  bgcolor: 'rgba(0, 0, 0, 0.02)',
                                  transform: 'translateY(-2px)',
                                  boxShadow: '0 4px 8px rgba(0,0,0,0.05)'
                                }
                              }}
                              onClick={() => handleDayCellClick(day)}
                            >
                              <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                mb: 1
                              }}>
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    fontWeight: isToday ? 'bold' : 'normal',
                                    color: isToday ? 'primary.main' : 'text.primary'
                                  }}
                                >
                                  {format(day, 'd')}
                                </Typography>
                                
                                {eventsToday.length > 0 && (
                                  <Badge 
                                    badgeContent={eventsToday.length} 
                                    color="primary" 
                                    max={99}
                                    sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', height: 18, minWidth: 18 } }}
                                  />
                                )}
                              </Box>
                              
                              <Box sx={{ overflow: 'hidden', maxHeight: 110 }}>
                                {eventsToday.slice(0, 2).map((event) => (
                                  <Box
                                    key={event.id}
                                    sx={{
                                      p: 0.5,
                                      mb: 0.5,
                                      borderRadius: 0.5,
                                      bgcolor: `${theme.palette[getEventChipColor(event.type)].light}20`,
                                      borderLeft: `3px solid ${theme.palette[getEventChipColor(event.type)].main}`,
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      fontSize: '0.8rem',
                                      cursor: 'pointer',
                                      '&:hover': {
                                        bgcolor: `${theme.palette[getEventChipColor(event.type)].light}40`,
                                      }
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenEventDialog(event);
                                    }}
                                  >
                                    <Typography variant="caption" noWrap>
                                      {event.title}
                                    </Typography>
                                  </Box>
                                ))}
                                
                                {eventsToday.length > 2 && (
                                  <Typography variant="caption" color="text.secondary">
                                    +{eventsToday.length - 2} more
                                  </Typography>
                                )}
                              </Box>
                            </Paper>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </motion.div>
                ) : (
                  <motion.div
                    key="list-view"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {listViewDays.map((date) => {
                      const dayStr = format(date, 'yyyy-MM-dd');
                      const eventsToday = eventsByDate[dayStr] || [];
                      const isToday = isSameDay(date, new Date());
                      
                      if (eventsToday.length === 0) return null;
                      
                      return (
                        <Paper 
                          key={dayStr} 
                          sx={{ 
                            p: 2, 
                            mb: 3, 
                            borderLeft: isToday ? `4px solid ${theme.palette.primary.main}` : undefined,
                            boxShadow: isToday ? '0 4px 12px rgba(0,0,0,0.1)' : undefined
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar
                              sx={{
                                bgcolor: isToday ? 'primary.main' : 'grey.200',
                                color: isToday ? 'white' : 'text.primary',
                                mr: 2
                              }}
                            >
                              {format(date, 'd')}
                            </Avatar>
                            <Typography variant="h6">
                              {isToday ? 'Today, ' : ''}
                              {format(date, 'EEEE, MMMM d')}
                            </Typography>
                          </Box>
                          
                          <Divider sx={{ mb: 2 }} />
                          
                          <Box>
                            {eventsToday.map((event) => (
                              <EventCard 
                                key={event.id} 
                                event={event} 
                                onClick={handleOpenEventDialog} 
                              />
                            ))}
                          </Box>
                        </Paper>
                      );
                    })}
                    
                    {filteredEvents.length === 0 && (
                      <Paper sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          No events found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Try adjusting your filters or search criteria
                        </Typography>
                      </Paper>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </Box>
            
            {/* Event Dialog */}
            <Dialog 
              open={openEventDialog} 
              onClose={handleCloseEventDialog}
              fullWidth
              maxWidth="sm"
            >
              <DialogTitle>
                {editingEvent ? 'Edit Event' : 'Add New Event'}
              </DialogTitle>
              
              <EventForm
                eventForm={eventForm}
                editingEvent={editingEvent}
                onFormChange={handleEventFormChange}
                onSave={handleSaveEvent}
                onDelete={handleDeleteEvent}
                onClose={handleCloseEventDialog}
              />
            </Dialog>
            
            {/* Feedback Snackbar */}
            <Snackbar
              open={snackbar.open}
              autoHideDuration={6000}
              onClose={handleCloseSnackbar}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
              <Alert 
                onClose={handleCloseSnackbar} 
                severity={snackbar.severity}
                sx={{ width: '100%' }}
              >
                {snackbar.message}
              </Alert>
            </Snackbar>
            
            {/* Add Reset Calendar Button at the end */}
            <Box sx={{ position: 'fixed', bottom: 20, right: 20 }}>
              <Tooltip title="Reset Calendar Events">
                <Fab 
                  color="secondary" 
                  onClick={handleResetCalendar}
                  aria-label="reset calendar"
                >
                  <RefreshIcon />
                </Fab>
              </Tooltip>
            </Box>
          </>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default CalendarView; 