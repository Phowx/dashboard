import React, { useState, useEffect, useRef } from 'react';
import { Cpu, HardDrive, MemoryStick, Wifi, ArrowDown, ArrowUp, RefreshCw, Plus, Edit2, Trash2, X, LayoutGrid, Globe, Settings, Terminal, Command, Play, Link } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const getWebSocketUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/ws`;
};

const ICONS = {
  globe: Globe,
  settings: Settings,
  layout: LayoutGrid,
  terminal: Terminal,
  command: Command,
  play: Play,
  link: Link,
};

const ICON_OPTIONS = [
  { key: 'globe', icon: Globe },
  { key: 'settings', icon: Settings },
  { key: 'layout', icon: LayoutGrid },
  { key: 'terminal', icon: Terminal },
  { key: 'command', icon: Command },
  { key: 'play', icon: Play },
  { key: 'link', icon: Link },
];

function MetricCard({ icon: Icon, label, value, unit, subLabel, color }) {
  return (
    <motion.div
      className="glass-card p-3"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-3.5 h-3.5" style={{ color }} />
        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold" style={{ color }}>{value}</span>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{unit}</span>
      </div>
      <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>{subLabel}</p>
    </motion.div>
  );
}

function NetworkStats({ network }) {
  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const kb = bytes / 1024;
    const mb = kb / 1024;
    const gb = mb / 1024;
    if (gb >= 1) return `${gb.toFixed(1)} GB`;
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    return `${kb.toFixed(0)} KB`;
  };

  const formatSpeed = (bytesPerSec) => {
    if (!bytesPerSec || bytesPerSec === 0) return '0 B/s';
    const kb = bytesPerSec / 1024;
    const mb = kb / 1024;
    if (mb >= 1) return `${mb.toFixed(1)} MB/s`;
    return `${kb.toFixed(1)} KB/s`;
  };

  return (
    <motion.div
      className="glass-card p-3"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Wifi className="w-3.5 h-3.5" style={{ color: 'var(--accent-cyan)' }} />
        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>网络</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-1.5">
          <ArrowDown className="w-3 h-3" style={{ color: 'var(--accent-green)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{formatSpeed(network?.rx_sec)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <ArrowUp className="w-3 h-3" style={{ color: 'var(--accent-blue)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{formatSpeed(network?.tx_sec)}</span>
        </div>
      </div>
      <p className="text-[10px] mt-1.5" style={{ color: 'var(--text-muted)' }}>
        ↓{formatBytes(network?.rx_bytes)} ↑{formatBytes(network?.tx_bytes)}
      </p>
    </motion.div>
  );
}

function ProcessTable({ title, data, icon: Icon, color }) {
  return (
    <div className="glass-card p-3 h-full">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-3.5 h-3.5" style={{ color }} />
        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{title}</span>
      </div>
      <div className="space-y-1">
        {data.map((p, i) => (
          <div key={p.pid} className="flex items-center justify-between py-1 px-2 rounded" style={{ background: 'var(--bg-tertiary)' }}>
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-[10px] w-4 text-right" style={{ color: 'var(--text-muted)' }}>#{i + 1}</span>
              <span className="text-xs truncate" style={{ color: 'var(--text-primary)' }}>{p.name}</span>
            </div>
            <span className="text-xs font-medium ml-2" style={{ color }}>{p[title.includes('CPU') ? 'cpu' : 'memory'].toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RealtimeChart({ data }) {
  return (
    <div className="glass-card p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent-blue)' }} />
          <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>实时监控</span>
        </div>
        <div className="flex items-center gap-3 xl:gap-4">
          <div className="flex items-center gap-1">
            <div className="w-3 h-1.5 rounded-sm" style={{ background: 'var(--accent-blue)' }} />
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>CPU</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-1.5 rounded-sm" style={{ background: 'var(--accent-green)' }} />
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>内存</span>
          </div>
        </div>
      </div>
      <div className="h-40 sm:h-48 xl:h-44">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
            <XAxis 
              dataKey="time" 
              hide={false}
              tick={{ fontSize: 9, fill: 'var(--text-muted)' }}
              axisLine={{ stroke: 'var(--border-color)' }}
              tickLine={{ stroke: 'var(--border-color)' }}
              interval="preserveStartEnd"
              minTickGap={50}
            />
            <YAxis 
              domain={[0, 100]} 
              hide={false}
              tick={{ fontSize: 9, fill: 'var(--text-muted)' }}
              axisLine={{ stroke: 'var(--border-color)' }}
              tickLine={{ stroke: 'var(--border-color)' }}
              width={25}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                fontSize: '10px'
              }}
              labelStyle={{ color: 'var(--text-primary)' }}
              formatter={(value) => [`${value}%`]}
            />
            <Line
              type="monotone"
              dataKey="cpu"
              stroke="var(--accent-blue)"
              strokeWidth={1.5}
              dot={false}
              name="CPU"
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="memory"
              stroke="var(--accent-green)"
              strokeWidth={1.5}
              dot={false}
              name="内存"
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ShortcutModal({ isOpen, onClose, onSubmit, formData, setFormData, isEditing }) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="glass-card w-full max-w-sm"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            {isEditing ? '编辑' : '添加'}快捷方式
          </h3>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}>
            <X className="w-4 h-4" />
          </motion.button>
        </div>

        <form onSubmit={onSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>名称</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field w-full text-sm"
              placeholder="例如：GitHub"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>图标</label>
            <div className="grid grid-cols-7 gap-1.5">
              {ICON_OPTIONS.map(({ key, icon: Icon }) => (
                <motion.button
                  key={key}
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setFormData({ ...formData, icon: key })}
                  className="p-2 rounded-lg border transition-all flex items-center justify-center"
                  style={{
                    background: formData.icon === key ? 'var(--accent-blue)' : 'var(--bg-tertiary)',
                    borderColor: formData.icon === key ? 'var(--accent-blue)' : 'var(--border-color)',
                    color: formData.icon === key ? 'white' : 'var(--text-muted)'
                  }}
                >
                  <Icon className="w-4 h-4" />
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>类型</label>
            <div className="flex gap-2">
              {['url', 'command'].map((type) => (
                <motion.button
                  key={type}
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFormData({ ...formData, type })}
                  className="flex-1 py-2 px-3 rounded-lg border text-xs font-medium transition-all"
                  style={{
                    background: formData.type === type ? 'var(--accent-blue)' : 'var(--bg-tertiary)',
                    borderColor: formData.type === type ? 'var(--accent-blue)' : 'var(--border-color)',
                    color: formData.type === type ? 'white' : 'var(--text-secondary)'
                  }}
                >
                  {type === 'url' ? 'URL' : '命令'}
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              {formData.type === 'url' ? 'URL 地址' : '命令内容'}
            </label>
            <input
              type="text"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              className="input-field w-full text-sm"
              placeholder={formData.type === 'url' ? 'https://...' : '输入命令...'}
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <motion.button type="button" whileTap={{ scale: 0.98 }} onClick={onClose} className="btn-secondary flex-1 text-sm">
              取消
            </motion.button>
            <motion.button type="submit" whileTap={{ scale: 0.98 }} className="btn-primary flex-1 text-sm">
              {isEditing ? '更新' : '创建'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function SystemMonitor() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [shortcuts, setShortcuts] = useState([]);
  const [shortcutLoading, setShortcutLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', icon: 'globe', type: 'url', value: '' });
  const metricsRef = useRef(null);

  useEffect(() => {
    metricsRef.current = metrics;
  }, [metrics]);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/system/metrics');
      const data = await response.json();
      setMetrics(data);

      setChartData(prev => {
        const newData = [...prev, {
          time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          cpu: parseFloat(data.cpu.usage.toFixed(1)),
          memory: parseFloat(data.memory.percentage)
        }];
        return newData.slice(-30);
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchShortcuts = async () => {
    try {
      const response = await fetch('/api/shortcuts');
      const data = await response.json();
      setShortcuts(data);
    } catch (error) {
      console.error('Failed to fetch shortcuts:', error);
    } finally {
      setShortcutLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    fetchShortcuts();
    const interval = setInterval(fetchMetrics, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const ws = new WebSocket(getWebSocketUrl());
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'metrics' && metricsRef.current) {
        setMetrics(prev => prev ? {
          ...prev,
          cpu: { ...prev.cpu, usage: message.data.cpu },
          memory: { ...prev.memory, percentage: message.data.memory.percentage }
        } : null);
      }
    };
    return () => ws.close();
  }, []);

  const handleShortcutSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/shortcuts/${editingId}` : '/api/shortcuts';
      const method = editingId ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setModalOpen(false);
        setEditingId(null);
        setFormData({ name: '', icon: 'globe', type: 'url', value: '' });
        fetchShortcuts();
      }
    } catch (error) {
      console.error('Failed to save shortcut:', error);
    }
  };

  const handleShortcutDelete = async (id) => {
    if (!confirm('确定要删除这个快捷方式吗？')) return;
    try {
      await fetch(`/api/shortcuts/${id}`, { method: 'DELETE' });
      fetchShortcuts();
    } catch (error) {
      console.error('Failed to delete shortcut:', error);
    }
  };

  const handleShortcutClick = (shortcut) => {
    if (shortcut.type === 'url') {
      window.open(shortcut.value, '_blank');
    } else {
      alert(`命令: ${shortcut.value}`);
    }
  };

  const openEditModal = (shortcut) => {
    setEditingId(shortcut.id);
    setFormData({ name: shortcut.name, icon: shortcut.icon, type: shortcut.type, value: shortcut.value });
    setModalOpen(true);
  };

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const kb = bytes / 1024;
    const mb = kb / 1024;
    const gb = mb / 1024;
    if (gb >= 1) return `${gb.toFixed(1)} GB`;
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    return `${kb.toFixed(0)} KB`;
  };

  if (loading || !metrics) {
    return (
      <div className="flex items-center justify-center h-48">
        <RefreshCw className="w-6 h-6 animate-spin" style={{ color: 'var(--accent-blue)' }} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <MetricCard
          icon={Cpu}
          label="CPU"
          value={metrics.cpu.usage.toFixed(1)}
          unit="%"
          subLabel={`${metrics.cpu.cores}核 | 负载${metrics.cpu.load?.toFixed(2) || '-'}`}
          color="var(--accent-blue)"
        />
        <MetricCard
          icon={MemoryStick}
          label="内存"
          value={metrics.memory.percentage}
          unit="%"
          subLabel={`${formatBytes(metrics.memory.used)}/${formatBytes(metrics.memory.total)}`}
          color="var(--accent-green)"
        />
        <MetricCard
          icon={HardDrive}
          label="磁盘"
          value={metrics.disk[0]?.percentage || 0}
          unit="%"
          subLabel={`${formatBytes(metrics.disk[0]?.used || 0)}/${formatBytes(metrics.disk[0]?.size || 0)}`}
          color="var(--accent-purple)"
        />
        <NetworkStats network={metrics.network} />
      </div>

      <RealtimeChart data={chartData} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <ProcessTable
          title="CPU"
          data={metrics.cpuProcesses || []}
          icon={Cpu}
          color="var(--accent-blue)"
        />
        <ProcessTable
          title="内存"
          data={metrics.memoryProcesses || []}
          icon={MemoryStick}
          color="var(--accent-green)"
        />
      </div>

      <div className="glass-card p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded" style={{ background: 'rgba(59, 130, 246, 0.15)' }}>
              <LayoutGrid className="w-3.5 h-3.5" style={{ color: 'var(--accent-blue)' }} />
            </div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>快捷方式</h3>
            <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>{shortcuts.length}</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { setEditingId(null); setFormData({ name: '', icon: 'globe', type: 'url', value: '' }); setModalOpen(true); }}
            className="btn-primary flex items-center gap-1 text-xs py-1 px-2"
          >
            <Plus className="w-3 h-3" />
            添加
          </motion.button>
        </div>

        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {shortcuts.map((shortcut, index) => {
              const Icon = ICONS[shortcut.icon] || Globe;
              return (
                <motion.div
                  key={shortcut.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="group relative"
                >
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleShortcutClick(shortcut)}
                    className="glass-card p-3 cursor-pointer flex flex-col items-center gap-2 w-24"
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))' }}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs font-medium text-center break-all leading-tight" style={{ color: 'var(--text-primary)' }}>{shortcut.name}</span>
                  </motion.div>
                  <div className="absolute -top-1 -right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); openEditModal(shortcut); }} className="w-4 h-4 rounded flex items-center justify-center" style={{ background: 'var(--accent-blue)', color: 'white' }}>
                      <Edit2 className="w-2.5 h-2.5" />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); handleShortcutDelete(shortcut.id); }} className="w-4 h-4 rounded flex items-center justify-center" style={{ background: 'var(--accent-red)', color: 'white' }}>
                      <Trash2 className="w-2.5 h-2.5" />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {shortcuts.length === 0 && !shortcutLoading && (
            <div className="w-full text-center py-4">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>点击"添加"创建快捷方式</p>
            </div>
          )}
        </div>
      </div>

      <ShortcutModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleShortcutSubmit}
        formData={formData}
        setFormData={setFormData}
        isEditing={!!editingId}
      />
    </div>
  );
}

export default SystemMonitor;
