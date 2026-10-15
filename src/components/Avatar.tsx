import React from 'react';
import { Camera, Smile } from 'lucide-react';
import { getStickerById } from './Stickers';

interface AvatarProps {
  name?: string | null;
  avatarUrl?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  statusSticker?: string | null;
  online?: boolean;
  className?: string;
  editable?: boolean;
  onEdit?: () => void;
  onClick?: () => void;
  title?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name = 'User',
  avatarUrl,
  size = 'md',
  statusSticker,
  online,
  className = '',
  editable = false,
  onEdit,
  onClick,
  title,
}) => {
  const safeName = name || 'User';
  // Determine pixel size
  let pxSize = 40;
  let textClass = 'text-xs';
  let badgeSize = 'w-4 h-4';
  let stickerRenderSize = 14;

  if (typeof size === 'number') {
    pxSize = size;
    textClass = size >= 60 ? 'text-2xl' : size >= 40 ? 'text-sm' : 'text-[10px]';
    badgeSize = size >= 60 ? 'w-6 h-6' : 'w-4 h-4';
    stickerRenderSize = size >= 60 ? 20 : 14;
  } else {
    switch (size) {
      case 'xs':
        pxSize = 20;
        textClass = 'text-[9px]';
        badgeSize = 'w-3 h-3';
        stickerRenderSize = 10;
        break;
      case 'sm':
        pxSize = 32;
        textClass = 'text-[11px]';
        badgeSize = 'w-3.5 h-3.5';
        stickerRenderSize = 12;
        break;
      case 'md':
        pxSize = 40;
        textClass = 'text-xs';
        badgeSize = 'w-4 h-4';
        stickerRenderSize = 14;
        break;
      case 'lg':
        pxSize = 48;
        textClass = 'text-sm';
        badgeSize = 'w-5 h-5';
        stickerRenderSize = 16;
        break;
      case 'xl':
        pxSize = 80;
        textClass = 'text-2xl font-extrabold';
        badgeSize = 'w-7 h-7';
        stickerRenderSize = 22;
        break;
    }
  }

  const initials = (name || 'U').slice(0, 2).toUpperCase();
  const stickerItem = statusSticker ? getStickerById(statusSticker) : null;

  return (
    <div
      onClick={onClick || onEdit}
      className={`relative flex-shrink-0 select-none ${(editable || onClick || onEdit) ? 'cursor-pointer group/avatar' : ''} ${className}`}
      style={{ width: `${pxSize}px`, height: `${pxSize}px` }}
      title={title || safeName}
    >
      {/* Inner Avatar: Image or Initials Gradient */}
      <div
        className="w-full h-full rounded-full overflow-hidden flex items-center justify-center font-bold text-white shadow-sm ring-2 ring-white/20 transition-transform group-hover/avatar:scale-105"
        style={{
          background: avatarUrl
            ? 'transparent'
            : 'linear-gradient(135deg, #06C755 0%, #10B981 50%, #059669 100%)',
        }}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={safeName}
            className="w-full h-full object-cover select-none pointer-events-none"
            onError={(e) => {
              // Fallback to initials if image fails
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <span className={textClass}>{initials}</span>
        )}
      </div>

      {/* Editable Hover Camera Overlay */}
      {editable && (
        <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center text-white transition-opacity backdrop-blur-xs">
          <Camera className={pxSize >= 60 ? 'w-6 h-6' : 'w-3.5 h-3.5'} />
        </div>
      )}

      {/* Status Sticker Badge (Floating Top-Right) */}
      {statusSticker && (
        <div
          className={`absolute -top-1 -right-1 ${badgeSize} rounded-full bg-white dark:bg-gray-800 p-0.5 shadow-md border border-line-green flex items-center justify-center z-10`}
          title={`สติกเกอร์สถานะ`}
        >
          {stickerItem ? (
            stickerItem.render(stickerRenderSize)
          ) : (
            <Smile className="w-2.5 h-2.5 text-line-green" />
          )}
        </div>
      )}

      {/* Online / Offline Dot (Floating Bottom-Right) */}
      {online !== undefined && (
        <span
          className={`absolute bottom-0 right-0 ${
            pxSize >= 60 ? 'w-4 h-4 border-3' : 'w-2.5 h-2.5 border-2'
          } rounded-full border-white dark:border-[#20242B] ${
            online ? 'bg-emerald-500' : 'bg-gray-400'
          }`}
          title={online ? 'ออนไลน์' : 'ออฟไลน์'}
        />
      )}
    </div>
  );
};
