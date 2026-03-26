from .system import router as system_router
from .docker import router as docker_router
from .systemd import router as systemd_router
from .alerts import router as alerts_router

router = system_router
