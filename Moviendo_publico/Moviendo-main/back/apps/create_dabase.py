import os
import sys
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')

try:
    from django.conf import settings
    import django
    django.setup()
    
    db_conf = settings.DATABASES['default']
    target_db_name = db_conf['NAME']
    user = db_conf['USER']
    password = db_conf['PASSWORD']
    host = db_conf['HOST']
    port = db_conf['PORT']
    
    print(f"Configuração detectada: Host={host}, Port={port}, User={user}, DB={target_db_name}")

    # Conecta ao banco 'postgres' (banco padrão de administração)
    print("Conectando ao banco de dados 'postgres'...")
    conn = psycopg2.connect(
        dbname="postgres",
        user=user,
        password=password,
        host=host,
        port=port
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cur = conn.cursor()

    cur.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{target_db_name}'")
    exists = cur.fetchone()

    if not exists:
        print(f"Banco de dados '{target_db_name}' não encontrado. Criando...")
        cur.execute(f"CREATE DATABASE {target_db_name}")
        print(f"Banco de dados '{target_db_name}' criado com sucesso!")
    else:
        print(f"Banco de dados '{target_db_name}' já existe.")

    cur.close()
    conn.close()

except Exception as e:
    print(f"Erro ao criar banco de dados: {e}")
    sys.exit(1)