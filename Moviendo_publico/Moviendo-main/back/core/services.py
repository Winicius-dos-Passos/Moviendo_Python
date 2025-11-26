import requests
from django.conf import settings
from django.core.exceptions import ValidationError
from .models import Obra, Diretor, Genero, TipoObra, StatusObra

class TMDBService:
    def __init__(self):
        self.api_key = settings.TMDB_API_KEY
        self.base_url = settings.TMDB_BASE_URL
        # Configuração correta para Bearer Token (Chave longa)
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json;charset=utf-8"
        }
        # Parametros comuns (sem a api_key aqui, pois ela vai no header)
        self.params_common = {"language": "pt-BR"}

    def buscar_no_tmdb(self, query):
        """
        Pesquisa filmes e séries pelo nome (Search Multi)
        """
        url = f"{self.base_url}/search/multi"
        params = {**self.params_common, "query": query}
        
        # IMPORTANTE: Passamos headers=self.headers aqui!
        response = requests.get(url, headers=self.headers, params=params)
        
        if response.status_code == 200:
            return response.json().get('results', [])
        else:
            # Print para ajudar a debugar no terminal se der erro
            print(f"Erro TMDB: {response.status_code} - {response.text}")
            return []

    def get_detalhes(self, tmdb_id, tipo):
        """
        Busca os detalhes completos (Movie ou TV) + Créditos
        """
        endpoint = "movie" if tipo == 'movie' else "tv"
        url = f"{self.base_url}/{endpoint}/{tmdb_id}"
        
        params = {**self.params_common, "append_to_response": "credits"}
        
        response = requests.get(url, headers=self.headers, params=params)
        
        if response.status_code == 200:
            return response.json()
        return None

def importar_obra_pelo_id(tmdb_id, tipo_tmdb):
    """
    Função Mágica para salvar no banco
    """
    service = TMDBService()
    dados = service.get_detalhes(tmdb_id, tipo_tmdb)

    if not dados:
        raise ValidationError("Obra não encontrada no TMDB.")

    # --- 1. Mapeamento ---
    eh_filme = (tipo_tmdb == 'movie')
    
    titulo = dados.get('title') if eh_filme else dados.get('name')
    data_lancamento_str = dados.get('release_date') if eh_filme else dados.get('first_air_date')
    
    ano = None
    if data_lancamento_str:
        try:
            ano = int(data_lancamento_str.split('-')[0])
        except:
            pass

    duracao = 0
    if eh_filme:
        duracao = dados.get('runtime', 0)
    else:
        tempos = dados.get('episode_run_time', [])
        duracao = tempos[0] if tempos else 0

    # Cria Obra
    nova_obra = Obra(
        titulo=titulo,
        sinopse=dados.get('overview', ''),
        ano_lancamento=ano,
        duracao_minutos=duracao,
        url_capa=f"{settings.TMDB_IMAGE_BASE_URL}/w500{dados.get('poster_path')}" if dados.get('poster_path') else None,
        tipo=TipoObra.FILME if eh_filme else TipoObra.SERIE,
        status=StatusObra.QUERO_ASSISTIR,
        # Séries
        total_temporadas=dados.get('number_of_seasons') if not eh_filme else None,
        total_episodios=dados.get('number_of_episodes') if not eh_filme else None,
    )
    nova_obra.save()

    # --- 2. Gêneros ---
    generos_tmdb = dados.get('genres', [])
    for gen in generos_tmdb:
        genero_obj, _ = Genero.objects.get_or_create(nome=gen['name'])
        nova_obra.generos.add(genero_obj)

    # --- 3. Diretores ---
    diretores_para_adicionar = []
    if eh_filme:
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
        nova_obra.diretores.add(diretor_obj)

    nova_obra.save()
    return nova_obra