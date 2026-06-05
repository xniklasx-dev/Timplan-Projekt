# Timplan -- Web Engineering Project

## Live Status

[![Timplan Website Status](https://img.shields.io/website?down_color=red&down_message=offline&up_color=brightgreen&up_message=online&label=Website&style=for-the-badge&url=https%3A%2F%2Fwww.timplan.app)](https://www.timplan.app)

[![Timplan API Status](https://img.shields.io/website?down_color=red&down_message=offline&up_color=brightgreen&up_message=online&label=API&style=for-the-badge&url=https%3A%2F%2Fapi.timplan.app/health)](https://api.timplan.app/health)

## Deployment

[![Build And Publish Frontend](https://github.com/xniklasx-dev/Timplan-Projekt/actions/workflows/deploy-frontend.yml/badge.svg)](https://github.com/xniklasx-dev/Timplan-Projekt/actions/workflows/deploy-frontend.yml)

[![Build And Publish Backend](https://github.com/xniklasx-dev/Timplan-Projekt/actions/workflows/deploy-backend.yml/badge.svg)](https://github.com/xniklasx-dev/Timplan-Projekt/actions/workflows/deploy-backend.yml)

Deployment is handled by GitHub Actions:

- Changes in `frontend/` trigger frontend deployment.
- Changes in `backend/` trigger backend deployment.

## Local Setup

Clone the repository:

```bash
git clone https://github.com/xniklasx-dev/Timplan-Projekt.git
cd Timplan-Projekt
```

Install dependencies in both folders:

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Environment Variables

Do not commit real `.env` files. Create them locally in `backend/.env` and `frontend/.env`.

### Backend `.env`

For normal local testing copy the following
env variables.

```env
DATA_SOURCE=memory
PORT=3001
HOST=0.0.0.0
ALLOWED_ORIGINS=http://localhost:3000
```

Backend variables:

- `DATA_SOURCE`: Use `memory` for local/demo usage. Use `postgres` only when you have a valid database connection.
- `DATABASE_URL`: Required only when `DATA_SOURCE=postgres`.
- `PORT`: Optional. Defaults to `3001`.
- `HOST`: Optional. Defaults to `0.0.0.0`.
- `ALLOWED_ORIGINS`: Optional comma-separated list of allowed frontend origins.

### Frontend `.env`

```env
NEXT_PUBLIC_API_BASE=http://localhost:3001
NEXT_PUBLIC_USE_MOCK=false
```

Frontend variables:

- `NEXT_PUBLIC_API_BASE`: Backend API URL used by frontend services. Use `http://localhost:3001` locally.
- `NEXT_PUBLIC_USE_MOCK`: Set to `true` for frontend-only auth mock testing.

## Start Backend

Open one terminal:

```bash
cd backend
npm run dev
```

Backend runs on:

```text
http://localhost:3001
```

Swagger API documentation:

```text
http://localhost:3001/docs
```

Health check:

```text
http://localhost:3001/health
```

## Start Frontend

Open a second terminal:

```bash
cd frontend
npm run dev
```

Frontend runs on:

```text
http://localhost:3000
```

## Useful Commands

Backend:

```bash
cd backend
npm run dev
npm run typecheck
npm run lint
npm run build
npm start
```

Frontend:

```bash
cd frontend
npm run dev
npm run typecheck
npm run lint
npm run build
npm start
```

## Architecture Overview

```text
User
  |
  v
Frontend: Next.js
  |
  v
Backend: Express API
  |
  v
Repository layer: memory or postgres
  |
  v
Database: Supabase PostgreSQL, only when DATA_SOURCE=postgres
```
