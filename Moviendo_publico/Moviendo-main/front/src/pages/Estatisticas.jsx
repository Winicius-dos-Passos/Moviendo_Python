import { motion } from "framer-motion";
import {
  Award,
  BarChart3,
  Calendar,
  Clock,
  Film,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import obrasService from "../services/obrasService";

const Estatisticas = () => {
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const obrasData = await obrasService.getAll();
        setObras(obrasData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Erro ao carregar estatísticas");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalObras = obras.length;
  const totalFilmes = obras.filter((o) => o.tipo === "filme").length;
  const totalSeries = obras.filter((o) => o.tipo === "serie").length;
  const totalConcluidas = obras.filter((o) => o.status === "assistido").length;
  const totalAssistindo = obras.filter((o) => o.status === "assistindo").length;

  const tempoTotalMinutos = obras
    .filter((o) => o.duracaoMinutos)
    .reduce((acc, o) => acc + o.duracaoMinutos, 0);
  const tempoTotalHoras = Math.floor(tempoTotalMinutos / 60);

  const obrasPorStatus = [
    {
      status: "Quero Assistir",
      count: obras.filter((o) => o.status === "quero_assistir").length,
      color: "bg-blue-500",
    },
    {
      status: "Assistindo",
      count: obras.filter((o) => o.status === "assistindo").length,
      color: "bg-yellow-500",
    },
    {
      status: "Assistido",
      count: obras.filter((o) => o.status === "assistido").length,
      color: "bg-purple-500",
    },
  ];

  const maxStatusCount = Math.max(...obrasPorStatus.map((s) => s.count), 1);

  const obrasPorAno = {};
  obras.forEach((obra) => {
    if (obra.anoLancamento) {
      obrasPorAno[obra.anoLancamento] =
        (obrasPorAno[obra.anoLancamento] || 0) + 1;
    }
  });

  const anosOrdenados = Object.entries(obrasPorAno)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .slice(-10)
    .map(([ano, count]) => ({ ano, count }));

  const maxAnoCount = Math.max(...anosOrdenados.map((a) => a.count), 1);

  const filmesDuracoes = obras
    .filter((o) => o.tipo === "filme" && o.duracaoMinutos)
    .map((o) => o.duracaoMinutos);
  const seriesDuracoes = obras
    .filter((o) => o.tipo === "serie" && o.duracaoMinutos)
    .map((o) => o.duracaoMinutos);
  const avg = (arr) =>
    arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
  const mediaFilmeMin = avg(filmesDuracoes);
  const mediaSerieMin = avg(seriesDuracoes);

  const filmes = obras.filter((o) => o.tipo === "filme");
  const series = obras.filter((o) => o.tipo === "serie");

  const filmeMaiorNota = filmes.reduce((best, o) => {
    const notaAtual = o.notaImdb;
    const notaMelhor = best?.notaImdb;
    return (notaAtual || -1) > (notaMelhor || -1) ? o : best;
  }, filmes[0] || null);

  const filmeMaisLongo = filmes.reduce(
    (longest, o) =>
      (o.duracaoMinutos || 0) > (longest?.duracaoMinutos || 0) ? o : longest,
    filmes[0] || null
  );

  const serieMaisLonga = series.reduce(
    (acc, o) =>
      (o.totalEpisodios || 0) > (acc?.totalEpisodios || 0) ? o : acc,
    series[0] || null
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando estatísticas...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      <div className="bg-gray-900/50 backdrop-blur-sm border-b border-purple-900/30">
        <div className="max-w-[1800px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <BarChart3 className="w-10 h-10 text-purple-500" />
                Estatísticas
              </h1>
              <p className="text-gray-400">
                Análise completa da sua coleção de obras
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h4 className="text-sm text-gray-400 mb-1">Filme com maior nota</h4>
            <p className="text-white text-lg font-semibold truncate">
              {filmeMaiorNota?.titulo || "—"}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Nota: {filmeMaiorNota?.notaImdb?.toFixed?.(1) || "—"}
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h4 className="text-sm text-gray-400 mb-1">Filme mais longo</h4>
            <p className="text-white text-lg font-semibold truncate">
              {filmeMaisLongo?.titulo || "—"}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Duração:{" "}
              {filmeMaisLongo?.duracaoMinutos
                ? `${filmeMaisLongo.duracaoMinutos} min`
                : "—"}
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h4 className="text-sm text-gray-400 mb-1">Série mais longa</h4>
            <p className="text-white text-lg font-semibold truncate">
              {serieMaisLonga?.titulo || "—"}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Episódios: {serieMaisLonga?.totalEpisodios || "—"}
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/10 rounded-lg">
                <Film className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-white/60" />
            </div>
            <h3 className="text-white/80 text-sm font-medium mb-1">
              Total de Obras
            </h3>
            <p className="text-4xl font-bold text-white">{totalObras}</p>
            <p className="text-white/60 text-xs mt-2">
              {totalFilmes} filmes • {totalSeries} séries
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Award className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-white/60" />
            </div>
            <h3 className="text-white/80 text-sm font-medium mb-1">
              Concluídas
            </h3>
            <p className="text-4xl font-bold text-white">{totalConcluidas}</p>
            <p className="text-white/60 text-xs mt-2">
              {totalAssistindo} assistindo agora
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-white/60" />
            </div>
            <h3 className="text-white/80 text-sm font-medium mb-1">
              Tempo Assistido
            </h3>
            <p className="text-4xl font-bold text-white">{tempoTotalHoras}h</p>
            <p className="text-white/60 text-xs mt-2">
              {tempoTotalMinutos.toLocaleString()} minutos
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
          >
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              Obras por Status
            </h3>
            <div className="space-y-4">
              {obrasPorStatus.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 text-sm">{item.status}</span>
                    <span className="text-white font-semibold">
                      {item.count}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(item.count / maxStatusCount) * 100}%`,
                      }}
                      transition={{ duration: 0.8, delay: 0.5 + index * 0.1 }}
                      className={`h-full bg-purple-600 rounded-full`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
          >
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              Obras por Ano de Lançamento
            </h3>
            <div className="space-y-4">
              {anosOrdenados.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 text-sm">{item.ano}</span>
                    <span className="text-white font-semibold">
                      {item.count} obras
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(item.count / maxAnoCount) * 100}%`,
                      }}
                      transition={{ duration: 0.8, delay: 0.8 + index * 0.05 }}
                      className="h-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
          className="mt-6 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
        >
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-500" />
            Duração Média por Tipo
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300 text-sm">Filmes</span>
                <span className="text-white font-semibold">
                  {mediaFilmeMin} min
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 rounded-full"
                  style={{
                    width: `${Math.min(100, (mediaFilmeMin / 180) * 100)}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300 text-sm">
                  Séries (por episódio)
                </span>
                <span className="text-white font-semibold">
                  {mediaSerieMin} min
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 rounded-full"
                  style={{
                    width: `${Math.min(100, (mediaSerieMin / 60) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-6 bg-gray-800/50 rounded-xl p-6 border border-gray-700"
        >
          <h3 className="text-xl font-semibold text-white mb-4">
            {" "}
            Resumo Geral
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-400">
                {totalFilmes}
              </p>
              <p className="text-gray-400 text-sm mt-1">Filmes</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-400">
                {totalSeries}
              </p>
              <p className="text-gray-400 text-sm mt-1">Séries</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Estatisticas;
