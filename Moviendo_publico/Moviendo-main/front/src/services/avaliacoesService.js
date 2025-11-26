import api from './api';

const avaliacoesService = {
  getAll: async () => {
    const response = await api.get('/avaliacoes');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/avaliacoes/${id}`);
    return response.data;
  },

  getByObraId: async (obraId) => {
    const response = await api.get(`/avaliacoes/obra/${obraId}`);
    return response.data;
  },

  create: async (avaliacaoData) => {
    const response = await api.post('/avaliacoes', avaliacaoData);
    return response.data;
  },

  update: async (id, avaliacaoData) => {
    const response = await api.put(`/avaliacoes/${id}`, avaliacaoData);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/avaliacoes/${id}`);
  },
};

export default avaliacoesService;
