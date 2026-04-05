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
  Trash2,
  X,
} from 'lucide-react';
import { AnimatePresence, m } from 'framer-motion';

function StatusBadge({ state }) {
  const getStatusConfig = () => {
    switch (state) {
      case 'running':
        return { color: 'var(--accent-green)', bg: 'rgba(138, 214, 142, 0.14)', label: '运行中' };
      case 'exited':
        return { color: 'var(--accent-red)', bg: 'rgba(240, 122, 99, 0.14)', label: '已停止' };
      case 'paused':
        return { color: 'var(--accent-yellow)', bg: 'rgba(216, 168, 95, 0.14)', label: '已暂停' };
      default:
        return { color: 'var(--text-muted)', bg: 'rgba(255, 255, 255, 0.05)', label: state || '未知' };
    }
  };

  const config = getStatusConfig();

  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 mono-type text-[10px] uppercase tracking-[0.18em]"
      style={{ background: config.bg, color: config.color }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{
          background: config.color,
          boxShadow: state === 'running' ? `0 0 10px ${config.color}` : 'none',
        }}
      />
      {config.label}
    </span>
  );
}

function ConfirmModal({ isOpen, onClose, onConfirm, containerName, action, isLoading }) {
  if (!isOpen) return null;

  const actionConfig = {
    start: { label: '启动', color: 'var(--accent-green)', icon: Play },
    stop: { label: '停止', color: 'var(--accent-red)', icon: Square },
    restart: { label: '重启', color: 'var(--accent-cyan)', icon: RotateCcw },
    remove: { label: '删除', color: 'var(--accent-red)', icon: Trash2 },
  };

  const config = actionConfig[action] || actionConfig.stop;
  const Icon = config.icon;
  const isDanger = action === 'remove' || action === 'stop';

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
                <h3 className="surface-title text-[1.6rem]">确认{config.label}</h3>
                <p className="mt-2 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>
                  你将对容器 <strong style={{ color: 'var(--text-primary)' }}>{containerName}</strong> 执行
                  <span style={{ color: config.color }}> {config.label}</span> 操作。
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 p-5">
            <m.button whileTap={{ scale: 0.98 }} onClick={onClose} disabled={isLoading} className="btn-secondary flex-1">
              取消
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
              确认
            </m.button>
          </div>
        </m.div>
      </m.div>
    </AnimatePresence>,
    document.body
  );
}

function ActionButton({ action, onClick, loading, disabled }) {
  const config = {
    start: { icon: Play, color: 'var(--accent-green)', title: '启动' },
    stop: { icon: Square, color: 'var(--accent-red)', title: '停止' },
    restart: { icon: RotateCcw, color: 'var(--accent-cyan)', title: '重启' },
    remove: { icon: Trash2, color: 'var(--accent-red)', title: '删除' },
  }[action];

  const Icon = config.icon;

  return (
    <m.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border transition-all disabled:opacity-50"
      style={{
        borderColor: 'var(--border-color)',
        background: 'rgba(255, 255, 255, 0.04)',
        color: config.color,
      }}
      title={config.title}
      type="button"
    >
      {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Icon className="h-3.5 w-3.5" />}
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

  const stats = {
    total: containers.length,
    running: containers.filter(container => container.state === 'running').length,
    stopped: containers.filter(container => container.state === 'exited').length,
    paused: containers.filter(container => container.state === 'paused').length,
  };

  if (loading) {
    return (
      <div className="glass-card flex h-40 items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin" style={{ color: 'var(--accent-cyan)' }} />
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="border-b p-4 sm:p-5 xl:p-6" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <span className="section-kicker">CONTAINERS</span>
            <div className="mt-3 flex items-center gap-3">
              <div className="signal-icon" style={{ color: 'var(--accent-cyan)' }}>
                <Container className="h-4 w-4" />
              </div>
              <h2 className="surface-title">Docker 舱段</h2>
            </div>
          </div>

          <m.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={fetchContainers}
            className="status-pill self-start"
            type="button"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>刷新容器</span>
          </m.button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="status-pill">
            <strong>{stats.total}</strong>
            <span>总数</span>
          </span>
          <span className="status-pill" style={{ color: 'var(--accent-green)' }}>
            <strong>{stats.running}</strong>
            <span>运行</span>
          </span>
          <span className="status-pill" style={{ color: 'var(--accent-red)' }}>
            <strong>{stats.stopped}</strong>
            <span>停止</span>
          </span>
          <span className="status-pill" style={{ color: 'var(--accent-yellow)' }}>
            <strong>{stats.paused}</strong>
            <span>暂停</span>
          </span>
        </div>
      </div>

      {containers.length === 0 ? (
        <div className="p-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border" style={{ borderColor: 'var(--border-color)' }}>
            <Container className="h-6 w-6" style={{ color: 'var(--text-muted)' }} />
          </div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            当前没有可显示的容器。
          </p>
        </div>
      ) : (
        <>
          <div className="mt-4 grid gap-3 px-3 pb-3 md:hidden">
            {containers.map(container => (
              <div key={container.id} className="glass-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {container.composeProject && (
                        <Layers className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--accent-cyan)' }} />
                      )}
                      <span className="truncate text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {container.composeProject
                          ? `${container.composeProject}/${container.composeService || container.name}`
                          : container.name}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] mono-type" style={{ color: 'var(--text-muted)' }}>
                      {container.image || '-'}
                    </p>
                  </div>
                  <StatusBadge state={container.state} />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="mobile-stat-card">
                    <span className="section-kicker">CPU</span>
                    <strong style={{ color: 'var(--accent-cyan)' }}>
                      {container.stats?.cpuPercent !== null && container.stats?.cpuPercent !== undefined
                        ? `${container.stats.cpuPercent.toFixed(1)}%`
                        : '-'}
                    </strong>
                  </div>
                  <div className="mobile-stat-card">
                    <span className="section-kicker">内存</span>
                    <strong style={{ color: 'var(--accent-yellow)' }}>{formatBytes(container.stats?.memoryUsage)}</strong>
                  </div>
                  <div className="mobile-stat-card col-span-2">
                    <span className="section-kicker">端口</span>
                    <strong className="break-all text-left" style={{ color: 'var(--text-primary)' }}>
                      {container.ports || '-'}
                    </strong>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end gap-2">
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
                  <ActionButton
                    action="remove"
                    onClick={() => openConfirm(container, 'remove')}
                    loading={actionLoading === `${container.id}-remove`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto px-3 pb-3 sm:px-4 sm:pb-4 xl:px-6 xl:pb-6 md:block">
            <table className="mt-4 w-full min-w-[920px] overflow-hidden rounded-[24px]">
            <thead>
              <tr
                className="mono-type text-[10px] uppercase tracking-[0.18em]"
                style={{ color: 'var(--text-muted)' }}
              >
                <th className="px-3 py-3 text-left font-medium">状态</th>
                <th className="px-3 py-3 text-left font-medium">名称</th>
                <th className="hidden px-3 py-3 text-left font-medium md:table-cell">镜像</th>
                <th className="px-3 py-3 text-left font-medium">端口</th>
                <th className="px-3 py-3 text-right font-medium">CPU</th>
                <th className="px-3 py-3 text-right font-medium">内存</th>
                <th className="px-3 py-3 text-center font-medium">操作</th>
              </tr>
            </thead>
              <tbody className="divide-y" style={{ divideColor: 'var(--border-color)' }}>
                {containers.map(container => (
                  <tr key={container.id} className="transition-colors duration-200">
                    <td className="px-3 py-4 align-top">
                      <StatusBadge state={container.state} />
                    </td>
                    <td className="px-3 py-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          {container.composeProject && (
                            <Layers className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--accent-cyan)' }} />
                          )}
                          <span className="truncate text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {container.composeProject
                              ? `${container.composeProject}/${container.composeService || container.name}`
                              : container.name}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] mono-type" style={{ color: 'var(--text-muted)' }}>
                          {container.id}
                        </p>
                      </div>
                    </td>
                    <td className="hidden px-3 py-4 md:table-cell">
                      <span className="text-xs leading-6" style={{ color: 'var(--text-secondary)' }}>
                        {container.image || '-'}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <span className="text-xs mono-type" style={{ color: 'var(--text-secondary)' }}>
                        {container.ports || '-'}
                      </span>
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
                        <ActionButton
                          action="remove"
                          onClick={() => openConfirm(container, 'remove')}
                          loading={actionLoading === `${container.id}-remove`}
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
