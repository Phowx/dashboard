from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import docker
from typing import Optional

router = APIRouter()
client = docker.from_env()

class ContainerStats(BaseModel):
    id: str
    name: str
    image: str
    status: str
    state: str
    cpu_percent: float
    memory_percent: float
    memory_usage: int
    created: str

@router.get("/containers", response_model=list[ContainerStats])
async def get_containers():
    containers = []
    for container in client.containers.list(all=True):
        stats = container.stats(stream=False)
        
        cpu_delta = stats['cpu_stats']['cpu_usage']['total_usage'] - stats['precpu_stats']['cpu_usage']['total_usage']
        system_delta = stats['cpu_stats']['system_cpu_usage'] - stats['precpu_stats']['system_cpu_usage']
        cpu_count = stats['cpu_stats'].get('online_cpus', 1)
        cpu_percent = (cpu_delta / system_delta * cpu_count * 100.0) if system_delta > 0 else 0
        
        mem_usage = stats['memory_stats'].get('usage', 0)
        mem_limit = stats['memory_stats'].get('limit', 1)
        mem_percent = (mem_usage / mem_limit * 100.0) if mem_limit > 0 else 0
        
        containers.append(ContainerStats(
            id=container.id,
            name=container.name,
            image=container.image.tags[0] if container.image.tags else 'none',
            status=container.status,
            state=container.status,
            cpu_percent=cpu_percent,
            memory_percent=mem_percent,
            memory_usage=mem_usage,
            created=str(container.attrs.get('Created', '')),
        ))
    
    return containers

@router.post("/containers/{container_id}/start")
async def start_container(container_id: str):
    try:
        container = client.containers.get(container_id)
        container.start()
        return {"message": "Container started"}
    except docker.errors.NotFound:
        raise HTTPException(status_code=404, detail="Container not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/containers/{container_id}/stop")
async def stop_container(container_id: str):
    try:
        container = client.containers.get(container_id)
        container.stop()
        return {"message": "Container stopped"}
    except docker.errors.NotFound:
        raise HTTPException(status_code=404, detail="Container not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/containers/{container_id}/restart")
async def restart_container(container_id: str):
    try:
        container = client.containers.get(container_id)
        container.restart()
        return {"message": "Container restarted"}
    except docker.errors.NotFound:
        raise HTTPException(status_code=404, detail="Container not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
