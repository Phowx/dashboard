import React, { lazy, Suspense, useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Cpu,
  HardDrive,
  MemoryStick,
  RefreshCw,
  Wifi,
} from 'lucide-react';
import { m } from 'framer-motion';
import { useLiveMetrics } from '../context/LiveMetricsContext';

const RealtimeChart = lazy(() => import('./charts/RealtimeChart'));

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
    <m.div
      className="glass-card metric-card p-3.5 sm:p-4"
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
    </m.div>
  );
}

function NetworkStats({ network }) {
  const formatSpeed = (bytesPerSec) => {
    if (!bytesPerSec || bytesPerSec === 0) return '0.0 KB/s';
    const kb = bytesPerSec / 1024;
    const mb = kb / 1024;
    if (mb >= 1) return `${mb.toFixed(1)} MB/s`;
    return `${kb.toFixed(1)} KB/s`;
  };

  const formatTrafficTotal = bytes => {
    if (!bytes || bytes === 0) return '0';
    const kb = bytes / 1024;
    const mb = kb / 1024;
    const gb = mb / 1024;
    if (gb >= 1) return `${gb.toFixed(1)}G`;
    if (mb >= 1) return `${mb.toFixed(1)}M`;
    return `${kb.toFixed(0)}K`;
  };

  return (
    <m.div
      className="glass-card metric-card p-3.5 sm:p-4"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="section-kicker">NETWORK</span>
        <div className="signal-icon" style={{ color: 'var(--accent-cyan)' }}>
          <Wifi className="h-4 w-4" />
        </div>
      </div>

      <div className="network-speed-list">
        <div className="network-speed-row">
          <ArrowDown className="h-3.5 w-3.5" style={{ color: 'var(--accent-green)' }} />
          <span className="network-speed-value">{formatSpeed(network?.rx_sec)}</span>
        </div>

        <div className="network-speed-row">
          <ArrowUp className="h-3.5 w-3.5" style={{ color: 'var(--accent-cyan)' }} />
          <span className="network-speed-value">{formatSpeed(network?.tx_sec)}</span>
        </div>
      </div>

      <p className="metric-subcopy network-summary mt-auto">
        I {formatTrafficTotal(network?.rx_bytes)} / O {formatTrafficTotal(network?.tx_bytes)}
      </p>
    </m.div>
  );
}

function ProcessTable({ sectionLabel, data, metricKey, icon: Icon, color }) {
  return (
    <div className="glass-card p-3 sm:p-3.5 h-full">
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="signal-icon" style={{ color }}>
            <Icon className="h-4 w-4" />
          </div>
          <span className="section-kicker">{sectionLabel}</span>
        </div>
        <span className="status-pill">TOP 5</span>
      </div>

      <div className="space-y-1.5">
        {data.map((process, index) => {
          const value = process[metricKey];

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

function SystemMonitor() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const { liveMetrics } = useLiveMetrics();

  const createChartPoint = (timestamp, cpuUsage, memoryPercentage) => ({
    time: new Date(timestamp).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    cpu: parseFloat(Number(cpuUsage).toFixed(1)),
    memory: parseFloat(memoryPercentage),
  });

  const appendChartPoint = (timestamp, cpuUsage, memoryPercentage) => {
    setChartData(prev => {
      const nextPoint = createChartPoint(timestamp, cpuUsage, memoryPercentage);

      if (prev.length < 2) {
        const seededHistory = Array.from({ length: 18 }, (_, index) => {
          const seedTimestamp = new Date(new Date(timestamp).getTime() - (17 - index) * 2000).toISOString();
          return createChartPoint(seedTimestamp, cpuUsage, memoryPercentage);
        });

        return seededHistory;
      }

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
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-4 xl:min-h-[322px] xl:grid-cols-12 xl:items-stretch">
        <div className="xl:col-span-8 xl:h-full">
          <Suspense
            fallback={
              <div className="glass-card h-full min-h-[320px] p-4 sm:p-5 xl:p-6">
                <div className="mb-3 flex justify-end">
                  <div className="loading-orb" />
                </div>
                <div className="mt-8 grid gap-3">
                  <div className="h-3 w-full rounded-full shimmer-bar" />
                  <div className="h-3 w-11/12 rounded-full shimmer-bar" />
                  <div className="h-3 w-4/5 rounded-full shimmer-bar" />
                  <div className="h-56 rounded-[28px] shimmer-panel" />
                </div>
              </div>
            }
          >
            <RealtimeChart data={chartData} />
          </Suspense>
        </div>

        <div className="metrics-grid grid grid-cols-2 gap-4 sm:grid-cols-4 xl:col-span-4 xl:h-full xl:grid-cols-2 xl:grid-rows-2">
          <MetricCard
            icon={Cpu}
            label="CPU"
            value={metrics.cpu.usage.toFixed(1)}
            unit="%"
            subLabel={`${metrics.cpu.cores} cores / load ${metrics.cpu.load?.toFixed(2) || '-'}`}
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
        <ProcessTable
          sectionLabel="CPU"
          metricKey="cpu"
          data={metrics.cpuProcesses || []}
          icon={Cpu}
          color="var(--accent-cyan)"
        />
        <ProcessTable
          sectionLabel="MEMORY"
          metricKey="memory"
          data={metrics.memoryProcesses || []}
          icon={MemoryStick}
          color="var(--accent-yellow)"
        />
      </div>
    </div>
  );
}

export default SystemMonitor;
