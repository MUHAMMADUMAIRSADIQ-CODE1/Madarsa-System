import { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  FiCheckCircle, FiXCircle, FiClock, FiSun, FiChevronDown,
} from 'react-icons/fi';

const OPTIONS = [
  { value: 'present', label: 'Present', icon: FiCheckCircle, color: 'text-green-600 bg-green-50 border-green-200 hover:bg-green-100' },
  { value: 'absent', label: 'Absent', icon: FiXCircle, color: 'text-red-600 bg-red-50 border-red-200 hover:bg-red-100' },
  { value: 'late', label: 'Late', icon: FiClock, color: 'text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100' },
  { value: 'excused', label: 'Leave', icon: FiSun, color: 'text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100' },
];

export default function StatusPopover({ value, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({});
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const selected = OPTIONS.find(o => o.value === value);
  const chipColor = selected?.color || 'text-gray-600 bg-gray-50 border-gray-200';

  const close = useCallback(() => setOpen(false), []);

  // ── Position the menu after mount ──
  useLayoutEffect(() => {
    if (!open || !triggerRef.current || !menuRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const menuEl = menuRef.current;
    const menuHeight = menuEl.offsetHeight;
    const menuWidth = menuEl.offsetWidth;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Default: below, left-aligned
    let top = triggerRect.bottom + 4;
    let left = triggerRect.left;

    // Flip up if not enough space below
    if (top + menuHeight > vh) {
      top = triggerRect.top - menuHeight - 4;
    }

    // Keep within viewport horizontally
    if (left + menuWidth > vw) {
      left = vw - menuWidth - 8;
    }
    if (left < 8) {
      left = 8;
    }

    setMenuStyle({ top, left });
  }, [open]);

  // ── Escape key ──
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, close]);

  // ── Reposition on scroll / resize ──
  useEffect(() => {
    if (!open) return;
    const reposition = () => {
      if (!triggerRef.current || !menuRef.current) return;
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const menuHeight = menuRef.current.offsetHeight;
      const menuWidth = menuRef.current.offsetWidth;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      let top = triggerRect.bottom + 4;
      let left = triggerRect.left;
      if (top + menuHeight > vh) {
        top = triggerRect.top - menuHeight - 4;
      }
      if (left + menuWidth > vw) {
        left = vw - menuWidth - 8;
      }
      if (left < 8) left = 8;
      setMenuStyle({ top, left });
    };
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [open]);

  return (
    <>
      {/* ── Trigger button ── */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => { if (!disabled) setOpen(prev => !prev); }}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all select-none ${
          open ? 'ring-2 ring-primary/40 border-primary' : ''
        } ${chipColor} ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:shadow-sm'}`}
      >
        {selected ? (
          <>
            <selected.icon className="w-3.5 h-3.5" />
            {selected.label}
            <FiChevronDown className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
          </>
        ) : (
          <>
            <span className="text-text-light">Select</span>
            <FiChevronDown className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      {/* ── Floating popup via portal ── */}
      {open && createPortal(
        <>
          {/* Invisible backdrop for click-outside */}
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
          <div className="fixed inset-0 z-[9999]" onClick={close} />
          {/* Popup menu */}
          <div
            ref={menuRef}
            role="listbox"
            aria-label="Attendance status"
            className="fixed z-[10000] bg-white rounded-xl border border-border-light shadow-2xl p-1.5 animate-pop-down"
            style={{ top: menuStyle.top, left: menuStyle.left, minWidth: 140 }}
          >
            {OPTIONS.map(opt => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={value === opt.value}
                  onClick={() => { onChange(opt.value); close(); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    value === opt.value
                      ? `${opt.color} ring-1 ring-inset ring-current/30`
                      : 'text-text-body hover:bg-bg-light'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1 text-left">{opt.label}</span>
                  {value === opt.value && (
                    <FiCheckCircle className="w-3.5 h-3.5 opacity-60 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </>,
        document.body,
      )}
    </>
  );
}
