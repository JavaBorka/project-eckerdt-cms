# Netlify Database hosting and migrations

The project will use **Netlify Database**, a managed PostgreSQL service integrated into Netlify, alongside a React/Vite frontend. The Node.js backend execution model (e.g., Netlify Functions versus another service) is not yet finalized. Do not put database credentials into frontend code.

## Before deployment

1. Confirm the Netlify account uses a credit-based plan; active database compute and bandwidth consume credits.
2. Choose your backend/ORM/SQL access method. Netlify supports PostgreSQL-compatible drivers.
3. Follow the official Netlify Database initialization instructions (`netlify database init`) and select raw SQL or your ORM.
4. Use **versioned migrations** in `netlify/database/migrations/` for deployable schema changes. The scripts in `src/docs/sql/` are source documentation and are **not auto-executed** by deploying the frontend.
5. For a new database, create an ordered initial migration using the statements in `01_create_tables.sql`, `02_indexes.sql`, `03_seed_unknown.sql`. Only apply each migration once. Do not rewrite a migration once deployed.
6. Keep CMS write endpoints private until authentication and authorization are implemented.

## Documentation versus migrations

- `src/docs/sql/` contains the reviewed table definitions, indexes, and fallback seed records.
- `src/docs/openapi.yaml` is the HTTP contract.
- Actual deployment migrations belong under `netlify/database/migrations/`, **outside** `src/docs`.

Official references:
- https://docs.netlify.com/build/data-and-storage/netlify-database/
- https://www.netlify.com/knowledge-base/how-to-add-a-postgres-database-to-a-netlify-app/

Netlify Database has billing and deployment considerations; verify your plan and the current CLI/ORM instructions before provisioning.
