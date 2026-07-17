import { useState, useRef, useEffect } from 'react';
import { FiChevronDown } from 'react-icons/fi';

export default function ActionDropdown({ actions, align = 'right' }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleAction = (onClick) => {
    setOpen(false);
    onClick();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-border-light rounded-lg text-xs font-semibold text-text-body hover:bg-bg-light hover:border-primary/30 transition-all duration-200"
      >
        Actions
        <FiChevronDown
          size={14}
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          className={`absolute top-full mt-1 z-50 min-w-[160px] bg-white border border-border-light rounded-xl shadow-xl py-1 animate-fade-in ${
            align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left'
          }`}
        >
          <div className="py-0.5">
            {actions.map((action, idx) => {
              if (action.divider) {
                return <div key={`divider-${idx}`} className="my-1 border-t border-border-light" />;
              }
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={() => handleAction(action.onClick)}
                  disabled={action.disabled}
                  className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-colors ${
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
                  <span>{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
