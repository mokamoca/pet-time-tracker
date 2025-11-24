from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, pets, activities, stats, report
from app.utils.db import init_db
from app.utils.settings import settings


def create_app() -> FastAPI:
    app = FastAPI(title="Pet Time Tracker")

    allowed_origins = {settings.frontend_origin, "http://localhost:5173", "http://127.0.0.1:5173"}

    app.add_middleware(
        CORSMiddleware,
        allow_origins=list(allowed_origins),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(auth.router, prefix="/auth", tags=["auth"])
    app.include_router(pets.router, prefix="/pets", tags=["pets"])
    app.include_router(activities.router, prefix="/activities", tags=["activities"])
    app.include_router(stats.router, prefix="/stats", tags=["stats"])
    app.include_router(report.router, prefix="/export", tags=["export"])

    @app.on_event("startup")
    def on_startup() -> None:
        init_db()

    return app


app = create_app()
