import api from './api';
import { trackAssignmentGraded, trackAssignmentCreation } from './connectorService';

export interface Assignment {
  id?: string;
  _id?: string;
  title: string;
  subject: string;
  gradeLevel: string;
  dueDate?: string;
  totalPoints: number;
  status: 'pending' | 'graded' | 'returned';
  studentCount: number;
  averageScore?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Get all graded assignments
export const getGradedAssignments = async (): Promise<Assignment[]> => {
  try {
    const response = await api.get('/assignments');
    // Map the backend _id to id for frontend consistency
    return response.data.data.map((assignment: any) => ({
      ...assignment,
      id: assignment._id
    }));
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return [];
  }
};

// Get a single assignment by ID
export const getAssignmentById = async (id: string): Promise<Assignment | null> => {
  try {
    const response = await api.get(`/assignments/${id}`);
    const assignment = response.data.data;
    return {
      ...assignment,
      id: assignment._id
    };
  } catch (error) {
    console.error(`Error fetching assignment with ID ${id}:`, error);
    return null;
  }
};

// Create a new assignment
export const createAssignment = async (
  assignment: Omit<Assignment, 'id' | '_id' | 'createdAt' | 'updatedAt'>
): Promise<Assignment> => {
  try {
    const response = await api.post('/assignments', assignment);
    const newAssignment = response.data.data;
    
    // Track the assignment creation in dashboard
    await trackAssignmentCreation();
    console.log('New assignment tracked in dashboard:', newAssignment.title);
    
    return {
      ...newAssignment,
      id: newAssignment._id
    };
  } catch (error) {
    console.error('Error creating assignment:', error);
    throw error;
  }
};

// Update an existing assignment
export const updateAssignment = async (
  id: string,
  updates: Partial<Assignment>
): Promise<Assignment | null> => {
  try {
    // Remove id from updates to avoid conflicts with _id
    const { id: _, _id, createdAt, updatedAt, ...updateData } = updates;
    
    const response = await api.put(`/assignments/${id}`, updateData);
    const updatedAssignment = response.data.data;
    
    // If status changed to graded, track it
    if (updates.status === 'graded') {
      await trackAssignmentGraded();
    }
    
    return {
      ...updatedAssignment,
      id: updatedAssignment._id
    };
  } catch (error) {
    console.error(`Error updating assignment with ID ${id}:`, error);
    return null;
  }
};

// Grade an assignment (special update case)
export const gradeAssignment = async (id: string, averageScore: number): Promise<Assignment | null> => {
  return updateAssignment(id, { 
    status: 'graded', 
    averageScore 
  });
};

// Delete an assignment
export const deleteAssignment = async (id: string): Promise<boolean> => {
  try {
    await api.delete(`/assignments/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting assignment with ID ${id}:`, error);
    return false;
  }
}; 