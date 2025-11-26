import api from './api';

export const diretoresService = {
  getAll: async () => {
    const response = await api.get('/diretores');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/diretores/${id}`);
    return response.data;
  },

  create: async (diretor) => {
    const response = await api.post('/diretores', diretor);
    return response.data;
  },

  update: async (id, diretor) => {
    const response = await api.put(`/diretores/${id}`, diretor);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/diretores/${id}`);
  },
};

export default diretoresService;
