# Migration Backend App

A simple Express backend for POC migration orchestration using Contentful App Identities.

## Features

- Start a migration (POST /start-migration)
- Poll migration status (GET /migration-status/:id)
- Request validation stub for Contentful App Identities

## Setup

1. Install dependencies:
   ```sh
   npm install
   ```
2. Copy `.env.sample` to `.env` and fill in your values.
3. Start the server:
   ```sh
   npm start
   ```

## Endpoints

- `POST /start-migration` — Start a pretend migration, returns migration ID
- `GET /migration-status/:id` — Poll migration status

## Testing with curl

Start a migration:

```bash
curl -X POST http://localhost:3000/start-migration \
  -H "Content-Type: application/json" \
  -d '{}'
```

Check migration status (replace `abc123` with actual migration ID):

```bash
curl http://localhost:3000/migration-status/abc123
```

## Environment Variables

See `.env.sample` for required variables.
