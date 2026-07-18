import { useState, useRef, useEffect, useCallback } from 'react';
import { FiChevronDown } from 'react-icons/fi';

const MENU_ITEM_HEIGHT = 38;

export default function ActionDropdown({ actions, align = 'right' }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  const containerRef = useRef(null);
  const menuRef = useRef(null);

  const recalcPosition = useCallback(() => {
    if (!open || !containerRef.current) return;

    const btn = containerRef.current.querySelector('button');
    if (!btn) return;

    const btnRect = btn.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const MARGIN = 8;
    const MENU_WIDTH = Math.min(220, vw - MARGIN * 2);
    const MENU_MAX_HEIGHT = Math.min(400, vh * 0.6);

    let left, top;

    if (align === 'right') {
      left = btnRect.right - MENU_WIDTH;
      if (left < MARGIN) left = MARGIN;
    } else {
      left = btnRect.left;
      if (left + MENU_WIDTH > vw - MARGIN) left = vw - MENU_WIDTH - MARGIN;
    }

    const spaceBelow = vh - btnRect.bottom - MARGIN;
    const spaceAbove = btnRect.top - MARGIN;
    if (spaceBelow < MENU_MAX_HEIGHT && spaceAbove >= MENU_MAX_HEIGHT) {
      top = btnRect.top - MARGIN;
    } else {
      top = btnRect.bottom + MARGIN;
    }

    if (top + MENU_MAX_HEIGHT > vh - MARGIN) {
      top = vh - MENU_MAX_HEIGHT - MARGIN;
    }
    if (top < MARGIN) top = MARGIN;

    setCoords({ left, top, width: MENU_WIDTH, maxHeight: MENU_MAX_HEIGHT });
  }, [open, align]);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => recalcPosition(), 0);
    const handleResize = () => recalcPosition();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
    };
  }, [open, recalcPosition]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const items = menuRef.current?.querySelectorAll('[role="menuitem"]:not([disabled])');
        if (!items || items.length === 0) return;
        const current = document.activeElement;
        const currentIdx = Array.from(items).indexOf(current);
        const nextIdx = e.key === 'ArrowDown'
          ? (currentIdx + 1) % items.length
          : (currentIdx - 1 + items.length) % items.length;
        items[nextIdx]?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      menuRef.current?.querySelector('[role="menuitem"]')?.focus();
    }, 80);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) setCoords(null);
  }, [open]);

  const handleAction = useCallback((onClick) => {
    setOpen(false);
    onClick();
  }, []);

  return (
    <div className="relative inline-flex" ref={containerRef}>
      <button
        onClick={() => setOpen(prev => { if (!prev) setTimeout(recalcPosition, 0); return !prev; })}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-border-light rounded-lg text-xs font-semibold text-text-body hover:bg-bg-light hover:border-primary/30 transition-all duration-200 select-none"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        Actions
        <FiChevronDown
          size={14}
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && coords && (
        <>
          <div
            className="fixed inset-0 z-40 md:hidden"
            onClick={() => setOpen(false)}
          />
          <div
            ref={menuRef}
            role="menu"
            style={{
              position: 'fixed',
              left: `${coords.left}px`,
              top: `${coords.top}px`,
              width: `${coords.width}px`,
              maxHeight: `${coords.maxHeight}px`,
            }}
            className="z-50 bg-white border border-border-light rounded-xl shadow-xl py-1 overflow-y-auto"
          >
            <div className="py-0.5">
              {actions.map((action, idx) => {
                if (action.hidden) return null;
                if (action.divider) {
                  return <div key={`divider-${idx}`} className="my-1 border-t border-border-light" />;
                }
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    role="menuitem"
                    onClick={() => handleAction(action.onClick)}
                    disabled={action.disabled}
                    className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm text-left transition-colors ${
                      action.danger
                        ? 'text-red-600 hover:bg-red-50'
                        : action.success
                        ? 'text-emerald-600 hover:bg-emerald-50'
                        : action.warning
                        ? 'text-orange-600 hover:bg-orange-50'
                        : 'text-text-body hover:bg-bg-light'
                    } ${action.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {Icon && <Icon size={15} className="flex-shrink-0" />}
                    <span className="truncate">{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
