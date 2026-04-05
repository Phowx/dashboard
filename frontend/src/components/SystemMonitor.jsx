import React, { useState, useEffect } from 'react';
import { Cpu, HardDrive, MemoryStick, Wifi, ArrowDown, ArrowUp, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useLiveMetrics } from '../context/LiveMetricsContext';

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

function SystemMonitor() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const { liveMetrics } = useLiveMetrics();

  const appendChartPoint = (timestamp, cpuUsage, memoryPercentage) => {
    setChartData(prev => {
      const nextPoint = {
        time: new Date(timestamp).toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }),
        cpu: parseFloat(Number(cpuUsage).toFixed(1)),
        memory: parseFloat(memoryPercentage)
      };

      return [...prev, nextPoint].slice(-30);
    });
  };

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/system/metrics');
      const data = await response.json();
      setMetrics(data);
      appendChartPoint(new Date().toISOString(), data.cpu.usage, data.memory.percentage);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!liveMetrics) {
      return;
    }

    setMetrics(prev => {
      if (!prev) {
        return prev;
      }

      return {
          ...prev,
          uptime: liveMetrics.uptime,
          cpu: { ...prev.cpu, usage: liveMetrics.cpu },
          memory: {
            ...prev.memory,
            percentage: liveMetrics.memory.percentage,
            used: liveMetrics.memory.used,
            total: liveMetrics.memory.total
          }
      };
    });

    appendChartPoint(liveMetrics.timestamp, liveMetrics.cpu, liveMetrics.memory.percentage);
  }, [liveMetrics]);

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
    </div>
  );
}

export default SystemMonitor;
