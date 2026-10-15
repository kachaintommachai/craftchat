import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Send,
  Paperclip,
  Image as ImageIcon,
  Reply,
  X,
  FileText,
  CheckCheck,
  Download,
  FolderOpen,
  Lock,
  Smile,
  Crop,
  Phone,
  Video,
  Users,
  Shield,
  Palette,
  Zap,
  Bluetooth,
  ChevronLeft,
} from 'lucide-react';
import { Peer, GroupChat, Message, MessageType } from '../types';
import { StickerPicker, getStickerById, predictStickers } from './Stickers';
import { StickerSuggestionBar } from './StickerSuggestionBar';
import { ScreenCaptureModal } from './ScreenCaptureModal';
import { Avatar } from './Avatar';

interface ChatWindowProps {
  peer: Peer | null;
  group: GroupChat | null;
  messages: Message[];
  chatBackground?: string;
  onSendMessage: (content: string, replyToId?: string | null, messageType?: MessageType) => void;
  onSendFile: (filePath: string, fileType: 'image' | 'file') => void;
  onOpenFileLocation: (filePath: string) => void;
  onViewDeviceDetails?: (peer: Peer) => void;
  onStartCall?: (peer: Peer, callType: 'audio' | 'video') => void;
  onOpenWallpaperModal?: () => void;
  onBack?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  peer,
  group,
  messages,
  chatBackground,
  onSendMessage,
  onOpenFileLocation,
  onViewDeviceDetails,
  onStartCall,
  onOpenWallpaperModal,
  onBack,
}) => {
  const [inputText, setInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isStickerPickerOpen, setIsStickerPickerOpen] = useState(false);
  const [isCaptureModalOpen, setIsCaptureModalOpen] = useState(false);
  const [dismissedKeyword, setDismissedKeyword] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const activeTargetName = group ? group.name : peer ? peer.name : '';

  // Predictive Sticker Suggestions (เดาสติ๊กเกอร์จากข้อความที่พิมพ์ เช่น โกรธ, รัก, ขอบคุณ)
  const suggestions = useMemo(() => {
    const trimmed = inputText.trim();
    if (!trimmed || trimmed === dismissedKeyword) return [];
    return predictStickers(trimmed);
  }, [inputText, dismissedKeyword]);

  // Reset dismissedKeyword when input text changes
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputText(val);
    if (dismissedKeyword && !val.includes(dismissedKeyword)) {
      setDismissedKeyword('');
    }
  };

  const handleSelectSuggestedSticker = (stickerId: string) => {
    handleSendSticker(stickerId);
    setInputText('');
    setDismissedKeyword('');
  };

  // Auto scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim() || (!peer && !group)) return;
    onSendMessage(inputText.trim(), replyingTo?.id || null, 'text');
    setInputText('');
    setReplyingTo(null);
  };

  const handleSendSticker = (stickerId: string) => {
    if (!peer && !group) return;
    onSendMessage(stickerId, replyingTo?.id || null, 'sticker');
    setReplyingTo(null);
    setIsStickerPickerOpen(false);
  };

  const handleSendCapturedImage = (dataUrl: string) => {
    if (!peer && !group) return;
    onSendMessage(dataUrl, replyingTo?.id || null, 'image');
    setReplyingTo(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (!peer && !group) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-[#181B20] text-gray-400 select-none">
        <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg border-2 border-line-green/30 mb-3 bg-white dark:bg-gray-800 p-1 flex items-center justify-center">
          <img src="/craftchat.png" alt="CraftChat Logo" className="w-full h-full object-cover rounded-xl" />
        </div>
        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">
          CraftChat - LAN Peer-to-Peer
        </h3>
        <p className="text-xs text-gray-400 mt-1 max-w-sm text-center">
          เลือกรายชื่อเครื่องหรือกลุ่มในแถบซ้ายมือเพื่อเริ่มการแชทหรือส่งไฟล์โดยตรงผ่านระบบเข้ารหัส E2EE
        </p>
      </div>
    );
  }

  const getChatBgStyle = (): React.CSSProperties => {
    if (!chatBackground) return {};
    if (chatBackground.startsWith('data:image') || chatBackground.startsWith('http') || chatBackground.startsWith('/')) {
      return {
        backgroundImage: `url(${chatBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      };
    }
    if (chatBackground.startsWith('linear-gradient')) {
      return { backgroundImage: chatBackground };
    }
    return { backgroundColor: chatBackground };
  };

  return (
    <div
      className="flex-1 flex flex-col h-full bg-[#ABC1D1] dark:bg-[#181B20] transition-colors relative"
      style={getChatBgStyle()}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
      }}
    >
      {/* Drag & Drop File Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-line-green/80 backdrop-blur-sm flex flex-col items-center justify-center text-white border-4 border-dashed border-white m-4 rounded-2xl pointer-events-none">
          <Download className="w-16 h-16 mb-2 animate-bounce" />
          <p className="text-lg font-bold">วางไฟล์ที่นี่เพื่อส่งไปยัง {activeTargetName}</p>
          <p className="text-xs opacity-90">ส่งไฟล์ตรงผ่านเครือข่ายแลน (Direct P2P Streaming)</p>
        </div>
      )}

      {/* Top Chat Header */}
      <div className="h-14 px-3 sm:px-4 bg-white/90 dark:bg-[#20242B]/90 backdrop-blur border-b border-gray-200 dark:border-gray-800 flex items-center justify-between z-10 select-none shadow-sm pt-[env(safe-area-inset-top)]">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-1.5 -ml-1 text-gray-700 dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center flex-shrink-0"
              title="ย้อนกลับ"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {group ? (
            /* Group Header */
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-sm ring-1 ring-line-green/30 flex-shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-gray-800 dark:text-gray-100 truncate">
                    {group.name}
                  </h3>
                  <span className="hidden sm:flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded font-mono font-semibold">
                    <Shield className="w-2.5 h-2.5" /> Full-Mesh E2EE
                  </span>
                </div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                  {group.members.length} สมาชิกในกลุ่ม • P2P Multi-cast
                </p>
              </div>
            </div>
          ) : peer ? (
            /* Direct Peer Header */
            <div
              onClick={() => onViewDeviceDetails?.(peer)}
              className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group/header hover:opacity-90 transition-opacity min-w-0"
              title="คลิกที่ไอคอนคนเพื่อดูชื่อเครื่องและรายละเอียดอุปกรณ์"
            >
            <Avatar
              name={peer.name}
              avatarUrl={peer.avatar_url}
              size="sm"
              online={peer.online}
              statusSticker={peer.status_sticker}
            />

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 min-w-0 flex-wrap sm:flex-nowrap">
                <h3 className="text-xs font-bold text-gray-800 dark:text-gray-100 group-hover/header:text-line-green transition-colors truncate max-w-[110px] sm:max-w-none">
                  {peer.name}
                </h3>
                {peer.status_sticker && (
                  <div className="w-4 h-4 flex items-center justify-center flex-shrink-0" title={peer.status_text || 'สถานะ'}>
                    {getStickerById(peer.status_sticker)?.render(16)}
                  </div>
                )}
                {peer.status_text && (
                  <span className="hidden md:inline-block text-[10px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 px-2 py-0.2 rounded-full font-medium truncate max-w-[120px]">
                    {peer.status_text}
                  </span>
                )}
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded font-mono flex-shrink-0">
                  <Lock className="w-2.5 h-2.5" /> E2EE
                </span>
                {peer.transport === 'bluetooth' ? (
                  <span className="inline-flex items-center gap-0.5 text-[9px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60 px-1.5 py-0.5 rounded font-mono font-semibold flex-shrink-0" title="เชื่อมต่อผ่าน Bluetooth Low Energy (ไร้เน็ต)">
                    <Bluetooth className="w-2.5 h-2.5" /> <span className="hidden sm:inline">BT Proximity {peer.rssi !== undefined && peer.rssi !== null ? `(${peer.rssi}dBm)` : ''}</span>
                  </span>
                ) : peer.transport === 'tcp' ? (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded font-mono flex-shrink-0" title="TCP Fallback">
                    TCP
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 text-[9px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 px-1.5 py-0.5 rounded font-mono font-semibold flex-shrink-0" title="QUIC 0-RTT Stream Multiplexing over UDP">
                    <Zap className="w-2.5 h-2.5 fill-amber-500 text-amber-500" /> <span className="hidden sm:inline">QUIC</span>
                  </span>
                )}
              </div>
              <p className="text-[10px] font-mono text-gray-500 dark:text-gray-400 truncate max-w-[120px] sm:max-w-none">
                {peer.transport === 'bluetooth'
                  ? `Bluetooth: ${peer.bluetooth_address || 'P2P BLE'}`
                  : `IP: ${peer.ip}:${peer.port}`}
              </p>
            </div>
          </div>
        ) : null}
        </div>

        {/* Header Actions - Always visible on mobile with flex-shrink-0 */}
        <div className="flex items-center gap-1 sm:gap-1.5 text-gray-500 flex-shrink-0">
          {peer && (
            <>
              {/* Audio Call Button */}
              <button
                onClick={() => onStartCall?.(peer, 'audio')}
                className="p-2 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-line-green rounded-xl transition-all shadow-2xs active:scale-95 flex items-center justify-center flex-shrink-0"
                title="โทรด้วยเสียงในวง LAN (Voice Call)"
              >
                <Phone className="w-4 h-4" />
              </button>

              {/* Video Call Button */}
              <button
                onClick={() => onStartCall?.(peer, 'video')}
                className="p-2 bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-600 dark:text-teal-400 rounded-xl transition-all shadow-2xs active:scale-95 flex items-center justify-center flex-shrink-0"
                title="วิดีโอคอลในวง LAN (Video Call)"
              >
                <Video className="w-4 h-4" />
              </button>

              {/* Folder Location Button (Desktop only) */}
              <button
                onClick={() => onOpenFileLocation(peer.peer_id)}
                className="hidden md:flex p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300 hover:text-line-green transition-colors"
                title="เปิดโฟลเดอร์ไฟล์ดาวน์โหลด"
              >
                <FolderOpen className="w-4 h-4" />
              </button>
            </>
          )}

          {onOpenWallpaperModal && (
            <button
              onClick={onOpenWallpaperModal}
              className="hidden sm:flex p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300 hover:text-line-green transition-colors"
              title="เปลี่ยนภาพพื้นหลังแชท (Chat Wallpaper)"
            >
              <Palette className="w-4 h-4" />
            </button>
          )}

          {group && (
            <div className="flex items-center gap-1">
              <span className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-line-green font-semibold flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>กลุ่ม {group.members.length} เครื่อง</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Message List (Scrollable Area) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 select-none">
            <div className="bg-white/80 dark:bg-gray-800/80 px-4 py-2 rounded-full shadow-sm text-xs backdrop-blur">
              เริ่มการสนทนาที่ปลอดภัยกับ <span className="font-bold">{activeTargetName}</span>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.is_mine;
            const isGroupMsg = !!group || !!msg.group_id;

            return (
              <div
                key={msg.id}
                className={`flex flex-col group ${isMine ? 'items-end' : 'items-start'}`}
              >
                {/* Sender Name in Group Chat */}
                {!isMine && isGroupMsg && (
                  <div className="flex items-center gap-1.5 ml-1 mb-1">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-[8px] font-bold text-white">
                      {(msg.sender_name || 'U').slice(0, 1).toUpperCase()}
                    </div>
                    <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                      {msg.sender_name || 'สมาชิกในกลุ่ม'}
                    </span>
                  </div>
                )}

                {/* Bubble Container */}
                <div
                  className={`flex items-end gap-1.5 max-w-[75%] ${
                    isMine ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  {/* Reply Button on Hover */}
                  <button
                    onClick={() => setReplyingTo(msg)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-line-green rounded bg-white/70 dark:bg-gray-800/70 shadow-sm transition-opacity"
                    title="ตอบกลับข้อความนี้ (Reply)"
                  >
                    <Reply className="w-3.5 h-3.5" />
                  </button>

                  {/* The Message Bubble or Sticker */}
                  <div
                    className={`relative select-text transition-all ${
                      msg.message_type === 'sticker'
                        ? 'p-0 bg-transparent shadow-none'
                        : `rounded-2xl px-3.5 py-2 shadow-sm text-xs ${
                            isMine
                              ? 'bg-line-bubble-me dark:bg-line-bubble-me-dark text-gray-900 dark:text-white rounded-br-none'
                              : 'bg-line-bubble dark:bg-line-bubble-dark text-gray-900 dark:text-gray-100 rounded-bl-none'
                          }`
                    }`}
                  >
                    {/* Reply Quoted Preview */}
                    {msg.reply_message && (
                      <div className="mb-2 p-1.5 rounded bg-black/5 dark:bg-white/10 border-l-2 border-line-green text-[11px]">
                        <span className="font-bold text-emerald-800 dark:text-emerald-300 block">
                          {msg.reply_message.sender_name}
                        </span>
                        <p className="truncate opacity-80">{msg.reply_message.content}</p>
                      </div>
                    )}

                    {/* Content: Sticker */}
                    {msg.message_type === 'sticker' && (
                      <div className="flex flex-col items-center group/sticker">
                        <div className="transition-transform hover:scale-105 duration-200 cursor-pointer drop-shadow-md">
                          {getStickerById(msg.content)?.render(120) || (
                            <div className="p-3 bg-white/90 dark:bg-gray-800 rounded-2xl shadow-sm text-xs flex items-center gap-1.5 border border-gray-200 dark:border-gray-700">
                              <Smile className="w-4 h-4 text-line-green" />
                              <span>สติกเกอร์ {msg.content}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Content: Text / Image / File */}
                    {msg.message_type === 'text' && (
                      <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
                    )}

                    {msg.message_type === 'image' && (
                      <div className="flex flex-col gap-1">
                        <img
                          src={msg.file_path || (msg.content.startsWith('data:image') ? msg.content : '')}
                          alt="Captured or attached media"
                          className="max-h-64 rounded-xl object-contain cursor-pointer hover:opacity-95 shadow-md border border-black/5 dark:border-white/10 bg-black/10"
                          onClick={() => {
                            if (msg.file_path) {
                              onOpenFileLocation(msg.file_path);
                            } else if (msg.content.startsWith('data:image')) {
                              const w = window.open('');
                              w?.document.write(`<img src="${msg.content}" style="max-width:100%; height:auto;" />`);
                            }
                          }}
                        />
                        {msg.content && !msg.content.startsWith('data:image') && <p className="mt-1">{msg.content}</p>}
                      </div>
                    )}

                    {msg.message_type === 'file' && (
                      <div className="flex items-center gap-3 p-1">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 dark:bg-emerald-400/20 flex items-center justify-center text-line-green">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold truncate text-xs">{msg.file_name || 'ไฟล์เอกสาร'}</p>
                          <p className="text-[10px] opacity-70">{formatFileSize(msg.file_size)}</p>
                        </div>
                        <button
                          onClick={() => msg.file_path && onOpenFileLocation(msg.file_path)}
                          className="p-1.5 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 transition-colors"
                          title="เปิดตำแหน่งไฟล์"
                        >
                          <FolderOpen className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Metadata: Time & Read status */}
                  <div
                    className={`flex flex-col text-[10px] text-gray-500 dark:text-gray-400 mb-0.5 select-none ${
                      isMine ? 'items-end' : 'items-start'
                    }`}
                  >
                    {isMine && (
                      <span className="text-[9px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center">
                        <CheckCheck className="w-3 h-3 inline mr-0.5" /> ส่งแล้ว
                      </span>
                    )}
                    <span>{msg.created_at}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Banner */}
      {replyingTo && (
        <div className="bg-white/95 dark:bg-[#20242B]/95 border-t border-gray-200 dark:border-gray-800 px-4 py-2 flex items-center justify-between text-xs z-20 backdrop-blur">
          <div className="flex items-center gap-2 truncate">
            <Reply className="w-4 h-4 text-line-green flex-shrink-0" />
            <span className="text-gray-400">ตอบกลับ:</span>
            <span className="text-gray-800 dark:text-gray-200 truncate font-medium">
              {replyingTo.content}
            </span>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input Toolbar & Area */}
      <div className="bg-white dark:bg-[#20242B] border-t border-gray-200 dark:border-gray-800 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] select-none">
        {/* Formatting / Media Action Buttons */}
        <div className="flex items-center gap-1 mb-2 text-gray-500">
          <button
            type="button"
            onClick={() => setIsStickerPickerOpen((prev) => !prev)}
            className={`p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors ${
              isStickerPickerOpen ? 'text-line-green bg-emerald-50 dark:bg-emerald-950/40' : ''
            }`}
            title="ส่งสติกเกอร์แสดงอารมณ์ (LINE Stickers)"
          >
            <Smile className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => setIsCaptureModalOpen(true)}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg hover:text-line-green transition-colors"
            title="จับภาพหน้าจอและวาดเส้น (Screen Capture & Draw)"
          >
            <Crop className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg hover:text-line-green transition-colors"
            title="ส่งรูปภาพ"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg hover:text-line-green transition-colors"
            title="ส่งไฟล์เอกสาร"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Hidden HTML File Inputs */}
          <input
            type="file"
            ref={imageInputRef}
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                  if (typeof reader.result === 'string') {
                    onSendMessage(reader.result, replyingTo?.id || null, 'image');
                    setReplyingTo(null);
                  }
                };
                reader.readAsDataURL(file);
              }
            }}
          />
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                // In browser dev mode, send file mock
                onSendMessage(`ไฟล์: ${file.name} (${formatFileSize(file.size)})`, replyingTo?.id || null, 'file');
                setReplyingTo(null);
              }
            }}
          />
        </div>

        {/* Text Input Box */}
        <div className="flex items-end gap-2">
          <textarea
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={group ? `ส่งข้อความถึงกลุ่ม ${group.name}...` : `ส่งข้อความถึง ${peer?.name}...`}
            rows={2}
            className="flex-1 bg-transparent text-sm sm:text-xs text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none resize-none leading-relaxed"
          />

          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="p-2 bg-line-green hover:bg-line-green-hover disabled:opacity-40 disabled:hover:bg-line-green text-white rounded-xl shadow-sm transition-all"
            title="ส่งข้อความ (Enter)"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Predictive Sticker Suggestions (เดาสติ๊กเกอร์จากข้อความที่พิมพ์ เช่น โกรธ, รัก, ขอบคุณ) */}
      <StickerSuggestionBar
        suggestions={suggestions}
        keyword={inputText.trim()}
        onSelectSticker={handleSelectSuggestedSticker}
        onDismiss={() => setDismissedKeyword(inputText.trim())}
      />

      {/* Floating Sticker Picker Popup */}
      <StickerPicker
        isOpen={isStickerPickerOpen}
        onClose={() => setIsStickerPickerOpen(false)}
        onSelectSticker={handleSendSticker}
      />

      {/* Screen Capture & Drawing Modal */}
      <ScreenCaptureModal
        isOpen={isCaptureModalOpen}
        onClose={() => setIsCaptureModalOpen(false)}
        onSendCapturedImage={handleSendCapturedImage}
      />
    </div>
  );
};
