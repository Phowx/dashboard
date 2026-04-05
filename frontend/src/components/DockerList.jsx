import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertTriangle,
  Container,
  Layers,
  Play,
  RefreshCw,
  RotateCcw,
  Square,
  X,
} from 'lucide-react';
import { AnimatePresence, m } from 'framer-motion';

const STACK_TONES = [
  { color: 'var(--accent-cyan)', bg: 'rgba(87, 208, 239, 0.12)', border: 'rgba(87, 208, 239, 0.26)' },
  { color: 'var(--accent-yellow)', bg: 'rgba(255, 180, 84, 0.14)', border: 'rgba(255, 180, 84, 0.28)' },
  { color: 'var(--accent-green)', bg: 'rgba(124, 214, 166, 0.14)', border: 'rgba(124, 214, 166, 0.28)' },
  { color: '#de8bff', bg: 'rgba(222, 139, 255, 0.14)', border: 'rgba(222, 139, 255, 0.28)' },
  { color: '#ff8a6a', bg: 'rgba(255, 138, 106, 0.14)', border: 'rgba(255, 138, 106, 0.28)' },
  { color: '#7aa6ff', bg: 'rgba(122, 166, 255, 0.14)', border: 'rgba(122, 166, 255, 0.28)' },
];

function StatusBadge({ state, compact = false }) {
  const getStatusConfig = () => {
    switch (state) {
      case 'running':
        return { color: 'var(--accent-green)', bg: 'rgba(138, 214, 142, 0.14)', label: 'Running' };
      case 'exited':
        return { color: 'var(--accent-red)', bg: 'rgba(240, 122, 99, 0.14)', label: 'Stopped' };
      case 'paused':
        return { color: 'var(--accent-yellow)', bg: 'rgba(216, 168, 95, 0.14)', label: 'Paused' };
      default:
        return { color: 'var(--text-muted)', bg: 'rgba(255, 255, 255, 0.05)', label: state || 'Unknown' };
    }
  };

  const config = getStatusConfig();

  return (
    <span
      className={`inline-flex rounded-full mono-type text-[10px] uppercase tracking-[0.18em] ${
        compact ? 'h-7 w-7 items-center justify-center p-0' : 'items-center gap-2 px-2.5 py-1'
      }`}
      style={{ background: config.bg, color: config.color }}
      title={config.label}
      aria-label={config.label}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{
          background: config.color,
          boxShadow: state === 'running' ? `0 0 10px ${config.color}` : 'none',
        }}
      />
      {!compact ? config.label : null}
    </span>
  );
}

function ConfirmModal({ isOpen, onClose, onConfirm, containerName, action, isLoading }) {
  if (!isOpen) return null;

  const actionConfig = {
    start: { label: 'Start', color: 'var(--accent-green)', icon: Play },
    stop: { label: 'Stop', color: 'var(--accent-red)', icon: Square },
    restart: { label: 'Restart', color: 'var(--accent-cyan)', icon: RotateCcw },
  };

  const config = actionConfig[action] || actionConfig.stop;
  const Icon = config.icon;
  const isDanger = action === 'stop';

  return createPortal(
    <AnimatePresence>
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        style={{ background: 'rgba(8, 10, 9, 0.72)', backdropFilter: 'blur(10px)' }}
        onClick={onClose}
      >
        <m.div
          initial={{ opacity: 0, scale: 0.94, y: 22 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 22 }}
          transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          className="glass-card w-full max-w-md overflow-hidden"
          onClick={event => event.stopPropagation()}
        >
          <div className="border-b p-5" style={{ borderColor: 'var(--border-color)' }}>
            <div className="mb-4 flex items-center justify-between">
              <span className="section-kicker">CONTAINER ACTION</span>
              <button type="button" onClick={onClose} className="status-pill">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex items-start gap-4">
              <div
                className="signal-icon"
                style={{
                  color: config.color,
                  background: isDanger ? 'rgba(240, 122, 99, 0.12)' : 'rgba(77, 180, 200, 0.12)',
                }}
              >
                {isDanger ? <AlertTriangle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>
              <div>
                <h3 className="surface-title text-[1.6rem]">{config.label} Container</h3>
                <p className="mt-2 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>
                  This will <span style={{ color: config.color }}>{config.label.toLowerCase()}</span>{' '}
                  <strong style={{ color: 'var(--text-primary)' }}>{containerName}</strong>.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 p-5">
            <m.button whileTap={{ scale: 0.98 }} onClick={onClose} disabled={isLoading} className="btn-secondary flex-1">
              Cancel
            </m.button>
            <m.button
              whileTap={{ scale: 0.98 }}
              onClick={onConfirm}
              disabled={isLoading}
              className="btn-primary flex flex-1 items-center justify-center gap-2"
              type="button"
              style={{ opacity: isLoading ? 0.75 : 1 }}
            >
              {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
              Confirm
            </m.button>
          </div>
        </m.div>
      </m.div>
    </AnimatePresence>,
    document.body
  );
}

function ActionButton({ action, onClick, loading, disabled, compact = false }) {
  const config = {
    start: { icon: Play, color: 'var(--accent-green)', title: 'Start' },
    stop: { icon: Square, color: 'var(--accent-red)', title: 'Stop' },
    restart: { icon: RotateCcw, color: 'var(--accent-cyan)', title: 'Restart' },
  }[action];

  const Icon = config.icon;
  const buttonSize = compact ? 'h-7 w-7' : 'h-9 w-9';
  const iconSize = compact ? 'h-3 w-3' : 'h-3.5 w-3.5';

  return (
    <m.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-full border transition-all disabled:opacity-50 ${buttonSize}`}
      style={{
        borderColor: 'var(--border-color)',
        background: 'rgba(255, 255, 255, 0.04)',
        color: config.color,
      }}
      title={config.title}
      type="button"
    >
      {loading ? <RefreshCw className={`${iconSize} animate-spin`} /> : <Icon className={iconSize} />}
    </m.button>
  );
}

function DockerList() {
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    containerId: null,
    containerName: '',
    action: null,
  });

  const fetchContainers = async () => {
    try {
      const response = await fetch('/api/docker/containers');
      const data = await response.json();
      setContainers(data);
    } catch (error) {
      console.error('Error fetching containers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContainers();
    const interval = setInterval(fetchContainers, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async () => {
    const { containerId, action } = confirmModal;
    setActionLoading(`${containerId}-${action}`);

    try {
      await fetch(`/api/docker/containers/${containerId}/${action}`, { method: 'POST' });
      await fetchContainers();
    } catch (error) {
      console.error('Error performing action:', error);
    } finally {
      setActionLoading(null);
      setConfirmModal({ open: false, containerId: null, containerName: '', action: null });
    }
  };

  const openConfirm = (container, action) => {
    setConfirmModal({
      open: true,
      containerId: container.id,
      containerName: container.name,
      action,
    });
  };

  const formatBytes = bytes => {
    if (!bytes || bytes === 0) return '-';
    const mb = bytes / (1024 * 1024);
    const gb = mb / 1024;
    if (gb >= 1) return `${gb.toFixed(1)} G`;
    return `${mb.toFixed(0)} M`;
  };

  const getPortEntries = ports => {
    if (!ports) return [];
    return String(ports)
      .split(',')
      .map(entry => entry.trim())
      .filter(Boolean)
      .sort((entryA, entryB) => {
        const parseEntry = entry => {
          const [mapping = '', protocol = 'tcp'] = entry.split('/');
          const numbers = mapping.match(/\d+/g)?.map(Number) ?? [];
          const publicPort = numbers[0] ?? Number.MAX_SAFE_INTEGER;
          const privatePort = numbers[1] ?? publicPort;
          const protocolOrder = protocol === 'tcp' ? 0 : protocol === 'udp' ? 1 : 2;

          return { publicPort, privatePort, protocolOrder, text: entry };
        };

        const a = parseEntry(entryA);
        const b = parseEntry(entryB);

        if (a.publicPort !== b.publicPort) return a.publicPort - b.publicPort;
        if (a.privatePort !== b.privatePort) return a.privatePort - b.privatePort;
        if (a.protocolOrder !== b.protocolOrder) return a.protocolOrder - b.protocolOrder;
        return a.text.localeCompare(b.text);
      });
  };

  const stats = {
    total: containers.length,
    running: containers.filter(container => container.state === 'running').length,
    stopped: containers.filter(container => container.state === 'exited').length,
    paused: containers.filter(container => container.state === 'paused').length,
  };

  const sortedContainers = [...containers].sort((a, b) => {
    const stackA = a.composeProject || 'zzz-standalone';
    const stackB = b.composeProject || 'zzz-standalone';
    const stackCompare = stackA.localeCompare(stackB);
    if (stackCompare !== 0) return stackCompare;

    const serviceA = a.composeService || a.name || '';
    const serviceB = b.composeService || b.name || '';
    return serviceA.localeCompare(serviceB);
  });

  const stackToneMap = sortedContainers.reduce((map, container) => {
    if (!container.composeProject || map[container.composeProject]) {
      return map;
    }

    const nextIndex = Object.keys(map).length % STACK_TONES.length;
    map[container.composeProject] = STACK_TONES[nextIndex];
    return map;
  }, {});

  if (loading) {
    return (
      <div className="glass-card flex h-40 items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin" style={{ color: 'var(--accent-cyan)' }} />
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="border-b p-3.5 sm:p-5 xl:p-6" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <span className="section-kicker">CONTAINERS</span>
          </div>
        </div>

        <div className="mt-4 hidden flex-wrap gap-2 md:flex">
          <span className="status-pill" style={{ color: 'var(--accent-green)' }}>
            <strong>{stats.running}</strong>
            <span>Running</span>
          </span>
          <span className="status-pill" style={{ color: 'var(--accent-red)' }}>
            <strong>{stats.stopped}</strong>
            <span>Stopped</span>
          </span>
        </div>

        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 md:hidden">
          <span className="status-pill shrink-0" style={{ color: 'var(--accent-green)' }}>
            <strong>{stats.running}</strong>
            <span>Running</span>
          </span>
          <span className="status-pill shrink-0" style={{ color: 'var(--accent-red)' }}>
            <strong>{stats.stopped}</strong>
            <span>Stopped</span>
          </span>
        </div>
      </div>

      {containers.length === 0 ? (
        <div className="p-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border" style={{ borderColor: 'var(--border-color)' }}>
            <Container className="h-6 w-6" style={{ color: 'var(--text-muted)' }} />
          </div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            No containers found.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-3 grid gap-2.5 px-3 pb-3 md:hidden">
            {sortedContainers.map(container => (
              <div key={container.id} className="glass-card p-3.5">
                <div className="flex items-start justify-between gap-2.5">
                  <div className="min-w-0">
                    {container.composeProject ? (
                      (() => {
                        const stackTone = stackToneMap[container.composeProject];
                        return (
                          <span
                            className="stack-pill"
                            style={{
                              color: stackTone.color,
                              background: stackTone.bg,
                              borderColor: stackTone.border,
                            }}
                          >
                            {container.composeProject}
                          </span>
                        );
                      })()
                    ) : (
                      <span className="stack-pill stack-pill-standalone">Standalone</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {container.state !== 'running' ? (
                      <ActionButton
                        action="start"
                        onClick={() => openConfirm(container, 'start')}
                        loading={actionLoading === `${container.id}-start`}
                        compact
                      />
                    ) : (
                      <ActionButton
                        action="stop"
                        onClick={() => openConfirm(container, 'stop')}
                        loading={actionLoading === `${container.id}-stop`}
                        compact
                      />
                    )}
                    <ActionButton
                      action="restart"
                      onClick={() => openConfirm(container, 'restart')}
                      loading={actionLoading === `${container.id}-restart`}
                      compact
                    />
                  </div>
                </div>

                <div className="mt-2.5 flex items-start justify-between gap-2.5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {container.composeProject && (() => {
                        const stackTone = stackToneMap[container.composeProject];
                        return (
                          <Layers className="h-3.5 w-3.5 shrink-0" style={{ color: stackTone?.color || 'var(--accent-cyan)' }} />
                        );
                      })()}
                      <span className="truncate text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {container.composeService || container.name}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[10px] mono-type leading-4" style={{ color: 'var(--text-muted)' }}>
                      {container.image || '-'}
                    </p>
                  </div>
                  <StatusBadge state={container.state} />
                </div>

                <div className="mt-2.5 grid grid-cols-[0.82fr_0.92fr_1.26fr] gap-2">
                  <div className="mobile-stat-card">
                    <span className="section-kicker">CPU</span>
                    <strong style={{ color: 'var(--accent-cyan)' }}>
                      {container.stats?.cpuPercent !== null && container.stats?.cpuPercent !== undefined
                        ? `${container.stats.cpuPercent.toFixed(1)}%`
                        : '-'}
                    </strong>
                  </div>
                  <div className="mobile-stat-card">
                    <span className="section-kicker">MEMORY</span>
                    <strong style={{ color: 'var(--accent-yellow)' }}>{formatBytes(container.stats?.memoryUsage)}</strong>
                  </div>
                  <div className="mobile-stat-card mobile-stat-card-ports">
                    <span className="section-kicker">PORTS</span>
                    <strong className="text-left leading-5" style={{ color: 'var(--text-primary)' }}>
                      {getPortEntries(container.ports).length > 0 ? (
                        getPortEntries(container.ports).map(entry => (
                          <span key={`${container.id}-${entry}`} className="block">
                            {entry}
                          </span>
                        ))
                      ) : (
                        '-'
                      )}
                    </strong>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto px-3 pb-3 sm:px-4 sm:pb-4 xl:px-6 xl:pb-6 md:block">
            <table className="mt-4 w-full min-w-[880px] table-fixed overflow-hidden rounded-[24px]">
            <thead>
              <tr
                className="mono-type text-[10px] uppercase tracking-[0.18em]"
                style={{ color: 'var(--text-muted)' }}
              >
                <th className="w-[56px] px-3 py-3 text-left font-medium">State</th>
                <th className="w-[172px] px-3 py-3 text-left font-medium">Stack</th>
                <th className="w-[154px] px-3 py-3 text-left font-medium">Container</th>
                <th className="hidden w-[168px] px-3 py-3 text-left font-medium md:table-cell">Image</th>
                <th className="w-[142px] px-3 py-3 text-left font-medium">Ports</th>
                <th className="w-[78px] px-3 py-3 text-right font-medium">CPU</th>
                <th className="w-[86px] px-3 py-3 text-right font-medium">Memory</th>
                <th className="w-[118px] px-3 py-3 text-center font-medium">Actions</th>
              </tr>
            </thead>
              <tbody className="divide-y" style={{ divideColor: 'var(--border-color)' }}>
                {sortedContainers.map(container => (
                  <tr key={container.id} className="transition-colors duration-200">
                    <td className="px-3 py-4 align-middle">
                      <StatusBadge state={container.state} compact />
                    </td>
                    <td className="px-3 py-4">
                      <div className="min-w-0 flex items-center gap-2">
                        {container.composeProject ? (
                          (() => {
                            const stackTone = stackToneMap[container.composeProject];
                            return (
                              <>
                                <Layers className="h-3.5 w-3.5 shrink-0" style={{ color: stackTone.color }} />
                                <span
                                  className="stack-pill"
                                  style={{
                                    color: stackTone.color,
                                    background: stackTone.bg,
                                    borderColor: stackTone.border,
                                  }}
                                >
                                  {container.composeProject}
                                </span>
                              </>
                            );
                          })()
                        ) : (
                          <span className="stack-pill stack-pill-standalone">Standalone</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <div className="min-w-0">
                        <span className="truncate text-sm font-semibold block" style={{ color: 'var(--text-primary)' }}>
                          {container.composeService || container.name}
                        </span>
                        <p className="mt-1 text-[11px] mono-type truncate" style={{ color: 'var(--text-muted)' }}>
                          {container.name}
                        </p>
                      </div>
                    </td>
                    <td className="hidden px-3 py-4 md:table-cell">
                      <span className="block break-words text-xs leading-5" style={{ color: 'var(--text-secondary)' }}>
                        {container.image || '-'}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <div className="space-y-1 text-xs leading-5 mono-type" style={{ color: 'var(--text-secondary)' }}>
                        {getPortEntries(container.ports).length > 0 ? (
                          getPortEntries(container.ports).map(entry => (
                            <span key={`${container.id}-${entry}`} className="block whitespace-nowrap">
                              {entry}
                            </span>
                          ))
                        ) : (
                          <span className="block">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-4 text-right">
                      <span className="text-sm font-semibold" style={{ color: 'var(--accent-cyan)' }}>
                        {container.stats?.cpuPercent !== null && container.stats?.cpuPercent !== undefined
                          ? `${container.stats.cpuPercent.toFixed(1)}%`
                          : '-'}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-right">
                      <span className="text-sm font-semibold" style={{ color: 'var(--accent-yellow)' }}>
                        {formatBytes(container.stats?.memoryUsage)}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {container.state !== 'running' ? (
                          <ActionButton
                            action="start"
                            onClick={() => openConfirm(container, 'start')}
                            loading={actionLoading === `${container.id}-start`}
                          />
                        ) : (
                          <ActionButton
                            action="stop"
                            onClick={() => openConfirm(container, 'stop')}
                            loading={actionLoading === `${container.id}-stop`}
                          />
                        )}
                        <ActionButton
                          action="restart"
                          onClick={() => openConfirm(container, 'restart')}
                          loading={actionLoading === `${container.id}-restart`}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <ConfirmModal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, containerId: null, containerName: '', action: null })}
        onConfirm={handleAction}
        containerName={confirmModal.containerName}
        action={confirmModal.action}
        isLoading={actionLoading === `${confirmModal.containerId}-${confirmModal.action}`}
      />
    </div>
  );
}

export default DockerList;
