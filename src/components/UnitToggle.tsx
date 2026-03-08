import { cn } from '@/lib/utils';
import type { UnitSystem } from '@/utils/unitConverter';

interface UnitToggleProps {
  value: UnitSystem;
  onChange: (system: UnitSystem) => void;
}

export function UnitToggle({ value, onChange }: UnitToggleProps) {
  return (
    <div className="inline-flex bg-muted rounded-lg p-0.5">
      <button
        onClick={() => onChange('metric')}
        className={cn(
          'px-3 py-1.5 text-xs font-body font-medium rounded-md transition-colors min-h-[36px]',
          value === 'metric'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground'
        )}
      >
        Metric
      </button>
      <button
        onClick={() => onChange('imperial')}
        className={cn(
          'px-3 py-1.5 text-xs font-body font-medium rounded-md transition-colors min-h-[36px]',
          value === 'imperial'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground'
        )}
      >
        Imperial
      </button>
    </div>
  );
}
