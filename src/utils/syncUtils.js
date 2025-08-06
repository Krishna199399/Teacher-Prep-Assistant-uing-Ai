import axios from 'axios';

// Direct sync API call without any middleware
export const directSyncCall = async () => {
  try {
    const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    
    console.log('Making direct API call to:', `${baseURL}/dashboard/sync`);
    
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // Create headers with authorization
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      'X-No-Mock-Data': 'true' // Add a custom header to signal no mock data
    };
    
    console.log('Using headers with X-No-Mock-Data:', headers);
    
    // Make direct call with multiple flags to ensure we don't get mock data
    const response = await axios.put(`${baseURL}/dashboard/sync`, 
      { 
        noMockData: true, 
        useRealDataOnly: true, 
        forceRealData: true, 
        preventMockData: true, 
        timestamp: Date.now() // Add timestamp to prevent caching
      },
      { headers }
    );
    
    console.log('Direct sync response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Direct sync error:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};

// Get auth details for debugging
export const getAuthDetails = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  return {
    hasToken: !!token,
    tokenPreview: token ? `${token.substring(0, 10)}...` : null,
    user: user ? JSON.parse(user) : null
  };
}; 