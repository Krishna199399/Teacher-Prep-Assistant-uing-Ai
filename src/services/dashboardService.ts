// Dashboard service using MongoDB API
import api from './api';

export interface DeadlineItem {
  id?: string;
  _id?: string;
  task: string;
  date: string;
  completed: boolean;
  category: 'grading' | 'planning' | 'meeting' | 'other';
  priority: 'high' | 'medium' | 'low';
}

export interface ActivityItem {
  id?: string;
  _id?: string;
  activity: string;
  date: string;
  icon: 'lesson' | 'resource' | 'grade' | 'meeting' | 'other' | 'deadline' | 'assessment';
  details?: string;
}

export interface DashboardStats {
  _id?: string;
  lessonsCreated: number;
  assignmentsGraded: number;
  assignmentsCreated: number;
  upcomingEvents: number;
  resourcesUsed: number;
  weeklyProgress: number;
}

// Get dashboard statistics
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await api.get('/dashboard');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      lessonsCreated: 0,
      assignmentsGraded: 0,
      assignmentsCreated: 0,
      upcomingEvents: 0,
      resourcesUsed: 0,
      weeklyProgress: 0
    };
  }
};

// Update dashboard statistics
export const updateDashboardStat = async (key: keyof DashboardStats, value: number): Promise<void> => {
  try {
    await api.put(`/dashboard/${key}`, { value });
  } catch (error) {
    console.error(`Error updating dashboard stat ${key}:`, error);
  }
};

// Increment dashboard statistic
export const incrementDashboardStat = async (key: keyof DashboardStats, incrementBy: number = 1): Promise<void> => {
  try {
    await api.put(`/dashboard/${key}/increment`, { incrementBy });
  } catch (error) {
    console.error(`Error incrementing dashboard stat ${key}:`, error);
  }
};

// Sync all dashboard stats with current data
export const syncDashboardStats = async (): Promise<void> => {
  try {
    console.log('Syncing dashboard stats with current data - no mock data');
    // Only sync with real data, no mock data generation
    await api.put('/dashboard/sync', { noMockData: true, useRealDataOnly: true });
  } catch (error) {
    console.error('Error syncing dashboard stats:', error);
  }
};

// Get upcoming deadlines - uses calendar events with type=deadline
export const getUpcomingDeadlines = async (): Promise<DeadlineItem[]> => {
  try {
    // Get all calendar events
    const response = await api.get('/calendar');
    console.log('Calendar events retrieved for deadlines:', response.data.data);
    
    // Check if we have any events
    if (!response.data.data || response.data.data.length === 0) {
      console.log('No calendar events found');
      return [];
    }
    
    // Add flexible filtering to catch all deadline types
    const deadlines = response.data.data.filter((event: any) => {
      // Keep any event explicitly marked as a deadline
      const isDeadlineType = event.type === 'deadline';
      // Or any event with 'deadline' anywhere in the className
      const hasDeadlineClass = event.className && 
        typeof event.className === 'string' && 
        event.className.toLowerCase().includes('deadline');
      
      // Keep if either condition is true
      return isDeadlineType || hasDeadlineClass;
    });
    
    console.log('Filtered deadline events:', deadlines);
    
    // Map to DeadlineItem format with better category and priority detection
    return deadlines.map((event: any) => {
      // Determine category from className or default to 'other'
      let category: DeadlineItem['category'] = 'other';
      if (event.className) {
        if (typeof event.className === 'string') {
          if (event.className.toLowerCase().includes('grading')) category = 'grading';
          else if (event.className.toLowerCase().includes('meeting')) category = 'meeting';
          else if (event.className.toLowerCase().includes('planning')) category = 'planning';
        }
      }
      
      // Determine priority from className or default to 'medium'
      let priority: DeadlineItem['priority'] = 'medium';
      if (event.className) {
        if (typeof event.className === 'string') {
          if (event.className.toLowerCase().includes('high')) priority = 'high';
          else if (event.className.toLowerCase().includes('low')) priority = 'low';
        }
      }
      
      return {
        id: event._id,
        task: event.title,
        date: event.date,
        completed: event.completed || false,
        category,
        priority
      };
    });
  } catch (error) {
    console.error('Error fetching deadlines:', error);
    return [];
  }
};

// Toggle deadline completion status (updates calendar event)
export const toggleDeadlineStatus = async (id: string): Promise<boolean> => {
  try {
    // Get the event first
    const response = await api.get(`/calendar/${id}`);
    const event = response.data.data;
    
    // Toggle the completed status
    const updatedEvent = {
      ...event,
      completed: !event.completed
    };
    
    // Update the event
    await api.put(`/calendar/${id}`, updatedEvent);
    
    // Log this activity
    await logActivity(
      `${event.completed ? 'Reopened' : 'Completed'} task: ${event.title}`,
      'deadline'  // Use 'deadline' icon type for consistency
    );
    
    // Sync dashboard stats
    await syncDashboardStats();
    
    return true;
  } catch (error) {
    console.error(`Error toggling deadline status for ID ${id}:`, error);
    return false;
  }
};

// Add a new deadline (creates a calendar event with type=deadline)
export const addDeadline = async (deadline: Omit<DeadlineItem, 'id'>): Promise<DeadlineItem> => {
  try {
    // Convert DeadlineItem to CalendarEvent format
    const calendarEvent = {
      title: deadline.task,
      date: deadline.date,
      type: 'deadline',
      className: `deadline deadline-${deadline.category} priority-${deadline.priority}`,
      description: '',
      completed: deadline.completed,
      isAllDay: true
    };
    
    console.log('Creating new deadline event:', calendarEvent);
    
    // Create the event
    const response = await api.post('/calendar', calendarEvent);
    const newEvent = response.data.data;
    
    console.log('New deadline created:', newEvent);
    
    // Log this activity
    await logActivity(`Added new ${deadline.category} task: ${deadline.task}`, 
      'deadline',  // Use 'deadline' icon type for consistency
      `Due date: ${deadline.date}, Priority: ${deadline.priority}`
    );
    
    // Sync dashboard stats
    await syncDashboardStats();
    
    // Return in DeadlineItem format
    return {
      id: newEvent._id,
      task: newEvent.title,
      date: newEvent.date,
      completed: newEvent.completed || false,
      category: deadline.category,
      priority: deadline.priority
    };
  } catch (error) {
    console.error('Error adding deadline:', error);
    throw error;
  }
};

// Delete a deadline (deletes the calendar event)
export const deleteDeadline = async (id: string): Promise<boolean> => {
  try {
    await api.delete(`/calendar/${id}`);
    
    // Sync dashboard stats
    await syncDashboardStats();
    
    return true;
  } catch (error) {
    console.error(`Error deleting deadline with ID ${id}:`, error);
    return false;
  }
};

// A client-side in-memory store for recent activities
// This will persist during the current session only
let recentActivitiesStore: ActivityItem[] = [];

// Clear all stored activities - useful at initialization
export const clearActivityStore = (): void => {
  console.log('Clearing activity store');
  recentActivitiesStore = [];
};

// Log an activity
export const logActivity = async (
  activity: string, 
  icon: ActivityItem['icon'] = 'other', 
  details?: string
): Promise<ActivityItem> => {
  try {
    // Create a new activity
    const newActivity = {
      id: `activity_${Date.now()}`,
      activity,
      date: new Date().toISOString(),
      icon,
      details
    };
    
    // Store in the client-side store (limit to 50 activities)
    recentActivitiesStore = [newActivity, ...recentActivitiesStore].slice(0, 50);
    console.log('Activity logged:', newActivity);
    
    return newActivity;
  } catch (error) {
    console.error('Error logging activity:', error);
    throw error;
  }
};

// Get recent activities based on user actions
export const getRecentActivities = async (): Promise<ActivityItem[]> => {
  try {
    const activities: ActivityItem[] = [];
    console.log('Getting recent activities...');
    
    // Include activities from our client-side store, but filter out initialization and sync activities
    const relevantActivities = recentActivitiesStore.filter(activity => {
      // Skip system activities like initialization and sync
      const isSystemActivity = 
        activity.activity.toLowerCase().includes('initialized') || 
        activity.activity.toLowerCase().includes('synced') ||
        activity.activity.toLowerCase().includes('refreshed') ||
        activity.activity.toLowerCase().includes('dashboard');
      
      // Only keep user actions
      return !isSystemActivity;
    });
    
    // Format activities to ensure they start with an action verb
    const formattedActivities = relevantActivities.map(activity => {
      let updatedActivity = activity.activity;
      
      // Ensure activity starts with action verb if it doesn't already
      const actionVerbs = ['added', 'created', 'deleted', 'edited', 'completed', 'reopened', 'graded'];
      const startsWithVerb = actionVerbs.some(verb => 
        updatedActivity.toLowerCase().startsWith(verb)
      );
      
      if (!startsWithVerb) {
        // Try to infer the verb from context
        if (updatedActivity.toLowerCase().includes('task')) {
          updatedActivity = `Added ${updatedActivity}`;
        } else if (updatedActivity.toLowerCase().includes('plan')) {
          updatedActivity = `Created ${updatedActivity}`;
        } else {
          updatedActivity = `Created ${updatedActivity}`;
        }
      }
      
      // Capitalize first letter
      updatedActivity = updatedActivity.charAt(0).toUpperCase() + updatedActivity.slice(1);
      
      return {
        ...activity,
        activity: updatedActivity
      };
    });
    
    activities.push(...formattedActivities);
    
    // Try to get lesson plans and create activities for them
    try {
      const lessonsResponse = await api.get('/lesson-plans');
      if (lessonsResponse.data && lessonsResponse.data.data) {
        console.log('Found lesson plans:', lessonsResponse.data.data.length);
        lessonsResponse.data.data.slice(0, 5).forEach((lesson: any) => {
          activities.push({
            id: `lesson_${lesson._id}`,
            activity: `Created lesson plan: ${lesson.title}`,
            date: lesson.createdAt || lesson.updatedAt || new Date().toISOString(),
            icon: 'lesson'
          });
        });
      }
    } catch (error) {
      console.error('Error fetching lesson plans for activities:', error);
    }
    
    // Try to get assignments and create activities for them
    try {
      const assignmentsResponse = await api.get('/assignments');
      if (assignmentsResponse.data && assignmentsResponse.data.data) {
        console.log('Found assignments:', assignmentsResponse.data.data.length);
        
        // Process all assignments (both new and graded)
        assignmentsResponse.data.data.slice(0, 10).forEach((assignment: any) => {
          // Add a "Created assignment" activity for all assignments
          activities.push({
            id: `assignment_created_${assignment._id}`,
            activity: `Created assignment: ${assignment.title}`,
            date: assignment.createdAt || new Date().toISOString(),
            icon: 'grade'
          });
          
          // Add a "Graded assignment" activity for graded assignments
          if (assignment.status === 'graded') {
            activities.push({
              id: `assignment_graded_${assignment._id}`,
              activity: `Graded assignment: ${assignment.title}`,
              date: assignment.updatedAt || new Date().toISOString(),
              icon: 'grade'
            });
          }
        });
      }
    } catch (error) {
      console.error('Error fetching assignments for activities:', error);
    }
    
    // Try to get resources and create activities for them
    try {
      const resourcesResponse = await api.get('/resources');
      if (resourcesResponse.data && resourcesResponse.data.data) {
        console.log('Found resources:', resourcesResponse.data.data.length);
        resourcesResponse.data.data.slice(0, 3).forEach((resource: any) => {
          activities.push({
            id: `resource_${resource._id}`,
            activity: `Added resource: ${resource.title}`,
            date: resource.createdAt || resource.dateAdded || new Date().toISOString(),
            icon: 'resource'
          });
        });
      }
    } catch (error) {
      console.error('Error fetching resources for activities:', error);
    }
    
    // Try to get calendar events and create activities for them
    try {
      const eventsResponse = await api.get('/calendar');
      if (eventsResponse.data && eventsResponse.data.data) {
        console.log('Found calendar events:', eventsResponse.data.data.length);
        // Only use the most recent events
        eventsResponse.data.data
          .sort((a: any, b: any) => {
            return new Date(b.createdAt || b.date).getTime() - 
                   new Date(a.createdAt || a.date).getTime();
          })
          .slice(0, 3)
          .forEach((event: any) => {
            // Determine event type and corresponding icon
            let eventType: string;
            let iconType: ActivityItem['icon'];
            
            if (event.type === 'deadline') {
              eventType = 'deadline';
              iconType = 'deadline';
            } else if (event.type === 'meeting') {
              eventType = 'meeting';
              iconType = 'meeting';
            } else if (event.type === 'lesson') {
              eventType = 'lesson';
              iconType = 'lesson';
            } else {
              eventType = event.type || 'event';
              iconType = 'other';
            }
            
            activities.push({
              id: `event_${event._id}`,
              activity: `Added ${eventType}: ${event.title}`,
              date: event.createdAt || event.date || new Date().toISOString(),
              icon: iconType
            });
          });
      }
    } catch (error) {
      console.error('Error fetching calendar events for activities:', error);
    }
    
    // Sort by date (most recent first) and remove duplicates
    const sortedActivities = activities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      // Filter out duplicates by id
      .filter((activity, index, self) => 
        index === self.findIndex(a => a.id === activity.id)
      );
    
    console.log('Total activities found:', sortedActivities.length);
    return sortedActivities;
  } catch (error) {
    console.error('Error getting recent activities:', error);
    // Return only the relevant activities from the store
    return recentActivitiesStore.filter(activity => {
      // Skip system activities like initialization and sync
      return !activity.activity.toLowerCase().includes('initialized') && 
             !activity.activity.toLowerCase().includes('synced') &&
             !activity.activity.toLowerCase().includes('refreshed') &&
             !activity.activity.toLowerCase().includes('dashboard');
    });
  }
};

// Sync dashboard with database data
export const initializeSampleData = async (): Promise<void> => {
  try {
    console.log('Dashboard data initialization skipped - using real data only');
    // Only sync stats from existing actual data with explicit flags
    await api.put('/dashboard/sync', { noMockData: true, useRealDataOnly: true });
  } catch (error) {
    console.error('Error initializing dashboard data:', error);
  }
};

// Reset dashboard data for testing/development
export const resetDashboardData = async (): Promise<void> => {
  try {
    // Reset dashboard stats
    const defaultStats = {
      lessonsCreated: 0,
      assignmentsGraded: 0,
      assignmentsCreated: 0,
      upcomingEvents: 0,
      resourcesUsed: 0,
      weeklyProgress: 0
    };
    
    // Reset through the dashboard/sync endpoint with zero counts
    await api.put('/dashboard/sync', { forceReset: true });
    
    // Force set each stat to zero explicitly
    await api.put('/dashboard/lessonsCreated', { value: 0 });
    await api.put('/dashboard/assignmentsGraded', { value: 0 });
    await api.put('/dashboard/assignmentsCreated', { value: 0 });
    await api.put('/dashboard/upcomingEvents', { value: 0 });
    await api.put('/dashboard/resourcesUsed', { value: 0 });
    await api.put('/dashboard/weeklyProgress', { value: 0 });
    
    // Delete all calendar events (which includes deadlines)
    try {
      const events = await api.get('/calendar');
      if (events.data && events.data.data) {
        for (const event of events.data.data) {
          await api.delete(`/calendar/${event._id}`);
        }
      }
    } catch (error) {
      console.error('Error deleting calendar events:', error);
    }
    
    // Delete all lesson plans
    try {
      const lessons = await api.get('/lesson-plans');
      if (lessons.data && lessons.data.data) {
        for (const lesson of lessons.data.data) {
          await api.delete(`/lesson-plans/${lesson._id}`);
        }
      }
    } catch (error) {
      console.error('Error deleting lesson plans:', error);
    }
    
    // Delete all assignments
    try {
      const assignments = await api.get('/assignments');
      if (assignments.data && assignments.data.data) {
        for (const assignment of assignments.data.data) {
          await api.delete(`/assignments/${assignment._id}`);
        }
      }
    } catch (error) {
      console.error('Error deleting assignments:', error);
    }
    
    // Delete all resources
    try {
      const resources = await api.get('/resources');
      if (resources.data && resources.data.data) {
        for (const resource of resources.data.data) {
          await api.delete(`/resources/${resource._id}`);
        }
      }
    } catch (error) {
      console.error('Error deleting resources:', error);
    }
    
    console.log('Dashboard data has been reset completely');
  } catch (error) {
    console.error('Error resetting dashboard data:', error);
    throw error;
  }
};

// Manually refresh dashboard stats without clearing data
export const refreshDashboard = async (): Promise<void> => {
  try {
    console.log('Manually refreshing dashboard data...');
    // Explicitly tell backend not to use mock data
    await api.put('/dashboard/sync', { noMockData: true, useRealDataOnly: true });
    console.log('Dashboard refresh completed');
  } catch (error) {
    console.error('Error refreshing dashboard data:', error);
  }
};

// Get progress breakdown - calculated from deadline status
export const getProgressBreakdown = async (): Promise<{[key: string]: number}> => {
  try {
    const deadlines = await getUpcomingDeadlines();
    const today = new Date();
    
    // Calculate counts
    const progress = {
      completed: 0,
      inProgress: 0,
      overdue: 0,
      upcoming: 0
    };
    
    deadlines.forEach(deadline => {
      const deadlineDate = new Date(deadline.date);
      
      if (deadline.completed) {
        progress.completed++;
      } else if (deadlineDate < today) {
        progress.overdue++;
      } else if (deadline.priority === 'high') {
        progress.inProgress++;
      } else {
        progress.upcoming++;
      }
    });
    
    // Update weekly progress percentage
    const total = progress.completed + progress.inProgress + progress.overdue + progress.upcoming;
    if (total > 0) {
      const weeklyProgress = Math.round((progress.completed / total) * 100);
      await updateDashboardStat('weeklyProgress', weeklyProgress);
    }
    
    return progress;
  } catch (error) {
    console.error('Error getting progress breakdown:', error);
    return {
      completed: 0,
      inProgress: 0,
      overdue: 0,
      upcoming: 0
    };
  }
};
