import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Container, Play, Square, RotateCcw, Trash2, RefreshCw, AlertTriangle, X, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function StatusBadge({ state }) {
  const getStatusConfig = () => {
    switch (state) {
      case 'running':
        return { color: 'var(--accent-green)', bg: 'rgba(34, 197, 94, 0.15)', label: '运行中' };
      case 'exited':
        return { color: 'var(--accent-red)', bg: 'rgba(239, 68, 68, 0.15)', label: '已停止' };
      case 'paused':
        return { color: 'var(--accent-yellow)', bg: 'rgba(234, 179, 8, 0.15)', label: '已暂停' };
      default:
        return { color: 'var(--text-muted)', bg: 'var(--bg-tertiary)', label: state || '未知' };
    }
  };

  const config = getStatusConfig();

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
      style={{ background: config.bg, color: config.color }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{
          background: config.color,
          boxShadow: state === 'running' ? `0 0 4px ${config.color}` : 'none'
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
    restart: { label: '重启', color: 'var(--accent-blue)', icon: RotateCcw },
    remove: { label: '删除', color: 'var(--accent-red)', icon: Trash2 },
  };

  const config = actionConfig[action] || actionConfig.stop;
  const Icon = config.icon;
  const isDanger = action === 'remove' || action === 'stop';

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="glass-card w-full max-w-sm overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-5 text-center">
            <div
              className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ background: isDanger ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)' }}
            >
              {isDanger ? (
                <AlertTriangle className="w-6 h-6" style={{ color: config.color }} />
              ) : (
                <Icon className="w-6 h-6" style={{ color: config.color }} />
              )}
            </div>
            <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              确认{config.label}
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              确定要<span style={{ color: config.color }}>{config.label}</span>容器
            </p>
            <p className="text-sm font-medium mt-1 truncate" style={{ color: 'var(--text-primary)' }}>
              {containerName}
            </p>
          </div>
          <div className="flex gap-3 p-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              disabled={isLoading}
              className="btn-secondary flex-1"
            >
              取消
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 py-2 px-4 rounded-lg font-medium text-white flex items-center justify-center gap-2 transition-all"
              style={{
                background: isDanger
                  ? 'linear-gradient(135deg, var(--accent-red), #dc2626)'
                  : 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))',
                opacity: isLoading ? 0.7 : 1
              }}
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Icon className="w-4 h-4" />
              )}
              确认
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

function ActionButton({ action, onClick, loading, disabled }) {
  const config = {
    start: { icon: Play, color: 'var(--accent-green)', title: '启动' },
    stop: { icon: Square, color: 'var(--accent-red)', title: '停止' },
    restart: { icon: RotateCcw, color: 'var(--accent-blue)', title: '重启' },
    remove: { icon: Trash2, color: 'var(--accent-red)', title: '删除' },
  }[action];

  const Icon = config.icon;

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      disabled={disabled}
      className="p-1.5 rounded-lg transition-colors disabled:opacity-50"
      style={{ color: config.color }}
      title={config.title}
    >
      {loading ? (
        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Icon className="w-3.5 h-3.5" />
      )}
    </motion.button>
  );
}

function DockerList() {
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ open: false, containerId: null, containerName: '', action: null });

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
      action
    });
  };

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '-';
    const mb = bytes / (1024 * 1024);
    const gb = mb / 1024;
    if (gb >= 1) return `${gb.toFixed(1)} G`;
    return `${mb.toFixed(0)} M`;
  };

  const stats = {
    total: containers.length,
    running: containers.filter(c => c.state === 'running').length,
    stopped: containers.filter(c => c.state === 'exited').length,
    paused: containers.filter(c => c.state === 'paused').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <RefreshCw className="w-6 h-6 animate-spin" style={{ color: 'var(--accent-blue)' }} />
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-2">
          <Container className="w-4 h-4" style={{ color: 'var(--accent-cyan)' }} />
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Docker 容器</h2>
          <div className="flex items-center gap-2 ml-3">
            <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
              {stats.total} 总
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(34, 197, 94, 0.15)', color: 'var(--accent-green)' }}>
              {stats.running} 运行
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-red)' }}>
              {stats.stopped} 停止
            </span>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchContainers}
          className="p-1.5 rounded-lg transition-colors"
          style={{ color: 'var(--text-muted)', background: 'var(--bg-tertiary)' }}
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </motion.button>
      </div>

      {containers.length === 0 ? (
        <div className="p-8 text-center">
          <Container className="w-10 h-10 mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>暂无容器</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="text-[10px] uppercase" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                <th className="text-left py-2 px-3 font-medium w-20">状态</th>
                <th className="text-left py-2 px-3 font-medium">名称</th>
                <th className="text-left py-2 px-3 font-medium hidden md:table-cell">镜像</th>
                <th className="text-left py-2 px-3 font-medium w-32">端口</th>
                <th className="text-right py-2 px-3 font-medium w-16">CPU</th>
                <th className="text-right py-2 px-3 font-medium w-16">内存</th>
                <th className="text-center py-2 px-3 font-medium w-24">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ divideColor: 'var(--border-color)' }}>
              {containers.map((container) => (
                <tr
                  key={container.id}
                  className="hover:bg-opacity-50 transition-colors"
                  style={{ background: 'var(--bg-secondary)' }}
                >
                  <td className="py-2 px-3">
                    <StatusBadge state={container.state} />
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {container.composeProject && (
                        <Layers className="w-3 h-3 shrink-0" style={{ color: 'var(--accent-cyan)' }} />
                      )}
                      <span className="text-xs font-medium break-all" style={{ color: 'var(--text-primary)' }}>
                        {container.composeProject 
                          ? `${container.composeProject}/${container.composeService || container.name}`
                          : container.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-2 px-3 hidden md:table-cell">
                    <span className="text-xs break-all" style={{ color: 'var(--text-secondary)' }}>
                      {container.image || '-'}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {container.ports || '-'}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <span className="text-xs font-medium" style={{ color: 'var(--accent-blue)' }}>
                      {container.stats?.cpuPercent !== null && container.stats?.cpuPercent !== undefined ? `${container.stats.cpuPercent.toFixed(1)}%` : '-'}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <span className="text-xs font-medium" style={{ color: 'var(--accent-green)' }}>
                      {formatBytes(container.stats?.memoryUsage)}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex items-center justify-center gap-1">
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