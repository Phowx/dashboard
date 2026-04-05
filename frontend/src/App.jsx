import React, { lazy, Suspense, useEffect, useState } from 'react';
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
import { AnimatePresence, domAnimation, LazyMotion, m } from 'framer-motion';
import SystemMonitor from './components/SystemMonitor';
import { LiveMetricsProvider, useLiveMetrics } from './context/LiveMetricsContext';

const DockerList = lazy(() => import('./components/DockerList'));
const Shortcuts = lazy(() => import('./components/Shortcuts'));
const THEME_STORAGE_KEY = 'dashboard-theme-v2';

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}天 ${hours}时 ${mins}分`;
  if (hours > 0) return `${hours}时 ${mins}分`;
  return `${mins}分`;
}

function SectionFallback({ title, description, minHeight = 'min-h-[260px]' }) {
  return (
    <div className={`glass-card flex ${minHeight} flex-col justify-between p-5 sm:p-6`}>
      <div className="space-y-3">
        <span className="section-kicker">LOADING</span>
        <div className="h-6 w-40 rounded-full shimmer-bar" />
        <div className="space-y-2">
          <div className="h-3 w-full rounded-full shimmer-bar" />
          <div className="h-3 w-5/6 rounded-full shimmer-bar" />
        </div>
      </div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{title}</p>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>{description}</p>
        </div>
        <div className="loading-orb" />
      </div>
    </div>
  );
}

function DashboardApp() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(THEME_STORAGE_KEY) || 'dark';
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
    localStorage.setItem(THEME_STORAGE_KEY, theme);
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

  const ribbonCards = [
    { label: '链路', value: wsStatus === 'connected' ? '稳定' : '重连中', accent: signalCards[0].accent },
    { label: 'CPU', value: cpuUsage, accent: 'var(--accent-cyan)' },
    { label: '内存', value: memoryUsage, accent: 'var(--accent-yellow)' },
    { label: '在线', value: formatUptime(uptime), accent: 'var(--accent-green)' },
  ];

  return (
    <div className="dashboard-shell min-h-screen">
      <m.header
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

                <m.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={toggleTheme}
                  className="status-pill transition-colors"
                  aria-label="Toggle theme"
                  type="button"
                >
                  <AnimatePresence mode="wait">
                    {theme === 'dark' ? (
                      <m.span
                        key="sun"
                        initial={{ rotate: -60, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 60, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Sun className="h-3.5 w-3.5" />
                      </m.span>
                    ) : (
                      <m.span
                        key="moon"
                        initial={{ rotate: 60, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -60, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Moon className="h-3.5 w-3.5" />
                      </m.span>
                    )}
                  </AnimatePresence>
                  <span>{theme === 'dark' ? '浅色视图' : '深色视图'}</span>
                </m.button>
              </div>
            </div>
          </div>
        </div>
      </m.header>

      <main className="relative mx-auto max-w-[1480px] px-4 pb-10 pt-6 xl:px-6">
        <m.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08, ease: 'easeOut' }}
          className="command-deck mb-5"
        >
          <div className="command-copy-column">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="section-kicker">CONTROL ROOM / NODE 01</span>
                <span className="command-inline-separator" />
                <span className="mono-type text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  {now.toLocaleDateString('zh-CN', {
                    month: '2-digit',
                    day: '2-digit',
                    weekday: 'short',
                  })}
                </span>
              </div>
              <h1 className="command-title">私人服务器控制台</h1>
              <p className="command-copy">
                这次把它收回到更像值班台的样子: 不抢戏，但要让负载波动、容器状态和常用入口在几秒内就能读懂。
              </p>
            </div>

            <div className="command-ribbon">
              {ribbonCards.map(item => (
                <div key={item.label} className="ribbon-chip">
                  <span className="section-kicker">{item.label}</span>
                  <strong style={{ color: item.accent }}>{item.value}</strong>
                </div>
              ))}
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

          <div className="command-board">
            <div className="command-board-header">
              <div>
                <span className="section-kicker">LIVE STATUS</span>
                <h2 className="surface-title mt-2">运行信号</h2>
              </div>
              <div className="status-pill">
                {wsStatus === 'connected' ? (
                  <Wifi className="h-3.5 w-3.5 live-indicator" style={{ color: 'var(--accent-green)' }} />
                ) : (
                  <WifiOff className="h-3.5 w-3.5" style={{ color: 'var(--accent-red)' }} />
                )}
                <span>{wsStatus === 'connected' ? '实时广播正常' : '链路恢复中'}</span>
              </div>
            </div>

            <div className="hero-signal-grid">
            {signalCards.map((item, index) => {
              const Icon = item.icon;

              return (
                <m.div
                  key={item.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.18 + index * 0.08 }}
                  className={`hero-signal-card ${index === 0 ? 'hero-signal-card-primary' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="signal-label">{item.label}</span>
                    <div className="signal-icon" style={{ color: item.accent }}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="signal-value">{item.value}</div>
                  <p className="signal-caption">{item.caption}</p>
                </m.div>
              );
            })}
          </div>
          </div>
        </m.section>

        <div className="grid grid-cols-12 gap-4 xl:gap-5">
          <m.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.16 }}
            className="col-span-12 xl:col-span-8"
          >
            <SystemMonitor />
          </m.section>

          <m.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.22 }}
            className="col-span-12 xl:col-span-4"
          >
            <Suspense
              fallback={
                <SectionFallback
                  title="快捷入口加载中"
                  description="正在拆分懒加载区块，先让首屏更快落地。"
                  minHeight="min-h-[360px]"
                />
              }
            >
              <Shortcuts />
            </Suspense>
          </m.section>

          <m.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.28 }}
            className="col-span-12"
          >
            <Suspense
              fallback={
                <SectionFallback
                  title="Docker 舱段加载中"
                  description="容器控制区已拆成独立 chunk，减少首屏主包压力。"
                  minHeight="min-h-[320px]"
                />
              }
            >
              <DockerList />
            </Suspense>
          </m.section>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <LazyMotion features={domAnimation}>
      <LiveMetricsProvider>
        <DashboardApp />
      </LiveMetricsProvider>
    </LazyMotion>
  );
}

export default App;
