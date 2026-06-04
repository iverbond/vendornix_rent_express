# Vendornix Rent API (V1)

Lean Express + Sequelize REST API for rental property management.

## Stack

- Node.js, Express 5, TypeScript
- Sequelize 6 + MySQL/MariaDB
- Layered architecture: **Controller → Service → Repository → Model**

## API base

Default prefix: `http://localhost:3000/api`

| Resource | Endpoints |
|----------|-----------|
| Users | `GET/POST /users`, `GET/PUT/DELETE /users/:id` |
| Organizations | `GET/POST /organizations`, `GET/PUT/DELETE /organizations/:id` |
| Memberships | `GET/POST /memberships`, `DELETE /memberships/:id` |
| Assets | `GET /assets`, `GET /assets/tree`, `GET/POST/PUT/DELETE /assets/:id` |
| Settings | `GET/PUT /settings` |

## Development

```bash
cp .env.example .env
pnpm install
pnpm dev
```

Set `DB_SYNC_ENABLED=true` for schema sync on startup. Reference SQL: `src/database/migrations/001-initial-schema.sql`.

## Seed data

On first run (empty `users` table), seeds:

- **Bahati Yves** → org **Vendornix** (COMPANY), assets: Jeep → Prado, Maison → Immeuble → A1–A4
- **Pascal** → org **Pascal** (INDIVIDUAL), asset: Audi
- App settings: `exchangeRate=3000`, `defaultCurrency=CDF`
- Default password: `Vendornix123!`

## V1 scope

Auth (JWT), RBAC enforcement, rentals, payments, and multi-tenant headers are prepared via placeholders but not enabled yet.
# vendornix_rent_express
