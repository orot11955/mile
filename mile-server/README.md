# mile-server

NestJS API server for `mile`.

## Runtime

Use Node `22.12.0` or newer. Prisma 7 requires Node 20.19+, 22.12+, or 24+.

## Setup

```bash
cp .env.example .env
yarn install --ignore-engines
yarn prisma:generate
```

## Development

```bash
yarn start:dev
```

The server defaults to port `3001`.

## API Docs

Swagger is available when the server is running:

```txt
Swagger UI: http://localhost:3001/docs
OpenAPI JSON: http://localhost:3001/docs-json
```

Authenticated endpoints use the `Authorization: Bearer <accessToken>` header. In Swagger UI, use the `Authorize` button with the access token returned from `POST /auth/login` or `POST /auth/register`.

## Database

```bash
yarn prisma:migrate
yarn prisma:studio
```

## Verification

```bash
yarn lint
yarn test
yarn test:e2e
yarn build
```
