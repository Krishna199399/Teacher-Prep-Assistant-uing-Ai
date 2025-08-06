// Utility script to sync dashboard stats
import { syncDashboardStats, refreshDashboard } from './services/dashboardService';

// Sync dashboard stats
async function syncDashboard() {
  console.log('Syncing dashboard stats...');
  try {
    // Sync dashboard stats with backend
    await syncDashboardStats();
    // Refresh dashboard UI
    await refreshDashboard();
    console.log('Dashboard sync completed successfully');
  } catch (error) {
    console.error('Error syncing dashboard:', error);
  }
}

// Execute sync
syncDashboard(); 