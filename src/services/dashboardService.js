import axios from 'axios';

const API_BASE_URL = 'http://localhost:5117/api/dashboard';

export const getDashboardData = async () => {
  try {
    //Take JWT Token from local storage
    const token = localStorage.getItem('token');

    const response = await axios.get(API_BASE_URL, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
  } catch (error) {
    if(error.response && error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
    }
    throw new Error('Failed to fetch dashboard data');
  }
};