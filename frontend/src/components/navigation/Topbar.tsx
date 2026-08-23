import React, { useEffect, useRef } from 'react';
import { IconSearch, IconUserPlus, IconBell } from '@tabler/icons-react';
import { useUIStore } from '@/stores/useUIStore';

export const Topbar: React.FC = () => {
  const { openModal, togglePalette, isNotifOpen, toggleNotif, closeAllPopovers } = useUIStore();
  const notifRef = useRef<HTMLDivElement>(null);

  // Global Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        togglePalette();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePalette]);

  // Click outside to close notification panel
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (isNotifOpen && notifRef.current && !notifRef.current.contains(e.target as Node)) {
        closeAllPopovers();
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [isNotifOpen, closeAllPopovers]);

  return (
    <header className="topbar">
      {/* Quick find / Command palette trigger */}
      <button
        type="button"
        className="search-trigger"
        onClick={() => togglePalette(true)}
        aria-haspopup="dialog"
      >
        <IconSearch size={16} aria-hidden="true" />
        <span>Quick find</span>
        <kbd>⌘K</kbd>
      </button>

      <div className="topbar-right" ref={notifRef}>
        {/* Invite roommate action */}
        <button
          type="button"
          className="btn-outline"
          onClick={() => openModal('invite')}
        >
          <IconUserPlus size={16} aria-hidden="true" />
          <span>Invite roommate</span>
        </button>

        {/* Notifications bell */}
        <button
          type="button"
          className="bell-btn"
          aria-haspopup="true"
          aria-expanded={isNotifOpen}
          aria-label="Notifications, 3 unread"
          onClick={(e) => {
            e.stopPropagation();
            toggleNotif();
          }}
        >
          <IconBell size={20} aria-hidden="true" />
          <span className="dot" aria-hidden="true" />
        </button>

        {/* Notification Popover Panel */}
        {isNotifOpen && (
          <div className="notif-panel" role="menu">
            <div className="notif-item">
              <div className="t">Bob paid you 300.00 MAD</div>
              <div className="m">Settled via cash · 2h ago</div>
            </div>
            <div className="notif-item">
              <div className="t">Wifi bill added</div>
              <div className="m">Alice logged an expense · yesterday</div>
            </div>
            <div className="notif-item">
              <div className="t">Eggs running low</div>
              <div className="m">2 left in pantry · 2 days ago</div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
