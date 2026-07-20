# Timplan — Web Engineering Project

Timplan is a web-based flashcard application for creating, organizing, and
studying cards in decks.

## Website Status

[![Timplan Website Status](https://img.shields.io/website?down_color=red&down_message=offline&up_color=brightgreen&up_message=online&label=Website&style=for-the-badge&url=https%3A%2F%2Fwww.timplan.app)](https://www.timplan.app)

[![Timplan API Status](https://img.shields.io/website?down_color=red&down_message=offline&up_color=brightgreen&up_message=online&label=API&style=for-the-badge&url=https%3A%2F%2Fapi.timplan.app/health)](https://api.timplan.app/health)

## Deployment Status

[![Build And Publish Frontend](https://github.com/xniklasx-dev/Timplan-Projekt/actions/workflows/deploy-frontend.yml/badge.svg)](https://github.com/xniklasx-dev/Timplan-Projekt/actions/workflows/deploy-frontend.yml)

[![Build And Publish Backend](https://github.com/xniklasx-dev/Timplan-Projekt/actions/workflows/deploy-backend.yml/badge.svg)](https://github.com/xniklasx-dev/Timplan-Projekt/actions/workflows/deploy-backend.yml)

## Tech Stack

### Frontend

- Next.js
- TypeScript

### Backend

- Express
- TypeScript
- Drizzle ORM

### Database and Infrastructure

- PostgreSQL with Supabase
- Azure App Service
- GitHub Actions

## Local Setup

### Requirements

- Node.js 24
- npm

### 1. Clone the repository

```bash
git clone https://github.com/xniklasx-dev/Timplan-Projekt.git
cd Timplan-Projekt
```

### 2. Configure the local environment

#### Environment with memoryRepository
Create `frontend/.env`:

```env
NEXT_PUBLIC_USE_MOCK=false
NEXT_PUBLIC_API_BASE=http://localhost:3001
```

Create `backend/.env`:

```env
DATA_SOURCE=memory
ALLOWED_ORIGINS=http://localhost:3000
```

#### Environtment with drizzleRepository

```env
NEXT_PUBLIC_USE_MOCK=false
NEXT_PUBLIC_API_BASE=http://localhost:3001
```

Create `backend/.env`:

```env
DATABASE_URL=""
DATA_SOURCE=postgres
ALLOWED_ORIGINS=http://localhost:3000
```

### 3. Install all dependencies

Run this once from the repository root:

```bash
npm install
```

The root install script installs the root, backend, and frontend dependencies.

### 4. Build and start the application

For final or production-like testing:

```bash
npm run preview
```

This command builds both applications and then starts them together.

- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Swagger API documentation: http://localhost:3001/docs
```

## Deployment

Deployment is automated with GitHub Actions:

- Changes in `frontend/` trigger the frontend deployment workflow.
- Changes in `backend/` trigger the backend deployment workflow.
- Pull requests run type checking, linting, and production builds.
- GitHub Actions builds the deployment artifacts and publishes them to
  separate Azure App Services.

## Architecture Overview

```text
User
  |
  v
Next.js frontend
  |
  v
Express REST API
  |
  v
Drizzle ORM
  |
  v
Supabase PostgreSQL
```
