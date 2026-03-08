import { Home, Plus, Search, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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

  if (location.pathname.startsWith('/recipe/') || location.pathname === '/auth') {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-md border-t border-border safe-bottom">
      <div className="flex items-center justify-around h-20 max-w-lg mx-auto px-4">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          const isAdd = path === '/add';

          return (
            <motion.button
              key={path}
              onClick={() => navigate(path)}
              whileTap={{ scale: 0.9 }}
              className={cn(
                'flex flex-col items-center justify-center min-w-[56px] min-h-[56px] gap-1 transition-colors rounded-pill',
                isAdd
                  ? 'bg-secondary rounded-pill w-14 h-14 text-secondary-foreground shadow-elevated -mt-5'
                  : isActive
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
              aria-label={label}
            >
              <Icon className={cn('w-5 h-5', isAdd && 'w-6 h-6')} />
              {!isAdd && (
                <span className="text-xs font-medium font-body">{label}</span>
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
