# PostgreSQL

O serviço PostgreSQL é definido no Compose na raiz. Dados são persistidos no volume `postgres_data`; migrações são executadas pela pipeline antes de atualizar os serviços da aplicação.
