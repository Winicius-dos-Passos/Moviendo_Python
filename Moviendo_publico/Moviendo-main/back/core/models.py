from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator, RegexValidator
from django.utils import timezone

class TipoObra(models.TextChoices):
    FILME = 'FILME', 'Filme'
    SERIE = 'SERIE', 'Série'
    DOCUMENTARIO = 'DOCUMENTARIO', 'Documentário'

class StatusObra(models.TextChoices):
    QUERO_ASSISTIR = 'QUERO_ASSISTIR', 'Quero Assistir'
    ASSISTINDO = 'ASSISTINDO', 'Assistindo'
    ASSISTIDO = 'ASSISTIDO', 'Assistido'

# --- MODELOS INDEPENDENTES ---

class Diretor(models.Model):
    nome = models.CharField(max_length=255, unique=True, verbose_name="Nome")
    biografia = models.TextField(null=True, blank=True, verbose_name="Biografia")
    url_foto = models.URLField(max_length=255, null=True, blank=True, verbose_name="URL da Foto")

    class Meta:
        db_table = 'diretores'
        verbose_name = 'Diretor'
        verbose_name_plural = 'Diretores'

    def __str__(self):
        return self.nome

class Genero(models.Model):
    nome = models.CharField(max_length=100, unique=True, verbose_name="Nome")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'generos'
        verbose_name = 'Gênero'
        verbose_name_plural = 'Gêneros'

    def __str__(self):
        return self.nome

class Plataforma(models.Model):
    nome = models.CharField(max_length=100, unique=True, verbose_name="Nome")
    logo = models.CharField(max_length=500, null=True, blank=True, verbose_name="URL do Logo")
    cor = models.CharField(
        max_length=7, null=True, blank=True,
        validators=[RegexValidator(regex=r'^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$', message='Cor deve ser #RRGGBB')],
        verbose_name="Cor (Hex)"
    )
    url = models.URLField(max_length=255, null=True, blank=True, verbose_name="URL do Site")
    ativa = models.BooleanField(default=True, verbose_name="Ativa?")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'plataformas'
        verbose_name = 'Plataforma'
        verbose_name_plural = 'Plataformas'

    def __str__(self):
        return self.nome

class Tag(models.Model):
    nome = models.CharField(max_length=50, unique=True, verbose_name="Nome")
    cor = models.CharField(
        max_length=7, null=True, blank=True,
        validators=[RegexValidator(regex=r'^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$', message='Cor deve ser #RRGGBB')],
        verbose_name="Cor (Hex)"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'tags'
        verbose_name = 'Tag'
        verbose_name_plural = 'Tags'

    def __str__(self):
        return self.nome

# --- MODELOS PRINCIPAIS ---

class Obra(models.Model):
    titulo = models.CharField(max_length=255, verbose_name="Título")
    sinopse = models.TextField(max_length=5000, null=True, blank=True, verbose_name="Sinopse")
    ano_lancamento = models.IntegerField(null=True, blank=True, verbose_name="Ano de Lançamento")
    duracao_minutos = models.IntegerField(null=True, blank=True, verbose_name="Duração (minutos)")
    url_capa = models.URLField(max_length=255, null=True, blank=True, verbose_name="URL da Capa")
    
    tipo = models.CharField(max_length=20, choices=TipoObra.choices, verbose_name="Tipo")
    status = models.CharField(max_length=20, choices=StatusObra.choices, verbose_name="Status")
    
    # Relacionamentos
    diretores = models.ManyToManyField(Diretor, related_name='obras', blank=True)
    generos = models.ManyToManyField(Genero, related_name='obras', blank=True)
    plataformas = models.ManyToManyField(Plataforma, related_name='obras', blank=True)
    tags = models.ManyToManyField(Tag, related_name='obras', blank=True)

    # Controle de Série
    temporada_atual = models.IntegerField(null=True, blank=True)
    episodio_atual = models.IntegerField(null=True, blank=True)
    total_temporadas = models.IntegerField(null=True, blank=True)
    total_episodios = models.IntegerField(null=True, blank=True)
    
    data_assistido = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'obras'
        verbose_name = 'Obra'
        verbose_name_plural = 'Obras'
    
    def __str__(self):
        return f"{self.titulo}"

class Avaliacao(models.Model):
    obra = models.ForeignKey(Obra, on_delete=models.CASCADE, related_name='avaliacoes')
    nota = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(10.0)],
        verbose_name="Nota",
        help_text="0.0 a 10.0"
    )
    comentario = models.CharField(max_length=2000, null=True, blank=True)
    data_avaliacao = models.DateTimeField(default=timezone.now)
    editado = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'avaliacoes'
        verbose_name = 'Avaliação'
        verbose_name_plural = 'Avaliações'

    def save(self, *args, **kwargs):
        if self.pk is not None:
            self.editado = True
        super().save(*args, **kwargs)

    def __str__(self):
        return f'Nota {self.nota} para {self.obra}'