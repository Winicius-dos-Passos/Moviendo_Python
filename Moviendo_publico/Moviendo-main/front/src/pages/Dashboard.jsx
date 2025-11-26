import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import obrasService from '../services/obrasService';
import KanbanBoardKibo from '../components/KanbanBoardKibo';
import { Plus, Search } from 'lucide-react';
import ObraModal from '../components/ObraModal';
import ObraDetailsModal from '../components/ObraDetailsModal';
import toast from 'react-hot-toast';
import { getStatusLabel } from '../constants/status';

const Dashboard = () => {
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedObra, setSelectedObra] = useState(null);

  useEffect(() => {
    loadObras();
  }, []);

  const loadObras = async () => {
    try {
      setLoading(true);
      const data = await obrasService.getAll();
      setObras(data);
    } catch (error) {
      console.error('Erro ao carregar obras:', error);
      toast.error('Erro ao carregar obras');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (obraId, newStatus) => {
    try {
      const obra = obras.find(o => o.id === obraId);
      if (!obra) {
        return;
      }

      setObras(prevObras =>
        prevObras.map(o =>
          o.id === obraId ? { ...o, status: newStatus } : o
        )
      );

      await obrasService.update(obraId, {
        ...obra,
        status: newStatus,
      });

      toast.success(`${obra.titulo} movido para ${getStatusLabel(newStatus)}`);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
      loadObras();
    }
  };
  const handleOpenCreateModal = () => {
    setSelectedObra(null);
    setIsModalOpen(true);
  };

  const handleCardClick = (obra) => {
    setSelectedObra(obra);
    setIsDetailsModalOpen(true);
  };

  const handleEditFromDetails = (obra) => {
    setIsDetailsModalOpen(false);
    setTimeout(() => {
      setSelectedObra(obra);
      setIsModalOpen(true);
    }, 100);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedObra(null);
  };

  const handleModalSuccess = () => {
    loadObras();
  };
  const filteredObras = obras.filter(obra =>
    obra.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-purple-950/20">
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-purple-900/30">
        <div className="max-w-[1800px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Pagina Inicial Moviendo
              </h1>
            </div>

            <button
              onClick={handleOpenCreateModal}
              className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-purple-500/30 transition-all hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Nova Obra
            </button>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar obras..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-8 py-8">
        {filteredObras.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">Nenhuma obra encontrada</p>
            <p className="text-gray-500 text-sm mt-2">
              {searchTerm ? 'Tente outro termo de busca' : 'Adicione sua primeira obra'}
            </p>
          </div>
        ) : (
          <KanbanBoardKibo
            obras={filteredObras}
            onUpdateStatus={handleUpdateStatus}
            onCardClick={handleCardClick}
          />
        )}
      </div>

      <ObraModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        obra={selectedObra}
        onSuccess={handleModalSuccess}
      />

      <ObraDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        obra={selectedObra}
        onEdit={handleEditFromDetails}
        onUpdate={loadObras}
      />
    </div>
  );
};

export default Dashboard;
