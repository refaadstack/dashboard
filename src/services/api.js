// services/api.js

const API_BASE_URLS = {
  auth: 'http://localhost:5000',
  item: 'http://localhost:3003',
  project: 'http://localhost:3004'
};

// Helper function untuk handle API calls
const apiCall = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Auth Service
export const authService = {
  // Contoh function untuk get token atau validate auth
  getToken: () => localStorage.getItem('token'),
  
  login: async (credentials) => {
    return await apiCall(`${API_BASE_URLS.auth}/api/auth/login`, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
  
  validateToken: async () => {
    return await apiCall(`${API_BASE_URLS.auth}/api/auth/validate`, {
      headers: {
        'Authorization': `Bearer ${authService.getToken()}`
      }
    });
  }
};

// Project Service
export const projectService = {
  getAllProjects: async () => {
    return await apiCall(`${API_BASE_URLS.project}/api/projects`);
  },
  
  getProjectById: async (id) => {
    return await apiCall(`${API_BASE_URLS.project}/api/projects/${id}`);
  },
  
  // Get project details with items
  getProjectDetails: async (id) => {
    return await apiCall(`${API_BASE_URLS.project}/api/projects/${id}/details`);
  },
  
  // Get projects stats
  getProjectsStats: async () => {
    return await apiCall(`${API_BASE_URLS.project}/api/projects/stats/summary`);
  },
  
  createProject: async (projectData) => {
    return await apiCall(`${API_BASE_URLS.project}/api/projects`, {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  },
  
  updateProject: async (id, projectData) => {
    return await apiCall(`${API_BASE_URLS.project}/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  },
  
  deleteProject: async (id) => {
    return await apiCall(`${API_BASE_URLS.project}/api/projects/${id}`, {
      method: 'DELETE',
    });
  },
  
  bulkDeleteProjects: async (projectIds) => {
    return await apiCall(`${API_BASE_URLS.project}/api/projects`, {
      method: 'DELETE',
      body: JSON.stringify({ ids: projectIds }),
    });
  },
  
  // Project Items Management
  addItemToProject: async (projectId, itemData) => {
    return await apiCall(`${API_BASE_URLS.project}/api/projects/${projectId}/items`, {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  },
  
  updateProjectItem: async (projectId, itemId, itemData) => {
    return await apiCall(`${API_BASE_URLS.project}/api/projects/${projectId}/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(itemData),
    });
  },
  
  removeItemFromProject: async (projectId, itemId) => {
    return await apiCall(`${API_BASE_URLS.project}/api/projects/${projectId}/items/${itemId}`, {
      method: 'DELETE',
    });
  }
};

// Item Service
export const itemService = {
  getAllItems: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    // Add pagination, search, and sorting parameters
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.search) queryParams.append('search', params.search);
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.order) queryParams.append('order', params.order);
    
    const queryString = queryParams.toString();
    const url = `${API_BASE_URLS.item}/api/items${queryString ? `?${queryString}` : ''}`;
    
    return await apiCall(url);
  },
  
  getItemsByIds: async (ids) => {
    const idsString = Array.isArray(ids) ? ids.join(',') : ids;
    return await apiCall(`${API_BASE_URLS.item}/api/items/bulk?ids=${idsString}`);
  },
  
  getItemsStats: async () => {
    return await apiCall(`${API_BASE_URLS.item}/api/items/stats/summary`);
  },
  
  getItemById: async (id) => {
    return await apiCall(`${API_BASE_URLS.item}/api/items/${id}`);
  },
  
  createItem: async (itemData) => {
    return await apiCall(`${API_BASE_URLS.item}/api/items`, {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  },
  
  updateItem: async (id, itemData) => {
    return await apiCall(`${API_BASE_URLS.item}/api/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(itemData),
    });
  },
  
  deleteItem: async (id) => {
    return await apiCall(`${API_BASE_URLS.item}/api/items/${id}`, {
      method: 'DELETE',
    });
  },
  
  bulkDeleteItems: async (itemIds) => {
    return await apiCall(`${API_BASE_URLS.item}/api/items`, {
      method: 'DELETE',
      body: JSON.stringify({ ids: itemIds }),
    });
  }
};