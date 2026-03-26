from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import subprocess

router = APIRouter()

class ServiceInfo(BaseModel):
    name: str
    load_state: str
    active_state: str
    sub_state: str
    description: str

def get_service_info(name: str) -> ServiceInfo:
    result = subprocess.run(
        ["systemctl", "show", name, "--no-pager"],
        capture_output=True,
        text=True
    )
    
    info = {}
    for line in result.stdout.split('\n'):
        if '=' in line:
            key, value = line.split('=', 1)
            info[key] = value
    
    return ServiceInfo(
        name=name,
        load_state=info.get('LoadState', ''),
        active_state=info.get('ActiveState', ''),
        sub_state=info.get('SubState', ''),
        description=info.get('Description', ''),
    )

@router.get("/services", response_model=list[ServiceInfo])
async def get_services():
    result = subprocess.run(
        ["systemctl", "list-units", "--type=service", "--no-pager", "--plain"],
        capture_output=True,
        text=True
    )
    
    services = []
    for line in result.stdout.split('\n')[1:]:
        if '.service' in line:
            parts = line.split()
            if len(parts) >= 4:
                name = parts[0]
                load_state = parts[1] if len(parts) > 1 else ''
                active_state = parts[2] if len(parts) > 2 else ''
                sub_state = parts[3] if len(parts) > 3 else ''
                
                service_info = get_service_info(name)
                service_info.load_state = load_state
                service_info.active_state = active_state
                service_info.sub_state = sub_state
                services.append(service_info)
    
    return services

@router.post("/services/{name}/restart")
async def restart_service(name: str):
    if not name.endswith('.service'):
        name = name + '.service'
    
    result = subprocess.run(
        ["systemctl", "restart", name],
        capture_output=True,
        text=True
    )
    
    if result.returncode != 0:
        raise HTTPException(status_code=500, detail=result.stderr)
    
    return {"message": f"Service {name} restarted"}
