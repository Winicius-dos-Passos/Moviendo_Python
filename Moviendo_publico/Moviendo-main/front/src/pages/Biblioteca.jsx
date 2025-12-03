import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Calendar,
  Eye,
  Film,
  Filter,
  Grid3x3,
  List,
  Search,
  Star,
  Tv,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ObraDetailsModal from "../components/ObraDetailsModal";
import ObraModal from "../components/ObraModal";
import { STATUS_OPTIONS } from "../constants/status";
import diretoresService from "../services/diretoresService";
import generosService from "../services/generosService";
import obrasService from "../services/obrasService";
import plataformasService from "../services/plataformasService";
import tagsService from "../services/tagsService";

const Biblioteca = () => {
  const [obras, setObras] = useState([]);
  const [filteredObras, setFilteredObras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenero, setSelectedGenero] = useState("");
  const [selectedPlataforma, setSelectedPlataforma] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [selectedDiretor, setSelectedDiretor] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedAno, setSelectedAno] = useState("");
  const [sortBy, setSortBy] = useState("titulo");

  const [generos, setGeneros] = useState([]);
  const [plataformas, setPlataformas] = useState([]);
  const [tags, setTags] = useState([]);
  const [diretores, setDiretores] = useState([]);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedObra, setSelectedObra] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          obrasData,
          generosData,
          plataformasData,
          tagsData,
          diretoresData,
        ] = await Promise.all([
          obrasService.getAll(),
          generosService.getAll(),
          plataformasService.getAll(),
          tagsService.getAll(),
          diretoresService.getAll(),
        ]);

        setObras(obrasData);
        setFilteredObras(obrasData);
        setGeneros(generosData);
        setPlataformas(plataformasData);
        setTags(tagsData);
        setDiretores(diretoresData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Erro ao carregar biblioteca");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let result = [...obras];

    if (searchTerm) {
      result = result.filter((obra) =>
        obra.titulo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedGenero) {
      result = result.filter((obra) => {
        const generos =
          (obra.generosInfo?.length ? obra.generosInfo : null) ||
          (obra.generos_info?.length ? obra.generos_info : null) ||
          (obra.generos?.length ? obra.generos : null) ||
          [];
        return generos.some((g) => g.id == selectedGenero);
      });
    }

    if (selectedPlataforma) {
      result = result.filter((obra) => {
        const plataformas =
          (obra.plataformasInfo?.length ? obra.plataformasInfo : null) ||
          (obra.plataformas_info?.length ? obra.plataformas_info : null) ||
          (obra.plataformas?.length ? obra.plataformas : null) ||
          [];
        return plataformas.some((p) => p.id == selectedPlataforma);
      });
    }

    if (selectedTag) {
      result = result.filter((obra) => {
        const tags =
          (obra.tagsInfo?.length ? obra.tagsInfo : null) ||
          (obra.tags_info?.length ? obra.tags_info : null) ||
          (obra.tags?.length ? obra.tags : null) ||
          [];
        return tags.some((t) => t.id == selectedTag);
      });
    }

    if (selectedDiretor) {
      result = result.filter((obra) => {
        const diretores =
          (obra.diretoresInfo?.length ? obra.diretoresInfo : null) ||
          (obra.diretores_info?.length ? obra.diretores_info : null) ||
          (obra.diretores?.length ? obra.diretores : null) ||
          [];
        return diretores.some((d) => d.id == selectedDiretor);
      });
    }

    if (selectedStatus) {
      result = result.filter((obra) => obra.status === selectedStatus);
    }

    if (selectedAno) {
      result = result.filter(
        (obra) => obra.anoLancamento === parseInt(selectedAno)
      );
    }

    result.sort((a, b) => {
      if (sortBy === "titulo") {
        return a.titulo.localeCompare(b.titulo);
      } else if (sortBy === "ano") {
        return (b.anoLancamento || 0) - (a.anoLancamento || 0);
      } else if (sortBy === "nota") {
        return (b.notaImdb || 0) - (a.notaImdb || 0);
      }
      return 0;
    });

    setFilteredObras(result);
  }, [
    obras,
    searchTerm,
    selectedGenero,
    selectedPlataforma,
    selectedTag,
    selectedDiretor,
    selectedStatus,
    selectedAno,
    sortBy,
  ]);

  const handleCardClick = (obra) => {
    setSelectedObra(obra);
    setIsDetailsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDetailsModalOpen(false);
  };

  const handleUpdateObra = () => {
    setLoading(true);
    obrasService
      .getAll()
      .then((data) => {
        setObras(data);
        setFilteredObras(data);
      })
      .finally(() => setLoading(false));
  };

  const refreshFilters = async () => {
    try {
      const [generosData, plataformasData, tagsData, diretoresData] =
        await Promise.all([
          generosService.getAll(),
          plataformasService.getAll(),
          tagsService.getAll(),
          diretoresService.getAll(),
        ]);

      setGeneros(generosData);
      setPlataformas(plataformasData);
      setTags(tagsData);
      setDiretores(diretoresData);
    } catch (error) {
      console.error("Erro ao recarregar filtros:", error);
    }
  };

  const handleObraModalSuccess = () => {
    handleUpdateObra();
    refreshFilters();
  };

  const handleEditFromDetails = (obra) => {
    setIsDetailsModalOpen(false);
    setTimeout(() => {
      setSelectedObra(obra);
      setIsModalOpen(true);
    }, 100);
  };

  const handleDeleteObra = async (obraId) => {
    await obrasService.delete(obraId);
    handleUpdateObra();
  };

  const limparFiltros = () => {
    setSearchTerm("");
    setSelectedGenero("");
    setSelectedPlataforma("");
    setSelectedTag("");
    setSelectedDiretor("");
    setSelectedStatus("");
    setSelectedAno("");
    setSortBy("titulo");
  };

  const anos = [
    ...new Set(obras.map((o) => o.anoLancamento).filter(Boolean)),
  ].sort((a, b) => b - a);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando biblioteca...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      <div className="bg-gray-900/50 backdrop-blur-sm border-b border-purple-900/30 sticky top-0 z-10">
        <div className="max-w-[1800px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Biblioteca</h1>
              <p className="text-gray-400">
                {filteredObras.length}{" "}
                {filteredObras.length === 1
                  ? "obra encontrada"
                  : "obras encontradas"}
              </p>
            </div>

            <div className="flex items-center gap-2 bg-gray-800/50 rounded-xl p-1 border border-gray-700">
              <button
                onClick={() => setViewMode("grid")}
                className={`
                  px-4 py-2 rounded-lg flex items-center gap-2 transition-all
                  ${
                    viewMode === "grid"
                      ? "bg-purple-600 text-white shadow-lg"
                      : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  }
                `}
              >
                <Grid3x3 className="w-4 h-4" />
                <span className="font-medium">Grade</span>
              </button>

              <button
                onClick={() => setViewMode("list")}
                className={`
                  px-4 py-2 rounded-lg flex items-center gap-2 transition-all
                  ${
                    viewMode === "list"
                      ? "bg-purple-600 text-white shadow-lg"
                      : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  }
                `}
              >
                <List className="w-4 h-4" />
                <span className="font-medium">Lista</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por título..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              <select
                value={selectedGenero}
                onChange={(e) => setSelectedGenero(e.target.value)}
                className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
              >
                <option value="">Todos os gêneros</option>
                {generos.map((genero) => (
                  <option key={genero.id} value={genero.id}>
                    {genero.nome || genero.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedPlataforma}
                onChange={(e) => setSelectedPlataforma(e.target.value)}
                className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
              >
                <option value="">Todas as plataformas</option>
                {plataformas.map((plataforma) => (
                  <option key={plataforma.id} value={plataforma.id}>
                    {plataforma.nome || plataforma.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
              >
                <option value="">Todas as tags</option>
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.nome || tag.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedDiretor}
                onChange={(e) => setSelectedDiretor(e.target.value)}
                className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
              >
                <option value="">Todos os diretores</option>
                {diretores.map((diretor) => (
                  <option key={diretor.id} value={diretor.id}>
                    {diretor.nome || diretor.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
              >
                <option value="">Todos os status</option>
                {STATUS_OPTIONS.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedAno}
                onChange={(e) => setSelectedAno(e.target.value)}
                className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
              >
                <option value="">Todos os anos</option>
                {anos.map((ano) => (
                  <option key={ano} value={ano}>
                    {ano}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
              >
                <option value="titulo">Ordenar: Título</option>
                <option value="ano">Ordenar: Ano</option>
                <option value="nota">Ordenar: Nota</option>
              </select>
            </div>

            {(searchTerm ||
              selectedGenero ||
              selectedPlataforma ||
              selectedTag ||
              selectedDiretor ||
              selectedStatus ||
              selectedAno) && (
              <Button
                onClick={limparFiltros}
                variant="outline"
                size="sm"
                className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
              >
                <Filter className="w-4 h-4 mr-2" />
                Limpar Filtros
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-8 py-8">
        {filteredObras.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">
              Nenhuma obra encontrada com os filtros selecionados
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
            {filteredObras.map((obra) => (
              <motion.div
                key={obra.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[2/3] bg-gray-900 rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500 transition-all duration-200 shadow-lg hover:shadow-purple-500/20">
                  {obra.urlCapa ? (
                    <img
                      src={obra.urlCapa}
                      alt={obra.titulo}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                      {obra.tipo === "SERIE" ? (
                        <Tv className="w-16 h-16 text-gray-600" />
                      ) : (
                        <Film className="w-16 h-16 text-gray-600" />
                      )}
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <button
                      onClick={() => handleCardClick(obra)}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transform scale-90 group-hover:scale-100 transition-transform"
                    >
                      <Eye className="w-5 h-5" />
                      Ver Detalhes
                    </button>
                  </div>

                  <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                    {obra.tipo === "SERIE" ? (
                      <Tv className="w-3 h-3 text-purple-400" />
                    ) : (
                      <Film className="w-3 h-3 text-purple-400" />
                    )}
                    <span className="text-xs text-white font-medium">
                      {obra.tipo}
                    </span>
                  </div>

                  {obra.notaImdb && (
                    <div className="absolute bottom-2 left-2 bg-yellow-500/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-900 fill-yellow-900" />
                      <span className="text-xs text-yellow-900 font-bold">
                        {Number(obra.notaImdb).toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-3">
                  <h3 className="text-white font-semibold text-sm line-clamp-2 mb-1">
                    {obra.titulo}
                  </h3>
                  {obra.anoLancamento && (
                    <div className="flex items-center gap-1 text-gray-400 text-xs">
                      <Calendar className="w-3 h-3" />
                      <span>{obra.anoLancamento}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredObras.map((obra) => (
              <motion.div
                key={obra.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4 bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700 hover:border-purple-500 transition-all duration-200 cursor-pointer group"
                onClick={() => handleCardClick(obra)}
              >
                <div className="w-16 h-24 bg-gray-900 rounded overflow-hidden flex-shrink-0">
                  {obra.urlCapa ? (
                    <img
                      src={obra.urlCapa}
                      alt={obra.titulo}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {obra.tipo === "SERIE" ? (
                        <Tv className="w-8 h-8 text-gray-600" />
                      ) : (
                        <Film className="w-8 h-8 text-gray-600" />
                      )}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-lg mb-1">
                    {obra.titulo}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    {obra.anoLancamento && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{obra.anoLancamento}</span>
                      </div>
                    )}
                    {obra.notaImdb && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-yellow-400 font-medium">
                          {Number(obra.notaImdb).toFixed(1)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      {obra.tipo === "SERIE" ? (
                        <Tv className="w-4 h-4 text-purple-400" />
                      ) : (
                        <Film className="w-4 h-4 text-purple-400" />
                      )}
                      <span>{obra.tipo}</span>
                    </div>
                  </div>

                  {(obra.generosInfo || obra.generos_info || obra.generos) &&
                    (obra.generosInfo || obra.generos_info || obra.generos)
                      .length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(obra.generosInfo || obra.generos_info || obra.generos)
                          .slice(0, 3)
                          .map((genero) => (
                            <Badge
                              key={genero.id}
                              variant="secondary"
                              className="text-xs bg-purple-900/30 text-purple-300 px-2 py-0.5"
                            >
                              {genero.nome}
                            </Badge>
                          ))}
                      </div>
                    )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="border-purple-500 text-purple-400 hover:bg-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Detalhes
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <ObraDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseModal}
        obra={selectedObra}
        onUpdate={handleUpdateObra}
        onEdit={handleEditFromDetails}
        onDelete={handleDeleteObra}
      />

      <ObraModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        obra={selectedObra}
        onSuccess={handleObraModalSuccess}
      />
    </div>
  );
};

export default Biblioteca;
