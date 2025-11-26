import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import listasService from '../services/listasService';
import toast from 'react-hot-toast';
import ListaModal from '../components/ListaModal';
import ListaObrasModal from '../components/ListaObrasModal';
import ConfirmModal from '../components/ConfirmModal';

const Lists = () => {
  const [listas, setListas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isObrasModalOpen, setIsObrasModalOpen] = useState(false);
  const [selectedLista, setSelectedLista] = useState(null);
  const [listaToDelete, setListaToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadListas();
  }, []);

  const loadListas = async () => {
    try {
      setLoading(true);
      const data = await listasService.getAll();
      setListas(data);
    } catch (error) {
      console.error('Erro ao carregar listas:', error);
      toast.error('Erro ao carregar listas');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLista = () => {
    setSelectedLista(null);
    setIsModalOpen(true);
  };

  const handleEditLista = (lista) => {
    setSelectedLista(lista);
    setIsModalOpen(true);
  };

  const handleViewObras = (lista) => {
    setSelectedLista(lista);
    setIsObrasModalOpen(true);
  };

  const handleDeleteLista = async () => {
    if (!listaToDelete) return;

    setDeleting(true);
    try {
      await listasService.delete(listaToDelete.id);
      toast.success('Lista excluída com sucesso!');
      loadListas();
      setListaToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir lista:', error);
      toast.error('Erro ao excluir lista');
    } finally {
      setDeleting(false);
    }
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    loadListas();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 flex items-center justify-center">
        <div className="text-white text-xl">Carregando listas...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Minhas Listas</h1>
            <p className="text-gray-400">Organize suas obras em listas personalizadas</p>
          </div>
          <Button
            onClick={handleCreateLista}
            className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nova Lista
          </Button>
        </div>

        {listas.length === 0 ? (
          <div className="text-center py-20">
            <Film className="w-20 h-20 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              Nenhuma lista criada ainda
            </h3>
            <p className="text-gray-500 mb-6">
              Crie sua primeira lista para organizar suas obras
            </p>
            <Button
              onClick={handleCreateLista}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Plus className="w-5 h-5 mr-2" />
              Criar Primeira Lista
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listas.map((lista) => (
              <Card
                key={lista.id}
                onClick={() => handleViewObras(lista)}
                className="bg-gray-900/80 border-gray-800 hover:border-purple-500 transition-all cursor-pointer group"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-white text-xl group-hover:text-purple-400 transition-colors">
                      {lista.nome}
                    </CardTitle>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditLista(lista);
                        }}
                        className="text-gray-400 hover:text-purple-400 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setListaToDelete(lista);
                        }}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {lista.descricao && (
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {lista.descricao}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Film className="w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ListaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        lista={selectedLista}
        onSuccess={handleModalSuccess}
      />

      <ListaObrasModal
        isOpen={isObrasModalOpen}
        onClose={() => setIsObrasModalOpen(false)}
        lista={selectedLista}
      />

      <ConfirmModal
        isOpen={!!listaToDelete}
        onClose={() => setListaToDelete(null)}
        onConfirm={handleDeleteLista}
        title="Excluir Lista?"
        description={`Tem certeza que deseja excluir a lista "${listaToDelete?.nome}"? Todas as obras serão removidas desta lista.`}
        confirmText="Excluir"
        loading={deleting}
      />
    </div>
  );
};

export default Lists;
