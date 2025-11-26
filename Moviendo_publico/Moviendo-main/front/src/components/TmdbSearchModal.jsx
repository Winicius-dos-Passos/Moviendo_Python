import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Film, Tv, Star, Calendar, Loader2, Plus, Check } from 'lucide-react';
import tmdbService from '../services/tmdbService';
import toast from 'react-hot-toast';

const TmdbSearchModal = ({ isOpen, onClose, onSelect, onCreateGenero, onCreateDiretor, existingGeneros = [], existingDiretores = [] }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedDetails, setSelectedDetails] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const data = await tmdbService.search(query);
      const filtered = data.results.filter(r => r.media_type === 'movie' || r.media_type === 'tv');
      setResults(filtered);
    } catch (error) {
      console.error('Erro ao buscar no TMDB:', error);
      toast.error('Erro ao buscar filmes/séries');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectItem = async (item) => {
    setSelectedItem(item.id);
    try {
      let details;
      if (item.media_type === 'movie') {
        details = await tmdbService.getMovieDetails(item.id);
      } else {
        details = await tmdbService.getTvDetails(item.id);
      }
      
      setSelectedDetails({
        ...details,
        media_type: item.media_type
      });
      setResults([]);
      setQuery('');
    } catch (error) {
      toast.error('Erro ao buscar detalhes');
    } finally {
      setSelectedItem(null);
    }
  };

  const handleConfirmImport = () => {
    const details = selectedDetails;
    const mappedData = {
      titulo: details.media_type === 'movie' ? details.title : details.name,
      sinopse: details.overview || '',
      anoLancamento: details.media_type === 'movie' 
        ? (details.release_date ? parseInt(details.release_date.split('-')[0]) : null)
        : (details.first_air_date ? parseInt(details.first_air_date.split('-')[0]) : null),
      duracaoMinutos: details.media_type === 'movie' 
        ? details.runtime 
        : (details.episode_run_time && details.episode_run_time.length > 0 ? details.episode_run_time[0] : null),
      urlCapa: tmdbService.buildPosterUrl(details.poster_path, 'w500'),
      tipo: details.media_type === 'movie' ? 'FILME' : 'SERIE',
      notaImdb: details.vote_average ? parseFloat(details.vote_average.toFixed(1)) : null,
      totalTemporadas: details.media_type === 'tv' ? details.number_of_seasons : null,
      totalEpisodios: details.media_type === 'tv' ? details.number_of_episodes : null,
      generos: details.genres?.map(g => g.name) || [],
      diretores: details.media_type === 'movie' 
        ? (details.credits?.crew?.filter(c => c.job === 'Director').map(d => d.name) || [])
        : (details.created_by?.map(c => c.name) || [])
    };
    
    onSelect(mappedData);
    onClose();
    setSelectedDetails(null);
    toast.success('Dados importados do TMDB!');
  };

  const handleCreateGenero = async (nome) => {
    try {
      await onCreateGenero(nome);
    } catch (error) {
      toast.error('Erro ao criar gênero');
    }
  };

  const handleCreateDiretor = async (nome) => {
    try {
      await onCreateDiretor(nome);
    } catch (error) {
      toast.error('Erro ao criar diretor');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-purple-900/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Search className="w-6 h-6 text-purple-500" />
            Buscar no TMDB
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Digite o título do filme ou série..."
            className="bg-gray-800 border-gray-700 text-white flex-1"
            autoFocus
          />
          <Button 
            type="submit" 
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </form>

        {selectedDetails && (
          <div className="space-y-4 bg-gray-800/50 rounded-lg p-4 border border-purple-500/30">
            <div className="flex items-start gap-4">
              <img 
                src={tmdbService.buildPosterUrl(selectedDetails.poster_path, 'w200')} 
                alt={selectedDetails.title || selectedDetails.name}
                className="w-24 h-36 object-cover rounded"
              />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">
                  {selectedDetails.title || selectedDetails.name}
                </h3>
                <p className="text-gray-400 text-sm line-clamp-3 mb-3">
                  {selectedDetails.overview}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-semibold text-purple-400 mb-2">Gêneros do TMDB:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDetails.genres?.map((genre) => {
                    const exists = existingGeneros.some(g => (g.nome || g.name)?.toLowerCase() === genre.name.toLowerCase());
                    return (
                      <button
                        key={genre.id}
                        onClick={() => !exists && handleCreateGenero(genre.name)}
                        disabled={exists}
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${exists ? 'bg-green-700/30 text-green-300 cursor-not-allowed' : 'bg-gray-700 hover:bg-purple-600 text-white'}`}
                      >
                        {exists ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                        {genre.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedDetails.media_type === 'movie' && selectedDetails.credits?.crew && (
                <div>
                  <h4 className="text-sm font-semibold text-purple-400 mb-2">Diretores do TMDB:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedDetails.credits.crew
                      .filter(c => c.job === 'Director')
                      .map((director, idx) => {
                        const exists = existingDiretores.some(d => (d.nome || d.name)?.toLowerCase() === director.name.toLowerCase());
                        return (
                          <button
                            key={idx}
                            onClick={() => !exists && handleCreateDiretor(director.name)}
                            disabled={exists}
                            className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${exists ? 'bg-green-700/30 text-green-300 cursor-not-allowed' : 'bg-gray-700 hover:bg-purple-600 text-white'}`}
                          >
                            {exists ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                            {director.name}
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}

              {selectedDetails.media_type === 'tv' && selectedDetails.created_by && (
                <div>
                  <h4 className="text-sm font-semibold text-purple-400 mb-2">Criadores do TMDB:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedDetails.created_by.map((creator) => {
                      const exists = existingDiretores.some(d => (d.nome || d.name)?.toLowerCase() === creator.name.toLowerCase());
                      return (
                        <button
                          key={creator.id}
                          onClick={() => !exists && handleCreateDiretor(creator.name)}
                          disabled={exists}
                          className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${exists ? 'bg-green-700/30 text-green-300 cursor-not-allowed' : 'bg-gray-700 hover:bg-purple-600 text-white'}`}
                        >
                          {exists ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                          {creator.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-3 border-t border-gray-700">
              <Button
                onClick={() => setSelectedDetails(null)}
                variant="outline"
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
              >
                Voltar
              </Button>
              <Button
                onClick={handleConfirmImport}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                Importar Dados
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {!selectedDetails && results.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-400">
              <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Busque por filmes ou séries</p>
            </div>
          )}

          {results.map((item) => {
            const title = item.media_type === 'movie' ? item.title : item.name;
            const date = item.media_type === 'movie' ? item.release_date : item.first_air_date;
            const year = date ? date.split('-')[0] : '';
            const posterUrl = tmdbService.buildPosterUrl(item.poster_path, 'w200');

            return (
              <div
                key={item.id}
                className="flex gap-4 bg-gray-800/50 rounded-lg p-3 hover:bg-gray-800 transition-colors cursor-pointer border border-gray-700 hover:border-purple-500"
                onClick={() => handleSelectItem(item)}
              >
                <div className="w-16 h-24 bg-gray-900 rounded overflow-hidden flex-shrink-0">
                  {posterUrl ? (
                    <img src={posterUrl} alt={title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {item.media_type === 'tv' ? (
                        <Tv className="w-8 h-8 text-gray-600" />
                      ) : (
                        <Film className="w-8 h-8 text-gray-600" />
                      )}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-lg mb-1 truncate">{title}</h3>
                  <div className="flex items-center gap-3 text-sm text-gray-400 mb-2">
                    {year && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{year}</span>
                      </div>
                    )}
                    {item.vote_averagze > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-yellow-400 font-medium">{item.vote_average.toFixed(1)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      {item.media_type === 'tv' ? (
                        <Tv className="w-4 h-4 text-purple-400" />
                      ) : (
                        <Film className="w-4 h-4 text-purple-400" />
                      )}
                      <span className="text-purple-400">{item.media_type === 'tv' ? 'Série' : 'Filme'}</span>
                    </div>
                  </div>
                  {item.overview && (
                    <p className="text-gray-400 text-sm line-clamp-2">{item.overview}</p>
                  )}
                </div>

                {selectedItem === item.id && (
                  <div className="flex items-center">
                    <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TmdbSearchModal;
