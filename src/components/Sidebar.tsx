import React from 'react';
import { MessageSquare, Users, Settings, Moon, Sun, ShieldCheck, Wifi, Smile, BookOpen, Palette } from 'lucide-react';
import { UserProfile } from '../types';
import { Avatar } from './Avatar';

interface SidebarProps {
  activeTab: 'chats' | 'peers' | 'settings';
  setActiveTab: (tab: 'chats' | 'peers' | 'settings') => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  profile: UserProfile | null;
  unreadTotal: number;
  onlinePeerCount: number;
  onOpenSettings: () => void;
  onViewMyProfile: () => void;
  onOpenStatusModal?: () => void;
  onOpenAvatarModal?: () => void;
  onOpenGuide?: () => void;
  onOpenThemeModal?: () => void;
  isChatActive?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  darkMode,
  setDarkMode,
  profile,
  unreadTotal,
  onlinePeerCount,
  onOpenSettings,
  onViewMyProfile,
  onOpenStatusModal,
  onOpenAvatarModal,
  onOpenGuide,
  onOpenThemeModal,
  isChatActive = false,
}) => {
  return (
    <>
      {/* Desktop Vertical Sidebar (LINE PC Style) */}
      <div className="hidden md:flex w-16 bg-line-sidebar flex-col items-center py-4 select-none justify-between h-full border-r border-gray-800 z-20 flex-shrink-0">
      {/* Top Group: Profile avatar & Navigation buttons */}
      <div className="flex flex-col items-center space-y-3 w-full">
        {/* CraftChat Brand Logo */}
        <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md border border-white/20 p-0.5 bg-black/20 hover:scale-105 transition-transform cursor-pointer" title="CraftChat">
          <img src="/craftchat.png" alt="CraftChat Logo" className="w-full h-full object-cover rounded-lg" />
        </div>

        {/* User Profile Avatar with Online Pulse & Status Sticker Badge */}
        <div className="flex flex-col items-center gap-1.5 pt-1">
          <div 
            onClick={onOpenAvatarModal || onViewMyProfile}
            className="relative cursor-pointer group"
            title={`โปรไฟล์: ${profile?.display_name || 'Loading...'} (คลิกเพื่อเปลี่ยนรูปประจำตัว)`}
          >
            <Avatar
              name={profile?.display_name || 'ME'}
              avatarUrl={profile?.avatar_url}
              size={42}
              statusSticker={profile?.status_sticker}
              online={true}
              editable={true}
              onEdit={onOpenAvatarModal}
            />
          </div>

          {/* Quick Status Button */}
          {onOpenStatusModal && (
            <button
              onClick={onOpenStatusModal}
              className="px-1.5 py-0.5 rounded-full bg-white/10 hover:bg-line-green/40 text-white/90 hover:text-white text-[9px] font-semibold flex items-center gap-0.5 transition-all max-w-[54px] truncate shadow-xs"
              title={`สถานะ: ${profile?.status_text || 'Online'} (คลิกเพื่อแก้ไขสถานะ)`}
            >
              <Smile className="w-2.5 h-2.5 text-line-green flex-shrink-0" />
              <span className="truncate">สถานะ</span>
            </button>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-col space-y-3 w-full px-2">
          {/* Chats Tab */}
          <button
            onClick={() => setActiveTab('chats')}
            className={`relative w-full h-12 rounded-xl flex items-center justify-center transition-all ${
              activeTab === 'chats'
                ? 'bg-line-sidebar-active text-line-green shadow-inner'
                : 'text-gray-400 hover:text-gray-200 hover:bg-line-sidebar-hover'
            }`}
            title="ห้องแชท (Chats)"
          >
            <MessageSquare className="w-5 h-5" />
            {unreadTotal > 0 && (
              <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center">
                {unreadTotal > 99 ? '99+' : unreadTotal}
              </span>
            )}
          </button>

          {/* Peers / Friends in LAN Tab */}
          <button
            onClick={() => setActiveTab('peers')}
            className={`relative w-full h-12 rounded-xl flex items-center justify-center transition-all ${
              activeTab === 'peers'
                ? 'bg-line-sidebar-active text-line-green shadow-inner'
                : 'text-gray-400 hover:text-gray-200 hover:bg-line-sidebar-hover'
            }`}
            title="อุปกรณ์ในวงแลน (LAN Peers)"
          >
            <Users className="w-5 h-5" />
            {onlinePeerCount > 0 && (
              <span className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center">
                {onlinePeerCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Bottom Group: Settings, Dark mode toggle, Local E2EE & Network info */}
      <div className="flex flex-col items-center space-y-4 w-full px-2">
        {/* Local E2EE Shield Indicator */}
        <div 
          className="text-emerald-400/80 hover:text-emerald-300 transition-colors cursor-pointer"
          title="เข้ารหัสแบบ Local E2EE (XChaCha20-Poly1305 + X25519)"
        >
          <ShieldCheck className="w-5 h-5" />
        </div>

        {/* Dark/Light Mode toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-200 hover:bg-line-sidebar-hover transition-colors"
          title={darkMode ? 'สลับเป็นโหมดสว่าง' : 'สลับเป็นโหมดมืด'}
        >
          {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* User Guide & Manual button */}
        {onOpenGuide && (
          <button
            onClick={onOpenGuide}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-line-green hover:bg-line-sidebar-hover transition-colors"
            title="คู่มือการใช้งาน (User Manual)"
          >
            <BookOpen className="w-5 h-5" />
          </button>
        )}

        {/* Theme Palette Customizer button */}
        {onOpenThemeModal && (
          <button
            onClick={onOpenThemeModal}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-line-gold hover:bg-line-sidebar-hover transition-colors"
            title="ปรับแต่งธีมและสีสัน (Themes)"
          >
            <Palette className="w-5 h-5 text-line-gold" />
          </button>
        )}

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            activeTab === 'settings'
              ? 'bg-line-sidebar-active text-line-green'
              : 'text-gray-400 hover:text-gray-200 hover:bg-line-sidebar-hover'
          }`}
          title="ตั้งค่า (Settings)"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* LAN Indicator Dot */}
        <div className="pt-2 flex flex-col items-center" title="LAN Direct P2P Active">
          <Wifi className="w-4 h-4 text-emerald-400 animate-pulse" />
        </div>
      </div>
    </div>

    {/* Mobile Bottom Navigation Bar (LINE Mobile style) */}
    {!isChatActive && (
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-line-sidebar/95 backdrop-blur-md border-t border-gray-800/80 z-40 flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)] select-none">
        {/* Chats */}
        <button
          onClick={() => setActiveTab('chats')}
          className={`flex flex-col items-center justify-center flex-1 py-1 relative transition-colors ${
            activeTab === 'chats' ? 'text-line-green font-bold' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5" />
            {unreadTotal > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full min-w-3.5 text-center leading-tight">
                {unreadTotal > 99 ? '99+' : unreadTotal}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5">แชท</span>
        </button>

        {/* Friends / Peers in LAN */}
        <button
          onClick={() => setActiveTab('peers')}
          className={`flex flex-col items-center justify-center flex-1 py-1 relative transition-colors ${
            activeTab === 'peers' ? 'text-line-green font-bold' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <div className="relative">
            <Users className="w-5 h-5" />
            {onlinePeerCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full min-w-3.5 text-center leading-tight">
                {onlinePeerCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5">เพื่อน</span>
        </button>

        {/* Profile / Avatar */}
        <button
          onClick={onOpenAvatarModal || onViewMyProfile}
          className="flex flex-col items-center justify-center flex-1 py-1 text-gray-400 hover:text-gray-200 transition-colors"
        >
          <div className="w-5 h-5 rounded-full overflow-hidden ring-1 ring-white/30 flex items-center justify-center">
            <Avatar
              name={profile?.display_name || 'ME'}
              avatarUrl={profile?.avatar_url}
              size={20}
              statusSticker={profile?.status_sticker}
            />
          </div>
          <span className="text-[10px] mt-0.5 truncate max-w-[48px]">
            {profile?.display_name || 'โปรไฟล์'}
          </span>
        </button>

        {/* Dark / Light Mode */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="flex flex-col items-center justify-center flex-1 py-1 text-gray-400 hover:text-gray-200 transition-colors"
        >
          {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          <span className="text-[10px] mt-0.5">{darkMode ? 'สว่าง' : 'มืด'}</span>
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            activeTab === 'settings' ? 'text-line-green font-bold' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">ตั้งค่า</span>
        </button>
      </nav>
    )}
  </>
  );
};
