from prometheus_api_client import PrometheusConnect
import socket

class PrometheusService:
    def __init__(self, url: str = "http://localhost:9090"):
        self.prometheus = PrometheusConnect(url=url, disable_ssl=True)
    
    def get_hostname(self) -> str:
        try:
            result = self.prometheus.custom_query(query="node_uname_info")
            if result:
                return result[0]['metric'].get('nodename', 'unknown')
        except Exception:
            pass
        return socket.gethostname()
    
    def get_cpu_usage(self) -> float:
        try:
            result = self.prometheus.custom_query(query="100 - (avg by(instance) (rate(node_cpu_seconds_total{mode='idle'}[5m])) * 100)")
            if result:
                return float(result[0]['value'][1])
        except Exception:
            pass
        return 0.0
    
    def get_memory_usage(self) -> float:
        try:
            result = self.prometheus.custom_query(query="100 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes * 100)")
            if result:
                return float(result[0]['value'][1])
        except Exception:
            pass
        return 0.0
    
    def get_disk_usage(self) -> float:
        try:
            result = self.prometheus.custom_query(query="100 - (node_filesystem_avail_bytes{mountpoint='/'} / node_filesystem_size_bytes{mountpoint='/'}) * 100")
            if result:
                return float(result[0]['value'][1])
        except Exception:
            pass
        return 0.0
