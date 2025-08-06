import { incrementDashboardStat, updateDashboardStat, getDashboardStats, syncDashboardStats } from './dashboardService';

/**
 * ConnectorService
 * 
 * This service acts as a bridge between different modules and the dashboard.
 * It ensures that actions in one module (e.g., creating a lesson plan) update 
 * the relevant dashboard statistics.
 */

// Lesson Planner connections
export const trackLessonCreation = async (): Promise<void> => {
  try {
    await incrementDashboardStat('lessonsCreated');
  } catch (error) {
    console.error('Error tracking lesson creation:', error);
  }
};

// Grading connections
export const trackAssignmentGraded = async (): Promise<void> => {
  try {
    await incrementDashboardStat('assignmentsGraded');
  } catch (error) {
    console.error('Error tracking assignment graded:', error);
  }
};

// Track new assignment creation
export const trackAssignmentCreation = async (): Promise<void> => {
  try {
    // Create a specific counter for assignments created instead of using the graded one
    await incrementDashboardStat('assignmentsCreated');
    console.log('Assignment creation tracked in dashboard');
  } catch (error) {
    console.error('Error tracking assignment creation:', error);
  }
};

// Resource connections
export const trackResourceUsed = async (): Promise<void> => {
  try {
    await incrementDashboardStat('resourcesUsed');
  } catch (error) {
    console.error('Error tracking resource used:', error);
  }
};

// Calendar connections
export const syncCalendarWithDashboard = async (): Promise<void> => {
  try {
    // This is now handled by the dashboard/sync endpoint
    await syncDashboardStats();
  } catch (error) {
    console.error('Error syncing calendar with dashboard:', error);
  }
};

// Initialize dashboard stats if not already set
export const initializeDashboardStats = async (): Promise<void> => {
  try {
    // Sync all stats from the database
    await syncDashboardStats();
  } catch (error) {
    console.error('Error initializing dashboard stats:', error);
  }
};

// Call initialization when the service is loaded
initializeDashboardStats(); 