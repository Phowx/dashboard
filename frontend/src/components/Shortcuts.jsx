import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Command,
  Edit2,
  Globe,
  GripVertical,
  LayoutGrid,
  Link,
  Play,
  Plus,
  Settings,
  Terminal,
  Trash2,
  X,
} from 'lucide-react';
import { AnimatePresence, Reorder, m, useDragControls } from 'framer-motion';

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

function ShortcutCard({ shortcut, onClick, onEdit, onDelete, index, onDragStart, onDragEnd }) {
  const Icon = ICONS[shortcut.icon] || Globe;
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={shortcut}
      dragListener={false}
      dragControls={dragControls}
      onDragStart={() => onDragStart(shortcut.id)}
      onDragEnd={onDragEnd}
      initial={{ opacity: 0, scale: 0.9, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 12 }}
      transition={{ delay: index * 0.04 }}
      layout
      whileDrag={{ scale: 1.02, zIndex: 12 }}
      className="shortcut-sort-item group relative list-none"
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
            <div className="shortcut-card-copy min-w-0 flex-1">
              <p className="shortcut-name">{shortcut.name}</p>
              <p className="shortcut-value" title={getShortcutPreview(shortcut)}>{getShortcutPreview(shortcut)}</p>
            </div>
          </div>
        </div>
      </m.button>

      <div className="shortcut-card-actions">
        <div className="shortcut-card-secondary-actions">
          <m.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={event => {
              event.stopPropagation();
              onEdit(shortcut);
            }}
            className="shortcut-card-action-button"
            type="button"
            aria-label={`Edit ${shortcut.name}`}
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
            className="shortcut-card-action-button shortcut-card-action-button-danger"
            type="button"
            aria-label={`Delete ${shortcut.name}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </m.button>
        </div>
        <m.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          onPointerDown={event => {
            event.preventDefault();
            event.stopPropagation();
            dragControls.start(event);
          }}
          onClick={event => event.stopPropagation()}
          className="shortcut-drag-handle"
          type="button"
          aria-label="Reorder shortcut"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </m.button>
      </div>
    </Reorder.Item>
  );
}

function MobileShortcutTile({
  shortcut,
  onOpen,
  onDelete,
  index,
  onDragStart,
  onDragEnd,
  editMode,
}) {
  const Icon = ICONS[shortcut.icon] || Globe;
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={shortcut}
      dragListener={false}
      dragControls={dragControls}
      onDragStart={() => onDragStart(shortcut.id)}
      onDragEnd={onDragEnd}
      initial={{ opacity: 0, scale: 0.92, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 10 }}
      transition={{ delay: index * 0.03 }}
      layout
      whileDrag={{ scale: 1.03, zIndex: 14 }}
      className="shortcut-mobile-item relative list-none"
    >
      <m.button
        whileTap={{ scale: 0.97 }}
        onClick={() => onOpen(shortcut)}
        className={`glass-card shortcut-mobile-tile w-full text-center ${editMode ? 'shortcut-mobile-tile-editing' : ''}`}
        type="button"
      >
        <div className="shortcut-icon-wrap shortcut-mobile-icon">
          <Icon className="h-4 w-4 text-white" />
        </div>
        <p className="shortcut-mobile-label">{shortcut.name}</p>
      </m.button>

      {editMode ? (
        <>
          <m.button
            whileTap={{ scale: 0.94 }}
            onClick={event => {
              event.stopPropagation();
              onDelete(shortcut.id);
            }}
            className="shortcut-mobile-badge shortcut-mobile-delete"
            type="button"
            aria-label={`Delete ${shortcut.name}`}
          >
            <Trash2 className="h-3 w-3" />
          </m.button>

          <m.button
            whileTap={{ scale: 0.94 }}
            onPointerDown={event => {
              event.preventDefault();
              event.stopPropagation();
              dragControls.start(event);
            }}
            onClick={event => event.stopPropagation()}
            className="shortcut-mobile-badge shortcut-mobile-drag"
            type="button"
            aria-label={`Reorder ${shortcut.name}`}
          >
            <GripVertical className="h-3 w-3" />
          </m.button>
        </>
      ) : null}
    </Reorder.Item>
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
  const [draggingId, setDraggingId] = useState(null);
  const [mobileEditMode, setMobileEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    icon: 'globe',
    type: 'url',
    value: '',
  });
  const shortcutsRef = useRef([]);
  const lastSavedOrderRef = useRef('');

  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  useEffect(() => {
    fetchShortcuts();
  }, []);

  const fetchShortcuts = async () => {
    try {
      const response = await fetch('/api/shortcuts');
      const data = await response.json();
      const orderedShortcuts = [...data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      lastSavedOrderRef.current = orderedShortcuts.map(shortcut => shortcut.id).join('|');
      setShortcuts(orderedShortcuts);
    } catch (error) {
      console.error('Failed to fetch shortcuts:', error);
    } finally {
      setLoading(false);
    }
  };

  const persistShortcutOrder = async (nextShortcuts) => {
    const ids = nextShortcuts.map(shortcut => shortcut.id);
    const signature = ids.join('|');

    if (!ids.length || signature === lastSavedOrderRef.current) {
      return;
    }

    try {
      const response = await fetch('/api/shortcuts/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });

      if (!response.ok) {
        throw new Error('Failed to reorder shortcuts');
      }

      const data = await response.json();
      const orderedShortcuts = [...data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      lastSavedOrderRef.current = orderedShortcuts.map(shortcut => shortcut.id).join('|');
      setShortcuts(orderedShortcuts);
    } catch (error) {
      console.error('Failed to reorder shortcuts:', error);
      fetchShortcuts();
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

  const handleReorderEnd = () => {
    setDraggingId(null);
    persistShortcutOrder(shortcutsRef.current);
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
    <div className="glass-card flex h-full min-h-0 flex-col p-4 sm:p-5 xl:p-6">
      <div className="shortcut-panel-header">
        <span className="section-kicker">LAUNCHPAD</span>
        <div className="shortcut-panel-controls">
          <m.button
            whileTap={{ scale: 0.96 }}
            onClick={() => setMobileEditMode(previous => !previous)}
            className={`shortcut-edit-toggle md:hidden ${mobileEditMode ? 'shortcut-edit-toggle-active' : ''}`}
            type="button"
            aria-label={mobileEditMode ? 'Exit edit mode' : 'Enter edit mode'}
          >
            <Edit2 className="h-3.5 w-3.5" />
          </m.button>

          <m.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={openAddModal}
            className="shortcut-add-button"
            type="button"
            aria-label="Add link"
          >
            <Plus className="h-3.5 w-3.5" />
          </m.button>
        </div>
      </div>

      <div className="shortcut-column flex min-h-0 flex-1 flex-col">
        {shortcuts.length > 0 ? (
          <>
            <Reorder.Group
              axis="y"
              values={shortcuts}
              onReorder={setShortcuts}
              className="shortcut-reorder-list hidden md:grid"
            >
              <AnimatePresence>
                {shortcuts.map((shortcut, index) => (
                  <ShortcutCard
                    key={`desktop-${shortcut.id}`}
                    shortcut={shortcut}
                    index={index}
                    onClick={() => {
                      if (draggingId) {
                        return;
                      }
                      handleShortcutClick(shortcut);
                    }}
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                    onDragStart={setDraggingId}
                    onDragEnd={handleReorderEnd}
                  />
                ))}
              </AnimatePresence>
            </Reorder.Group>

            <Reorder.Group
              axis="y"
              values={shortcuts}
              onReorder={setShortcuts}
              className="shortcut-mobile-grid md:hidden"
            >
              <AnimatePresence>
                {shortcuts.map((shortcut, index) => (
                  <MobileShortcutTile
                    key={`mobile-${shortcut.id}`}
                    shortcut={shortcut}
                    index={index}
                    editMode={mobileEditMode}
                    onOpen={item => {
                      if (draggingId) {
                        return;
                      }

                      if (mobileEditMode) {
                        openEditModal(item);
                        return;
                      }

                      handleShortcutClick(item);
                    }}
                    onDelete={handleDelete}
                    onDragStart={setDraggingId}
                    onDragEnd={handleReorderEnd}
                  />
                ))}
              </AnimatePresence>
            </Reorder.Group>
          </>
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
