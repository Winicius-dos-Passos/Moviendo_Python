import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, Edit2, Film, Star, Trash2, Tv } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Rating, RatingButton } from "../components/kibo-ui/rating";
import { STATUS_LABELS } from "../constants/status";
import avaliacoesService from "../services/avaliacoesService";

const ObraDetailsModal = ({
  isOpen,
  onClose,
  obra,
  onUpdate,
  onEdit,
  onDelete,
}) => {
  const [isEditingAvaliacao, setIsEditingAvaliacao] = useState(false);
  const [avaliacao, setAvaliacao] = useState(null);
  const [comentario, setComentario] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(obra.id);
      toast.success("Obra deletada com sucesso!");
      setShowDeleteConfirm(false);
      onClose();
    } catch (error) {
      toast.error("Erro ao deletar obra");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    const fetchAvaliacao = async () => {
      if (obra && isOpen) {
        try {
          const avaliacoes = await avaliacoesService.getByObraId(obra.id);
          if (avaliacoes && avaliacoes.length > 0) {
            const avaliacaoExistente = avaliacoes[0];
            setAvaliacao(avaliacaoExistente);
            setComentario(avaliacaoExistente.comentario || "");
          } else {
            setAvaliacao(null);
            setComentario("");
          }
        } catch (error) {
          console.error("Erro ao buscar avaliação:", error);
          setAvaliacao(null);
          setComentario("");
        }
        setIsEditingAvaliacao(false);
      }
    };

    fetchAvaliacao();
  }, [obra, isOpen]);

  if (!obra) {
    return null;
  }

  const handleSaveAvaliacao = async () => {
    if (!avaliacao?.nota) {
      toast.error("Nota é obrigatória");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        obra: obra.id,
        nota: parseFloat(avaliacao.nota),
        comentario: comentario || null,
      };

      if (avaliacao && avaliacao.id) {
        const avaliacaoAtualizada = await avaliacoesService.update(
          avaliacao.id,
          payload
        );
        setAvaliacao(avaliacaoAtualizada);
        toast.success("Avaliação atualizada com sucesso!");
      } else {
        const novaAvaliacao = await avaliacoesService.create(payload);
        setAvaliacao(novaAvaliacao);
        toast.success("Avaliação criada com sucesso!");
      }

      setIsEditingAvaliacao(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Erro ao salvar avaliação:", error);
      toast.error(error.response?.data?.message || "Erro ao salvar avaliação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-purple-900/30">
          <DialogHeader>
            <div className="flex items-center justify-between gap-3">
              <DialogTitle className="text-3xl font-bold text-white flex items-center gap-3">
                {obra.tipo === "FILME" ? (
                  <Film className="w-8 h-8 text-purple-500" />
                ) : (
                  <Tv className="w-8 h-8 text-purple-500" />
                )}
                {obra.titulo}
              </DialogTitle>
              <div className="flex gap-2">
                {onEdit && (
                  <Button
                    onClick={() => onEdit(obra)}
                    variant="outline"
                    className="bg-purple-600/10 border-purple-600 text-purple-300 hover:bg-purple-600 hover:text-white"
                    title="Editar obra"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                )}
                {onDelete && (
                  <Button
                    onClick={() => setShowDeleteConfirm(true)}
                    variant="outline"
                    className="bg-red-600/10 border-red-600 text-red-300 hover:bg-red-600 hover:text-white"
                    title="Deletar obra"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Deletar
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 mt-6">
            <div className="flex gap-6">
              {obra.urlCapa && (
                <div className="w-48 h-72 flex-shrink-0">
                  <img
                    src={obra.urlCapa}
                    alt={obra.titulo}
                    className="w-full h-full object-cover rounded-lg shadow-lg"
                  />
                </div>
              )}

              <div className="flex-1 space-y-4">
                <div>
                  <Badge className="bg-purple-600 text-white">
                    {STATUS_LABELS[obra.status]}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  {obra.anoLancamento && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <Calendar className="w-4 h-4 text-purple-400" />
                      <span>{obra.anoLancamento}</span>
                    </div>
                  )}
                  {obra.duracaoMinutos && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <Clock className="w-4 h-4 text-purple-400" />
                      <span>{obra.duracaoMinutos} min</span>
                    </div>
                  )}
                  {obra.notaImdb && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span>IMDB: {obra.notaImdb}/10</span>
                    </div>
                  )}
                </div>

                {(obra.generosInfo || obra.generos_info || obra.generos) &&
                  (obra.generosInfo || obra.generos_info || obra.generos).length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-400 mb-2">
                        Gêneros
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {(obra.generosInfo || obra.generos_info || obra.generos).map((genero) => (
                          <Badge
                            key={genero.id}
                            variant="outline"
                            className="border-purple-500 text-purple-300"
                          >
                            {genero.nome}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                {(obra.diretoresInfo || obra.diretores_info || obra.diretores) &&
                  (obra.diretoresInfo || obra.diretores_info || obra.diretores).length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-400 mb-2">
                        Diretor(es)
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {(obra.diretoresInfo || obra.diretores_info || obra.diretores).map(
                          (diretor) => (
                            <Badge
                              key={diretor.id}
                              className="bg-gray-800 text-gray-300"
                            >
                              {diretor.nome}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {obra.sinopse && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Sinopse
                </h3>
                <p className="text-gray-300 leading-relaxed">{obra.sinopse}</p>
              </div>
            )}

            <div className="border-t border-gray-800 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Star className="w-5 h-5 text-purple-500" />
                  Minha Avaliação
                </h3>
                {!isEditingAvaliacao && (
                  <Button
                    onClick={() => setIsEditingAvaliacao(true)}
                    variant="outline"
                    size="sm"
                    className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    {avaliacao ? "Editar" : "Adicionar"} Avaliação
                  </Button>
                )}
              </div>

              {isEditingAvaliacao ? (
                <div className="space-y-4 bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                  <div>
                    <Label className="text-white mb-3 block">Sua Nota</Label>
                    <div className="flex items-center gap-4">
                      <Rating
                        value={avaliacao?.nota}
                        onValueChange={(value) =>
                          setAvaliacao((prev) => ({
                            ...prev,
                            nota: value.toString(),
                          }))
                        }
                        className="gap-0.5"
                      >
                        {[...Array(10)].map((_, i) => (
                          <RatingButton
                            key={i}
                            size={24}
                            className="text-yellow-400"
                          />
                        ))}
                      </Rating>
                      <span className="text-2xl font-bold text-white min-w-[60px]">
                        {avaliacao?.nota}
                        /10
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">
                      Clique nas estrelas para avaliar (1-10)
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="comentario" className="text-white">
                      Comentário
                    </Label>
                    <Textarea
                      id="comentario"
                      value={comentario}
                      onChange={(e) => setComentario(e.target.value)}
                      className="mt-2 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                      placeholder="Escreva sua opinião sobre a obra..."
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-3 justify-end pt-2">
                    <Button
                      onClick={() => {
                        setIsEditingAvaliacao(false);
                        setComentario(avaliacao?.comentario || "");
                      }}
                      variant="outline"
                      className="bg-white text-black border-gray-300 hover:bg-gray-100"
                      disabled={loading}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSaveAvaliacao}
                      className="bg-purple-600 hover:bg-purple-700"
                      disabled={loading}
                    >
                      {loading ? "Salvando..." : "Salvar Avaliação"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {avaliacao ? (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[...Array(10)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < Math.floor(avaliacao.nota)
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-600"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-2xl font-bold text-white">
                        {avaliacao.nota}/10
                      </span>
                    </div>
                  ) : (
                    <p className="text-gray-400 italic">
                      Nenhuma avaliação ainda
                    </p>
                  )}

                  {avaliacao?.comentario && (
                    <div>
                      <p className="text-gray-300 leading-relaxed">
                        {avaliacao.comentario}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {(obra.tagsInfo || obra.tags_info || obra.tags) &&
              (obra.tagsInfo || obra.tags_info || obra.tags).length > 0 && (
                <div className="border-t border-gray-800 pt-6">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(obra.tagsInfo || obra.tags_info || obra.tags).map((tag) => (
                      <Badge key={tag.id} className="bg-gray-800 text-gray-300">
                        {tag.nome}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md bg-gray-900 border-red-900/30">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Trash2 className="w-6 h-6 text-red-500" />
              Confirmar Exclusão
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <p className="text-gray-300">
              Tem certeza que deseja deletar{" "}
              <span className="font-bold text-white">
                &quot;{obra?.titulo}&quot;
              </span>
              ?
            </p>
            <p className="text-sm text-gray-400">
              Esta ação não pode ser desfeita. Todas as avaliações associadas
              também serão removidas.
            </p>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                variant="outline"
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
                disabled={deleting}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                disabled={deleting}
              >
                {deleting ? "Deletando..." : "Deletar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ObraDetailsModal;
