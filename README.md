# Typing Battle Game

This monorepo hosts the projects for the multiplayer typing game.

## Projects

- **frontend** – Next.js application for the game client.
- **backend** – Nest.js server using Prisma with Supabase PostgreSQL.

Each project maintains its own `env.template` describing the required environment variables. Copy the template to `.env` in the respective directory and provide the proper credentials.

The frontend communicates with the backend for authentication and game data while the backend manages the database and API endpoints.
