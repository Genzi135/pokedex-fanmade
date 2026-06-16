import { TYPE_COLORS } from '@/lib/utils/type-colors';
import { PokemonType } from '@/types/pokemon';

interface TypeBadgeProps {
  type: PokemonType;
  size?: 'sm' | 'md' | 'lg';
}

export function TypeBadge({ type, size = 'md' }: TypeBadgeProps) {
  const style = TYPE_COLORS[type];
  if (!style) return null;

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 font-medium rounded-full border-[0.5px]',
    md: 'text-xs px-2.5 py-1 font-semibold rounded-full border',
    lg: 'text-sm px-4 py-1.5 font-bold rounded-full border-2',
  };

  const nameFormatted = type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <span
      className={`${sizeClasses[size]} inline-flex items-center justify-center tracking-wide font-sans shadow-sm transition-all`}
      style={{
        backgroundColor: style.bg,
        borderColor: style.border,
        color: style.text,
        boxShadow: `0 2px 6px -1px rgba(${style.rgbBg}, 0.3)`,
      }}
    >
      {nameFormatted}
    </span>
  );
}

export default TypeBadge;
