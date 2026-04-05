import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Globe, Edit2, Trash2, X, Settings, LayoutGrid, Terminal, Command, Play, Link } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ICONS = {
  globe: Globe,
  settings: Settings,
  layout: LayoutGrid,
  terminal: Terminal,
  command: Command,
  play: Play,
  link: Link,
};

const ICON_OPTIONS = [
  { key: 'globe', icon: Globe, label: 'Globe' },
  { key: 'settings', icon: Settings, label: 'Settings' },
  { key: 'layout', icon: LayoutGrid, label: 'Layout' },
  { key: 'terminal', icon: Terminal, label: 'Terminal' },
  { key: 'command', icon: Command, label: 'Command' },
  { key: 'play', icon: Play, label: 'Play' },
  { key: 'link', icon: Link, label: 'Link' },
];

function ShortcutCard({ shortcut, onClick, onEdit, onDelete, index }) {
  const Icon = ICONS[shortcut.icon] || Globe;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ delay: index * 0.03 }}
      layout
      className="group relative"
    >
      <motion.div
        whileHover={{ scale: 1.08, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="glass-card p-3 cursor-pointer flex flex-col items-center gap-2"
      >
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-shadow"
          style={{
            background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))',
            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.25)'
          }}
        >
          <Icon className="w-4 h-4 text-white" />
        </div>
        <span className="text-[11px] font-medium text-center truncate w-full" style={{ color: 'var(--text-primary)' }}>
          {shortcut.name}
        </span>
      </motion.div>

      <div className="absolute -top-1 -right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => { e.stopPropagation(); onEdit(shortcut); }}
          className="w-5 h-5 rounded-md flex items-center justify-center shadow-lg"
          style={{ background: 'var(--accent-blue)', color: 'white' }}
        >
          <Edit2 className="w-2.5 h-2.5" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => { e.stopPropagation(); onDelete(shortcut.id); }}
          className="w-5 h-5 rounded-md flex items-center justify-center shadow-lg"
          style={{ background: 'var(--accent-red)', color: 'white' }}
        >
          <Trash2 className="w-2.5 h-2.5" />
        </motion.button>
      </div>
    </motion.div>
  );
}

function ShortcutModal({ isOpen, onClose, onSubmit, formData, setFormData, isEditing }) {
  if (!isOpen) return null;

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
          className="glass-card w-full max-w-sm max-h-[90vh] flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b shrink-0" style={{ borderColor: 'var(--border-color)' }}>
            <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
              {isEditing ? '编辑' : '添加'}快捷方式
            </h3>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-1.5 rounded-lg"
              style={{ color: 'var(--text-muted)' }}
            >
              <X className="w-4 h-4" />
            </motion.button>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="p-4 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  名称
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field w-full text-sm"
                  placeholder="例如：GitHub"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  图标
                </label>
                <div className="grid grid-cols-7 gap-1.5">
                  {ICON_OPTIONS.map(({ key, icon: Icon }) => (
                    <motion.button
                      key={key}
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setFormData({ ...formData, icon: key })}
                      className="p-2 rounded-lg border transition-all flex items-center justify-center"
                      style={{
                        background: formData.icon === key ? 'var(--accent-blue)' : 'var(--bg-tertiary)',
                        borderColor: formData.icon === key ? 'var(--accent-blue)' : 'var(--border-color)',
                        color: formData.icon === key ? 'white' : 'var(--text-muted)'
                      }}
                    >
                      <Icon className="w-4 h-4" />
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  类型
                </label>
                <div className="flex gap-2">
                  {['url', 'command'].map((type) => (
                    <motion.button
                      key={type}
                      type="button"
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFormData({ ...formData, type })}
                      className="flex-1 py-2 px-3 rounded-lg border text-xs font-medium transition-all"
                      style={{
                        background: formData.type === type ? 'var(--accent-blue)' : 'var(--bg-tertiary)',
                        borderColor: formData.type === type ? 'var(--accent-blue)' : 'var(--border-color)',
                        color: formData.type === type ? 'white' : 'var(--text-secondary)'
                      }}
                    >
                      {type === 'url' ? 'URL' : '命令'}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  {formData.type === 'url' ? 'URL 地址' : '命令内容'}
                </label>
                <input
                  type="text"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  className="input-field w-full text-sm"
                  placeholder={formData.type === 'url' ? 'https://...' : '输入命令...'}
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 p-4 border-t shrink-0" style={{ borderColor: 'var(--border-color)' }}>
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="btn-secondary flex-1 text-sm"
              >
                取消
              </motion.button>
              <motion.button
                type="submit"
                whileTap={{ scale: 0.98 }}
                className="btn-primary flex-1 text-sm"
              >
                {isEditing ? '更新' : '创建'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

export default function Shortcuts() {
  const [shortcuts, setShortcuts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    icon: 'globe',
    type: 'url',
    value: '',
  });

  useEffect(() => {
    fetchShortcuts();
  }, []);

  const fetchShortcuts = async () => {
    try {
      const response = await fetch('/api/shortcuts');
      const data = await response.json();
      setShortcuts(data);
    } catch (error) {
      console.error('Failed to fetch shortcuts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editingId ? `/api/shortcuts/${editingId}` : '/api/shortcuts';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        closeModal();
        fetchShortcuts();
      }
    } catch (error) {
      console.error('Failed to save shortcut:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('确定要删除这个快捷方式吗？')) return;

    try {
      const response = await fetch(`/api/shortcuts/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchShortcuts();
      }
    } catch (error) {
      console.error('Failed to delete shortcut:', error);
    }
  };

  const handleShortcutClick = (shortcut) => {
    if (shortcut.type === 'url') {
      window.open(shortcut.value, '_blank');
    } else {
      alert(`命令: ${shortcut.value}`);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', icon: 'globe', type: 'url', value: '' });
    setModalOpen(true);
  };

  const openEditModal = (shortcut) => {
    setEditingId(shortcut.id);
    setFormData({
      name: shortcut.name,
      icon: shortcut.icon,
      type: shortcut.type,
      value: shortcut.value,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setFormData({ name: '', icon: 'globe', type: 'url', value: '' });
  };

  if (loading) {
    return (
      <div className="glass-card p-4 flex items-center justify-center h-32">
        <div className="w-5 h-5 border-2 rounded-full animate-spin"
          style={{ borderColor: 'var(--border-color)', borderTopColor: 'var(--accent-blue)' }} />
      </div>
    );
  }

  return (
    <div className="glass-card p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg" style={{ background: 'rgba(59, 130, 246, 0.15)' }}>
            <LayoutGrid className="w-3.5 h-3.5" style={{ color: 'var(--accent-blue)' }} />
          </div>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>快捷方式</h2>
          <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
            {shortcuts.length}
          </span>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={openAddModal}
          className="btn-primary flex items-center gap-1 text-xs py-1.5 px-2.5"
        >
          <Plus className="w-3 h-3" />
          添加
        </motion.button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <AnimatePresence>
          {shortcuts.map((shortcut, index) => (
            <ShortcutCard
              key={shortcut.id}
              shortcut={shortcut}
              index={index}
              onClick={() => handleShortcutClick(shortcut)}
              onEdit={openEditModal}
              onDelete={handleDelete}
            />
          ))}
        </AnimatePresence>
      </div>

      {shortcuts.length === 0 && (
        <motion.div
          className="text-center py-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-10 h-10 mx-auto mb-2 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--bg-tertiary)' }}>
            <Link className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            点击"添加"创建快捷方式
          </p>
        </motion.div>
      )}

      <ShortcutModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        isEditing={!!editingId}
      />
    </div>
  );
}