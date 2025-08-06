import React from 'react';
import { CalendarEvent } from '../types/calendarTypes';
import { 
  Assignment as AssignmentIcon, 
  Group as GroupIcon, 
  Today as TodayIcon, 
  Book as BookIcon,
  EventNote as EventNoteIcon 
} from '@mui/icons-material';

/**
 * Groups events by date for easier display in calendar
 */
export const groupEventsByDate = (events: CalendarEvent[]): Record<string, CalendarEvent[]> => {
  const grouped: Record<string, CalendarEvent[]> = {};
  
  events.forEach(event => {
    if (!grouped[event.date]) {
      grouped[event.date] = [];
    }
    grouped[event.date].push(event);
  });
  
  return grouped;
};

/**
 * Maps event types to appropriate icon names
 */
export const getEventIcon = (type: string): string => {
  switch (type) {
    case 'assessment':
      return 'Assignment';
    case 'meeting':
      return 'Group';
    case 'deadline':
      return 'Today';
    case 'lesson':
      return 'Book';
    default:
      return 'EventNote';
  }
};

/**
 * Maps event types to appropriate color schemes
 */
export const getEventChipColor = (type: string): "error" | "primary" | "warning" | "success" => {
  switch (type) {
    case 'assessment':
      return 'error';
    case 'meeting':
      return 'primary';
    case 'deadline':
      return 'warning';
    case 'lesson':
      return 'success';
    default:
      return 'primary';
  }
};

/**
 * Returns gradient background styles for different event types
 */
export const getEventGradient = (type: string): string => {
  switch (type) {
    case 'assessment':
      return 'linear-gradient(135deg, rgba(244,67,54,0.1) 0%, rgba(244,67,54,0.05) 100%)';
    case 'meeting':
      return 'linear-gradient(135deg, rgba(33,150,243,0.1) 0%, rgba(33,150,243,0.05) 100%)';
    case 'deadline':
      return 'linear-gradient(135deg, rgba(255,152,0,0.1) 0%, rgba(255,152,0,0.05) 100%)';
    case 'lesson':
      return 'linear-gradient(135deg, rgba(76,175,80,0.1) 0%, rgba(76,175,80,0.05) 100%)';
    default:
      return 'none';
  }
}; 