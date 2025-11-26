import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import listasService from '../services/listasService';
import toast from 'react-hot-toast';

const ListaModal = ({ isOpen, onClose, lista, onSuccess }) => {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    publica: false,
  });
  const [loading, setLoading] = useState(false);

  const isEditing = !!lista;

  useEffect(() => {
    if (lista) {
      setFormData({
        nome: lista.nome || '',
        descricao: lista.descricao || '',
        publica: lista.publica || false,
      });
    } else {
      setFormData({
        nome: '',
        descricao: '',
        publica: false,
      });
    }
  }, [lista, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      toast.error('Nome da lista é obrigatório');
      return;
    }

    setLoading(true);

    try {
      if (isEditing) {
        await listasService.update(lista.id, formData);
        toast.success('Lista atualizada com sucesso!');
      } else {
        await listasService.create(formData);
        toast.success('Lista criada com sucesso!');
      }
      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar lista:', error);
      toast.error(error.response?.data?.message || 'Erro ao salvar lista');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gray-900 border-purple-900/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            {isEditing ? 'Editar Lista' : 'Nova Lista'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="nome" className="text-white">
              Nome da Lista *
            </Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              placeholder="Ex: Filmes de Ação, Séries para Maratonar..."
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao" className="text-white">
              Descrição
            </Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleChange('descricao', e.target.value)}
              placeholder="Descreva o tema ou objetivo desta lista..."
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 min-h-[100px]"
              rows={4}
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-white text-black border-gray-300 hover:bg-gray-100"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white"
              disabled={loading}
            >
              {loading ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar Lista'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ListaModal;
