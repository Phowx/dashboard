from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import WebSocket
from app.routers import system, docker, systemd, alerts
import asyncio

app = FastAPI(title="Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(system.router, prefix="/api")
app.include_router(docker.router, prefix="/api")
app.include_router(systemd.router, prefix="/api")
app.include_router(alerts.router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "Dashboard API"}


@app.websocket("/ws/alerts")
async def websocket_alerts(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            await asyncio.sleep(5)
            await websocket.send_json({"type": "heartbeat"})
    except Exception:
        pass
