# bl-monorepo

![Uptime Robot ratio (30 days)](https://img.shields.io/uptimerobot/ratio/m790106369-0ed2a627f24343cf93d2bba7)

Library and book management services and administration for upper secondary schools. Built with Next.js with Material UI using an express backend. This project is the successor for the bl-web and bl-admin projects, with the aim to unify the administration site with the customer site.

## Workspaces

This repository consists of three distinct workspaces.

- _frontend_ is the Next.js frontend responsible for all user facing UI
- _backend_ is the Express server responsible for business logic and database access
- _shared_ contains shared types and logic used by both projects

The frontend and backend are completely decoupled, but are codependent on the shared logic. In addition, code style, linting and type checks are handled on root level for all three workspaces.

## Setup and development

```bash
# Install dependencies
$ pnpm install

# Frontend
# Copy .env.example to .env and fill in the correct keys
# Run the development server on http://localhost:3000
$ pnpm --filter frontend dev
# For production builds, use
$ pnpm --filter frontend build
$ pnpm --filter frontend serve

# Backend
# Copy .env.example to .env and fill in the correct keys
# Run the development server on http://localhost:1337
$ pnpm --filter backend dev
# For production builds, use
$ pnpm --filter backend build
$ pnpm --filter backend serve

```

## Code style, linting and type checking

```bash
# Prettier code style
$ pnpm prettier

# Linting with Eslint
$ pnpm lint

# Typescript type checks
$ pnpm typecheck

# Backend tests
$ pnpm --filter backend test
```

## Branches

There are two active branches, `main` and `production`. The `main` branch is automatically deployed to the staging environment, while `production` auto-deploys to the public live version.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.
