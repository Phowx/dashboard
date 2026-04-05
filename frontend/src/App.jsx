import React, { useState, useEffect } from 'react';
import { Activity, Sun, Moon, Wifi, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SystemMonitor from './components/SystemMonitor';
import DockerList from './components/DockerList';

const getWebSocketUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/ws`;
};

function App() {
  const [wsStatus, setWsStatus] = useState('disconnected');
  const [uptime, setUptime] = useState(0);
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `${days}天 ${hours}时 ${mins}分`;
    if (hours > 0) return `${hours}时 ${mins}分`;
    return `${mins}分`;
  };

  useEffect(() => {
    const ws = new WebSocket(getWebSocketUrl());

    ws.onopen = () => setWsStatus('connected');
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'metrics' && message.data.uptime) {
        setUptime(message.data.uptime);
      }
    };
    ws.onclose = () => setWsStatus('disconnected');
    ws.onerror = () => setWsStatus('disconnected');

    return () => ws.close();
  }, []);

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ background: 'var(--bg-primary)' }}>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-50 backdrop-blur-lg border-b"
        style={{
          background: 'var(--bg-secondary)',
          borderColor: 'var(--border-color)'
        }}
      >
        <div className="max-w-[1400px] mx-auto px-4 xl:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="p-1.5 rounded-lg"
                style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))' }}
              >
                <Activity className="w-4 h-4 text-white" />
              </motion.div>
              <h1 className="text-base font-bold gradient-text">系统监控</h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  运行: {formatUptime(uptime)}
                </span>
                <div className="flex items-center gap-1.5">
                  {wsStatus === 'connected' ? (
                    <Wifi className="w-3 h-3 text-green-500 live-indicator" />
                  ) : (
                    <WifiOff className="w-3 h-3 text-red-500" />
                  )}
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {wsStatus === 'connected' ? '实时' : '离线'}
                  </span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className="p-1.5 rounded-lg transition-colors"
                style={{
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-secondary)'
                }}
                aria-label="Toggle theme"
              >
                <AnimatePresence mode="wait">
                  {theme === 'dark' ? (
                    <motion.div
                      key="sun"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Sun className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Moon className="w-4 h-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-[1400px] mx-auto px-4 xl:px-6 py-4 space-y-4">
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <SystemMonitor />
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <DockerList />
        </motion.section>
      </main>
    </div>
  );
}

export default App;
