const express = require('express');
const cors = require('cors');
const si = require('systeminformation');
const Docker = require('dockerode');
const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const docker = new Docker();

const PORT = 8888;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'shortcuts.json');
const EXAMPLE_DATA_FILE = path.join(DATA_DIR, 'shortcuts.example.json');
const CACHE_TTL = 2000;
const ENABLE_PROCESS_TOP = ['1', 'true', 'on', 'yes'].includes(String(process.env.ENABLE_PROCESS_TOP || 'false').toLowerCase());

const SYSTEM_PIDS = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
const SYSTEM_PROCS = new Set([
  'ps', 'systemd', 'kworker', 'kthreadd', 'migration', 'rcu', 'ksoftirqd',
  'watchdog', 'cpuset', 'khelper', 'kintegrityd', 'kblockd', 'ata', 'scsi',
  'networking', 'console', 'ttys', 'kmem', 'dev', 'raw', 'nfs', 'rpc',
  'jffs2', 'flush', 'vballs', 'kpsmoused', 'deferwq', 'charger', 'tmp'
]);

const cache = {
  metrics: { data: null, timestamp: 0 },
  containers: { data: null, timestamp: 0 }
};

let wsClients = new Set();
let metricsInterval = null;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/dist')));

function ensureDataFile() {
  if (fs.existsSync(DATA_FILE)) {
    return;
  }

  fs.mkdirSync(DATA_DIR, { recursive: true });

  if (fs.existsSync(EXAMPLE_DATA_FILE)) {
    fs.copyFileSync(EXAMPLE_DATA_FILE, DATA_FILE);
    return;
  }

  fs.writeFileSync(DATA_FILE, JSON.stringify({ shortcuts: [] }, null, 2));
}

function normalizeShortcutList(shortcuts = []) {
  return [...shortcuts]
    .map((shortcut, index) => ({
      ...shortcut,
      order: Number.isFinite(Number(shortcut.order)) ? Number(shortcut.order) : index
    }))
    .sort((a, b) => a.order - b.order || String(a.id).localeCompare(String(b.id)))
    .map((shortcut, index) => ({
      ...shortcut,
      order: index
    }));
}

function readShortcutsData() {
  ensureDataFile();
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  const normalizedShortcuts = normalizeShortcutList(data.shortcuts || []);

  if (JSON.stringify(data.shortcuts || []) !== JSON.stringify(normalizedShortcuts)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ shortcuts: normalizedShortcuts }, null, 2));
  }

  return { shortcuts: normalizedShortcuts };
}

function writeShortcutsData(shortcuts) {
  const normalizedShortcuts = normalizeShortcutList(shortcuts);
  const data = { shortcuts: normalizedShortcuts };
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  return data;
}

function getNetworkUrls(port) {
  const interfaces = os.networkInterfaces();
  const urls = [];

  Object.values(interfaces).forEach((entries) => {
    entries?.forEach((entry) => {
      if (entry.family === 'IPv4' && !entry.internal) {
        urls.push(`http://${entry.address}:${port}`);
      }
    });
  });

  return urls;
}

async function getSystemMetrics() {
  const now = Date.now();
  if (cache.metrics.data && (now - cache.metrics.timestamp) < CACHE_TTL) {
    return cache.metrics.data;
  }

  const [cpu, mem, disk, processes, time, networkStats] = await Promise.all([
    si.currentLoad(),
    si.mem(),
    si.fsSize(),
    ENABLE_PROCESS_TOP ? si.processes() : Promise.resolve(null),
    si.time(),
    si.networkStats()
  ]);

  const filteredProcesses = (processes?.list || []).filter(p => {
    if (SYSTEM_PIDS.has(p.pid)) return false;
    if (SYSTEM_PROCS.has(p.name)) return false;
    if (p.name === 'ps') return false;
    return true;
  });

  const cpuProcesses = ENABLE_PROCESS_TOP
    ? filteredProcesses
      .sort((a, b) => b.cpu - a.cpu)
      .slice(0, 5)
      .map(p => ({
        pid: p.pid,
        name: p.name,
        cpu: p.cpu,
        memory: p.mem,
        memoryRss: p.memRss || 0
      }))
    : [];

  const memoryProcesses = ENABLE_PROCESS_TOP
    ? filteredProcesses
      .sort((a, b) => b.mem - a.mem)
      .slice(0, 5)
      .map(p => ({
        pid: p.pid,
        name: p.name,
        cpu: p.cpu,
        memory: p.mem,
        memoryRss: p.memRss || 0
      }))
    : [];

  const network = networkStats
    .filter(n => n.iface !== 'lo' && !n.iface.startsWith('veth'))
    .reduce((acc, n) => ({
      rx_bytes: acc.rx_bytes + (n.rx_bytes || 0),
      tx_bytes: acc.tx_bytes + (n.tx_bytes || 0),
      rx_sec: acc.rx_sec + (n.rx_sec || 0),
      tx_sec: acc.tx_sec + (n.tx_sec || 0)
    }), { rx_bytes: 0, tx_bytes: 0, rx_sec: 0, tx_sec: 0 });

  const data = {
    uptime: time.uptime,
    cpu: {
      usage: cpu.currentLoad,
      cores: cpu.cpus.length,
      load: cpu.avgLoad
    },
    memory: {
      total: mem.total,
      used: mem.active,
      free: mem.available,
      buffcache: mem.buffcache,
      percentage: ((mem.active / mem.total) * 100).toFixed(1)
    },
    disk: [...new Map(disk.map(d => [d.fs, d])).values()]
      .filter(d => {
        const skipTypes = ['overlay', 'tmpfs', 'devpts', 'sysfs', 'proc', 'cgroup', 'cgroup2', 'securityfs', 'hugetlbfs', 'mqueue', 'debugfs', 'tracefs', 'fusectl', 'configfs', 'devtmpfs', 'efivarfs', 'selinuxfs', 'binfmt_misc'];
        const skipMounts = ['/var/lib/docker', '/run', '/sys', '/proc', '/dev', '/boot/efi', '/sys/firmware'];
        const isRealDisk = d.fs.startsWith('/dev/');
        const isRealMount = !skipMounts.some(p => d.mount === p || d.mount?.startsWith(p + '/'));
        return isRealDisk || isRealMount;
      })
      .map(d => ({
        fs: d.fs,
        type: d.type,
        size: d.size,
        used: d.used,
        available: d.available,
        percentage: d.use
      })),
    network,
    cpuProcesses,
    memoryProcesses
  };

  cache.metrics = { data, timestamp: now };
  return data;
}

function formatPorts(ports) {
  if (!ports || ports.length === 0) return '-';
  return ports
    .map(p => {
      if (p.PublicPort && p.PrivatePort) {
        return `${p.PublicPort}:${p.PrivatePort}/${p.Type || 'tcp'}`;
      }
      return `${p.PrivatePort}/${p.Type || 'tcp'}`;
    })
    .slice(0, 3)
    .join(', ');
}

async function getContainerStats() {
  const now = Date.now();
  if (cache.containers.data && (now - cache.containers.timestamp) < CACHE_TTL) {
    return cache.containers.data;
  }

  const containers = await docker.listContainers({ all: true });

  const enrichedContainers = await Promise.all(
    containers.map(async (c) => {
      try {
        const container = docker.getContainer(c.Id);
        const stats = c.State === 'running'
          ? await container.stats({ stream: false }).catch(() => null)
          : null;

        let memoryUsage = null;
        let memoryLimit = null;
        let cpuPercent = null;

        if (stats) {
          memoryUsage = stats.memory_stats?.usage || null;
          memoryLimit = stats.memory_stats?.limit || null;

          if (stats.cpu_stats?.cpu_usage?.total_usage && stats.precpu_stats?.cpu_usage?.total_usage) {
            const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
            const systemDelta = (stats.cpu_stats.system_cpu_usage || 0) - (stats.precpu_stats.system_cpu_usage || 0);
            const numCpus = stats.cpu_stats.online_cpus || 1;
            if (systemDelta > 0) {
              cpuPercent = (cpuDelta / systemDelta) * numCpus * 100;
            }
          }
        }

        return {
          id: c.Id.substring(0, 12),
          name: c.Names[0]?.replace('/', '') || c.Id.substring(0, 12),
          image: c.Image,
          state: c.State,
          status: c.Status,
          ports: formatPorts(c.Ports),
          labels: c.Labels || {},
          composeProject: c.Labels?.['com.docker.compose.project'] || null,
          composeService: c.Labels?.['com.docker.compose.service'] || null,
          created: c.Created,
          stats: { memoryUsage, memoryLimit, cpuPercent }
        };
      } catch {
        return {
          id: c.Id?.substring(0, 12) || 'unknown',
          name: c.Names?.[0]?.replace('/', '') || 'unknown',
          image: c.Image || 'unknown',
          state: c.State || 'unknown',
          status: c.Status || 'unknown',
          ports: formatPorts(c.Ports),
          labels: {},
          composeProject: null,
          composeService: null,
          created: c.Created,
          stats: { memoryUsage: null, memoryLimit: null, cpuPercent: null }
        };
      }
    })
  );

  cache.containers = { data: enrichedContainers, timestamp: now };
  return enrichedContainers;
}

app.get('/api/system/metrics', async (req, res) => {
  try {
    const data = await getSystemMetrics();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/docker/containers', async (req, res) => {
  try {
    const data = await getContainerStats();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/docker/containers/:id/:action', async (req, res) => {
  try {
    const container = docker.getContainer(req.params.id);
    const action = req.params.action;
    const allowedActions = new Set(['start', 'stop', 'restart', 'remove']);

    if (!allowedActions.has(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    if (action === 'start') await container.start();
    else if (action === 'stop') await container.stop();
    else if (action === 'restart') await container.restart();
    else if (action === 'remove') await container.remove({ force: true });

    cache.containers.timestamp = 0;

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/shortcuts', (req, res) => {
  try {
    const data = readShortcutsData();
    res.json(data.shortcuts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/shortcuts', (req, res) => {
  try {
    const data = readShortcutsData();
    const newShortcut = {
      id: Date.now().toString(),
      order: data.shortcuts.length,
      ...req.body
    };
    const nextData = writeShortcutsData([...data.shortcuts, newShortcut]);
    res.json(nextData.shortcuts.find(shortcut => shortcut.id === newShortcut.id));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/shortcuts/:id', (req, res) => {
  try {
    const data = readShortcutsData();
    const index = data.shortcuts.findIndex(s => s.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Not found' });

    const currentShortcut = data.shortcuts[index];
    const updatedShortcut = {
      ...currentShortcut,
      ...req.body,
      id: currentShortcut.id,
      order: currentShortcut.order
    };
    const nextShortcuts = [...data.shortcuts];
    nextShortcuts[index] = updatedShortcut;
    const nextData = writeShortcutsData(nextShortcuts);
    res.json(nextData.shortcuts[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/shortcuts/reorder', (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids)) {
      return res.status(400).json({ error: 'ids must be an array' });
    }

    const data = readShortcutsData();
    const shortcutMap = new Map(data.shortcuts.map(shortcut => [shortcut.id, shortcut]));

    if (ids.length !== data.shortcuts.length || ids.some(id => !shortcutMap.has(id))) {
      return res.status(400).json({ error: 'Shortcut list mismatch' });
    }

    const reorderedShortcuts = ids.map((id, index) => ({
      ...shortcutMap.get(id),
      order: index
    }));

    const nextData = writeShortcutsData(reorderedShortcuts);
    res.json(nextData.shortcuts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/shortcuts/:id', (req, res) => {
  try {
    const data = readShortcutsData();
    writeShortcutsData(data.shortcuts.filter(s => s.id !== req.params.id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function startMetricsBroadcast() {
  if (metricsInterval) return;
  metricsInterval = setInterval(async () => {
    if (wsClients.size === 0) return;
    try {
      const data = await getSystemMetrics();
      const message = JSON.stringify({
        type: 'metrics',
        data: {
          timestamp: new Date().toISOString(),
          uptime: data.uptime,
          cpu: data.cpu.usage,
          memory: {
            percentage: data.memory.percentage,
            used: data.memory.used,
            total: data.memory.total
          }
        }
      });
      wsClients.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(message);
        }
      });
    } catch (error) {
      console.error('Error broadcasting metrics:', error);
    }
  }, 2000);
}

function stopMetricsBroadcast() {
  if (wsClients.size === 0 && metricsInterval) {
    clearInterval(metricsInterval);
    metricsInterval = null;
  }
}

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  wsClients.add(ws);
  startMetricsBroadcast();

  ws.on('close', () => {
    wsClients.delete(ws);
    console.log('WebSocket client disconnected');
    stopMetricsBroadcast();
  });
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

ensureDataFile();

server.listen(PORT, '0.0.0.0', () => {
  const networkUrls = getNetworkUrls(PORT);

  console.log(`Dashboard server running on http://0.0.0.0:${PORT}`);
  console.log(`Local: http://localhost:${PORT}`);
  networkUrls.forEach((url) => {
    console.log(`Network: ${url}`);
  });
});
