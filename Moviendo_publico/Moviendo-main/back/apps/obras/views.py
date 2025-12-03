from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Obra
from .serializers import ObraSerializer, ImportarTmdbSerializer
from .services import ObraService
from integrations.tmdb.client import TMDBClient


class ObraViewSet(viewsets.ModelViewSet):
    queryset = Obra.objects.prefetch_related(
        'diretores', 
        'generos', 
        'plataformas', 
        'tags'
    ).all()
    serializer_class = ObraSerializer

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.obra_service = ObraService()
        self.tmdb_client = TMDBClient()

    @action(detail=False, methods=['get'])
    def pesquisar_tmdb(self, request):
        query = request.query_params.get('query')
        if not query:
            return Response(
                {"erro": "Parâmetro 'query' é obrigatório"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        resultados = self.tmdb_client.buscar(query)
        return Response(resultados)

    @action(detail=False, methods=['post'])
    def importar_tmdb(self, request):
        serializer = ImportarTmdbSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        obra = self.obra_service.importar_do_tmdb(
            tmdb_id=serializer.validated_data['tmdb_id'],
            tipo=serializer.validated_data['tipo']
        )
        
        return Response(
            ObraSerializer(obra).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=['get'])
    def get_tmdb_details(self, request):
        tmdb_id = request.query_params.get('tmdb_id')
        tipo = request.query_params.get('tipo')
        
        if not tmdb_id or not tipo:
            return Response(
                {"erro": "Parâmetros 'tmdb_id' e 'tipo' são obrigatórios"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            detalhes = self.tmdb_client.get_detalhes(tmdb_id, tipo)
            return Response(detalhes)
        except Exception as e:
            return Response(
                {"erro": str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

