from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import transaction
from .models import Obra, TipoObra, StatusObra
from apps.diretores.models import Diretor
from apps.generos.models import Genero
from integrations.tmdb.client import TMDBClient


class ObraService:
    def __init__(self):
        self.tmdb_client = TMDBClient()

    @transaction.atomic
    def importar_do_tmdb(self, tmdb_id, tipo_tmdb):
        self._validar_parametros(tmdb_id, tipo_tmdb)
        
        dados = self.tmdb_client.get_detalhes(tmdb_id, tipo_tmdb)
        
        obra = self._criar_obra_do_tmdb(dados, tipo_tmdb)
        self._associar_generos(obra, dados.get('genres', []))
        self._associar_diretores(obra, dados, tipo_tmdb)
        
        obra.save()
        return obra

    def _validar_parametros(self, tmdb_id, tipo_tmdb):
        if not tmdb_id:
            raise ValidationError("tmdb_id é obrigatório")
        if tipo_tmdb not in ['movie', 'tv']:
            raise ValidationError("tipo deve ser 'movie' ou 'tv'")

    def _criar_obra_do_tmdb(self, dados, tipo_tmdb):
        eh_filme = (tipo_tmdb == 'movie')
        
        titulo = dados.get('title') if eh_filme else dados.get('name')
        data_lancamento_str = dados.get('release_date') if eh_filme else dados.get('first_air_date')
        
        ano = None
        if data_lancamento_str:
            try:
                ano = int(data_lancamento_str.split('-')[0])
            except (ValueError, IndexError):
                pass

        duracao = 0
        if eh_filme:
            duracao = dados.get('runtime', 0)
        else:
            tempos = dados.get('episode_run_time', [])
            duracao = tempos[0] if tempos else 0

        nota_imdb = dados.get('vote_average')
        if nota_imdb is not None:
            try:
                nota_imdb = round(float(nota_imdb), 1)
            except (ValueError, TypeError):
                nota_imdb = None

        obra = Obra(
            titulo=titulo,
            sinopse=dados.get('overview', ''),
            ano_lancamento=ano,
            duracao_minutos=duracao,
            url_capa=self._montar_url_capa(dados.get('poster_path')),
            tipo=TipoObra.FILME if eh_filme else TipoObra.SERIE,
            status=StatusObra.QUERO_ASSISTIR,
            nota_imdb=nota_imdb,
            total_temporadas=dados.get('number_of_seasons') if not eh_filme else None,
            total_episodios=dados.get('number_of_episodes') if not eh_filme else None,
        )
        obra.save()
        return obra

    def _montar_url_capa(self, poster_path):
        if poster_path:
            return f"{settings.TMDB_IMAGE_BASE_URL}/w500{poster_path}"
        return None

    def _associar_generos(self, obra, generos_tmdb):
        for gen in generos_tmdb:
            genero_obj, _ = Genero.objects.get_or_create(nome=gen['name'])
            obra.generos.add(genero_obj)

    def _associar_diretores(self, obra, dados, tipo_tmdb):
        diretores_para_adicionar = []
        
        if tipo_tmdb == 'movie':
            crew = dados.get('credits', {}).get('crew', [])
            for pessoa in crew:
                if pessoa.get('job') == 'Director':
                    diretores_para_adicionar.append(pessoa)
        else:
            diretores_para_adicionar = dados.get('created_by', [])

        for pessoa in diretores_para_adicionar:
            diretor_obj, _ = Diretor.objects.get_or_create(
                nome=pessoa['name'],
                defaults={'biografia': f"Importado do TMDB ID {pessoa.get('id')}"}
            )
            obra.diretores.add(diretor_obj)
