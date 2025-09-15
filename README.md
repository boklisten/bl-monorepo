# bl-monorepo

![Uptime Robot ratio (30 days)](https://img.shields.io/uptimerobot/ratio/m790106369-0ed2a627f24343cf93d2bba7)

Library and book management services and administration for upper secondary schools. Built with Next.js with Mantine using an AdonisJS backend. This project is the successor for the bl-web and bl-admin projects, with the aim to unify the administration site with the customer site.

## Workspaces

This repository consists of two workspaces.

- _frontend_ is the Next.js frontend responsible for all user facing UI
- _backend_ is the AdonisJS server responsible for business logic and database access

The frontend only depends on the shared types located in backend/shared. Code style and linting is handled on root level for both workspaces.

## Setup and development

```bash
# Install dependencies
$ pnpm install

# Frontend
# Copy .env.example to .env and fill in the correct keys
# Run the development server on http://localhost:3000
$ pnpm -F frontend dev
# For production builds, use
$ pnpm -F frontend build
$ pnpm -F frontend serve

# Backend
# Copy .env.example to .env and fill in the correct keys
# Run the development server on http://localhost:1337
$ pnpm -F backend dev
# For production builds, use
$ pnpm -F backend build
$ pnpm -F backend start

```

## Code style, linting and type checking

```bash
# All checks and fixes for both workspaces can be run with
$ pnpm fix
```

## Testing

```bash
# Run backend tests
$ pnpm test
```

## Branches

There are two active branches, `main` and `production`. The `main` branch is automatically deployed to the staging environment, while `production` auto-deploys to the public live version.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.
