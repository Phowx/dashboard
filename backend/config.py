from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    prometheus_url: str = "http://localhost:9090"
    docker_socket: str = "/var/run/docker.sock"

    class Config:
        env_file = ".env"
