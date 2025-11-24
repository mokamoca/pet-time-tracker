# Pet Time Tracker

FastAPI + React PWA for quick pet activity tracking, streaks, and weekly share images.

## Backend (FastAPI)
- Stack: FastAPI, SQLModel/SQLite, JWT (python-jose), passlib, Pillow
- Run
  ```bash
  cd backend
  python3 -m venv .venv && source .venv/bin/activate
  pip install -e .
  uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
  ```
- Env: copy `.env.example` to `.env` and set `SECRET_KEY`, `DATABASE_URL`, `FRONTEND_ORIGIN`
- Tests: `pytest`

## Frontend (Vite + React + Tailwind)
- Stack: React 18 + TS, Vite, Tailwind, React Router, Zustand, Chart.js, PWA (manifest + SW)
- Run
  ```bash
  cd frontend
  npm install
  npm run dev
  ```
- Lint/Test: `npm run lint`, `npm test`

## Features
- Auth/signup/login with access (15m) + refresh (7d)
- Pet setup, quick actions (2 taps) for walk/play/treat/care
- Chat-style log parsing -> activities
- Daily/weekly stats, streaks, chart dashboard
- Weekly report PNG at `/export/weekly-report.png`
- PWA offline cache + manifest + dummy notification placeholder
