import { Home, Receipt, PieChart, Users, LogOut } from 'lucide-react';
import { cx } from './ui.jsx';

const TABS = [
  { id: 'expenses', label: 'Expenses', icon: Receipt },
  { id: 'analysis', label: 'Analysis', icon: PieChart },
];

export default function Header({ page, onPage, roomName, onMembers, onSignOut }) {
  return (
    <header className="bg-forest text-ivory">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sand text-forest">
            <Home size={18} />
          </span>
          <div className="leading-tight">
            <p className="font-display text-xl font-semibold tracking-tight">RoomMate</p>
            <p className="max-w-[10rem] truncate text-xs text-sage sm:max-w-xs">{roomName}</p>
          </div>
        </div>

        <nav className="order-3 flex w-full gap-1 sm:order-none sm:w-auto" aria-label="Primary">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onPage(id)}
              aria-current={page === id ? 'page' : undefined}
              className={cx(
                'flex flex-1 items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-colors duration-200 sm:flex-none',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-sand',
                page === id ? 'bg-sand text-forest' : 'text-sand hover:bg-forest-light'
              )}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <button
            onClick={onMembers}
            className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-sand transition-colors hover:bg-forest-light focus:outline-none focus-visible:ring-2 focus-visible:ring-sand"
          >
            <Users size={16} />
            <span className="hidden sm:inline">Roommates</span>
          </button>
          <button
            onClick={onSignOut}
            aria-label="Switch room"
            title="Switch room"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-sand transition-colors hover:bg-forest-light focus:outline-none focus-visible:ring-2 focus-visible:ring-sand"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
