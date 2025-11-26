import api from './api';

export const generosService = {
  getAll: async () => {
    const response = await api.get('/genero');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/genero/${id}`);
    return response.data;
  },

  create: async (genero) => {
    const response = await api.post('/genero', genero);
    return response.data;
  },
};

export default generosService;
