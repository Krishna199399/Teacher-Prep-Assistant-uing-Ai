import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    
    // Handle auth errors
    if (response && response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login page if needed
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Auth APIs
export const loginUser = (email: string, password: string) => {
  console.log('Login API call with:', { email });
  return api.post('/auth/login', { email, password });
};

export const registerUser = (name: string, email: string, password: string) => {
  console.log('Register API call with data:', { name, email });
  return api.post('/auth/register', { name, email, password });
};

export const getCurrentUser = () => {
  return api.get('/auth/me');
};

// Lesson Plan APIs
export const getLessonPlans = () => {
  return api.get('/lesson-plans');
};

export const getLessonPlan = (id: string) => {
  return api.get(`/lesson-plans/${id}`);
};

export const createLessonPlan = (lessonPlanData: any) => {
  return api.post('/lesson-plans', lessonPlanData);
};

export const updateLessonPlan = (id: string, lessonPlanData: any) => {
  return api.put(`/lesson-plans/${id}`, lessonPlanData);
};

export const deleteLessonPlan = (id: string) => {
  return api.delete(`/lesson-plans/${id}`);
};

// Resource APIs
export const getResources = (queryParams?: any) => {
  return api.get('/resources', { params: queryParams });
};

export const getResource = (id: string) => {
  return api.get(`/resources/${id}`);
};

export const createResource = (resourceData: any) => {
  return api.post('/resources', resourceData);
};

export const updateResource = (id: string, resourceData: any) => {
  return api.put(`/resources/${id}`, resourceData);
};

export const deleteResource = (id: string) => {
  return api.delete(`/resources/${id}`);
};

// Assignment APIs
export const getAssignments = () => {
  return api.get('/assignments');
};

export const getAssignment = (id: string) => {
  return api.get(`/assignments/${id}`);
};

export const createAssignment = (assignmentData: any) => {
  return api.post('/assignments', assignmentData);
};

export const updateAssignment = (id: string, assignmentData: any) => {
  return api.put(`/assignments/${id}`, assignmentData);
};

export const deleteAssignment = (id: string) => {
  return api.delete(`/assignments/${id}`);
};

export default api; 