import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, Film, Plus, Search, Star, Tv } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { STATUS_OPTIONS } from "../constants/status";
import diretoresService from "../services/diretoresService";
import generosService from "../services/generosService";
import obrasService from "../services/obrasService";
import plataformasService from "../services/plataformasService";
import tagsService from "../services/tagsService";
import CreateItemModal from "./CreateItemModal";
import TmdbSearchModal from "./TmdbSearchModal";

const ObraModal = ({ isOpen, onClose, obra = null, onSuccess }) => {
  const isEditing = !!obra;

  const [formData, setFormData] = useState({
    titulo: "",
    sinopse: "",
    anoLancamento: "",
    duracaoMinutos: "",
    urlCapa: "",
    tipo: "filme",
    status: "quero_assistir",
    notaImdb: "",
    temporadaAtual: "",
    episodioAtual: "",
    totalTemporadas: "",
    totalEpisodios: "",
    dataAssistido: "",
  });

  const [selectedGeneros, setSelectedGeneros] = useState([]);
  const [selectedPlataformas, setSelectedPlataformas] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedDiretores, setSelectedDiretores] = useState([]);

  const [generos, setGeneros] = useState([]);
  const [plataformas, setPlataformas] = useState([]);
  const [tags, setTags] = useState([]);
  const [diretores, setDiretores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isTmdbModalOpen, setIsTmdbModalOpen] = useState(false);

  const [isCreateGeneroModalOpen, setIsCreateGeneroModalOpen] = useState(false);
  const [isCreatePlataformaModalOpen, setIsCreatePlataformaModalOpen] =
    useState(false);
  const [isCreateTagModalOpen, setIsCreateTagModalOpen] = useState(false);
  const [isCreateDiretorModalOpen, setIsCreateDiretorModalOpen] =
    useState(false);

  useEffect(() => {
    if (isOpen) {
      loadOptions();
      if (obra) {
        populateForm(obra);
      } else {
        resetForm();
      }
    }
  }, [isOpen, obra]);

  const loadOptions = async () => {
    try {
      const [generosData, plataformasData, tagsData, diretoresData] =
        await Promise.all([
          generosService.getAll().catch(() => []),
          plataformasService.getAll().catch(() => []),
          tagsService.getAll().catch(() => []),
          diretoresService.getAll().catch(() => []),
        ]);
      setGeneros(generosData || []);
      setPlataformas(plataformasData || []);
      setTags(tagsData || []);
      setDiretores(diretoresData || []);
    } catch (error) {
      console.error("Erro ao carregar opções:", error);
      toast.error("Alguns dados não puderam ser carregados");
      setGeneros([]);
      setPlataformas([]);
      setTags([]);
      setDiretores([]);
    }
  };

  const populateForm = (obraData) => {
    setFormData({
      titulo: obraData.titulo || "",
      sinopse: obraData.sinopse || "",
      anoLancamento: obraData.anoLancamento || "",
      duracaoMinutos: obraData.duracaoMinutos || "",
      urlCapa: obraData.urlCapa || "",
      tipo: obraData.tipo || "filme",
      status: obraData.status || "quero_assistir",
      notaImdb: obraData.notaImdb || "",
      temporadaAtual: obraData.temporadaAtual || "",
      episodioAtual: obraData.episodioAtual || "",
      totalTemporadas: obraData.totalTemporadas || "",
      totalEpisodios: obraData.totalEpisodios || "",
      dataAssistido: obraData.dataAssistido || "",
    });
    
    const generos = obraData.generosInfo || obraData.generos_info || obraData.generos || [];
    const plataformas = obraData.plataformasInfo || obraData.plataformas_info || obraData.plataformas || [];
    const tags = obraData.tagsInfo || obraData.tags_info || obraData.tags || [];
    const diretores = obraData.diretoresInfo || obraData.diretores_info || obraData.diretores || [];
    
    setSelectedGeneros(generos.map((g) => g.id));
    setSelectedPlataformas(plataformas.map((p) => p.id));
    setSelectedTags(tags.map((t) => t.id));
    setSelectedDiretores(diretores.map((d) => d.id));
  };

  const resetForm = () => {
    setFormData({
      titulo: "",
      sinopse: "",
      anoLancamento: "",
      duracaoMinutos: "",
      urlCapa: "",
      tipo: "filme",
      status: "quero_assistir",
      notaImdb: "",
      temporadaAtual: "",
      episodioAtual: "",
      totalTemporadas: "",
      totalEpisodios: "",
      dataAssistido: "",
    });
    setSelectedGeneros([]);
    setSelectedPlataformas([]);
    setSelectedTags([]);
    setSelectedDiretores([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        anoLancamento: formData.anoLancamento
          ? parseInt(formData.anoLancamento)
          : null,
        duracaoMinutos: formData.duracaoMinutos
          ? parseInt(formData.duracaoMinutos)
          : null,
        notaImdb: formData.notaImdb ? parseFloat(formData.notaImdb) : null,
        temporadaAtual: formData.temporadaAtual
          ? parseInt(formData.temporadaAtual)
          : null,
        episodioAtual: formData.episodioAtual
          ? parseInt(formData.episodioAtual)
          : null,
        totalTemporadas: formData.totalTemporadas
          ? parseInt(formData.totalTemporadas)
          : null,
        totalEpisodios: formData.totalEpisodios
          ? parseInt(formData.totalEpisodios)
          : null,
        generos: selectedGeneros,
        plataformas: selectedPlataformas,
        tags: selectedTags,
        diretores: selectedDiretores,
      };

      if (isEditing) {
        await obrasService.update(obra.id, payload);
        toast.success("Obra atualizada com sucesso!");
      } else {
        await obrasService.create(payload);
        toast.success("Obra criada com sucesso!");
      }

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      console.error("Erro ao salvar obra:", error);
      toast.error(isEditing ? "Erro ao atualizar obra" : "Erro ao criar obra");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (id, selectedArray, setSelectedArray) => {
    if (selectedArray.includes(id)) {
      setSelectedArray(selectedArray.filter((item) => item !== id));
    } else {
      setSelectedArray([...selectedArray, id]);
    }
  };

  const handleCreateGenero = () => {
    setIsCreateGeneroModalOpen(true);
  };

  const handleSubmitGenero = async (nome) => {
    try {
      const novoGenero = await generosService.create({ nome });
      setGeneros([...generos, novoGenero]);
      setSelectedGeneros([...selectedGeneros, novoGenero.id]);
    } catch (error) {
      console.error("Erro ao criar gênero:", error);
      toast.error(error.response?.data?.message || "Erro ao criar gênero");
      throw error;
    }
  };

  const handleCreateTag = () => {
    setIsCreateTagModalOpen(true);
  };

  const handleSubmitTag = async (nome) => {
    try {
      const novaTag = await tagsService.create({ nome });
      setTags([...tags, novaTag]);
      setSelectedTags([...selectedTags, novaTag.id]);
      toast.success(`Tag "${novaTag.nome}" criada com sucesso!`);
    } catch (error) {
      console.error("Erro ao criar tag:", error);
      toast.error(error.response?.data?.message || "Erro ao criar tag");
      throw error;
    }
  };

  const handleCreatePlataforma = () => {
    setIsCreatePlataformaModalOpen(true);
  };

  const handleSubmitPlataforma = async (nome) => {
    try {
      const novaPlataforma = await plataformasService.create({ nome });
      setPlataformas([...plataformas, novaPlataforma]);
      setSelectedPlataformas([...selectedPlataformas, novaPlataforma.id]);
      toast.success(`Plataforma "${novaPlataforma.nome}" criada com sucesso!`);
    } catch (error) {
      console.error("Erro ao criar plataforma:", error);
      toast.error(error.response?.data?.message || "Erro ao criar plataforma");
      throw error;
    }
  };

  const handleCreateDiretor = () => {
    setIsCreateDiretorModalOpen(true);
  };

  const handleSubmitDiretor = async (nome) => {
    try {
      const novoDiretor = await diretoresService.create({ nome });
      setDiretores([...diretores, novoDiretor]);
      setSelectedDiretores([...selectedDiretores, novoDiretor.id]);
    } catch (error) {
      console.error("Erro ao criar diretor:", error);
      toast.error(error.response?.data?.message || "Erro ao criar diretor");
      throw error;
    }
  };

  const handleTmdbSelect = async (tmdbData) => {
    setFormData({
      ...formData,
      titulo: tmdbData.titulo || "",
      sinopse: tmdbData.sinopse || "",
      anoLancamento: tmdbData.anoLancamento || "",
      duracaoMinutos: tmdbData.duracaoMinutos || "",
      urlCapa: tmdbData.urlCapa || "",
      tipo: tmdbData.tipo || "filme",
      notaImdb: tmdbData.notaImdb || "",
      totalTemporadas: tmdbData.totalTemporadas || "",
      totalEpisodios: tmdbData.totalEpisodios || "",
    });

    if (tmdbData.generos && tmdbData.generos.length > 0) {
      for (const generoNome of tmdbData.generos) {
        const existingGenero = generos.find(
          (g) => g.nome.toLowerCase() === generoNome.toLowerCase()
        );
        if (existingGenero && !selectedGeneros.includes(existingGenero.id)) {
          setSelectedGeneros((prev) => [...prev, existingGenero.id]);
        }
      }
    }

    if (tmdbData.diretores && tmdbData.diretores.length > 0) {
      for (const diretorNome of tmdbData.diretores) {
        const existingDiretor = diretores.find(
          (d) => d.nome.toLowerCase() === diretorNome.toLowerCase()
        );
        if (
          existingDiretor &&
          !selectedDiretores.includes(existingDiretor.id)
        ) {
          setSelectedDiretores((prev) => [...prev, existingDiretor.id]);
        }
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-purple-900/30">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
              {isEditing ? (
                <>
                  <Star className="w-6 h-6 text-purple-500" />
                  Editar Obra
                </>
              ) : (
                <>
                  <Film className="w-6 h-6 text-purple-500" />
                  Nova Obra
                </>
              )}
            </DialogTitle>
            {!isEditing && (
              <Button
                type="button"
                onClick={() => setIsTmdbModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Search className="w-4 h-4 mr-2" />
                Buscar no TMDB
              </Button>
            )}
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-gray-800 pb-2">
              Informações Básicas
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="titulo" className="text-white">
                  Título 
                </Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) =>
                    setFormData({ ...formData, titulo: e.target.value })
                  }
                  required
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="Ex: Matrix"
                />
              </div>

              <div>
                <Label htmlFor="tipo" className="text-white">
                  Tipo 
                </Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value) =>
                    setFormData({ ...formData, tipo: value })
                  }
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    <SelectItem value="filme">
                      <div className="flex items-center gap-2">
                        <Film className="w-4 h-4" />
                        Filme
                      </div>
                    </SelectItem>
                    <SelectItem value="serie">
                      <div className="flex items-center gap-2">
                        <Tv className="w-4 h-4" />
                        Série
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status" className="text-white">
                  Status 
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label
                  htmlFor="anoLancamento"
                  className="text-white flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Ano de Lançamento
                </Label>
                <Input
                  id="anoLancamento"
                  type="number"
                  value={formData.anoLancamento}
                  onChange={(e) =>
                    setFormData({ ...formData, anoLancamento: e.target.value })
                  }
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="2024"
                />
              </div>

              <div>
                <Label
                  htmlFor="duracaoMinutos"
                  className="text-white flex items-center gap-2"
                >
                  <Clock className="w-4 h-4" />
                  Duração (minutos)
                </Label>
                <Input
                  id="duracaoMinutos"
                  type="number"
                  value={formData.duracaoMinutos}
                  onChange={(e) =>
                    setFormData({ ...formData, duracaoMinutos: e.target.value })
                  }
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="120"
                />
              </div>

              <div className="col-span-2 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <h3 className="text-lg font-semibold text-white">
                    Diretores
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleCreateDiretor()}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Novo
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {diretores.map((diretor) => (
                    <Badge
                      key={diretor.id}
                      variant={
                        selectedDiretores.includes(diretor.id)
                          ? "default"
                          : "outline"
                      }
                      className={`cursor-pointer transition-all ${
                        selectedDiretores.includes(diretor.id)
                          ? "bg-purple-600 hover:bg-purple-700 text-white"
                          : "border-gray-700 hover:border-purple-500 text-gray-300"
                      }`}
                      onClick={() =>
                        toggleSelection(
                          diretor.id,
                          selectedDiretores,
                          setSelectedDiretores
                        )
                      }
                    >
                      {diretor.nome}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="col-span-2">
                <Label htmlFor="urlCapa" className="text-white">
                  URL da Capa
                </Label>
                <Input
                  id="urlCapa"
                  value={formData.urlCapa}
                  onChange={(e) =>
                    setFormData({ ...formData, urlCapa: e.target.value })
                  }
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="https://image.tmdb.org/t/p/w500/..."
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="sinopse" className="text-white">
                  Sinopse
                </Label>
                <Textarea
                  id="sinopse"
                  value={formData.sinopse}
                  onChange={(e) =>
                    setFormData({ ...formData, sinopse: e.target.value })
                  }
                  className="bg-gray-800 border-gray-700 text-white min-h-[100px]"
                  placeholder="Descrição da obra..."
                />
              </div>

              <div>
                <Label
                  htmlFor="notaImdb"
                  className="text-white flex items-center gap-2"
                >
                  <Star className="w-4 h-4" />
                  Nota IMDB
                </Label>
                <Input
                  id="notaImdb"
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={formData.notaImdb}
                  onChange={(e) =>
                    setFormData({ ...formData, notaImdb: e.target.value })
                  }
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="8.5"
                />
              </div>
            </div>
          </div>

          {formData.tipo === "serie" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-gray-800 pb-2">
                Informações da Série
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="temporadaAtual" className="text-white">
                    Temporada Atual
                  </Label>
                  <Input
                    id="temporadaAtual"
                    type="number"
                    value={formData.temporadaAtual}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        temporadaAtual: e.target.value,
                      })
                    }
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="1"
                  />
                </div>

                <div>
                  <Label htmlFor="episodioAtual" className="text-white">
                    Episódio Atual
                  </Label>
                  <Input
                    id="episodioAtual"
                    type="number"
                    value={formData.episodioAtual}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        episodioAtual: e.target.value,
                      })
                    }
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="5"
                  />
                </div>

                <div>
                  <Label htmlFor="totalTemporadas" className="text-white">
                    Total de Temporadas
                  </Label>
                  <Input
                    id="totalTemporadas"
                    type="number"
                    value={formData.totalTemporadas}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        totalTemporadas: e.target.value,
                      })
                    }
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="4"
                  />
                </div>

                <div>
                  <Label htmlFor="totalEpisodios" className="text-white">
                    Total de Episódios
                  </Label>
                  <Input
                    id="totalEpisodios"
                    type="number"
                    value={formData.totalEpisodios}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        totalEpisodios: e.target.value,
                      })
                    }
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="34"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <h3 className="text-lg font-semibold text-white">Gêneros</h3>
              <button
                type="button"
                onClick={() => handleCreateGenero()}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Novo
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {generos.map((genero) => (
                <Badge
                  key={genero.id}
                  variant={
                    selectedGeneros.includes(genero.id) ? "default" : "outline"
                  }
                  className={`cursor-pointer transition-all ${
                    selectedGeneros.includes(genero.id)
                      ? "bg-purple-600 hover:bg-purple-700 text-white"
                      : "border-gray-700 hover:border-purple-500 text-gray-300"
                  }`}
                  onClick={() =>
                    toggleSelection(
                      genero.id,
                      selectedGeneros,
                      setSelectedGeneros
                    )
                  }
                >
                  {genero.nome}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <h3 className="text-lg font-semibold text-white">Plataformas</h3>
              <button
                type="button"
                onClick={() => handleCreatePlataforma()}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Novo
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {plataformas.map((plataforma) => (
                <Badge
                  key={plataforma.id}
                  variant={
                    selectedPlataformas.includes(plataforma.id)
                      ? "default"
                      : "outline"
                  }
                  className={`cursor-pointer transition-all ${
                    selectedPlataformas.includes(plataforma.id)
                      ? "bg-purple-600 hover:bg-purple-700 text-white"
                      : "border-gray-700 hover:border-purple-500 text-gray-300"
                  }`}
                  onClick={() =>
                    toggleSelection(
                      plataforma.id,
                      selectedPlataformas,
                      setSelectedPlataformas
                    )
                  }
                >
                  {plataforma.nome}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <h3 className="text-lg font-semibold text-white">Tags</h3>
              <button
                type="button"
                onClick={() => handleCreateTag()}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Novo
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant={
                    selectedTags.includes(tag.id) ? "default" : "outline"
                  }
                  className={`cursor-pointer transition-all ${
                    selectedTags.includes(tag.id)
                      ? "bg-purple-600 hover:bg-purple-700 text-white"
                      : "border-gray-700 hover:border-purple-500 text-gray-300"
                  }`}
                  onClick={() =>
                    toggleSelection(tag.id, selectedTags, setSelectedTags)
                  }
                >
                  {tag.nome}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="bg-white text-black border-gray-300 hover:bg-gray-100"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? "Salvando..." : isEditing ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>

      <CreateItemModal
        isOpen={isCreateGeneroModalOpen}
        onClose={() => setIsCreateGeneroModalOpen(false)}
        onSubmit={handleSubmitGenero}
        title="Novo Gênero"
        label="Nome do Gênero"
        placeholder="Ex: Ação, Comédia, Drama..."
      />

      <CreateItemModal
        isOpen={isCreateTagModalOpen}
        onClose={() => setIsCreateTagModalOpen(false)}
        onSubmit={handleSubmitTag}
        title="Nova Tag"
        label="Nome da Tag"
        placeholder="Ex: Favorito, Assistir Novamente..."
      />

      <CreateItemModal
        isOpen={isCreatePlataformaModalOpen}
        onClose={() => setIsCreatePlataformaModalOpen(false)}
        onSubmit={handleSubmitPlataforma}
        title="Nova Plataforma"
        label="Nome da Plataforma"
        placeholder="Ex: Netflix, Prime Video, Disney+..."
      />

      <CreateItemModal
        isOpen={isCreateDiretorModalOpen}
        onClose={() => setIsCreateDiretorModalOpen(false)}
        onSubmit={handleSubmitDiretor}
        title="Novo Diretor"
        label="Nome do Diretor"
        placeholder="Ex: Christopher Nolan, Quentin Tarantino..."
      />

      <TmdbSearchModal
        isOpen={isTmdbModalOpen}
        onClose={() => setIsTmdbModalOpen(false)}
        onSelect={handleTmdbSelect}
        onCreateGenero={async (nome) => {
          await handleSubmitGenero(nome);
        }}
        onCreateDiretor={async (nome) => {
          await handleSubmitDiretor(nome);
        }}
        existingGeneros={generos}
        existingDiretores={diretores}
      />
    </Dialog>
  );
};

export default ObraModal;
