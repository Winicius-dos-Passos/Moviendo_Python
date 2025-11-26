import api from './api';

export const tagsService = {
  getAll: async () => {
    const response = await api.get('/tags');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/tags/${id}`);
    return response.data;
  },

  create: async (tag) => {
    const response = await api.post('/tags', tag);
    return response.data;
  },
};

export default tagsService;
