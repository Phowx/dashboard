from fastapi import APIRouter
from pydantic import BaseModel
from app.services.prometheus import PrometheusService
import psutil
import time

router = APIRouter()
prometheus = PrometheusService()

class SystemInfo(BaseModel):
    hostname: str
    cpu_percent: float
    memory_percent: float
    memory_total: int
    memory_used: int
    disk_percent: float
    disk_total: int
    disk_used: int
    network_rx: int
    network_tx: int
    cpu_history: list[float]
    memory_history: list[float]

cpu_history = []
memory_history = []

@router.get("/system", response_model=SystemInfo)
async def get_system_info():
    global cpu_history, memory_history
    
    cpu_percent = psutil.cpu_percent(interval=1)
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    net_io = psutil.net_io_counters()
    
    cpu_history.append(cpu_percent)
    memory_history.append(memory.percent)
    
    if len(cpu_history) > 60:
        cpu_history = cpu_history[-60:]
    if len(memory_history) > 60:
        memory_history = memory_history[-60:]
    
    return SystemInfo(
        hostname=prometheus.get_hostname(),
        cpu_percent=cpu_percent,
        memory_percent=memory.percent,
        memory_total=memory.total,
        memory_used=memory.used,
        disk_percent=disk.percent,
        disk_total=disk.total,
        disk_used=disk.used,
        network_rx=net_io.bytes_recv,
        network_tx=net_io.bytes_sent,
        cpu_history=cpu_history,
        memory_history=memory_history,
    )
