import { Home, Plus, Search, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', icon: Home, label: 'Library' },
  { path: '/add', icon: Plus, label: 'Add' },
  { path: '/search', icon: Search, label: 'Search' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  // Hide on recipe detail and auth pages
  if (location.pathname.startsWith('/recipe/') || location.pathname === '/auth') {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-4">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          const isAdd = path === '/add';

          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn(
                'flex flex-col items-center justify-center min-w-[48px] min-h-[48px] gap-0.5 transition-colors',
                isAdd
                  ? 'bg-primary rounded-full w-12 h-12 text-primary-foreground shadow-card -mt-4'
                  : isActive
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
              aria-label={label}
            >
              <Icon className={cn('w-5 h-5', isAdd && 'w-6 h-6')} />
              {!isAdd && (
                <span className="text-[10px] font-medium font-body">{label}</span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
