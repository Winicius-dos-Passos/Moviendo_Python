import api from './api';

export const obrasService = {
  getAll: async (params = {}) => {
    const response = await api.get('/obras', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/obras/${id}`);
    return response.data;
  },

  create: async (obraData) => {
    const response = await api.post('/obras', obraData);
    return response.data;
  },

  update: async (id, obraData) => {
    const response = await api.put(`/obras/${id}`, obraData);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/obras/${id}`);
  },

  getByStatus: async (status) => {
    const response = await api.get('/obras', {
      params: { status }
    });
    return response.data;
  },

  getByTipo: async (tipo) => {
    const response = await api.get('/obras', {
      params: { tipo }
    });
    return response.data;
  },
};

export default obrasService;
