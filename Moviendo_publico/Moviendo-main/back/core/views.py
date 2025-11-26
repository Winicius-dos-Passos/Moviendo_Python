from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Diretor, Genero, Plataforma, Tag, Obra, Avaliacao, Lista
from .serializers import (
    DiretorSerializer, GeneroSerializer, PlataformaSerializer, 
    TagSerializer, ObraSerializer, AvaliacaoSerializer, ListaSerializer
)
from .services import TMDBService, importar_obra_pelo_id

class DiretorViewSet(viewsets.ModelViewSet):
    queryset = Diretor.objects.all()
    serializer_class = DiretorSerializer

class GeneroViewSet(viewsets.ModelViewSet):
    queryset = Genero.objects.all()
    serializer_class = GeneroSerializer

class PlataformaViewSet(viewsets.ModelViewSet):
    queryset = Plataforma.objects.all()
    serializer_class = PlataformaSerializer

class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer

class ObraViewSet(viewsets.ModelViewSet):
    queryset = Obra.objects.all()
    serializer_class = ObraSerializer

    @action(detail=False, methods=['get'])
    def pesquisar_tmdb(self, request):
        query = request.query_params.get('query')
        if not query:
            return Response({"erro": "Parâmetro 'query' é obrigatório"}, status=400)
        
        service = TMDBService()
        resultados = service.buscar_no_tmdb(query)
        return Response(resultados)

    @action(detail=False, methods=['post'])
    def importar_tmdb(self, request):
        # O CamelCaseJSONParser converteu as chaves para snake_case automaticamente
        tmdb_id = request.data.get('tmdb_id') 
        tipo = request.data.get('tipo')
        
        # Debug: Se quiser ver o que está chegando, descomente a linha abaixo
        # print(f"Dados recebidos: {request.data}")

        if not tmdb_id or not tipo:
            return Response({"erro": "tmdbId e tipo são obrigatórios"}, status=400)
            
        try:
            obra = importar_obra_pelo_id(tmdb_id, tipo)
            serializer = self.get_serializer(obra)
            return Response(serializer.data, status=201)
        except Exception as e:
            return Response({"erro": str(e)}, status=500)

class AvaliacaoViewSet(viewsets.ModelViewSet):
    queryset = Avaliacao.objects.all()
    serializer_class = AvaliacaoSerializer

class ListaViewSet(viewsets.ModelViewSet):
    queryset = Lista.objects.all()
    serializer_class = ListaSerializer