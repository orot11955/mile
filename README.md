# mile

`mile` is a personal and work productivity system with separate web and server packages.

## Structure

```txt
docs/        implementation prompts and plans
mile-server/ NestJS API server
mile-web/    Next.js web app
```

## Setup

```bash
nvm use
cp .env.example .env
yarn --cwd mile-server install --ignore-engines
yarn --cwd mile-web install --ignore-engines
```

Use Node `22.12.0` or newer. Prisma 7 requires Node 20.19+, 22.12+, or 24+.

## Development

```bash
yarn dev:infra
yarn server:migrate
yarn dev:server
yarn dev:web
```

Server API docs are available after the server starts:

```txt
Swagger UI: http://localhost:3001/docs
OpenAPI JSON: http://localhost:3001/docs-json
```

## Test And Build

```bash
yarn test
yarn test:e2e
yarn build
```

## Compose Deployment

```bash
yarn compose:up
yarn compose:logs
yarn compose:down
```
