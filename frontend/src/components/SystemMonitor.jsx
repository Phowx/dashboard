import React, { useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Cpu,
  HardDrive,
  MemoryStick,
  RefreshCw,
  Wifi,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useLiveMetrics } from '../context/LiveMetricsContext';

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const kb = bytes / 1024;
  const mb = kb / 1024;
  const gb = mb / 1024;
  if (gb >= 1) return `${gb.toFixed(1)} GB`;
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${kb.toFixed(0)} KB`;
}

function MetricCard({ icon: Icon, label, value, unit, subLabel, color, progress }) {
  return (
    <motion.div
      className="glass-card p-4"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="section-kicker">{label}</span>
          <div className="mt-3 flex items-end gap-2">
            <span className="metric-value" style={{ color }}>
              {value}
            </span>
            <span className="metric-unit">{unit}</span>
          </div>
        </div>
        <div className="signal-icon" style={{ color }}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="metric-track">
        <div
          className="metric-fill"
          style={{
            width: `${Math.min(Math.max(Number(progress) || 0, 0), 100)}%`,
            background: color,
            boxShadow: `0 0 28px ${color}`,
          }}
        />
      </div>

      <p className="metric-subcopy">{subLabel}</p>
    </motion.div>
  );
}

function NetworkStats({ network }) {
  const formatSpeed = (bytesPerSec) => {
    if (!bytesPerSec || bytesPerSec === 0) return '0 B/s';
    const kb = bytesPerSec / 1024;
    const mb = kb / 1024;
    if (mb >= 1) return `${mb.toFixed(1)} MB/s`;
    return `${kb.toFixed(1)} KB/s`;
  };

  return (
    <motion.div
      className="glass-card p-4"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <span className="section-kicker">NETWORK</span>
          <div className="mt-3 text-2xl font-semibold display-type" style={{ color: 'var(--text-primary)' }}>
            双向吞吐
          </div>
        </div>
        <div className="signal-icon" style={{ color: 'var(--accent-cyan)' }}>
          <Wifi className="h-4 w-4" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="network-row">
          <div className="flex items-center gap-2">
            <ArrowDown className="h-3.5 w-3.5" style={{ color: 'var(--accent-green)' }} />
            <span className="network-label">下载</span>
          </div>
          <span className="network-value">{formatSpeed(network?.rx_sec)}</span>
        </div>

        <div className="network-row">
          <div className="flex items-center gap-2">
            <ArrowUp className="h-3.5 w-3.5" style={{ color: 'var(--accent-cyan)' }} />
            <span className="network-label">上传</span>
          </div>
          <span className="network-value">{formatSpeed(network?.tx_sec)}</span>
        </div>
      </div>

      <p className="metric-subcopy mt-4">
        累计 ↓{formatBytes(network?.rx_bytes)} / ↑{formatBytes(network?.tx_bytes)}
      </p>
    </motion.div>
  );
}

function ProcessTable({ title, data, icon: Icon, color }) {
  return (
    <div className="glass-card p-4 h-full">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="signal-icon" style={{ color }}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <span className="section-kicker">{title}</span>
            <h3 className="mt-2 text-xl display-type" style={{ color: 'var(--text-primary)' }}>
              {title === 'CPU' ? '热点进程' : '内存占用'}
            </h3>
          </div>
        </div>
        <span className="status-pill">TOP 5</span>
      </div>

      <div className="space-y-2">
        {data.map((process, index) => {
          const value = process[title === 'CPU' ? 'cpu' : 'memory'];

          return (
            <div key={process.pid} className="process-row">
              <div className="process-fill" style={{ width: `${Math.min(value, 100)}%`, background: color }} />
              <div className="relative flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="process-rank">#{index + 1}</span>
                    <span className="truncate text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {process.name}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] mono-type" style={{ color: 'var(--text-muted)' }}>
                    PID {process.pid}
                  </p>
                </div>
                <span className="process-value" style={{ color }}>
                  {value.toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RealtimeChart({ data }) {
  return (
    <div className="glass-card p-4 sm:p-5 xl:p-6 h-full">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="section-kicker">SIGNAL WINDOW</span>
          <h2 className="surface-title mt-2">实时负载曲线</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="status-pill">
            <span className="h-2 w-2 rounded-full" style={{ background: 'var(--accent-cyan)' }} />
            CPU
          </span>
          <span className="status-pill">
            <span className="h-2 w-2 rounded-full" style={{ background: 'var(--accent-yellow)' }} />
            内存
          </span>
        </div>
      </div>

      <div className="h-72 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, bottom: 0, left: -18 }}>
            <defs>
              <linearGradient id="cpuFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity={0.32} />
                <stop offset="100%" stopColor="var(--accent-cyan)" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="memoryFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent-yellow)" stopOpacity={0.28} />
                <stop offset="100%" stopColor="var(--accent-yellow)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 9" stroke="var(--chart-grid)" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
              axisLine={false}
              tickLine={false}
              minTickGap={42}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
              axisLine={false}
              tickLine={false}
              width={28}
              tickFormatter={value => `${value}%`}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--tooltip-bg)',
                border: '1px solid var(--border-strong)',
                borderRadius: '18px',
                fontSize: '11px',
                boxShadow: 'var(--shadow-panel)',
              }}
              labelStyle={{ color: 'var(--text-primary)' }}
              formatter={value => [`${value}%`]}
            />
            <Area
              type="monotone"
              dataKey="cpu"
              stroke="var(--accent-cyan)"
              fill="url(#cpuFill)"
              strokeWidth={2.5}
              name="CPU"
              dot={false}
              activeDot={{ r: 4 }}
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="memory"
              stroke="var(--accent-yellow)"
              fill="url(#memoryFill)"
              strokeWidth={2.5}
              name="内存"
              dot={false}
              activeDot={{ r: 4 }}
              isAnimationActive={false}
            />
          </AreaChart>
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
          second: '2-digit',
        }),
        cpu: parseFloat(Number(cpuUsage).toFixed(1)),
        memory: parseFloat(memoryPercentage),
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
          total: liveMetrics.memory.total,
        },
      };
    });

    appendChartPoint(liveMetrics.timestamp, liveMetrics.cpu, liveMetrics.memory.percentage);
  }, [liveMetrics]);

  if (loading || !metrics) {
    return (
      <div className="glass-card flex h-64 items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin" style={{ color: 'var(--accent-cyan)' }} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="section-kicker">SYSTEM TELEMETRY</span>
          <h2 className="surface-title mt-2">主机运行概览</h2>
        </div>
        <p className="max-w-2xl text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>
          实时曲线盯住波动，右侧四块读数负责给你最短路径的判断。哪怕只是瞟一眼，也知道系统是不是正在变吵。
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <RealtimeChart data={chartData} />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 xl:col-span-4 xl:grid-cols-2">
          <MetricCard
            icon={Cpu}
            label="CPU"
            value={metrics.cpu.usage.toFixed(1)}
            unit="%"
            subLabel={`${metrics.cpu.cores}核 / 负载 ${metrics.cpu.load?.toFixed(2) || '-'}`}
            color="var(--accent-cyan)"
            progress={metrics.cpu.usage}
          />
          <MetricCard
            icon={MemoryStick}
            label="MEMORY"
            value={metrics.memory.percentage}
            unit="%"
            subLabel={`${formatBytes(metrics.memory.used)} / ${formatBytes(metrics.memory.total)}`}
            color="var(--accent-yellow)"
            progress={metrics.memory.percentage}
          />
          <MetricCard
            icon={HardDrive}
            label="DISK"
            value={metrics.disk[0]?.percentage || 0}
            unit="%"
            subLabel={`${formatBytes(metrics.disk[0]?.used || 0)} / ${formatBytes(metrics.disk[0]?.size || 0)}`}
            color="var(--accent-purple)"
            progress={metrics.disk[0]?.percentage || 0}
          />
          <NetworkStats network={metrics.network} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ProcessTable title="CPU" data={metrics.cpuProcesses || []} icon={Cpu} color="var(--accent-cyan)" />
        <ProcessTable title="内存" data={metrics.memoryProcesses || []} icon={MemoryStick} color="var(--accent-yellow)" />
      </div>
    </div>
  );
}

export default SystemMonitor;
