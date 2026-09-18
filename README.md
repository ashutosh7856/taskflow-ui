# TaskFlow frontend

Vite + React + TypeScript client for the Trello backend.

## Setup

```bash
cp .env.example .env
bun install
bun run dev
```

Set `VITE_API_URL` to the backend origin. The default is `http://localhost:3000`.

## Architecture

- Material UI: components and theme
- TanStack Query: API data and mutations
- Zustand: persisted authentication and UI state
- React Router: protected routes
- dnd-kit: card movement between lists
- Axios: API client and automatic token refresh
