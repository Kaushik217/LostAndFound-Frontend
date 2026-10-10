import axios from 'axios';

const API_URL = 'http://localhost:5117/api/auth';

export const loginUser = async (email, password) => {
  try{
    const response = await axios.post(`${API_URL}/login`, { email, password });

    //Save Token and User Info in Local Storage.
    if(response.data && response.data.token){
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  } catch (error) {
    if(error.response && error.response.data && error.response.data.message){
      throw new Error(error.response.data.message);
    }
    throw new Error('Server Connection Failed. Please try again later.');
  }
};

export const registerUser = async (name, email, password, confirmPassword) => {
  try {
    const response = await axios.post(`${API_URL}/register`, {
      name,
      email,
      password,
      confirmPassword,
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Registration failed. Please try again.');
  }
};

export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};