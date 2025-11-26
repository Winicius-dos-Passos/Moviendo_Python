from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ValidationError, NotFound, ParseError
from django.db import IntegrityError
from django.http import Http404
from datetime import datetime

def custom_exception_handler(exc, context):
    """
    Substitui o handler padrão do Django REST Framework para
    retornar o JSON no formato que o Front-end Java espera.
    """
    
    # 1. Chama o handler padrão primeiro (ele já trata 404, 403, 400 básico)
    response = exception_handler(exc, context)
    
    # 2. Se o handler padrão não pegou (ex: Erro de Banco de Dados), pegamos aqui
    if response is None:
        if isinstance(exc, IntegrityError):
            # Equivalente ao DataIntegrityViolationException do Java
            response = Response(
                {"message": "Erro de integridade de dados (Conflito de Unique ou FK)"},
                status=status.HTTP_409_CONFLICT
            )
        else:
            # Equivalente ao RuntimeException (Erro 500 genérico)
            # Em produção, é bom logar o erro aqui (print(exc))
            response = Response(
                {"message": "Ocorreu um erro interno no servidor."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    # 3. Agora formatamos o corpo do JSON para ficar igual ao do Java
    # Java retorna: { status, error, message, path, errors (opcional) }
    
    payload = {
        "status": response.status_code,
        "path": context['request'].path, # Pega a URL que deu erro
        "timestamp": datetime.now().isoformat() # Opcional, mas útil
    }

    # Tratamento específico para Validação (MethodArgumentNotValidException)
    if isinstance(exc, ValidationError):
        payload["error"] = "Erro de validação"
        payload["message"] = "Verifique os campos inválidos"
        # O DRF devolve {'campo': ['erro']}, o Java devolve {'campo': 'erro'}
        # Vamos manter o formato do DRF que é mais detalhado, ou achatar se preferir
        payload["errors"] = response.data 
        
    # Tratamento para 404 (EntityNotFoundException)
    elif isinstance(exc, (Http404, NotFound)):
        payload["error"] = "Não encontrado"
        payload["message"] = "O recurso solicitado não foi encontrado."
        
    # Tratamento para Erros de Tipo (MethodArgumentTypeMismatchException)
    elif isinstance(exc, (ValueError, ParseError)):
        payload["error"] = "Parâmetro inválido"
        payload["message"] = str(exc)
        
    # Outros erros
    else:
        payload["error"] = response.status_text if hasattr(response, 'status_text') else "Erro"
        payload["message"] = response.data.get('detail', str(exc)) if isinstance(response.data, dict) else str(response.data)

    # Atualiza o corpo da resposta com nosso payload customizado
    response.data = payload
    
    return response

