import api from './api';

const tmdbService = {
  search: async (query, page = 1) => {
    const response = await api.get('/tmdb/search', {
      params: { query, page }
    });
    return response.data;
  },

  getMovieDetails: async (tmdbId) => {
    const response = await api.get(`/tmdb/movie/${tmdbId}`);
    return response.data;
  },

  getTvDetails: async (tmdbId) => {
    const response = await api.get(`/tmdb/tv/${tmdbId}`);
    return response.data;
  },

  buildPosterUrl: (path, size = 'w500') => {
    if (!path) return null;
    return `https://image.tmdb.org/t/p/${size}${path}`;
  }
};

export default tmdbService;
