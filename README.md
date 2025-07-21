# Migration Backend App

A TypeScript Express backend for POC migration orchestration using Contentful App Identities.

## Features

- Start a migration (POST /start-migration)
- Poll migration status (GET /migration-status/:id)
- Request validation using Contentful App request verification
- **Real CMA Operations**: Creates actual Contentful entries using App Installation Access Tokens
- **Content Creation**: Automatically creates and publishes sample "category" entries during migration
- **TypeScript**: Full type safety with comprehensive interfaces and type definitions

## Development

### Prerequisites

- Node.js 18+ (for ES modules support)
- npm 8+

### Setup

1. Install dependencies:

   ```sh
   npm install
   ```

2. Copy `.env.sample` to `.env` and fill in your values.

3. For development with auto-reload:

   ```sh
   npm run dev
   ```

4. For production build and start:
   ```sh
   npm run build
   npm start
   ```

### TypeScript Build

The project is built with TypeScript for enhanced type safety:

- **Source**: All source files are in `src/` directory
- **Build**: TypeScript compiles to `dist/` directory
- **Types**: Comprehensive type definitions in `src/types.ts`
- **Modules**: Full ES modules support with .js extensions for compatibility

#### Available Scripts

- `npm run dev` - Development mode with auto-reload using tsx
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Run the built application
- `npm run clean` - Remove build artifacts

## Endpoints

- `POST /start-migration` — Start a pretend migration, returns migration ID
- `GET /migration-status/:id` — Poll migration status

## Testing with curl

These will fail without a valid Contentful App request signature, but can be used for testing the backend logic:

```bash
# Start a migration
curl -X POST http://localhost:3000/start-migration \
  -H "Content-Type: application/json" \
  -d '{}'

# Check migration status (replace `abc123` with actual migration ID)
curl http://localhost:3000/migration-status/abc123
```

## Environment Variables

See `.env.sample` for required variables.

- `CONTENTFUL_APP_SECRET`: A 64-character secret used to verify requests from your Contentful app. This should match the secret configured in your Contentful app settings.
- `CONTENTFUL_APP_INSTALLATION_ID`: Your app installation ID for App Identities authentication
- `CONTENTFUL_PRIVATE_KEY`: Your private key content as a string (including BEGIN/END markers)
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

## App Identities & CMA Integration

This backend uses **Contentful App Identities** for secure content operations:

### Authentication

**App Identities Authentication**

1. **Request Verification**: Verifies that requests come from authorized Contentful apps using signed request validation
2. **App Identities Authentication**: Uses App Identities to generate management tokens:
   - Reads the private key from `CONTENTFUL_PRIVATE_KEY` environment variable
   - Uses `getManagementToken()` from `@contentful/node-apps-toolkit`
   - Generates scoped tokens for the specific app installation, space, and environment

### CMA Operations

The generated token allows the backend to:

- Make direct HTTP requests to the Contentful Management API
- Perform operations as the installed app identity
- Create and publish entries in the target space/environment using REST API calls

### Sample Migration

Creates three category entries with unique values for `slug` and `title` fields

### Prerequisites

- A `category` content type exists in your space with `slug` and `title` fields (both Short Text)
- The app is installed in the target space
- The private key content is set in `CONTENTFUL_PRIVATE_KEY` environment variable
- `CONTENTFUL_APP_INSTALLATION_ID` is configured in your environment variables

### Troubleshooting App Identities

If you see "401 Unauthorized" errors with App Identities:

1. **Verify App Installation ID**: Ensure `CONTENTFUL_APP_INSTALLATION_ID` is correct
2. **Check Private Key**: Ensure `CONTENTFUL_PRIVATE_KEY` contains the complete private key (including BEGIN/END markers)
3. **App Permissions**: Verify the app has proper permissions in the space

### Private Key Setup

The app uses the private key stored in the `CONTENTFUL_PRIVATE_KEY` environment variable. This approach is more secure than file storage because:

- **No file system exposure**: Keys aren't stored on disk
- **Environment isolation**: Only accessible to the process
- **DevOps friendly**: Easy to inject via CI/CD and cloud platforms
- **No file permission issues**: Eliminates file access security risks

To set up the private key:

1. Download the private key from your Contentful App configuration
2. Copy the entire key content (including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`)
3. Set it as the `CONTENTFUL_PRIVATE_KEY` environment variable (see `.env.sample` for format)

```

```
