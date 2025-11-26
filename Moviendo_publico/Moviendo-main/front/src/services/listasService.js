import api from './api';

export const listasService = {
  getAll: async () => {
    const response = await api.get('/listas');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/listas/${id}`);
    return response.data;
  },

  create: async (lista) => {
    const response = await api.post('/listas', lista);
    return response.data;
  },

  update: async (id, lista) => {
    const response = await api.put(`/listas/${id}`, lista);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/listas/${id}`);
  },

  addObra: async (listaId, obraId) => {
    const response = await api.post(`/listas/${listaId}/obras/${obraId}`);
    return response.data;
  },

  removeObra: async (listaId, obraId) => {
    await api.delete(`/listas/${listaId}/obras/${obraId}`);
  },
};

export default listasService;
