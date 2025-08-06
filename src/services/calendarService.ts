import { CalendarEvent } from '../types/calendarTypes';
import api from './api';
import { syncDashboardStats, incrementDashboardStat } from './dashboardService';

// Get all calendar events
export const getCalendarEvents = async (): Promise<CalendarEvent[]> => {
  try {
    const response = await api.get('/calendar');
    // Map the backend _id to id for frontend consistency
    return response.data.data.map((event: any) => ({
      ...event,
      id: event._id
    }));
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return [];
  }
};

// Add a new calendar event
export const addCalendarEvent = async (event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> => {
  try {
    const response = await api.post('/calendar', event);
    const newEvent = response.data.data;
    
    // Update dashboard stats when a new event is created
    await incrementDashboardStat('upcomingEvents');
    await syncDashboardStats();
    
    return {
      ...newEvent,
      id: newEvent._id
    };
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
};

// Update an existing calendar event
export const updateCalendarEvent = async (updatedEvent: CalendarEvent): Promise<CalendarEvent> => {
  try {
    // Remove id and _id from updates to avoid conflicts
    const { id, _id, ...eventData } = updatedEvent as any;
    
    const response = await api.put(`/calendar/${id || _id}`, eventData);
    const event = response.data.data;
    
    return {
      ...event,
      id: event._id
    };
  } catch (error) {
    console.error(`Error updating calendar event:`, error);
    throw error;
  }
};

// Delete a calendar event
export const deleteCalendarEvent = async (id: number | string): Promise<boolean> => {
  try {
    await api.delete(`/calendar/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting calendar event with ID ${id}:`, error);
    return false;
  }
};

// Reset calendar events - just clears existing events without adding mock data
export const resetCalendarEvents = async (): Promise<void> => {
  try {
    console.log('Clearing all calendar events - no mock data will be added');
    
    // Delete all existing events
    const events = await getCalendarEvents();
    for (const event of events) {
      await deleteCalendarEvent(event.id);
    }
    
    // Sync dashboard stats after clearing events
    await syncDashboardStats();
    
    console.log('All calendar events have been cleared');
  } catch (error) {
    console.error('Error resetting calendar events:', error);
  }
}; 