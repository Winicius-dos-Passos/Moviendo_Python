from rest_framework import serializers
from .models import Diretor, Genero, Plataforma, Tag, Obra, Avaliacao, Lista

# --- SERIALIZERS DE RESUMO (ResponseDTO) ---
class DiretorResumoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Diretor
        fields = ['id', 'nome']

class GeneroResumoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genero
        fields = ['id', 'nome']

class PlataformaResumoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plataforma
        fields = ['id', 'nome']

class TagResumoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'nome']

# --- SERIALIZERS COMPLETOS (CRUD) ---

class DiretorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Diretor
        fields = '__all__'

class GeneroSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genero
        fields = '__all__'

class PlataformaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plataforma
        fields = '__all__'

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = '__all__'

class ObraSerializer(serializers.ModelSerializer):
    # --- CONFIGURAÇÃO DE ESCRITA (RequestDTO) ---
    diretoresIds = serializers.PrimaryKeyRelatedField(
        source='diretores', queryset=Diretor.objects.all(), many=True, write_only=True, required=False
    )
    generosIds = serializers.PrimaryKeyRelatedField(
        source='generos', queryset=Genero.objects.all(), many=True, write_only=True, required=False
    )
    plataformasIds = serializers.PrimaryKeyRelatedField(
        source='plataformas', queryset=Plataforma.objects.all(), many=True, write_only=True, required=False
    )
    tagsIds = serializers.PrimaryKeyRelatedField(
        source='tags', queryset=Tag.objects.all(), many=True, write_only=True, required=False
    )

    # --- CONFIGURAÇÃO DE LEITURA (ResponseDTO) ---
    diretores = DiretorResumoSerializer(many=True, read_only=True)
    generos = GeneroResumoSerializer(many=True, read_only=True)
    plataformas = PlataformaResumoSerializer(many=True, read_only=True)
    tags = TagResumoSerializer(many=True, read_only=True)

    class Meta:
        model = Obra
        fields = [
            'id', 'titulo', 'sinopse', 'ano_lancamento', 'duracao_minutos',
            'url_capa', 'tipo', 'status', 'onde_assistir',
            'temporada_atual', 'episodio_atual', 'total_temporadas', 'total_episodios',
            'comentario', 'data_assistido', 'created_at', 'updated_at',
            # Campos de Leitura
            'diretores', 'generos', 'plataformas', 'tags',
            # Campos de Escrita
            'diretoresIds', 'generosIds', 'plataformasIds', 'tagsIds'
        ]

class AvaliacaoSerializer(serializers.ModelSerializer):
    # Usamos snake_case (obra_id) no Python.
    # A biblioteca camel-case converte automaticamente para obraId no JSON.
    obra_id = serializers.PrimaryKeyRelatedField(
        source='obra', queryset=Obra.objects.all(), write_only=True
    )

    # Usamos snake_case (obra_titulo).
    # Vai virar obraTitulo no JSON.
    obra_titulo = serializers.CharField(source='obra.titulo', read_only=True)

    class Meta:
        model = Avaliacao
        fields = [
            'id', 'nota', 'comentario', 'data_avaliacao', 'editado', 
            'created_at', 'updated_at',
            'obra_id',      # Escrita (ID)
            'obra_titulo'   # Leitura (Texto)
        ]

class ListaSerializer(serializers.ModelSerializer):
    # ESCRITA: Recebe IDs
    obrasIds = serializers.PrimaryKeyRelatedField(
        source='obras', 
        queryset=Obra.objects.all(), 
        many=True, 
        write_only=True,
        required=False
    )

    # LEITURA: Devolve os objetos completos
    obras = ObraSerializer(many=True, read_only=True)

    class Meta:
        model = Lista
        fields = [
            'id', 'nome', 'descricao', 'tipo', 'ordem', 
            'created_at', 'updated_at',
            'obras',     # Leitura
            'obrasIds'   # Escrita
        ]