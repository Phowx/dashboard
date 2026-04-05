import React, { lazy, Suspense, useEffect, useState } from 'react';
import {
  Activity,
  Clock3,
  Moon,
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

function formatUptimeCompact(seconds) {
  if (!seconds || seconds < 1) return '--';

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
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
  const { wsStatus, liveMetrics } = useLiveMetrics();

  const uptime = liveMetrics?.uptime || 0;

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

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
              <div className="toolbar-brand">
                <div className="brand-mark">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <span className="section-kicker">DASHBOARD</span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="status-pill toolbar-pill">
                  <Clock3 className="h-3.5 w-3.5" />
                  <strong>{formatUptimeCompact(uptime)}</strong>
                </div>

                <div className="status-pill toolbar-icon-pill" aria-label={wsStatus === 'connected' ? 'Connected' : 'Reconnecting'}>
                  {wsStatus === 'connected' ? (
                    <Wifi className="h-3.5 w-3.5 live-indicator" style={{ color: 'var(--accent-green)' }} />
                  ) : (
                    <WifiOff className="h-3.5 w-3.5" style={{ color: 'var(--accent-red)' }} />
                  )}
                </div>

                <m.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={toggleTheme}
                  className="status-pill toolbar-icon-pill transition-colors"
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
                </m.button>
              </div>
            </div>
          </div>
        </div>
      </m.header>

      <main className="relative mx-auto max-w-[1480px] px-4 pb-10 pt-6 xl:px-6">
        <div className="grid grid-cols-12 gap-4 xl:gap-5">
          <m.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.16 }}
            className="col-span-12 xl:col-span-9 2xl:col-span-9"
          >
            <SystemMonitor />
          </m.section>

          <m.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.22 }}
            className="col-span-12 h-full xl:col-span-3 2xl:col-span-3 xl:self-stretch"
          >
            <Suspense
              fallback={
                <SectionFallback
                  title="Launchpad Loading"
                  description="Preparing the shortcuts panel."
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
                  title="Container Deck Loading"
                  description="Preparing the container controls."
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
