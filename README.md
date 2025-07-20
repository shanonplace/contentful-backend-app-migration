# Migration Backend App

A simple Express backend for POC migration orchestration using Contentful App Identities.

## Features

- Start a migration (POST /start-migration)
- Poll migration status (GET /migration-status/:id)
- Request validation using Contentful App request verification

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

- `CONTENTFUL_APP_SECRET`: A 64-character secret used to verify requests from your Contentful app. This should match the secret configured in your Contentful app settings.
- `PORT`: The port the server runs on (default: 3000)

## Request Verification

This backend uses Contentful's request verification to ensure requests come from authorized Contentful apps. The verification process works as follows:

1. **Frontend Request Signing**: The Contentful frontend app uses `cma.appSignedRequest.create()` to generate signed request headers including:

   - `X-Contentful-Signature`: HMAC signature of the request
   - `X-Contentful-Signed-Headers`: Headers included in the signature
   - `X-Contentful-Timestamp`: Request timestamp
   - Additional context headers (Space ID, Environment ID, etc.)

2. **Backend Verification**: The backend validates each request using:

   - `verifyRequest()` from `@contentful/node-apps-toolkit`
   - The `CONTENTFUL_APP_SECRET` environment variable
   - Request path, headers, method, and body to reconstruct the canonical request

3. **Security**: Only requests with valid signatures from apps with the correct secret are accepted. Invalid requests receive a 403 Unauthorized response.

If `CONTENTFUL_APP_SECRET` is not set, request verification is skipped (for development only).
