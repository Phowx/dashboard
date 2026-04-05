import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import {
  Check,
  Clock3,
  Monitor,
  MoonStar,
  Sun,
  SunMedium,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { AnimatePresence, domAnimation, LazyMotion, m } from 'framer-motion';
import SystemMonitor from './components/SystemMonitor';
import LiquidSurface from './components/LiquidSurface';
import { LiveMetricsProvider, useLiveMetrics } from './context/LiveMetricsContext';

const DockerList = lazy(() => import('./components/DockerList'));
const Shortcuts = lazy(() => import('./components/Shortcuts'));
const THEME_STORAGE_KEY = 'dashboard-theme-v2';

function getSystemTheme() {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

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

function DashboardMark() {
  return (
    <span className="dashboard-glyph" aria-hidden>
      <span className="dashboard-glyph-cell dashboard-glyph-cell-primary" />
      <span className="dashboard-glyph-cell dashboard-glyph-cell-secondary" />
      <span className="dashboard-glyph-cell dashboard-glyph-cell-wide" />
    </span>
  );
}

function DashboardApp() {
  const [themePreference, setThemePreference] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(THEME_STORAGE_KEY) || 'system';
    }
    return 'system';
  });
  const [systemTheme, setSystemTheme] = useState(getSystemTheme);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const { wsStatus, liveMetrics } = useLiveMetrics();
  const themeMenuRef = useRef(null);

  const uptime = liveMetrics?.uptime || 0;
  const resolvedTheme = themePreference === 'system' ? systemTheme : themePreference;

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = event => {
      setSystemTheme(event.matches ? 'dark' : 'light');
    };

    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleThemeChange);
      return () => mediaQuery.removeEventListener('change', handleThemeChange);
    }

    mediaQuery.addListener(handleThemeChange);
    return () => mediaQuery.removeListener(handleThemeChange);
  }, []);

  useEffect(() => {
    if (resolvedTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }

    document.documentElement.dataset.themePreference = themePreference;
    localStorage.setItem(THEME_STORAGE_KEY, themePreference);
  }, [resolvedTheme, themePreference]);

  useEffect(() => {
    if (!themeMenuOpen) {
      return undefined;
    }

    const handlePointerDown = event => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target)) {
        setThemeMenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [themeMenuOpen]);

  const themeButtonIcon = themePreference === 'system'
    ? <Monitor className="h-3.5 w-3.5" />
    : resolvedTheme === 'light'
      ? <Sun className="h-3.5 w-3.5" />
      : <MoonStar className="h-3.5 w-3.5" />;

  const themeOptions = [
    { value: 'light', label: 'Light', icon: SunMedium },
    { value: 'dark', label: 'Dark', icon: MoonStar },
    { value: 'system', label: 'Auto', icon: Monitor },
  ];

  return (
    <div className="dashboard-shell min-h-screen">
      <m.header
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="relative z-10 pt-4"
      >
        <div className="mx-auto max-w-[1480px] px-4 xl:px-6">
          <div className="dashboard-toolbar">
            <div className="toolbar-brand-lane">
              <LiquidSurface variant="toolbarBrand" className="toolbar-brand-liquid" contentClassName="toolbar-brand-content">
                <div className="brand-mark">
                  <DashboardMark />
                </div>
                <span className="section-kicker">DASHBOARD</span>
              </LiquidSurface>
            </div>

            <div className="toolbar-controls">
              <LiquidSurface variant="toolbarPill" className="toolbar-pill-liquid" contentClassName="toolbar-pill-content">
                <Clock3 className="h-3.5 w-3.5" />
                <strong>{formatUptimeCompact(uptime)}</strong>
              </LiquidSurface>

              <LiquidSurface variant="toolbarIcon" className="toolbar-icon-liquid" contentClassName="toolbar-icon-content">
                <span aria-label={wsStatus === 'connected' ? 'Connected' : 'Reconnecting'}>
                  {wsStatus === 'connected' ? (
                    <Wifi className="h-3.5 w-3.5 live-indicator" style={{ color: 'var(--accent-green)' }} />
                  ) : (
                    <WifiOff className="h-3.5 w-3.5" style={{ color: 'var(--accent-red)' }} />
                  )}
                </span>
              </LiquidSurface>

              <div className="theme-switcher" ref={themeMenuRef}>
                <LiquidSurface variant="toolbarIcon" className="toolbar-icon-liquid" contentClassName="toolbar-icon-button-shell">
                  <m.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setThemeMenuOpen(prev => !prev)}
                    className="toolbar-icon-button transition-colors"
                    aria-label="Open theme menu"
                    type="button"
                  >
                    <AnimatePresence mode="wait">
                      <m.span
                        key={themePreference}
                        initial={{ rotate: -30, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 30, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {themeButtonIcon}
                      </m.span>
                    </AnimatePresence>
                  </m.button>
                </LiquidSurface>

                <AnimatePresence>
                  {themeMenuOpen ? (
                    <m.div
                      initial={{ opacity: 0, y: -6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.96 }}
                      transition={{ duration: 0.18 }}
                      className="theme-menu"
                    >
                      {themeOptions.map(({ value, label, icon: Icon }) => (
                        <button
                          key={value}
                          type="button"
                          className={`theme-menu-item${themePreference === value ? ' theme-menu-item-active' : ''}`}
                          onClick={() => {
                            setThemePreference(value);
                            setThemeMenuOpen(false);
                          }}
                        >
                          <span className="theme-menu-item-meta">
                            <Icon className="h-3.5 w-3.5" />
                            <span>{label}</span>
                          </span>
                          {themePreference === value ? <Check className="h-3.5 w-3.5" /> : null}
                        </button>
                      ))}
                    </m.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </m.header>

      <main className="relative pb-10 pt-4">
        <div className="mx-auto max-w-[1480px] px-4 xl:px-6">
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
