import React, { useState, useEffect } from 'react';
import { resolveMediaUrl } from '../../services/apiClient';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  name?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'busy' | 'away';
  type?: 'user' | 'academy';
}

function getInitial(name?: string | null): string {
  const value = name?.trim();
  if (!value) return '?';
  return value.charAt(0).toUpperCase();
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  status,
  type = 'user',
  className = '',
  ...props
}) => {
  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-xs font-semibold',
    lg: 'w-12 h-12 text-sm font-bold',
    xl: 'w-16 h-16 text-base font-extrabold',
  };

  const statusColors = {
    online: 'bg-emerald-500',
    offline: 'bg-slate-400',
    busy: 'bg-rose-500',
    away: 'bg-amber-500',
  };

  const rawSrc = src?.trim();
  const normalizedSrc =
    !rawSrc || ['null', 'undefined', 'none'].includes(rawSrc.toLowerCase())
      ? null
      : resolveMediaUrl(rawSrc);

  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [normalizedSrc]);

  const initial = getInitial(name);
  const showImage = Boolean(normalizedSrc) && !imageFailed;
  const isAcademy = type === 'academy';

  return (
    <div className={`relative inline-block shrink-0 ${className}`} {...props}>
      {showImage ? (
        <img
          src={normalizedSrc!}
          alt={name ? `${name} ${isAcademy ? 'logo' : 'avatar'}` : ''}
          onError={() => setImageFailed(true)}
          className={`${sizes[size]} ${
            isAcademy ? 'rounded-xl object-contain bg-slate-50 dark:bg-[#1E293B]' : 'rounded-full object-cover'
          } border border-slate-200 dark:border-[#263244] shadow-2xs`}
        />
      ) : (
        <div
          className={`${sizes[size]} ${
            isAcademy ? 'rounded-xl' : 'rounded-full'
          } bg-blue-50 dark:bg-[rgba(37,99,235,0.12)] border border-blue-200 dark:border-[rgba(59,130,246,0.2)] text-[#2563EB] dark:text-[#60A5FA] font-bold flex items-center justify-center shadow-2xs uppercase select-none`}
        >
          {initial}
        </div>
      )}

      {status && (
        <span
          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#111827] ${statusColors[status]}`}
        />
      )}
    </div>
  );
};
