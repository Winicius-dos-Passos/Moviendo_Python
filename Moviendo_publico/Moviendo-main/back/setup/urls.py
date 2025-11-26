"""
URL configuration for setup project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView

from core.views import (
    DiretorViewSet, GeneroViewSet, PlataformaViewSet, 
    TagViewSet, ObraViewSet, AvaliacaoViewSet, ListaViewSet
)

# Configuração do Router (Gera as URLs da API automaticamente)
router = DefaultRouter()
router.register(r'diretores', DiretorViewSet)
router.register(r'generos', GeneroViewSet)
router.register(r'plataformas', PlataformaViewSet)
router.register(r'tags', TagViewSet)
router.register(r'obras', ObraViewSet)
router.register(r'avaliacoes', AvaliacaoViewSet)
router.register(r'listas', ListaViewSet)

urlpatterns = [
    # Painel Administrativo do Django
    path('admin/', admin.site.urls),
    
    # Rotas da API (inclui todas as registradas no router acima)
    path('api/', include(router.urls)),
    
    # --- Rotas da Documentação (Swagger/OpenAPI) ---
    # Gera o arquivo de esquema (YAML) necessário para a documentação
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    
    # Interface gráfica Swagger UI (Igual ao Java/SpringDoc)
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    
    # Interface alternativa de documentação (Redoc)
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]