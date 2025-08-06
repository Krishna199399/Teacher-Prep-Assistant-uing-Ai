import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  Avatar,
  Badge,
  Tooltip,
  useTheme
} from '@mui/material';
import { motion } from 'framer-motion';
import { Zoom } from '@mui/material';
import {
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Today as TodayIcon,
  Notifications as NotificationIcon,
  Assignment as AssignmentIcon,
  Group as GroupIcon,
  Book as BookIcon,
  EventNote as EventNoteIcon
} from '@mui/icons-material';
import { CalendarEvent } from '../../types/calendarTypes';
import { getEventChipColor, getEventGradient, getEventIcon } from '../../utils/calendarUtils';

interface EventCardProps {
  event: CalendarEvent;
  onClick: (event: CalendarEvent) => void;
}

/**
 * Component for displaying calendar events as cards
 */
const EventCard: React.FC<EventCardProps> = ({ event, onClick }) => {
  const theme = useTheme();

  // Render the appropriate icon based on event type
  const renderEventIcon = (iconName: string) => {
    switch (iconName) {
      case 'Assignment':
        return <AssignmentIcon />;
      case 'Group':
        return <GroupIcon />;
      case 'Today':
        return <TodayIcon />;
      case 'Book':
        return <BookIcon />;
      default:
        return <EventNoteIcon />;
    }
  };

  return (
    <Zoom in={true} style={{ transitionDelay: '100ms' }}>
      <Card 
        variant="outlined" 
        component={motion.div}
        whileHover={{ 
          scale: 1.02,
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          transition: { duration: 0.2 }
        }}
        sx={{ 
          mb: 2, 
          backgroundImage: getEventGradient(event.type),
          borderLeft: `4px solid ${theme.palette[getEventChipColor(event.type)].main}`,
          transition: 'all 0.2s ease-in-out'
        }}
        onClick={() => onClick(event)}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <Avatar sx={{ 
              mr: 2, 
              bgcolor: `${theme.palette[getEventChipColor(event.type)].main}`,
              color: '#fff'
            }}>
              {renderEventIcon(getEventIcon(event.type))}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" component="div" gutterBottom>
                {event.title}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Chip 
                  label={event.type.charAt(0).toUpperCase() + event.type.slice(1)} 
                  size="small"
                  color={getEventChipColor(event.type)}
                />
                <Typography variant="body2" color="text.secondary">
                  {event.className}
                </Typography>
              </Box>
              
              {event.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {event.description.length > 100 ? `${event.description.substring(0, 100)}...` : event.description}
                </Typography>
              )}
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                {event.location && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationIcon fontSize="small" sx={{ mr: 0.5, opacity: 0.7 }} />
                    <Typography variant="body2">{event.location}</Typography>
                  </Box>
                )}
                
                {!event.isAllDay && event.startTime && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TimeIcon fontSize="small" sx={{ mr: 0.5, opacity: 0.7 }} />
                    <Typography variant="body2">
                      {event.startTime}{event.endTime ? ` - ${event.endTime}` : ''}
                    </Typography>
                  </Box>
                )}
                
                {event.isAllDay && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TodayIcon fontSize="small" sx={{ mr: 0.5, opacity: 0.7 }} />
                    <Typography variant="body2">All day</Typography>
                  </Box>
                )}
              </Box>
            </Box>
            {event.reminder && (
              <Tooltip title="Reminder set">
                <Badge color="error" variant="dot">
                  <NotificationIcon fontSize="small" sx={{ opacity: 0.7 }} />
                </Badge>
              </Tooltip>
            )}
          </Box>
        </CardContent>
      </Card>
    </Zoom>
  );
};

export default EventCard; 