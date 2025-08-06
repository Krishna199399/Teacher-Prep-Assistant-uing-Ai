import api from './api';
import { trackLessonCreation } from './connectorService';
import { incrementDashboardStat, syncDashboardStats } from './dashboardService';

export interface LessonPlan {
  id?: string;
  _id?: string;
  title: string;
  subject: string;
  gradeLevel: string;
  lessonDate?: string;
  duration?: string;
  objectives: string[];
  materials: string[];
  procedures: string[];
  assessment: string;
  differentiation: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

const STORAGE_KEY = 'lessonPlans';

// Initialize localStorage if needed
const initStorage = (): void => {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  }
};

// Initialize on load
initStorage();

// Get all lesson plans
export const getLessonPlans = async (): Promise<LessonPlan[]> => {
  try {
    const response = await api.get('/lesson-plans');
    // Map the backend _id to id for frontend consistency
    return response.data.data.map((plan: any) => ({
      ...plan,
      id: plan._id
    }));
  } catch (error) {
    console.error('Error fetching lesson plans:', error);
    return [];
  }
};

// Get a single lesson plan by ID
export const getLessonPlanById = async (id: string): Promise<LessonPlan | null> => {
  try {
    const response = await api.get(`/lesson-plans/${id}`);
    const plan = response.data.data;
    return {
      ...plan,
      id: plan._id
    };
  } catch (error) {
    console.error(`Error fetching lesson plan with ID ${id}:`, error);
    return null;
  }
};

// Create a new lesson plan
export const createLessonPlan = async (
  lessonPlan: Omit<LessonPlan, 'id' | '_id' | 'createdAt' | 'updatedAt'>
): Promise<LessonPlan> => {
  try {
    const response = await api.post('/lesson-plans', lessonPlan);
    const newPlan = response.data.data;
    
    // Directly increment dashboard stats and force sync
    try {
      console.log('Incrementing lessons created stat');
      await incrementDashboardStat('lessonsCreated');
      await syncDashboardStats();
      console.log('Dashboard stats updated for new lesson plan');
    } catch (statError) {
      console.error('Error updating dashboard stats:', statError);
    }
    
    // Also try the connector service as a fallback
    try {
      await trackLessonCreation();
    } catch (trackError) {
      console.error('Error in trackLessonCreation:', trackError);
    }
    
    return {
      ...newPlan,
      id: newPlan._id
    };
  } catch (error) {
    console.error('Error creating lesson plan:', error);
    throw error;
  }
};

// Update an existing lesson plan
export const updateLessonPlan = async (
  id: string,
  updates: Partial<LessonPlan>
): Promise<LessonPlan | null> => {
  try {
    // Remove id from updates to avoid conflicts with _id
    const { id: _, _id, createdAt, updatedAt, ...updateData } = updates;
    
    const response = await api.put(`/lesson-plans/${id}`, updateData);
    const updatedPlan = response.data.data;
    
    return {
      ...updatedPlan,
      id: updatedPlan._id
    };
  } catch (error) {
    console.error(`Error updating lesson plan with ID ${id}:`, error);
    return null;
  }
};

// Delete a lesson plan
export const deleteLessonPlan = async (id: string): Promise<boolean> => {
  try {
    await api.delete(`/lesson-plans/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting lesson plan with ID ${id}:`, error);
    return false;
  }
};

// Track lesson creation
export const trackLessonCreationService = async (): Promise<void> => {
  await trackLessonCreation();
}; 