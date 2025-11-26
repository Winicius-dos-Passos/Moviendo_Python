# Moviendo

Sistema completo de gerenciamento de filmes e séries com Kanban, listas, avaliações e estatísticas.

**Desenvolvido por:**  
Pedro Vitor Chastalo Santos  
RA: 2576759

---

### Pré-requisitos

- Java 17+
- Node.js 18+
- PostgreSQL 14+

---

# back

```bash
# Navegar para a pasta do backend
cd back/moviendoback

# Configurar banco de dados no application.properties
# Editar: src/main/resources/application.properties
# spring.datasource.url=jdbc:postgresql://localhost:5432/moviendo
# spring.datasource.username=seu_usuario
# spring.datasource.password=sua_senha

# Rodar a aplicação
./mvnw spring-boot:run

# Ou no Windows:
mvnw.cmd spring-boot:run
```

---

# front

```bash
# Navegar para a pasta do frontend
cd front

# Instalar dependências
pnpm install

# Rodar a aplicação
pnpm run dev
```
