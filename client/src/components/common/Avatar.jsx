import React from 'react';

const sizeMap = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
};

const dotSizeMap = {
  xs: 'w-1.5 h-1.5 ring-1',
  sm: 'w-2 h-2 ring-1.5',
  md: 'w-2.5 h-2.5 ring-2',
  lg: 'w-3 h-3 ring-2',
  xl: 'w-3.5 h-3.5 ring-2',
};

export const Avatar = ({
  src,
  name = 'User',
  size = 'md',
  status, // 'online' | 'offline' | 'away' | 'in_meeting' | undefined
  showStatus = false,
  className = '',
}) => {
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  const statusColor =
    status === 'online'
      ? 'bg-brand-500 ring-surface-950 light:ring-white'
      : status === 'away'
      ? 'bg-accent-500 ring-surface-950 light:ring-white'
      : status === 'in_meeting'
      ? 'bg-orange-500 ring-surface-950 light:ring-white'
      : 'bg-surface-500 ring-surface-950 light:ring-white';

  return (
    <div className={`relative inline-flex flex-shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${sizeMap[size] || sizeMap.md} rounded-full object-cover ring-1 ring-white/10`}
          onError={(e) => {
            // fallback to initials on broken image
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      ) : null}

      <div
        className={`${sizeMap[size] || sizeMap.md} rounded-full bg-gradient-to-br from-brand-600 to-brand-400 text-white font-semibold items-center justify-center ring-1 ring-white/10 ${
          src ? 'hidden' : 'flex'
        }`}
      >
        {initials}
      </div>

      {showStatus && (
        <span
          className={`absolute bottom-0 right-0 rounded-full ${statusColor} ${
            dotSizeMap[size] || dotSizeMap.md
          } ${status === 'online' ? 'animate-pulse' : ''}`}
          title={`Status: ${status || 'offline'}`}
        />
      )}
    </div>
  );
};
