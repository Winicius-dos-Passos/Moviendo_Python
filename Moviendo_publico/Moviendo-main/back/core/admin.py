from django.contrib import admin
from .models import Diretor, Genero, Plataforma, Tag, Obra, Avaliacao

# Registrando os modelos para aparecerem no painel
admin.site.register(Diretor)
admin.site.register(Genero)
admin.site.register(Plataforma)
admin.site.register(Tag)
admin.site.register(Obra)
admin.site.register(Avaliacao)