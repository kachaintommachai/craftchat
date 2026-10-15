import React, { useState } from 'react';
import {
  X,
  Monitor,
  Network,
  ShieldCheck,
  MessageSquare,
  Copy,
  Check,
  Wifi,
  Clock,
  Radio,
  FileUp,
  Smile,
  Edit3,
  Zap,
  Bluetooth,
  Phone,
  Video,
} from 'lucide-react';
import { Peer } from '../types';
import { getStickerById } from './Stickers';
import { Avatar } from './Avatar';

interface DeviceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  peer: Peer | null;
  onStartChat: (peer: Peer) => void;
  onSendFilePrompt?: (peer: Peer) => void;
  onOpenStatusModal?: () => void;
  onStartCall?: (peer: Peer, callType: 'audio' | 'video') => void;
}

export const DeviceDetailModal: React.FC<DeviceDetailModalProps> = ({
  isOpen,
  onClose,
  peer,
  onStartChat,
  onSendFilePrompt,
  onOpenStatusModal,
  onStartCall,
}) => {
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedIp, setCopiedIp] = useState(false);

  if (!isOpen || !peer) return null;

  const handleCopyKey = () => {
    navigator.clipboard.writeText(peer.pubkey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCopyIp = () => {
    navigator.clipboard.writeText(`${peer.ip}:${peer.port}`);
    setCopiedIp(true);
    setTimeout(() => setCopiedIp(false), 2000);
  };

  // Extract hostname or device hint from peer_id or name
  const deviceHostname = peer.peer_id.includes('.local')
    ? peer.peer_id
    : `${peer.peer_id}.local`;

  const peerSticker = peer.status_sticker ? getStickerById(peer.status_sticker) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm select-none p-4 animate-fadeIn">
      <div className="bg-white dark:bg-[#20242B] w-full max-w-sm rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col relative transition-all">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* LINE Profile Cover (Gradient Header) */}
        <div className="h-32 bg-gradient-to-tr from-emerald-600 via-line-green to-teal-400 relative flex items-end justify-center pb-0">
          <div className="absolute top-3 left-4 flex items-center gap-1.5 text-[11px] font-bold text-white/90 bg-black/20 px-2.5 py-1 rounded-full backdrop-blur">
            <Radio className="w-3 h-3 text-emerald-300 animate-pulse" />
            <span>อุปกรณ์ในวง LAN</span>
          </div>

          {/* Large Center Avatar */}
          <div className="relative translate-y-1/2">
            <Avatar
              name={peer.name}
              avatarUrl={peer.avatar_url}
              size="xl"
              online={peer.online}
              statusSticker={peer.status_sticker}
            />
          </div>
        </div>

        {/* Content Body */}
        <div className="pt-12 px-6 pb-6 flex flex-col items-center text-center">
          {/* Display Name & Device Hostname */}
          <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center justify-center gap-1.5">
            <span>{peer.name}</span>
          </h2>
          <p className="text-xs font-mono text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
            <Monitor className="w-3.5 h-3.5 text-blue-500" />
            <span>{deviceHostname}</span>
          </p>

          {/* Status Message & Sticker */}
          <div className="mt-3 px-3.5 py-1.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center gap-2 max-w-full shadow-xs">
            {peer.status_sticker && (
              <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
                {peerSticker ? (
                  peerSticker.render(22)
                ) : (
                  <Smile className="w-4 h-4 text-line-green" />
                )}
              </div>
            )}
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-200 truncate">
              {peer.status_text || 'Online พร้อมคุย'}
            </span>
            {onOpenStatusModal && (
              <button
                onClick={onOpenStatusModal}
                className="p-1 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors ml-1"
                title="แก้ไขสถานะด้วยสติกเกอร์"
              >
                <Edit3 className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Device & Network Details Cards */}
          <div className="w-full mt-4 space-y-2.5 text-left text-xs">
            {/* IP & Port */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-gray-400 block font-sans">ที่อยู่ IP & พอร์ต</span>
                  <span className="font-mono font-bold text-gray-800 dark:text-gray-200">
                    {peer.ip}:{peer.port}
                  </span>
                </div>
              </div>
              <button
                onClick={handleCopyIp}
                className="p-1.5 text-gray-400 hover:text-line-green hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="คัดลอก IP"
              >
                {copiedIp ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Connection Mode & Transport Protocol */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                {peer.transport === 'bluetooth' ? (
                  <Bluetooth className="w-4 h-4 text-blue-500 flex-shrink-0" />
                ) : peer.transport === 'tcp' ? (
                  <Wifi className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                ) : (
                  <Zap className="w-4 h-4 text-amber-500 flex-shrink-0" />
                )}
                <div>
                  <span className="text-[10px] text-gray-400 block font-sans">โปรโตคอลการเชื่อมต่อ</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {peer.transport === 'bluetooth'
                      ? 'Bluetooth Low Energy (P2P ไร้เน็ต)'
                      : peer.transport === 'tcp'
                      ? 'TCP Sockets (LAN Fallback)'
                      : 'QUIC / UDP (0-RTT Multiplexing)'}
                  </span>
                </div>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  peer.transport === 'bluetooth'
                    ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                    : peer.transport === 'tcp'
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                }`}
              >
                {peer.transport === 'bluetooth' ? 'Offline BLE' : peer.transport === 'tcp' ? 'TCP' : 'QUIC 0-RTT'}
              </span>
            </div>

            {/* Bluetooth Details (if available or transport is bluetooth) */}
            {(peer.bluetooth_address || peer.transport === 'bluetooth') && (
              <div className="p-2.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 font-medium">
                    <Bluetooth className="w-3.5 h-3.5" />
                    <span>ข้อมูล Bluetooth Direct</span>
                  </div>
                  {peer.rssi !== undefined && peer.rssi !== null && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 font-mono text-blue-800 dark:text-blue-200 font-semibold">
                      RSSI: {peer.rssi} dBm
                    </span>
                  )}
                </div>
                <div className="mt-1 text-[11px] font-mono text-gray-600 dark:text-gray-300">
                  MAC: {peer.bluetooth_address || 'กำลังจับคู่ BLE Service'}
                </div>
              </div>
            )}

            {/* Local E2EE Public Key */}
            <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-gray-400 flex items-center gap-1 font-sans">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>X25519 Public Key (E2EE)</span>
                </span>
                <button
                  onClick={handleCopyKey}
                  className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  {copiedKey ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey ? 'คัดลอกแล้ว' : 'คัดลอกกุญแจ'}</span>
                </button>
              </div>
              <p className="font-mono text-[10px] text-gray-500 dark:text-gray-400 break-all bg-white dark:bg-[#1A1D24] p-1.5 rounded border border-gray-100 dark:border-gray-800 select-all">
                {peer.pubkey || 'ไม่ได้ระบุกุญแจ'}
              </p>
            </div>

            {/* Last Seen / Status */}
            <div className="flex items-center justify-between px-1 text-[11px] text-gray-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> สถานะเครื่อง:
              </span>
              <span className={`font-semibold ${peer.online ? 'text-emerald-500' : 'text-gray-500'}`}>
                {peer.online ? 'ออนไลน์ พร้อมสนทนา' : 'ไม่ได้เชื่อมต่อ'}
              </span>
            </div>
          </div>

          {/* Action Buttons (LINE Style: Chat, Voice Call, Video Call, Send File) */}
          <div className="w-full grid grid-cols-2 gap-2 mt-5">
            <button
              onClick={() => {
                onStartChat(peer);
                onClose();
              }}
              className="py-2.5 px-3 rounded-xl bg-line-green hover:bg-line-green-hover text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <MessageSquare className="w-4 h-4" />
              <span>เปิดแชท</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onStartCall?.(peer, 'audio');
              }}
              className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <Phone className="w-4 h-4" />
              <span>โทรด้วยเสียง</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onStartCall?.(peer, 'video');
              }}
              className="py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <Video className="w-4 h-4" />
              <span>วิดีโอคอล</span>
            </button>

            <button
              onClick={() => {
                onStartChat(peer);
                onClose();
                onSendFilePrompt?.(peer);
              }}
              className="py-2.5 px-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 border border-gray-200 dark:border-gray-700"
            >
              <FileUp className="w-4 h-4 text-line-green" />
              <span>ส่งไฟล์</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
