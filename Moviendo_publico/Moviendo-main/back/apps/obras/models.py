from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.diretores.models import Diretor
from apps.generos.models import Genero
from apps.plataformas.models import Plataforma
from apps.tags.models import Tag


class TipoObra(models.TextChoices):
    FILME = 'filme', 'Filme'
    SERIE = 'serie', 'Série'


class StatusObra(models.TextChoices):
    QUERO_ASSISTIR = 'quero_assistir', 'Quero Assistir'
    ASSISTINDO = 'assistindo', 'Assistindo'
    ASSISTIDO = 'assistido', 'Assistido'
    PAUSADO = 'pausado', 'Pausado'
    ABANDONADO = 'abandonado', 'Abandonado'


class Obra(models.Model):
    titulo = models.CharField(max_length=255, verbose_name="Título")
    sinopse = models.TextField(max_length=5000, null=True, blank=True, verbose_name="Sinopse")
    ano_lancamento = models.IntegerField(
        null=True, 
        blank=True, 
        validators=[MinValueValidator(1900), MaxValueValidator(2100)],
        verbose_name="Ano de Lançamento"
    )
    duracao_minutos = models.IntegerField(
        null=True, 
        blank=True, 
        validators=[MinValueValidator(1)],
        verbose_name="Duração (minutos)"
    )
    url_capa = models.URLField(max_length=255, null=True, blank=True, verbose_name="URL da Capa")
    tipo = models.CharField(max_length=20, choices=TipoObra.choices, verbose_name="Tipo")
    status = models.CharField(max_length=20, choices=StatusObra.choices, verbose_name="Status")
    nota_imdb = models.DecimalField(
        max_digits=3,
        decimal_places=1,
        null=True,
        blank=True,
        validators=[MinValueValidator(0.0), MaxValueValidator(10.0)],
        verbose_name="Nota IMDB"
    )
    
    total_episodios = models.IntegerField(
        null=True, 
        blank=True, 
        validators=[MinValueValidator(1)],
        verbose_name="Total de Episódios"
    )
    total_temporadas = models.IntegerField(
        null=True, 
        blank=True, 
        validators=[MinValueValidator(1)],
        verbose_name="Total de Temporadas"
    )
    episodio_atual = models.IntegerField(
        null=True, 
        blank=True, 
        validators=[MinValueValidator(0)],
        verbose_name="Episódio Atual"
    )
    temporada_atual = models.IntegerField(
        null=True, 
        blank=True, 
        validators=[MinValueValidator(0)],
        verbose_name="Temporada Atual"
    )
    
    comentario = models.TextField(max_length=2000, null=True, blank=True, verbose_name="Comentário")
    
    diretores = models.ManyToManyField(Diretor, related_name='obras', blank=True)
    generos = models.ManyToManyField(Genero, related_name='obras', blank=True)
    plataformas = models.ManyToManyField(Plataforma, related_name='obras', blank=True)
    tags = models.ManyToManyField(Tag, related_name='obras', blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'obras'
        verbose_name = 'Obra'
        verbose_name_plural = 'Obras'
        ordering = ['-created_at']

    def __str__(self):
        return self.titulo

    def clean(self):
        from django.core.exceptions import ValidationError
        
        if self.tipo == TipoObra.SERIE:
            if self.episodio_atual and self.total_episodios:
                if self.episodio_atual > self.total_episodios:
                    raise ValidationError("Episódio atual não pode ser maior que o total de episódios")
            
            if self.temporada_atual and self.total_temporadas:
                if self.temporada_atual > self.total_temporadas:
                    raise ValidationError("Temporada atual não pode ser maior que o total de temporadas")
