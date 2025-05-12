import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/token/refresh/`, {
            refresh: refreshToken,
          });
          
          localStorage.setItem('token', response.data.access);
          
          originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;
          
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export const authService = {
  register: (username, email, password) => {
    return api.post('/register/', { username, email, password });
  },
  login: (username, password) => {
    return api.post('/token/', { username, password });
  },
};

export const projectService = {
  getAllProjects: () => {
    return api.get('/projects/');
  },
  getProject: (id) => {
    return api.get(`/projects/${id}/`);
  },
  createProject: (data) => {
    return api.post('/projects/', data);
  },
  deleteProject: (id) => {
    return api.delete(`/projects/${id}/`);
  },
};

export const taskService = {
  getProjectTasks: (projectId, status = null) => {
    let url = `/tasks/?project=${projectId}`;
    if (status) {
      url += `&status=${status}`;
    }
    return api.get(url);
  },
  getAllTasks: () => {
    return api.get('/tasks/');
  },
  createTask: (data) => {
    return api.post('/tasks/', data);
  },
  updateTask: (id, data) => {
    return api.patch(`/tasks/${id}/`, data);
  },
  deleteTask: (id) => {
    return api.delete(`/tasks/${id}/`);
  },
};

export default api;