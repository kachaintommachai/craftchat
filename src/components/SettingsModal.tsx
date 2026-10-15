import React, { useState } from 'react';
import { X, Shield, Folder, User, Network, Copy, Check, Smile, Camera, BookOpen } from 'lucide-react';
import { UserProfile } from '../types';
import { getStickerById } from './Stickers';
import { Avatar } from './Avatar';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  onSaveProfile: (name: string, port: number, downloadDir: string) => void;
  onOpenStatusModal?: () => void;
  onOpenAvatarModal?: () => void;
  onOpenGuide?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  onOpenStatusModal,
  onOpenAvatarModal,
  onOpenGuide,
}) => {
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [port, setPort] = useState(profile?.port || 4242);
  const [downloadDir, setDownloadDir] = useState(profile?.download_dir || '');
  const [copiedKey, setCopiedKey] = useState(false);

  if (!isOpen) return null;

  const handleCopyKey = () => {
    if (profile?.pubkey) {
      navigator.clipboard.writeText(profile.pubkey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const handleSave = () => {
    onSaveProfile(displayName, port, downloadDir);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm select-none p-4 animate-fadeIn">
      <div className="bg-white dark:bg-[#20242B] w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <User className="w-4 h-4 text-line-green" />
            <span>การตั้งค่า (Settings)</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Avatar & Profile Photo Card */}
          <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar
                name={profile?.display_name}
                avatarUrl={profile?.avatar_url}
                size="lg"
                online={true}
                statusSticker={profile?.status_sticker}
                editable={true}
                onClick={() => {
                  onClose();
                  onOpenAvatarModal?.();
                }}
              />
              <div>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 block font-sans">รูปโปรไฟล์ (Avatar)</span>
                <span className="text-xs font-bold text-gray-800 dark:text-gray-100">
                  {profile?.avatar_url ? 'ใช้รูปโปรไฟล์แบบกำหนดเอง' : 'ใช้ไอคอนเริ่มต้น'}
                </span>
              </div>
            </div>
            {onOpenAvatarModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAvatarModal();
                }}
                className="px-2.5 py-1 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-lg font-bold text-[11px] shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5 text-line-green" />
                <span>เปลี่ยนรูป</span>
              </button>
            )}
          </div>

          {/* Current Status Card */}
          <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-xl border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shadow-xs flex-shrink-0">
                {profile?.status_sticker ? (
                  getStickerById(profile.status_sticker)?.render(24) || <Smile className="w-4 h-4 text-line-green" />
                ) : (
                  <Smile className="w-4 h-4 text-line-green" />
                )}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-gray-500 dark:text-gray-400 block font-sans">สถานะและสติกเกอร์ปัจจุบัน</span>
                <span className="text-xs font-bold text-gray-800 dark:text-gray-100 truncate block">
                  {profile?.status_text || 'Online พร้อมคุย'}
                </span>
              </div>
            </div>
            {onOpenStatusModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenStatusModal();
                }}
                className="px-2.5 py-1 bg-white dark:bg-gray-800 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-line-green border border-emerald-200 dark:border-emerald-700/60 rounded-lg font-bold text-[11px] shadow-xs transition-colors flex items-center gap-1"
              >
                <span>แก้ไขสถานะ</span>
              </button>
            )}
          </div>

          {/* User Guide & Manual Card */}
          {onOpenGuide && (
            <div className="p-3 bg-gradient-to-r from-emerald-50/80 to-teal-50/50 dark:from-emerald-950/30 dark:to-teal-950/20 rounded-xl border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-line-green flex items-center justify-center shadow-xs">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-100 block">คู่มือการใช้งาน & FAQ</span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">วิธีแชท, สติกเกอร์, โทร, QUIC & Bluetooth</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenGuide();
                }}
                className="px-3 py-1.5 rounded-lg bg-line-green hover:bg-line-green-hover text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
              >
                เปิดอ่าน
              </button>
            </div>
          )}

          {/* Display Name */}
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              ชื่อแสดงผลของคุณ (Display Name)
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="เช่น Somchai (MacBook-Pro)"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-100 focus:outline-none focus:border-line-green transition-colors"
            />
          </div>

          {/* Network Port */}
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
              <Network className="w-3.5 h-3.5 text-blue-500" />
              <span>TCP Listening Port</span>
            </label>
            <input
              type="number"
              value={port}
              onChange={(e) => setPort(Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-100 focus:outline-none focus:border-line-green transition-colors font-mono"
            />
          </div>

          {/* Download Directory */}
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-amber-500" />
              <span>โฟลเดอร์สำหรับรับไฟล์ (Download Folder)</span>
            </label>
            <input
              type="text"
              value={downloadDir}
              onChange={(e) => setDownloadDir(e.target.value)}
              placeholder="โฟลเดอร์ปลายทาง"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-100 focus:outline-none focus:border-line-green transition-colors font-mono text-[11px]"
            />
          </div>

          {/* Security & Public Key */}
          <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span>X25519 Public Key (Local E2EE)</span>
              </span>
              <button
                onClick={handleCopyKey}
                className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                {copiedKey ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
              </button>
            </div>
            <p className="font-mono text-[10px] text-gray-500 break-all select-all">
              {profile?.pubkey || 'Generating keys...'}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-gray-50 dark:bg-gray-800/40 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-lg bg-line-green hover:bg-line-green-hover text-white font-semibold shadow-md transition-colors"
          >
            บันทึกการตั้งค่า
          </button>
        </div>
      </div>
    </div>
  );
};
