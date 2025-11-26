import api from './api';

export const plataformasService = {
  getAll: async () => {
    const response = await api.get('/plataformas');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/plataformas/${id}`);
    return response.data;
  },

  create: async (plataforma) => {
    const response = await api.post('/plataformas', plataforma);
    return response.data;
  },
};

export default plataformasService;
