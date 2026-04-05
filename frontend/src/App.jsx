import React, { useEffect, useState } from 'react';
import {
  Activity,
  Clock3,
  Cpu,
  MemoryStick,
  Moon,
  ShieldCheck,
  Sun,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import SystemMonitor from './components/SystemMonitor';
import DockerList from './components/DockerList';
import Shortcuts from './components/Shortcuts';
import { LiveMetricsProvider, useLiveMetrics } from './context/LiveMetricsContext';

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}天 ${hours}时 ${mins}分`;
  if (hours > 0) return `${hours}时 ${mins}分`;
  return `${mins}分`;
}

function DashboardApp() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'dark';
    }
    return 'dark';
  });
  const [now, setNow] = useState(() => new Date());
  const { wsStatus, liveMetrics } = useLiveMetrics();

  const uptime = liveMetrics?.uptime || 0;
  const cpuUsage = liveMetrics ? `${Number(liveMetrics.cpu).toFixed(1)}%` : '--';
  const memoryUsage = liveMetrics ? `${Number(liveMetrics.memory.percentage).toFixed(1)}%` : '--';

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const signalCards = [
    {
      label: '连接状态',
      value: wsStatus === 'connected' ? '在线' : '离线',
      caption: wsStatus === 'connected' ? '实时信道已连接' : '等待自动重连',
      icon: wsStatus === 'connected' ? Wifi : WifiOff,
      accent: wsStatus === 'connected' ? 'var(--accent-green)' : 'var(--accent-red)',
    },
    {
      label: 'CPU',
      value: cpuUsage,
      caption: '来自实时广播',
      icon: Cpu,
      accent: 'var(--accent-cyan)',
    },
    {
      label: '内存',
      value: memoryUsage,
      caption: liveMetrics ? '主机使用率' : '等待采样',
      icon: MemoryStick,
      accent: 'var(--accent-yellow)',
    },
    {
      label: '在线时长',
      value: formatUptime(uptime),
      caption: '主机持续运行',
      icon: ShieldCheck,
      accent: 'var(--accent-purple)',
    },
  ];

  return (
    <div className="dashboard-shell min-h-screen">
      <motion.header
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="sticky top-4 z-50 px-4 xl:px-6"
      >
        <div className="mx-auto max-w-[1480px]">
          <div className="chrome-bar px-4 py-3 sm:px-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="brand-mark">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span className="section-kicker">PRIVATE INFRASTRUCTURE</span>
                  <p className="mt-1 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    你的服务器、容器和入口都在同一张工作台里。
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="status-pill">
                  <Clock3 className="h-3.5 w-3.5" />
                  <span>{now.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}</span>
                  <strong>{now.toLocaleTimeString('zh-CN', { hour12: false })}</strong>
                </div>

                <div className="status-pill">
                  {wsStatus === 'connected' ? (
                    <Wifi className="h-3.5 w-3.5 live-indicator" style={{ color: 'var(--accent-green)' }} />
                  ) : (
                    <WifiOff className="h-3.5 w-3.5" style={{ color: 'var(--accent-red)' }} />
                  )}
                  <span>{wsStatus === 'connected' ? '实时同步中' : '等待重连'}</span>
                  <strong>{formatUptime(uptime)}</strong>
                </div>

                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={toggleTheme}
                  className="status-pill transition-colors"
                  aria-label="Toggle theme"
                  type="button"
                >
                  <AnimatePresence mode="wait">
                    {theme === 'dark' ? (
                      <motion.span
                        key="sun"
                        initial={{ rotate: -60, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 60, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Sun className="h-3.5 w-3.5" />
                      </motion.span>
                    ) : (
                      <motion.span
                        key="moon"
                        initial={{ rotate: 60, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -60, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Moon className="h-3.5 w-3.5" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <span>{theme === 'dark' ? '浅色视图' : '深色视图'}</span>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="relative mx-auto max-w-[1480px] px-4 pb-10 pt-6 xl:px-6">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08, ease: 'easeOut' }}
          className="hero-panel mb-5"
        >
          <div className="space-y-6">
            <span className="section-kicker">OPERATIONS DESK</span>
            <div className="space-y-4">
              <h1 className="hero-title">私人服务器控制台</h1>
              <p className="hero-subtitle">
                把系统波动、容器运行状态和常用入口压缩进一张更安静的工作台。
                它不是仪表盘堆砌，而是一眼就能判断有没有异常的控制桌面。
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="hero-chip">
                <ShieldCheck className="h-4 w-4" />
                <span>自动重连已启用</span>
              </div>
              <div className="hero-chip">
                <Cpu className="h-4 w-4" />
                <span>当前 CPU {cpuUsage}</span>
              </div>
              <div className="hero-chip">
                <MemoryStick className="h-4 w-4" />
                <span>当前内存 {memoryUsage}</span>
              </div>
            </div>
          </div>

          <div className="hero-signal-grid">
            {signalCards.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.18 + index * 0.08 }}
                  className="hero-signal-card"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="signal-label">{item.label}</span>
                    <div className="signal-icon" style={{ color: item.accent }}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="signal-value">{item.value}</div>
                  <p className="signal-caption">{item.caption}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        <div className="grid grid-cols-12 gap-4 xl:gap-5">
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.16 }}
            className="col-span-12 xl:col-span-8"
          >
            <SystemMonitor />
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.22 }}
            className="col-span-12 xl:col-span-4"
          >
            <Shortcuts />
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.28 }}
            className="col-span-12"
          >
            <DockerList />
          </motion.section>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <LiveMetricsProvider>
      <DashboardApp />
    </LiveMetricsProvider>
  );
}

export default App;
