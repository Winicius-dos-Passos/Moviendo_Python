import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Film, Plus, Search, Shuffle, Tv, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import listasService from '../services/listasService';
import obrasService from '../services/obrasService';
import ConfirmModal from './ConfirmModal';
import ObraDetailsModal from './ObraDetailsModal';

const ListaObrasModal = ({ isOpen, onClose, lista }) => {
  const [obras, setObras] = useState([]);
  const [todasObras, setTodasObras] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddObras, setShowAddObras] = useState(false);
  const [obraToRemove, setObraToRemove] = useState(null);
  const [selectedRandomObra, setSelectedRandomObra] = useState(null);

  const loadListaObras = useCallback(async () => {
    if (!lista?.id) return;
    try {
      const data = await listasService.getById(lista.id);
      setObras(data.obrasInfo || []);
    } catch (error) {
      console.error('Erro ao carregar obras da lista:', error);
      toast.error('Erro ao carregar obras da lista');
    }
  }, [lista?.id]);

  const loadTodasObras = useCallback(async () => {
    try {
      const data = await obrasService.getAll();
      setTodasObras(data);
    } catch (error) {
      console.error('Erro ao carregar obras:', error);
    }
  }, []);

  useEffect(() => {
    if (isOpen && lista) {
      loadListaObras();
      loadTodasObras();
    }
  }, [isOpen, lista, loadListaObras, loadTodasObras]);

  const handleAddObra = async (obraId) => {
    setLoading(true);
    try {
      await listasService.addObra(lista.id, obraId);
      toast.success('Obra adicionada à lista!');
      loadListaObras();
    } catch (error) {
      console.error('Erro ao adicionar obra:', error);
      toast.error(error.response?.data?.message || 'Erro ao adicionar obra');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveObra = async () => {
    if (!obraToRemove) return;
    setLoading(true);
    try {
      await listasService.removeObra(lista.id, obraToRemove.id);
      toast.success('Obra removida da lista!');
      loadListaObras();
      setObraToRemove(null);
    } catch (error) {
      console.error('Erro ao remover obra:', error);
      toast.error('Erro ao remover obra');
    } finally {
      setLoading(false);
    }
  };

  const handleRandomObra = () => {
    if (obras.length === 0) {
      toast.error('Adicione obras à lista primeiro!');
      return;
    }
    const randomIndex = Math.floor(Math.random() * obras.length);
    setSelectedRandomObra(obras[randomIndex]);
  };

  const obrasDisponiveis = todasObras.filter(
    obra => !obras.some(o => o.id === obra.id) &&
            obra.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!lista) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-purple-900/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            {lista.nome}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Gerencie as obras desta lista
          </DialogDescription>
          {lista.descricao && (
            <p className="text-gray-400 text-sm mt-2">{lista.descricao}</p>
          )}
        </DialogHeader>

        <div className="space-y-6 mt-6">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {!showAddObras && (
                <Button
                  onClick={() => setShowAddObras(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Obras
                </Button>
              )}
              {obras.length > 0 && (
                <Button
                  onClick={handleRandomObra}
                  variant="outline"
                  className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
                >
                  <Shuffle className="w-4 h-4 mr-2" />
                  Escolher Aleatório
                </Button>
              )}
            </div>
          </div>
          {showAddObras && (
            <div className="border border-gray-800 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-white">Adicionar Obras</h3>
                <Button
                  onClick={() => setShowAddObras(false)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar obras para adicionar..."
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                />
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2">
                {obrasDisponiveis.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">
                    {searchTerm ? 'Nenhuma obra encontrada' : 'Todas as obras já estão na lista'}
                  </p>
                ) : (
                  obrasDisponiveis.map(obra => (
                    <div
                      key={obra.id}
                      className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="text-white font-medium">{obra.titulo}</p>
                          {obra.anoLancamento && (
                            <p className="text-gray-400 text-sm">{obra.anoLancamento}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        onClick={() => handleAddObra(obra.id)}
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700"
                        disabled={loading}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="space-y-3">
            {obras.length === 0 ? (
              <div className="text-center py-12">
                <Film className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Nenhuma obra nesta lista ainda</p>
                <p className="text-gray-500 text-sm mt-2">
                  Clique em Adicionar Obras para começar
                </p>
              </div>
            ) : (
              obras.map(obra => (
                <div
                  key={obra.id}
                  className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors group cursor-pointer"
                  onClick={() => setSelectedRandomObra(obra)}
                >
                  <div className="flex items-center gap-4">
                    {obra.urlCapa && (
                      <img
                        src={obra.urlCapa}
                        alt={obra.titulo}
                        className="w-16 h-24 object-cover rounded"
                      />
                    )}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {obra.tipo === 'FILME' ? (
                          <Film className="w-4 h-4 text-purple-400" />
                        ) : (
                          <Tv className="w-4 h-4 text-purple-400" />
                        )}
                        <h4 className="text-white font-semibold">{obra.titulo}</h4>
                      </div>
                      {obra.anoLancamento && (
                        <p className="text-gray-400 text-sm">{obra.anoLancamento}</p>
                      )}
                      {obra.generos && obra.generos.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {obra.generos.slice(0, 3).map(genero => (
                            <Badge
                              key={genero.id}
                              variant="outline"
                              className="text-xs border-purple-500 text-purple-300"
                            >
                              {genero.nome}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => setObraToRemove(obra)}
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity"
                    disabled={loading}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>

      <ConfirmModal
        isOpen={!!obraToRemove}
        onClose={() => setObraToRemove(null)}
        onConfirm={handleRemoveObra}
        title="Remover Obra da Lista?"
        description={`Tem certeza que deseja remover "${obraToRemove?.titulo}" desta lista?`}
        confirmText="Remover"
        loading={loading}
      />

      {selectedRandomObra && (
        <ObraDetailsModal
          isOpen={!!selectedRandomObra}
          onClose={() => setSelectedRandomObra(null)}
          obra={selectedRandomObra}
        />
      )}
    </Dialog>
  );
};

export default ListaObrasModal;
