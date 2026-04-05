import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Command,
  Edit2,
  Globe,
  LayoutGrid,
  Link,
  Play,
  Plus,
  Settings,
  Terminal,
  Trash2,
  X,
} from 'lucide-react';
import { AnimatePresence, m } from 'framer-motion';

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

function getShortcutPreview(shortcut) {
  if (shortcut.type !== 'url') {
    return shortcut.value;
  }

  return shortcut.value
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '');
}

function ShortcutCard({ shortcut, onClick, onEdit, onDelete, index }) {
  const Icon = ICONS[shortcut.icon] || Globe;

  return (
    <m.div
      initial={{ opacity: 0, scale: 0.9, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 12 }}
      transition={{ delay: index * 0.04 }}
      layout
      className="group relative"
    >
      <m.button
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="glass-card shortcut-card w-full text-left"
        type="button"
      >
        <div className="shortcut-card-top">
          <div className="flex min-w-0 items-center gap-3">
            <div className="shortcut-icon-wrap">
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="shortcut-name">{shortcut.name}</p>
              <p className="shortcut-value">{getShortcutPreview(shortcut)}</p>
            </div>
          </div>
          <span className="status-pill">{shortcut.type === 'url' ? 'URL' : 'CMD'}</span>
        </div>
      </m.button>

      <div className="absolute right-3 top-3 flex gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <m.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          onClick={event => {
            event.stopPropagation();
            onEdit(shortcut);
          }}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border"
          style={{
            borderColor: 'var(--border-color)',
            background: 'rgba(255, 255, 255, 0.06)',
            color: 'var(--text-primary)',
          }}
          type="button"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </m.button>
        <m.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          onClick={event => {
            event.stopPropagation();
            onDelete(shortcut.id);
          }}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border"
          style={{
            borderColor: 'rgba(240, 122, 99, 0.28)',
            background: 'rgba(240, 122, 99, 0.08)',
            color: 'var(--accent-red)',
          }}
          type="button"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </m.button>
      </div>
    </m.div>
  );
}

function ShortcutModal({ isOpen, onClose, onSubmit, formData, setFormData, isEditing }) {
  if (!isOpen) return null;

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
          initial={{ opacity: 0, scale: 0.94, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 18 }}
          transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          className="glass-card flex max-h-[90vh] w-full max-w-md flex-col"
          onClick={event => event.stopPropagation()}
        >
          <div className="border-b p-5" style={{ borderColor: 'var(--border-color)' }}>
            <div className="mb-4 flex items-center justify-between">
              <span className="section-kicker">SHORTCUT EDITOR</span>
              <button type="button" onClick={onClose} className="status-pill">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <h3 className="surface-title text-[1.6rem]">{isEditing ? 'Edit Shortcut' : 'Add Shortcut'}</h3>
          </div>

          <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              <div>
                <label className="section-kicker mb-2 block">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={event => setFormData({ ...formData, name: event.target.value })}
                  className="input-field w-full text-sm"
                  placeholder="Portainer"
                  required
                />
              </div>

              <div>
                <label className="section-kicker mb-2 block">Icon</label>
                <div className="grid grid-cols-7 gap-2">
                  {ICON_OPTIONS.map(({ key, icon: Icon }) => (
                    <m.button
                      key={key}
                      type="button"
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => setFormData({ ...formData, icon: key })}
                      className="flex items-center justify-center rounded-2xl border p-2.5 transition-all"
                      style={{
                        background: formData.icon === key ? 'rgba(77, 180, 200, 0.14)' : 'rgba(255, 255, 255, 0.03)',
                        borderColor: formData.icon === key ? 'rgba(77, 180, 200, 0.4)' : 'var(--border-color)',
                        color: formData.icon === key ? 'var(--accent-cyan)' : 'var(--text-muted)',
                      }}
                    >
                      <Icon className="h-4 w-4" />
                    </m.button>
                  ))}
                </div>
              </div>

              <div>
                <label className="section-kicker mb-2 block">Type</label>
                <div className="flex gap-2">
                  {['url', 'command'].map(type => (
                    <m.button
                      key={type}
                      type="button"
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFormData({ ...formData, type })}
                      className="flex-1 rounded-2xl border px-3 py-2.5 text-xs font-medium transition-all"
                      style={{
                        background: formData.type === type ? 'rgba(216, 168, 95, 0.14)' : 'rgba(255, 255, 255, 0.03)',
                        borderColor: formData.type === type ? 'rgba(216, 168, 95, 0.36)' : 'var(--border-color)',
                        color: formData.type === type ? 'var(--accent-yellow)' : 'var(--text-secondary)',
                      }}
                    >
                      {type === 'url' ? 'URL' : 'Command'}
                    </m.button>
                  ))}
                </div>
              </div>

              <div>
                <label className="section-kicker mb-2 block">
                  {formData.type === 'url' ? 'URL' : 'Command'}
                </label>
                <input
                  type="text"
                  value={formData.value}
                  onChange={event => setFormData({ ...formData, value: event.target.value })}
                  className="input-field w-full text-sm"
                  placeholder={formData.type === 'url' ? 'https://...' : 'Enter command...'}
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 border-t p-5" style={{ borderColor: 'var(--border-color)' }}>
              <m.button whileTap={{ scale: 0.98 }} type="button" onClick={onClose} className="btn-secondary flex-1">
                Cancel
              </m.button>
              <m.button whileTap={{ scale: 0.98 }} type="submit" className="btn-primary flex-1">
                {isEditing ? 'Update' : 'Create'}
              </m.button>
            </div>
          </form>
        </m.div>
      </m.div>
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

  const handleSubmit = async event => {
    event.preventDefault();

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

  const handleDelete = async id => {
    if (!confirm('Delete this shortcut?')) return;

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

  const handleShortcutClick = shortcut => {
    if (shortcut.type === 'url') {
      window.open(shortcut.value, '_blank');
    } else {
      alert(`Command: ${shortcut.value}`);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', icon: 'globe', type: 'url', value: '' });
    setModalOpen(true);
  };

  const openEditModal = shortcut => {
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
      <div className="glass-card flex h-40 items-center justify-center">
        <div
          className="h-6 w-6 animate-spin rounded-full border-2"
          style={{ borderColor: 'var(--border-color)', borderTopColor: 'var(--accent-cyan)' }}
        />
      </div>
    );
  }

  return (
    <div className="glass-card flex h-full flex-col p-4 sm:p-5 xl:p-6">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="section-kicker">LAUNCHPAD</span>
        </div>

        <m.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={openAddModal} className="btn-primary self-start" type="button">
          <Plus className="h-3.5 w-3.5" />
          Add Link
        </m.button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <span className="status-pill">
          <strong>{shortcuts.length}</strong>
          <span>Saved</span>
        </span>
      </div>

      <div className="shortcut-column flex flex-1 flex-col">
        {shortcuts.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 content-start">
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
        ) : (
          <m.div className="flex flex-1 flex-col items-center justify-center py-10 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <Link className="h-6 w-6" style={{ color: 'var(--text-muted)' }} />
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              No shortcuts yet
            </p>
          </m.div>
        )}
      </div>

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
