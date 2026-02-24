# Timplan -- Web Engineering Project

---

# 🌐 Website Status

## Here you can see the current Website and API status

[![Timplan Website Status](https://img.shields.io/website?down_color=red&down_message=offline&up_color=brightgreen&up_message=online&label=Website&style=for-the-badge&url=https%3A%2F%2Fwww.timplan.app)](https://www.timplan.app)

[![Timplan API Status](https://img.shields.io/website?down_color=red&down_message=offline&up_color=brightgreen&up_message=online&label=API&style=for-the-badge&url=https%3A%2F%2Fapi.timplan.app/health)](https://api.timplan.app/health)

# 🚀 Live Deployment

## Here you can see if the newest changes got deployed successfully:

[![Build And Publish Frontend](https://github.com/xniklasx-dev/Timplan-Projekt/actions/workflows/deploy-frontend.yml/badge.svg)](https://github.com/xniklasx-dev/Timplan-Projekt/actions/workflows/deploy-frontend.yml)

[![Build And Publish Backend](https://github.com/xniklasx-dev/Timplan-Projekt/actions/workflows/deploy-backend.yml/badge.svg)](https://github.com/xniklasx-dev/Timplan-Projekt/actions/workflows/deploy-backend.yml)

# 🖥 Tech Stack

### Frontend

- Next.js
- TypeScript

### Backend

- TypeScript
- Express

### Infrastructure

- Azure App Service
- Azure PostgreSQL

---

# 💻 Local Development

## 1️⃣ Clone the repository

```bash
git clone https://github.com/xniklasx-dev/Timplan-Projekt.git
cd Timplan-Projekt
```

---

# ▶ Start Frontend locally

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on:

http://localhost:3000

---

# ▶ Start Backend locally

```bash
cd backend
npm install
npm run dev
```

Backend will run on:

http://localhost:3001

Swagger API documentation:

http://localhost:3001/docs

---

# 🛠 Production Deployment

Deployment is fully automated via GitHub Actions.

- Changes in `/frontend` → trigger frontend deployment
- Changes in `/backend` → trigger backend deployment

Azure handles the build process (Oryx) during deployment.

---

# 📚 Architecture Overview

User\
↓\
www.timplan.app → Frontend (Next.js)\
↓\
api.timplan.app → Backend (Express API)\
↓\
Azure PostgreSQL → Database
