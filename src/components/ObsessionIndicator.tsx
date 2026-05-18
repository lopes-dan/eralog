type Props = {
  level: number;
  size?: 'sm' | 'md' | 'lg';
};

const LEVEL_LABELS = ['', 'Casual', 'Into It', 'Deep', 'Spiraling', 'Full Collapse'];
const LEVEL_COLORS = ['', 'text-ink-400', 'text-gold-400', 'text-ember-400', 'text-ember-500', 'text-ember-400'];

export default function ObsessionIndicator({ level, size = 'md' }: Props) {
  const sizeClasses = {
    sm: 'w-3 h-3 text-xs',
    md: 'w-4 h-4 text-sm',
    lg: 'w-5 h-5 text-base',
  };

  const flameSize = sizeClasses[size];

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            className={`${flameSize} transition-all duration-300 ${i < level ? LEVEL_COLORS[level] : 'text-ink-700'}`}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2C12 2 7 8 7 13a5 5 0 0010 0C17 8 12 2 12 2zm0 15.5a3 3 0 01-2.83-4c.5-1.5 1.83-3 2.83-4.5 1 1.5 2.33 3 2.83 4.5A3 3 0 0112 17.5z" />
          </svg>
        ))}
      </div>
      <span className={`font-medium ${size === 'sm' ? 'text-xs' : 'text-sm'} ${LEVEL_COLORS[level]}`}>
        {LEVEL_LABELS[level]}
      </span>
    </div>
  );
}
