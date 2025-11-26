from rest_framework import viewsets
from .models import Diretor, Genero, Plataforma, Tag, Obra, Avaliacao
from .serializers import (
    DiretorSerializer, GeneroSerializer, PlataformaSerializer, 
    TagSerializer, ObraSerializer, AvaliacaoSerializer
)

# ViewSets criam automaticamente as rotas GET, POST, PUT, DELETE

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

class AvaliacaoViewSet(viewsets.ModelViewSet):
    queryset = Avaliacao.objects.all()
    serializer_class = AvaliacaoSerializer