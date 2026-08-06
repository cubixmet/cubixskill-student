import React from 'react';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'busy' | 'away';
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name = 'User',
  size = 'md',
  status,
  className = '',
  ...props
}) => {
  const sizes = {
    sm: 'w-7 h-7 text-[10px]',
    md: 'w-9 h-9 text-xs',
    lg: 'w-11 h-11 text-sm',
    xl: 'w-14 h-14 text-base font-bold',
  };

  const statusColors = {
    online: 'bg-emerald-500',
    offline: 'bg-slate-400',
    busy: 'bg-rose-500',
    away: 'bg-amber-500',
  };

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className={`relative inline-block shrink-0 ${className}`} {...props}>
      {src ? (
        <img src={src} alt={name} className={`${sizes[size]} rounded-full object-cover border border-slate-200 shadow-2xs`} />
      ) : (
        <div
          className={`${sizes[size]} rounded-full bg-[var(--theme-primary-soft,#EFF6FF)] text-[var(--theme-primary,#2563EB)] font-semibold flex items-center justify-center border border-[var(--theme-primary,#2563EB)]/30 shadow-2xs`}
        >
          {initials}
        </div>
      )}

      {status && (
        <span
          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${statusColors[status]}`}
        />
      )}
    </div>
  );
};
