import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Film, Star, Clock, Calendar, Award, FileDown } from 'lucide-react';
import obrasService from '../services/obrasService';
import avaliacoesService from '../services/avaliacoesService';
import reportsService from '../services/reportsService';
import toast from 'react-hot-toast';

const Estatisticas = () => {
  const [obras, setObras] = useState([]);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadRelatorio = async (tipo) => {
    setDownloading(true);
    try {
      if (tipo === 'obras') {
        await reportsService.downloadRelatorioObras();
        toast.success('Relatório de obras baixado!');
      } else if (tipo === 'genero') {
        await reportsService.downloadRelatorioPorGenero();
        toast.success('Relatório por gênero baixado!');
      } else if (tipo === 'estatisticas') {
        await reportsService.downloadRelatorioEstatisticas();
        toast.success('Relatório de estatísticas baixado!');
      }
    } catch (error) {
      toast.error('Erro ao baixar relatório');
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [obrasData, avaliacoesData] = await Promise.all([
          obrasService.getAll(),
          avaliacoesService.getAll(),
        ]);
        
        setObras(obrasData);
        setAvaliacoes(avaliacoesData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar estatísticas');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalObras = obras.length;
  const totalFilmes = obras.filter(o => o.tipo === 'FILME').length;
  const totalSeries = obras.filter(o => o.tipo === 'SERIE').length;
  const totalConcluidas = obras.filter(o => o.status === 'ASSISTIDO').length;
  const totalAssistindo = obras.filter(o => o.status === 'ASSISTINDO').length;
  
  const tempoTotalMinutos = obras
    .filter(o => o.duracaoMinutos)
    .reduce((acc, o) => acc + o.duracaoMinutos, 0);
  const tempoTotalHoras = Math.floor(tempoTotalMinutos / 60);
  
  const mediaAvaliacoes = avaliacoes.length > 0
    ? (avaliacoes.reduce((acc, a) => acc + a.nota, 0) / avaliacoes.length).toFixed(1)
    : 0;
  
  const obrasPorStatus = [
    { status: 'Quero Assistir', count: obras.filter(o => o.status === 'QUERO_ASSISTIR').length, color: 'bg-blue-500' },
    { status: 'Assistindo', count: obras.filter(o => o.status === 'ASSISTINDO').length, color: 'bg-yellow-500' },
    { status: 'Assistido', count: obras.filter(o => o.status === 'ASSISTIDO').length, color: 'bg-purple-500' },
  ];
  
  const maxStatusCount = Math.max(...obrasPorStatus.map(s => s.count), 1);
  
  const generosCount = {};
  obras.forEach(obra => {
    obra.generos?.forEach(genero => {
      generosCount[genero.nome] = (generosCount[genero.nome] || 0) + 1;
    });
  });
  
  const topGeneros = Object.entries(generosCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([nome, count]) => ({ nome, count }));
  
  const maxGeneroCount = Math.max(...topGeneros.map(g => g.count), 1);
  
  const diretoresCount = {};
  obras.forEach(obra => {
    obra.diretores?.forEach(diretor => {
      diretoresCount[diretor.nome] = (diretoresCount[diretor.nome] || 0) + 1;
    });
  });
  
  const topDiretores = Object.entries(diretoresCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([nome, count]) => ({ nome, count }));
  
  const maxDiretorCount = Math.max(...topDiretores.map(d => d.count), 1);
  
  const obrasPorAno = {};
  obras.forEach(obra => {
    if (obra.anoLancamento) {
      obrasPorAno[obra.anoLancamento] = (obrasPorAno[obra.anoLancamento] || 0) + 1;
    }
  });
  
  const anosOrdenados = Object.entries(obrasPorAno)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .slice(-10) 
    .map(([ano, count]) => ({ ano, count }));
  
  const maxAnoCount = Math.max(...anosOrdenados.map(a => a.count), 1);

  const plataformasCount = {};
  obras.forEach(obra => {
    obra.plataformas?.forEach(p => {
      const key = p.nome || p.name;
      if (key) plataformasCount[key] = (plataformasCount[key] || 0) + 1;
    });
  });
  const topPlataformas = Object.entries(plataformasCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([nome, count]) => ({ nome, count }));
  const maxPlataformaCount = Math.max(...topPlataformas.map(p => p.count), 1);

  const filmesDuracoes = obras.filter(o => o.tipo === 'FILME' && o.duracaoMinutos).map(o => o.duracaoMinutos);
  const seriesDuracoes = obras.filter(o => o.tipo === 'SERIE' && o.duracaoMinutos).map(o => o.duracaoMinutos);
  const avg = arr => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
  const mediaFilmeMin = avg(filmesDuracoes);
  const mediaSerieMin = avg(seriesDuracoes);

  const filmes = obras.filter(o => o.tipo === 'FILME');
  const series = obras.filter(o => o.tipo === 'SERIE');
  const filmeMaiorNota = filmes.reduce((best, o) => (o.notaImdb || -1) > (best?.notaImdb || -1) ? o : best, null);
  const filmeMaisLongo = filmes.reduce((longest, o) => (o.duracaoMinutos || 0) > (longest?.duracaoMinutos || 0) ? o : longest, null);
  const serieMaisLonga = series.reduce((acc, o) => (o.totalEpisodios || 0) > (acc?.totalEpisodios || 0) ? o : acc, null);
  const diretorNotasMap = {};
  obras.forEach(o => {
    if (o.notaImdb && o.diretores) {
      o.diretores.forEach(d => {
        const k = d.nome;
        if (!k) return;
        if (!diretorNotasMap[k]) diretorNotasMap[k] = [];
        diretorNotasMap[k].push(o.notaImdb);
      });
    }
  });
  const diretorMaiorMedia = Object.entries(diretorNotasMap)
    .map(([nome, notas]) => ({ nome, media: notas.reduce((a,b)=>a+b,0)/notas.length, qtd: notas.length }))
    .sort((a,b)=> b.media - a.media)[0] || null;
  const melhorPorGenero = {};
  filmes.forEach(f => {
    f.generos?.forEach(g => {
      const n = g.nome;
      if (!n) return;
      if (!melhorPorGenero[n] || (f.notaImdb || 0) > (melhorPorGenero[n].notaImdb || 0)) {
        melhorPorGenero[n] = f;
      }
    });
  });
  const melhoresGenerosLista = Object.entries(melhorPorGenero)
    .map(([genero, obra]) => ({ genero, obra }))
    .sort((a,b)=> (b.obra.notaImdb||0) - (a.obra.notaImdb||0))
    .slice(0, 3);

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
              <p className="text-gray-400">Análise completa da sua coleção de obras</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleDownloadRelatorio('obras')}
                disabled={downloading}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <FileDown className="w-4 h-4" />
                Relatório Obras
              </button>
              <button
                onClick={() => handleDownloadRelatorio('genero')}
                disabled={downloading}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <FileDown className="w-4 h-4" />
                Por Gênero
              </button>
              <button
                onClick={() => handleDownloadRelatorio('estatisticas')}
                disabled={downloading}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <FileDown className="w-4 h-4" />
                Estatísticas
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h4 className="text-sm text-gray-400 mb-1">Filme com maior nota</h4>
            <p className="text-white text-lg font-semibold truncate">{filmeMaiorNota?.titulo || '—'}</p>
            <p className="text-gray-400 text-sm mt-1">Nota: {filmeMaiorNota?.notaImdb?.toFixed?.(1) || '—'}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h4 className="text-sm text-gray-400 mb-1">Diretor com maior média</h4>
            <p className="text-white text-lg font-semibold truncate">{diretorMaiorMedia?.nome || '—'}</p>
            <p className="text-gray-400 text-sm mt-1">Média: {diretorMaiorMedia ? diretorMaiorMedia.media.toFixed(1) : '—'} ({diretorMaiorMedia?.qtd || 0} obras)</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h4 className="text-sm text-gray-400 mb-1">Filme mais longo</h4>
            <p className="text-white text-lg font-semibold truncate">{filmeMaisLongo?.titulo || '—'}</p>
            <p className="text-gray-400 text-sm mt-1">Duração: {filmeMaisLongo?.duracaoMinutos ? `${filmeMaisLongo.duracaoMinutos} min` : '—'}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h4 className="text-sm text-gray-400 mb-1">Série mais longa</h4>
            <p className="text-white text-lg font-semibold truncate">{serieMaisLonga?.titulo || '—'}</p>
            <p className="text-gray-400 text-sm mt-1">Episódios: {serieMaisLonga?.totalEpisodios || '—'}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/10 rounded-lg">
                <Film className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-white/60" />
            </div>
            <h3 className="text-white/80 text-sm font-medium mb-1">Total de Obras</h3>
            <p className="text-4xl font-bold text-white">{totalObras}</p>
            <p className="text-white/60 text-xs mt-2">{totalFilmes} filmes • {totalSeries} séries</p>
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
            <h3 className="text-white/80 text-sm font-medium mb-1">Concluídas</h3>
            <p className="text-4xl font-bold text-white">{totalConcluidas}</p>
            <p className="text-white/60 text-xs mt-2">{totalAssistindo} assistindo agora</p>
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
            <h3 className="text-white/80 text-sm font-medium mb-1">Tempo Assistido</h3>
            <p className="text-4xl font-bold text-white">{tempoTotalHoras}h</p>
            <p className="text-white/60 text-xs mt-2">{tempoTotalMinutos.toLocaleString()} minutos</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Star className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-white/60" />
            </div>
            <h3 className="text-white/80 text-sm font-medium mb-1">Média de Avaliações</h3>
            <p className="text-4xl font-bold text-white">{mediaAvaliacoes}/10</p>
            <p className="text-white/60 text-xs mt-2">{avaliacoes.length} avaliações feitas</p>
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
                    <span className="text-white font-semibold">{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.count / maxStatusCount) * 100}%` }}
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
            transition={{ delay: 0.55 }}
            className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
          >
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              Top Plataformas
            </h3>
            <div className="space-y-4">
              {topPlataformas.map((plataforma, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 text-sm">{plataforma.nome}</span>
                    <span className="text-white font-semibold">{plataforma.count}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(plataforma.count / maxPlataformaCount) * 100}%` }}
                      transition={{ duration: 0.8, delay: 0.6 + index * 0.1 }}
                      className="h-full bg-purple-600 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
          >
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Film className="w-5 h-5 text-purple-500" />
              Top 5 Gêneros
            </h3>
            <div className="space-y-4">
              {topGeneros.map((genero, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 text-sm">{genero.nome}</span>
                    <span className="text-white font-semibold">{genero.count} obras</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(genero.count / maxGeneroCount) * 100}%` }}
                      transition={{ duration: 0.8, delay: 0.6 + index * 0.1 }}
                      className="h-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
          >
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-500" />
              Top 5 Diretores
            </h3>
            <div className="space-y-4">
              {topDiretores.map((diretor, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 text-sm">{diretor.nome}</span>
                    <span className="text-white font-semibold">{diretor.count} obras</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(diretor.count / maxDiretorCount) * 100}%` }}
                      transition={{ duration: 0.8, delay: 0.7 + index * 0.1 }}
                      className="h-full bg-purple-600 rounded-full"
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
                    <span className="text-white font-semibold">{item.count} obras</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.count / maxAnoCount) * 100}%` }}
                      transition={{ duration: 0.8, delay: 0.8 + index * 0.05 }}
                      className="h-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="mt-6 bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">Melhor filme por gênero</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {melhoresGenerosLista.map(item => (
              <div key={item.genero} className="bg-gray-900/40 rounded-lg p-4 border border-gray-700">
                <p className="text-sm text-gray-400 mb-1">{item.genero}</p>
                <p className="text-white font-semibold truncate">{item.obra?.titulo || '—'}</p>
                <p className="text-gray-400 text-sm mt-1">Nota: {item.obra?.notaImdb?.toFixed?.(1) || '—'}</p>
              </div>
            ))}
          </div>
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
                <span className="text-white font-semibold">{mediaFilmeMin} min</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 rounded-full"
                  style={{ width: `${Math.min(100, (mediaFilmeMin / 180) * 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300 text-sm">Séries (por episódio)</span>
                <span className="text-white font-semibold">{mediaSerieMin} min</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 rounded-full"
                  style={{ width: `${Math.min(100, (mediaSerieMin / 60) * 100)}%` }}
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
          <h3 className="text-xl font-semibold text-white mb-4"> Resumo Geral</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-400">{totalFilmes}</p>
              <p className="text-gray-400 text-sm mt-1">Filmes</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-400">{totalSeries}</p>
              <p className="text-gray-400 text-sm mt-1">Séries</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-400">{Object.keys(generosCount).length}</p>
              <p className="text-gray-400 text-sm mt-1">Gêneros Diferentes</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-400">{Object.keys(diretoresCount).length}</p>
              <p className="text-gray-400 text-sm mt-1">Diretores Diferentes</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Estatisticas;
