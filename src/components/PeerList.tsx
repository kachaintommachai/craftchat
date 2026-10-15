import React, { useState, useEffect } from 'react';
import {
  Search,
  Monitor,
  RefreshCw,
  Users,
  Plus,
  User,
  Edit3,
  Info,
  Circle,
  Bluetooth,
  Zap,
  LayoutGrid,
  List,
  ArrowDownAZ,
} from 'lucide-react';
import { Peer, GroupChat, UserProfile } from '../types';
import { getStickerById } from './Stickers';
import { Avatar } from './Avatar';

interface PeerListProps {
  peers: Peer[];
  groups: GroupChat[];
  selectedPeer: Peer | null;
  selectedGroup: GroupChat | null;
  profile: UserProfile | null;
  onSelectPeer: (peer: Peer) => void;
  onSelectGroup: (group: GroupChat) => void;
  onViewDeviceDetails: (peer: Peer) => void;
  onRefreshDiscovery: () => void;
  onOpenCreateGroup: () => void;
  onOpenStatusModal: () => void;
  onOpenAvatarModal?: () => void;
  onStartBluetoothScan?: () => void;
  isScanning: boolean;
  isBluetoothScanning?: boolean;
  sidebarTab?: 'chats' | 'peers' | 'settings';
}

export const PeerList: React.FC<PeerListProps> = ({
  peers,
  groups,
  selectedPeer,
  selectedGroup,
  profile,
  onSelectPeer,
  onSelectGroup,
  onViewDeviceDetails,
  onRefreshDiscovery,
  onOpenCreateGroup,
  onOpenStatusModal,
  onOpenAvatarModal,
  onStartBluetoothScan,
  isScanning,
  isBluetoothScanning = false,
  sidebarTab,
}) => {
  const [activeTab, setActiveTab] = useState<'peers' | 'groups'>('peers');
  const [viewMode, setViewMode] = useState<'icon' | 'list'>('icon');
  const [searchQuery, setSearchQuery] = useState('');

  // Sync activeTab when user clicks sidebar icons
  useEffect(() => {
    if (sidebarTab === 'peers') {
      setActiveTab('peers');
      setViewMode('icon'); // Default to icon view on friends icon
    } else if (sidebarTab === 'chats') {
      // In chat mode, prioritize recent active chats or groups
      setActiveTab('peers');
    }
  }, [sidebarTab]);

  const myStickerItem = profile?.status_sticker ? getStickerById(profile.status_sticker) : null;

  const filteredPeers = peers.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.ip.includes(searchQuery)
  );

  // Alphabetical sort (ก-ฮ / A-Z) using Thai-aware collation
  const sortedPeers = [...filteredPeers].sort((a, b) =>
    a.name.localeCompare(b.name, 'th', { sensitivity: 'base', numeric: true })
  );

  // Group sorted peers by alphabet / initial character
  const alphabetGroups = sortedPeers.reduce((acc, peer) => {
    const rawChar = (peer.name.trim()[0] || '#').toUpperCase();
    acc[rawChar] = acc[rawChar] || [];
    acc[rawChar].push(peer);
    return acc;
  }, {} as Record<string, Peer[]>);

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full md:w-80 h-full flex flex-col bg-white dark:bg-[#20242B] border-r border-gray-200 dark:border-gray-800 transition-colors select-none pb-16 md:pb-0 flex-shrink-0">
      {/* Top Header & Search Box */}
      <div className="p-3 border-b border-gray-100 dark:border-gray-800 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/craftchat.png" alt="CraftChat Logo" className="w-6 h-6 rounded-lg object-cover shadow-xs border border-gray-200 dark:border-gray-700" />
            <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-1.5">
              <span>เครือข่ายแลน</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-semibold">
                {peers.length} เครื่อง
              </span>
            </h2>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onStartBluetoothScan}
              className={`p-1.5 rounded-lg transition-all ${
                isBluetoothScanning
                  ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 animate-pulse'
                  : 'text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title="ค้นหาอุปกรณ์ใกล้เคียงผ่าน Bluetooth Low Energy (ไร้เน็ต/ไร้เราเตอร์)"
            >
              <Bluetooth className={`w-4 h-4 ${isBluetoothScanning ? 'animate-bounce' : ''}`} />
            </button>
            <button
              onClick={onOpenCreateGroup}
              className="p-1.5 text-gray-400 hover:text-line-green rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
              title="สร้างกลุ่มแชทใหม่ใน LAN"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={onRefreshDiscovery}
              className={`p-1.5 text-gray-400 hover:text-line-green rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all ${
                isScanning ? 'animate-spin text-line-green' : ''
              }`}
              title="สแกนค้นหาเครื่องใน LAN อีกครั้ง (QUIC/mDNS)"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab switch: Direct vs Groups */}
        <div className="grid grid-cols-2 p-0.5 bg-gray-100 dark:bg-gray-800/80 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setActiveTab('peers')}
            className={`py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'peers'
                ? 'bg-white dark:bg-[#20242B] text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>เพื่อน ({peers.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'groups'
                ? 'bg-white dark:bg-[#20242B] text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>กลุ่ม ({groups.length})</span>
          </button>
        </div>

        {/* Search Bar & View Mode Toggle */}
        <div className="flex items-center gap-1.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder={activeTab === 'peers' ? 'ค้นหาชื่อ หรือ IP ใน LAN...' : 'ค้นหาชื่อกลุ่มแชท...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800/80 border border-transparent focus:border-line-green dark:focus:border-line-green rounded-lg text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none transition-colors"
            />
          </div>

          {activeTab === 'peers' && (
            <div className="flex items-center bg-gray-100 dark:bg-gray-800/80 p-0.5 rounded-lg flex-shrink-0 border border-gray-200/50 dark:border-gray-700/50">
              <button
                onClick={() => setViewMode('icon')}
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === 'icon'
                    ? 'bg-white dark:bg-[#20242B] text-line-green shadow-xs'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
                title="มุมมองไอคอน เรียงตามตัวอักษร (Icon Grid)"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-[#20242B] text-line-green shadow-xs'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
                title="มุมมองรายการ (List View)"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Alphabetical Sort Indicator Banner */}
        {activeTab === 'peers' && (
          <div className="flex items-center justify-between text-[10px] text-gray-400 px-0.5">
            <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
              <ArrowDownAZ className="w-3.5 h-3.5" />
              <span>เรียงตามตัวอักษร {viewMode === 'icon' ? '(แบบไอคอน)' : '(แบบรายการ)'}</span>
            </span>
            <span>{sortedPeers.length} เพื่อน</span>
          </div>
        )}
      </div>

      {/* List Area */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800/50">
        {activeTab === 'peers' ? (
          /* PEERS TAB */
          <>
            {/* My Profile & Current Status Header Card */}
            {profile && (
              <div className="p-3 bg-gradient-to-r from-emerald-50 via-teal-50/40 to-white dark:from-emerald-950/20 dark:via-teal-950/10 dark:to-transparent border-b border-gray-100 dark:border-gray-800 flex items-center justify-between group">
                <div
                  onClick={onOpenStatusModal}
                  className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                  title="คลิกเพื่อแก้ไขสถานะการใช้งานด้วย Sticker"
                >
                  <div
                    className="relative flex-shrink-0 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenAvatarModal?.();
                    }}
                    title="คลิกเพื่อเปลี่ยนรูป Avatar ประจำตัว"
                  >
                    <Avatar
                      name={profile.display_name}
                      avatarUrl={profile.avatar_url}
                      size="md"
                      online={true}
                      statusSticker={profile.status_sticker}
                      editable={true}
                      onClick={onOpenAvatarModal}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-line-green transition-colors">
                        {profile.display_name}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 font-bold">
                        ฉัน
                      </span>
                    </div>

                    {/* Status Text Bubble */}
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate flex items-center gap-1 mt-0.5">
                      {profile.status_sticker && myStickerItem && (
                        <span className="w-3.5 h-3.5 flex-shrink-0 inline-flex items-center justify-center">
                          {myStickerItem.render(14)}
                        </span>
                      )}
                      <span className="truncate italic">
                        {profile.status_text || 'Online พร้อมคุย'}
                      </span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={onOpenStatusModal}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-line-green hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40 transition-all flex items-center gap-1 text-[11px] font-semibold flex-shrink-0"
                  title="แก้ไขสถานะด้วยสติกเกอร์"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {filteredPeers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 mb-3 animate-pulse">
                  <Monitor className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                  กำลังค้นหาเครื่องในวง LAN...
                </p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 max-w-xs">
                  ระบบกำลังส่งสัญญาณ mDNS Auto-discovery ใน Subnet เดียวกัน
                </p>
              </div>
            ) : viewMode === 'icon' ? (
              /* ICON GRID VIEW (แสดงรายชื่อเพื่อนแบบไอคอน เรียงตามตัวอักษร) */
              <div className="p-2 space-y-3">
                {Object.entries(alphabetGroups).map(([letter, groupPeers]) => (
                  <div key={letter} className="space-y-1.5">
                    {/* Alphabet Category Header Badge */}
                    <div className="flex items-center gap-2 px-1">
                      <span className="w-5 h-5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-[11px] flex items-center justify-center shadow-2xs">
                        {letter}
                      </span>
                      <div className="flex-1 h-px bg-gray-200/60 dark:bg-gray-800" />
                      <span className="text-[10px] font-mono text-gray-400">{groupPeers.length} คน</span>
                    </div>

                    {/* 3-Column Friends Icon Grid */}
                    <div className="grid grid-cols-3 gap-2">
                      {groupPeers.map((peer) => {
                        const isSelected = !selectedGroup && selectedPeer?.peer_id === peer.peer_id;
                        const peerSticker = peer.status_sticker ? getStickerById(peer.status_sticker) : null;

                        return (
                          <div
                            key={peer.peer_id}
                            onClick={() => onSelectPeer(peer)}
                            className={`relative flex flex-col items-center p-2 rounded-2xl cursor-pointer transition-all border group/card ${
                              isSelected
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-line-green ring-1 ring-line-green shadow-xs'
                                : 'bg-gray-50/60 dark:bg-[#252A32] hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 border-gray-100 dark:border-gray-800 shadow-2xs hover:shadow-xs hover:border-line-green/40'
                            }`}
                            title={`${peer.name} (${peer.online ? 'ออนไลน์' : 'ออฟไลน์'})`}
                          >
                            {/* Top Badges (Transport & Unread) */}
                            <div className="w-full flex items-center justify-between mb-1 px-0.5">
                              {peer.transport === 'bluetooth' ? (
                                <span className="inline-flex items-center gap-0.5 text-[8px] text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/60 px-1 py-0.2 rounded font-mono font-bold" title="Bluetooth Direct">
                                  <Bluetooth className="w-2.5 h-2.5" /> BT
                                </span>
                              ) : peer.transport === 'tcp' ? (
                                <span className="text-[8px] text-gray-500 bg-gray-200/70 dark:bg-gray-800 px-1 py-0.2 rounded font-mono">
                                  TCP
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-0.5 text-[8px] text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-1 py-0.2 rounded font-mono font-bold" title="QUIC 0-RTT">
                                  <Zap className="w-2.5 h-2.5 fill-amber-500 text-amber-500" /> QUIC
                                </span>
                              )}

                              {peer.unread_count > 0 && (
                                <span className="bg-line-green text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full min-w-3.5 text-center leading-tight">
                                  {peer.unread_count}
                                </span>
                              )}
                            </div>

                            {/* Large Avatar Icon */}
                            <div
                              className="relative cursor-pointer transition-transform group-hover/card:scale-105 active:scale-95"
                              onClick={(e) => {
                                e.stopPropagation();
                                onViewDeviceDetails(peer);
                              }}
                              title="คลิกที่ไอคอนเพื่อดูรายละเอียดเครื่อง"
                            >
                              <Avatar
                                name={peer.name}
                                avatarUrl={peer.avatar_url}
                                size={46}
                                online={peer.online}
                                statusSticker={peer.status_sticker}
                              />
                            </div>

                            {/* Friend Name Under Icon */}
                            <span className="text-xs font-bold text-gray-800 dark:text-gray-100 text-center truncate w-full mt-1.5 group-hover/card:text-line-green transition-colors">
                              {peer.name}
                            </span>

                            {/* Status Sticker or Subtitle */}
                            <div className="w-full mt-0.5 flex items-center justify-center gap-1 text-[10px] text-gray-400 dark:text-gray-400 truncate">
                              {peer.status_sticker && peerSticker && (
                                <span className="w-3 h-3 inline-flex items-center justify-center flex-shrink-0">
                                  {peerSticker.render(12)}
                                </span>
                              )}
                              <span className="truncate text-center">
                                {peer.status_text || (peer.online ? 'ออนไลน์' : 'ออฟไลน์')}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* LIST VIEW (เรียงตามตัวอักษร) */
              sortedPeers.map((peer) => {
                const isSelected = !selectedGroup && selectedPeer?.peer_id === peer.peer_id;
                const peerSticker = peer.status_sticker ? getStickerById(peer.status_sticker) : null;

                return (
                  <div
                    key={peer.peer_id}
                    onClick={() => onSelectPeer(peer)}
                    className={`flex items-center gap-3 p-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-l-4 border-line-green'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/60 border-l-4 border-transparent'
                    }`}
                  >
                    {/* Peer Avatar */}
                    <div
                      className="relative flex-shrink-0 cursor-pointer group/avatar"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDeviceDetails(peer);
                      }}
                      title="คลิกที่ไอคอนคนเพื่อดูชื่อเครื่องและรายละเอียด"
                    >
                      <Avatar
                        name={peer.name}
                        avatarUrl={peer.avatar_url}
                        size="md"
                        online={peer.online}
                        statusSticker={peer.status_sticker}
                      />
                    </div>

                    {/* Peer Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-xs font-bold text-gray-800 dark:text-gray-100 truncate">
                            {peer.name}
                          </span>
                          {/* Transport Protocol Badge */}
                          {peer.transport === 'bluetooth' ? (
                            <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.2 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-semibold" title={`Bluetooth Direct (${peer.bluetooth_address || 'P2P'})`}>
                              <Bluetooth className="w-2.5 h-2.5" />
                              <span>BT {peer.rssi !== undefined && peer.rssi !== null ? `${peer.rssi}dBm` : 'ไร้เน็ต'}</span>
                            </span>
                          ) : peer.transport === 'tcp' ? (
                            <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium" title="TCP Fallback">
                              <span>TCP</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-semibold" title="QUIC 0-RTT Stream Multiplexing over UDP">
                              <Zap className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                              <span>QUIC</span>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {peer.last_message_time && (
                            <span className="text-[10px] text-gray-400">
                              {peer.last_message_time}
                            </span>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewDeviceDetails(peer);
                            }}
                            className="p-1 rounded-md text-gray-400 hover:text-line-green hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                            title="ดูรายละเอียดอุปกรณ์"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Peer Status Text or Last Message */}
                      {peer.status_text && (
                        <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium truncate mb-0.5">
                          {peer.status_sticker && peerSticker && (
                            <span className="w-3 h-3 inline-flex items-center justify-center flex-shrink-0">
                              {peerSticker.render(12)}
                            </span>
                          )}
                          <span className="truncate">{peer.status_text}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
                          {peer.last_message ? (
                            <span>{peer.last_message}</span>
                          ) : peer.transport === 'bluetooth' ? (
                            <span className="font-mono text-[10px] text-blue-500">
                              BT: {peer.bluetooth_address || 'BLE Direct'}
                            </span>
                          ) : (
                            <span className="font-mono text-[10px] text-gray-400">
                              {peer.ip}:{peer.port}
                            </span>
                          )}
                        </p>

                        {/* Unread Message Badge */}
                        {peer.unread_count > 0 && (
                          <span className="bg-line-green text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center flex-shrink-0">
                            {peer.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </>
        ) : (
          /* GROUPS TAB */
          filteredGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center px-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-line-green mb-3">
                <Users className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                ยังไม่มีกลุ่มแชทในวงแลน
              </p>
              <button
                onClick={onOpenCreateGroup}
                className="mt-3 px-3 py-1.5 text-xs font-bold text-white bg-line-green hover:bg-line-green-hover rounded-lg shadow-sm transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>สร้างกลุ่มใหม่</span>
              </button>
            </div>
          ) : (
            filteredGroups.map((group) => {
              const isSelected = selectedGroup?.group_id === group.group_id;
              return (
                <div
                  key={group.group_id}
                  onClick={() => onSelectGroup(group)}
                  className={`flex items-center gap-3 p-3 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-l-4 border-line-green'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/60 border-l-4 border-transparent'
                  }`}
                >
                  {/* Group Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-sm ring-2 ring-transparent">
                      <Users className="w-5 h-5" />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 bg-line-green text-white text-[9px] font-bold px-1 rounded-full border border-white dark:border-[#20242B]">
                      {group.members.length}
                    </span>
                  </div>

                  {/* Group Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-100 truncate">
                        {group.name}
                      </span>
                      {group.last_message_time && (
                        <span className="text-[10px] text-gray-400">
                          {group.last_message_time}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                        {group.last_message || `${group.members.length} สมาชิกในกลุ่ม`}
                      </p>

                      {group.unread_count > 0 && (
                        <span className="bg-line-green text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center flex-shrink-0">
                          {group.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )
        )}
      </div>

      {/* Bottom Network Status summary */}
      <div className="p-2.5 bg-gray-50 dark:bg-gray-800/40 border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-500 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Circle className="w-2.5 h-2.5 fill-emerald-500 text-emerald-500" />
          <span>mDNS Auto-Discovery</span>
        </span>
        <span className="text-[10px] font-mono text-gray-400">P2P Mesh LAN</span>
      </div>
    </div>
  );
};
