import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { PeerList } from './components/PeerList';
import { ChatWindow } from './components/ChatWindow';
import { SettingsModal } from './components/SettingsModal';
import { DeviceDetailModal } from './components/DeviceDetailModal';
import { CreateGroupModal } from './components/CreateGroupModal';
import { CallModal, CallSession } from './components/CallModal';
import { StatusModal } from './components/StatusModal';
import { AvatarModal } from './components/AvatarModal';
import { WallpaperModal } from './components/WallpaperModal';
import { UserGuideModal } from './components/UserGuideModal';
import { Peer, GroupChat, Message, UserProfile } from './types';

// Safely invoke Tauri commands if available, else fallback to mock for browser preview
const isTauri = () => typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

async function invokeTauri<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  if (isTauri()) {
    const { invoke } = await import('@tauri-apps/api/core');
    return invoke<T>(cmd, args);
  }
  // Mock fallback for browser dev preview
  console.warn(`[Tauri Mock] Invoke '${cmd}'`, args);
  if (cmd === 'get_my_profile') {
    const savedStatus = localStorage.getItem('craft_chat_my_status_text') || 'กำลังทำงาน ลุยโปรเจกต์ CraftChat';
    const savedSticker = localStorage.getItem('craft_chat_my_status_sticker') || 'fl_8819091';
    const savedAvatar = localStorage.getItem('craft_chat_my_avatar_url') || 'https://stickershop.line-scdn.net/stickershop/v1/sticker/52002734/iPhone/sticker_key@2x.png';
    const savedWallpaper = localStorage.getItem('craft_chat_my_chat_background') || '#ABC1D1';
    return {
      peer_id: 'local-node-1',
      display_name: 'My Computer (LAN Node)',
      port: 4242,
      pubkey: '3f9a9108b3e813f282490ec997bda5c1b69352e89694e9f78326099b28aef431',
      download_dir: '~/Downloads/CraftChat',
      ip_address: '192.168.1.100',
      status_text: savedStatus,
      status_sticker: savedSticker,
      avatar_url: savedAvatar,
      chat_background: savedWallpaper,
    } as T;
  }
  if (cmd === 'update_user_status') {
    if (args?.statusText !== undefined) {
      localStorage.setItem('craft_chat_my_status_text', args.statusText as string);
    }
    if (args?.statusSticker !== undefined) {
      localStorage.setItem('craft_chat_my_status_sticker', args.statusSticker as string);
    }
    return {} as T;
  }
  if (cmd === 'update_avatar') {
    if (args?.avatarUrl !== undefined) {
      localStorage.setItem('craft_chat_my_avatar_url', args.avatarUrl as string);
    }
    return {} as T;
  }
  if (cmd === 'update_chat_background') {
    if (args?.background !== undefined) {
      localStorage.setItem('craft_chat_my_chat_background', args.background as string);
    }
    return {} as T;
  }
  if (cmd === 'get_peers') {
    return [
      {
        peer_id: 'peer-alice',
        name: 'Alice (MacBook)',
        ip: '192.168.1.105',
        port: 4242,
        pubkey: 'a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90',
        online: true,
        unread_count: 1,
        last_message: 'สวัสดีครับ ส่งเอกสารให้แล้วนะ',
        last_message_time: '14:20',
        status_text: 'กำลังสนุก อารมณ์ดี 555',
        status_sticker: 'fl_8819089',
        avatar_url: 'https://stickershop.line-scdn.net/stickershop/v1/sticker/52002738/iPhone/sticker_key@2x.png',
        transport: 'quic',
      },
      {
        peer_id: 'peer-bob',
        name: 'Bob (ThinkPad)',
        ip: '192.168.1.112',
        port: 4242,
        pubkey: 'b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90a1',
        online: true,
        unread_count: 0,
        last_message: 'เรียบร้อยครับ ขอบคุณมาก',
        last_message_time: 'เมื่อวาน',
        status_text: 'กำลังทำงาน ปั่นโค้ด Rust',
        status_sticker: 'fl_8819091',
        avatar_url: 'https://stickershop.line-scdn.net/stickershop/v1/sticker/52002735/iPhone/sticker_key@2x.png',
        transport: 'bluetooth',
        bluetooth_address: 'F4:D4:88:5A:21:49',
        rssi: -58,
      },
    ] as T;
  }
  if (cmd === 'start_bluetooth_scan') {
    return true as T;
  }
  if (cmd === 'get_bluetooth_status') {
    return {
      adapter_present: true,
      is_scanning: false,
      discovered_peers: 1,
    } as T;
  }
  if (cmd === 'get_discovered_bt_peers') {
    return [
      {
        peer_id: 'peer-bob',
        name: 'Bob (ThinkPad)',
        address: 'F4:D4:88:5A:21:49',
        rssi: -58,
        pubkey: 'b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90a1',
        last_seen: Date.now(),
      },
    ] as T;
  }
  if (cmd === 'get_network_status') {
    return {
      quic_port: 4242,
      bluetooth_available: true,
      active_transport: 'quic',
      peer_count: 2,
    } as T;
  }
  if (cmd === 'get_groups') {
    return [
      {
        group_id: 'group-dev-team',
        name: 'ทีมพัฒนา CraftChat LAN',
        members: ['local-node-1', 'peer-alice', 'peer-bob'],
        created_at: '10:00',
        last_message: 'Bob: ระบบ Full-Mesh P2P พร้อมแล้วครับ!',
        last_message_time: '14:25',
        unread_count: 0,
      },
    ] as T;
  }
  if (cmd === 'create_group') {
    const name = (args?.name as string) || 'กลุ่มใหม่';
    const member_ids = (args?.memberIds as string[]) || [];
    return {
      group_id: 'group-' + Date.now(),
      name,
      members: ['local-node-1', ...member_ids],
      created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      last_message: 'สร้างกลุ่มเรียบร้อยแล้ว',
      last_message_time: 'เพิ่งสร้าง',
      unread_count: 0,
    } as T;
  }
  if (cmd === 'get_group_messages') {
    return [
      {
        id: 'grp-mock-1',
        sender_id: 'peer-alice',
        sender_name: 'Alice (MacBook)',
        recipient_id: '',
        group_id: 'group-dev-team',
        content: 'สวัสดีทุกคนในกลุ่มพัฒนา! ทุกคนได้ยินไหมครับ?',
        message_type: 'text',
        is_mine: false,
        created_at: '14:21',
      },
      {
        id: 'grp-mock-2',
        sender_id: 'peer-bob',
        sender_name: 'Bob (ThinkPad)',
        recipient_id: '',
        group_id: 'group-dev-team',
        content: 'brown_ok',
        message_type: 'sticker',
        is_mine: false,
        created_at: '14:23',
      },
      {
        id: 'grp-mock-3',
        sender_id: 'local-node-1',
        sender_name: 'My Computer',
        recipient_id: '',
        group_id: 'group-dev-team',
        content: 'ได้ยินชัดเจนครับ ทำงานผ่าน LAN 100% ไม่มีหลุดออกเน็ต!',
        message_type: 'text',
        is_mine: true,
        created_at: '14:24',
      },
    ] as T;
  }
  if (cmd === 'get_messages') {
    return [
      {
        id: 'mock-1',
        sender_id: 'peer-alice',
        recipient_id: 'local-node-1',
        content: 'สวัสดีครับ! ยินดีที่ได้เชื่อมต่อในวง LAN',
        message_type: 'text',
        is_mine: false,
        created_at: '14:18',
      },
      {
        id: 'mock-2',
        sender_id: 'peer-alice',
        recipient_id: 'local-node-1',
        content: 'brown_love',
        message_type: 'sticker',
        is_mine: false,
        created_at: '14:19',
      },
      {
        id: 'mock-3',
        sender_id: 'local-node-1',
        recipient_id: 'peer-alice',
        content: 'cony_happy',
        message_type: 'sticker',
        is_mine: true,
        created_at: '14:20',
      },
    ] as T;
  }
  return {} as T;
}

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chats' | 'peers' | 'settings'>('chats');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [peers, setPeers] = useState<Peer[]>([]);
  const [groups, setGroups] = useState<GroupChat[]>([]);
  const [selectedPeer, setSelectedPeer] = useState<Peer | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<GroupChat | null>(null);
  const [selectedPeerForDetails, setSelectedPeerForDetails] = useState<Peer | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isBluetoothScanning, setIsBluetoothScanning] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [wallpaperModalOpen, setWallpaperModalOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [activeCallSession, setActiveCallSession] = useState<CallSession | null>(null);

  const handleSaveAvatar = async (avatarUrl: string) => {
    try {
      await invokeTauri('update_avatar', { avatarUrl });
    } catch (err) {
      console.warn('Failed to update avatar in backend:', err);
    }
    setProfile((prev) => (prev ? { ...prev, avatar_url: avatarUrl } : null));
  };

  const handleSaveWallpaper = async (background: string) => {
    try {
      await invokeTauri('update_chat_background', { background });
    } catch (err) {
      console.warn('Failed to update chat background in backend:', err);
    }
    setProfile((prev) => (prev ? { ...prev, chat_background: background } : null));
  };

  const handleSaveStatus = async (statusText: string, statusSticker: string) => {
    try {
      await invokeTauri('update_user_status', { statusText, statusSticker });
    } catch (err) {
      console.warn('Failed to update status in backend:', err);
    }
    setProfile((prev) =>
      prev
        ? {
            ...prev,
            status_text: statusText,
            status_sticker: statusSticker,
          }
        : null
    );
  };

  // Toggle Dark Mode Class on Root
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Load Initial Profile, Peers, and Groups
  useEffect(() => {
    async function init() {
      try {
        const myProfile = await invokeTauri<UserProfile>('get_my_profile');
        setProfile(myProfile);

        const peerList = await invokeTauri<Peer[]>('get_peers');
        setPeers(peerList);

        const groupList = await invokeTauri<GroupChat[]>('get_groups');
        setGroups(groupList);

        if (peerList.length > 0 && !selectedPeer && !selectedGroup) {
          setSelectedPeer(peerList[0]);
        }
      } catch (err) {
        console.error('Failed to init profile/peers/groups:', err);
      }
    }
    init();
  }, []);

  // Listen to Tauri events (Peer discovered, New message, Call signal)
  useEffect(() => {
    let unlistenDiscovered: (() => void) | undefined;
    let unlistenMessage: (() => void) | undefined;
    let unlistenCall: (() => void) | undefined;

    if (isTauri()) {
      import('@tauri-apps/api/event').then(({ listen }) => {
        listen<Peer>('peer-discovered', (event) => {
          setPeers((prev) => {
            const index = prev.findIndex((p) => p.peer_id === event.payload.peer_id);
            if (index >= 0) {
              const updated = [...prev];
              updated[index] = { ...updated[index], ...event.payload, online: true };
              return updated;
            }
            return [...prev, { ...event.payload, online: true, unread_count: 0 }];
          });
        }).then((unsub) => {
          unlistenDiscovered = unsub;
        });

        listen<Message>('new-message', (event) => {
          const newMsg = event.payload;

          // Check if message belongs to current room
          if (
            (selectedGroup && newMsg.group_id === selectedGroup.group_id) ||
            (!selectedGroup && selectedPeer && newMsg.sender_id === selectedPeer.peer_id)
          ) {
            setMessages((prev) => [...prev, newMsg]);
          }

          // Update unread count and last_message for Peers or Groups
          if (newMsg.group_id) {
            setGroups((prev) =>
              prev.map((g) => {
                if (g.group_id === newMsg.group_id) {
                  return {
                    ...g,
                    last_message: `${newMsg.sender_name || 'เพื่อน'}: ${newMsg.content}`,
                    last_message_time: newMsg.created_at,
                    unread_count:
                      selectedGroup?.group_id === g.group_id ? 0 : g.unread_count + 1,
                  };
                }
                return g;
              })
            );
          } else {
            setPeers((prev) =>
              prev.map((p) => {
                if (p.peer_id === newMsg.sender_id) {
                  return {
                    ...p,
                    last_message: newMsg.content,
                    last_message_time: newMsg.created_at,
                    unread_count:
                      selectedPeer?.peer_id === p.peer_id ? 0 : p.unread_count + 1,
                  };
                }
                return p;
              })
            );
          }
        }).then((unsub) => {
          unlistenMessage = unsub;
        });

        listen<{ call_id: string; sender_id: string; signal_type: string; payload: string }>(
          'call-signal',
          (event) => {
            const { call_id, sender_id, signal_type, payload } = event.payload;
            if (signal_type === 'offer') {
              const callerPeer = peers.find((p) => p.peer_id === sender_id) || {
                peer_id: sender_id,
                name: sender_id,
                ip: 'LAN Node',
                port: 4242,
                pubkey: '',
                online: true,
                unread_count: 0,
              };
              const isVideo = payload.includes('video');
              setActiveCallSession({
                callId: call_id,
                peer: callerPeer,
                callType: isVideo ? 'video' : 'audio',
                status: 'incoming',
              });
            } else if (signal_type === 'answer') {
              setActiveCallSession((prev) => (prev ? { ...prev, status: 'connected' } : null));
            } else if (signal_type === 'hangup' || signal_type === 'reject') {
              setActiveCallSession(null);
            }
          }
        ).then((unsub) => {
          unlistenCall = unsub;
        });
      });
    }

    return () => {
      unlistenDiscovered?.();
      unlistenMessage?.();
      unlistenCall?.();
    };
  }, [selectedPeer, selectedGroup, peers]);

  // Fetch messages when selectedPeer changes
  useEffect(() => {
    if (!selectedPeer) return;

    invokeTauri<Message[]>('get_messages', { peerId: selectedPeer.peer_id })
      .then((msgs) => {
        setMessages(msgs || []);
        setPeers((prev) =>
          prev.map((p) =>
            p.peer_id === selectedPeer.peer_id ? { ...p, unread_count: 0 } : p
          )
        );
      })
      .catch((err) => console.error('Failed to get direct messages:', err));
  }, [selectedPeer]);

  // Fetch messages when selectedGroup changes
  useEffect(() => {
    if (!selectedGroup) return;

    invokeTauri<Message[]>('get_group_messages', { groupId: selectedGroup.group_id })
      .then((msgs) => {
        setMessages(msgs || []);
        setGroups((prev) =>
          prev.map((g) =>
            g.group_id === selectedGroup.group_id ? { ...g, unread_count: 0 } : g
          )
        );
      })
      .catch((err) => console.error('Failed to get group messages:', err));
  }, [selectedGroup]);

  const handleSelectPeer = (peer: Peer) => {
    setSelectedGroup(null);
    setSelectedPeer(peer);
  };

  const handleSelectGroup = (group: GroupChat) => {
    setSelectedPeer(null);
    setSelectedGroup(group);
  };

  const handleCreateGroup = async (name: string, memberIds: string[]) => {
    try {
      const newGroup = await invokeTauri<GroupChat>('create_group', {
        name,
        memberIds,
      });
      setGroups((prev) => [newGroup, ...prev]);
      handleSelectGroup(newGroup);
    } catch (err) {
      console.error('Failed to create group:', err);
    }
  };

  const handleSendMessage = async (
    content: string,
    replyToId?: string | null,
    messageType: Message['message_type'] = 'text'
  ) => {
    if (!profile) return;

    if (selectedGroup) {
      // Send to Group Chat (Full-Mesh Fan-out)
      const optimisticMsg: Message = {
        id: 'msg-' + Date.now(),
        sender_id: profile.peer_id,
        sender_name: profile.display_name,
        recipient_id: '',
        group_id: selectedGroup.group_id,
        content,
        message_type: messageType,
        reply_to_id: replyToId,
        reply_message: replyToId
          ? {
              sender_name:
                messages.find((m) => m.id === replyToId)?.sender_name ||
                profile.display_name,
              content: messages.find((m) => m.id === replyToId)?.content || '',
            }
          : null,
        is_mine: true,
        created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sent',
      };

      setMessages((prev) => [...prev, optimisticMsg]);
      setGroups((prev) =>
        prev.map((g) =>
          g.group_id === selectedGroup.group_id
            ? { ...g, last_message: `คุณ: ${content}`, last_message_time: optimisticMsg.created_at }
            : g
        )
      );

      try {
        await invokeTauri('send_message', {
          recipientId: '',
          groupId: selectedGroup.group_id,
          content,
          replyToId,
          messageType,
        });
      } catch (err) {
        console.error('Failed to send group message:', err);
      }
    } else if (selectedPeer) {
      // Send 1-on-1 Direct Message
      const optimisticMsg: Message = {
        id: 'msg-' + Date.now(),
        sender_id: profile.peer_id,
        recipient_id: selectedPeer.peer_id,
        content,
        message_type: messageType,
        reply_to_id: replyToId,
        reply_message: replyToId
          ? {
              sender_name:
                messages.find((m) => m.id === replyToId)?.sender_id === profile.peer_id
                  ? profile.display_name
                  : selectedPeer.name,
              content: messages.find((m) => m.id === replyToId)?.content || '',
            }
          : null,
        is_mine: true,
        created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sent',
      };

      setMessages((prev) => [...prev, optimisticMsg]);
      setPeers((prev) =>
        prev.map((p) =>
          p.peer_id === selectedPeer.peer_id
            ? { ...p, last_message: content, last_message_time: optimisticMsg.created_at }
            : p
        )
      );

      try {
        await invokeTauri('send_message', {
          recipientId: selectedPeer.peer_id,
          groupId: null,
          content,
          replyToId,
          messageType,
        });
      } catch (err) {
        console.error('Failed to send message:', err);
      }
    }
  };

  const handleSendFile = async (filePath: string, fileType: 'image' | 'file') => {
    if (!selectedPeer) return;
    try {
      await invokeTauri('send_file', {
        recipientId: selectedPeer.peer_id,
        filePath,
        fileType,
      });
    } catch (err) {
      console.error('Failed to send file:', err);
    }
  };

  const handleOpenFileLocation = async (path: string) => {
    try {
      await invokeTauri('open_file_location', { path });
    } catch (err) {
      console.error('Failed to open file location:', err);
    }
  };

  const handleRefreshDiscovery = async () => {
    setIsScanning(true);
    try {
      await invokeTauri('refresh_discovery');
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setIsScanning(false), 1500);
    }
  };

  const handleStartBluetoothScan = async () => {
    setIsBluetoothScanning(true);
    try {
      await invokeTauri('start_bluetooth_scan');
      setTimeout(async () => {
        try {
          const updatedPeers = await invokeTauri<Peer[]>('get_peers');
          setPeers(updatedPeers);
        } catch (e) {
          console.error('Failed to get peers after BT scan:', e);
        } finally {
          setIsBluetoothScanning(false);
        }
      }, 2500);
    } catch (err) {
      console.warn('Bluetooth scan error:', err);
      setIsBluetoothScanning(false);
    }
  };

  const handleSaveProfile = async (name: string, port: number, downloadDir: string) => {
    try {
      await invokeTauri('update_profile', { displayName: name, port, downloadDir });
      setProfile((prev) =>
        prev ? { ...prev, display_name: name, port, download_dir: downloadDir } : null
      );
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  const handleStartCall = async (peer: Peer, callType: 'audio' | 'video') => {
    const callId = 'call-' + Date.now();
    setActiveCallSession({
      callId,
      peer,
      callType,
      status: 'calling',
    });

    try {
      await invokeTauri('send_call_signal', {
        recipientId: peer.peer_id,
        callId,
        signalType: 'offer',
        payload: JSON.stringify({ type: 'offer', callType }),
      });
    } catch (err) {
      console.warn('Call signaling:', err);
    }

    if (!isTauri()) {
      setTimeout(() => {
        setActiveCallSession((prev) => (prev ? { ...prev, status: 'connected' } : null));
      }, 2500);
    }
  };

  const handleAcceptCall = async () => {
    if (!activeCallSession) return;
    setActiveCallSession((prev) => (prev ? { ...prev, status: 'connected' } : null));
    try {
      await invokeTauri('send_call_signal', {
        recipientId: activeCallSession.peer.peer_id,
        callId: activeCallSession.callId,
        signalType: 'answer',
        payload: JSON.stringify({ type: 'answer' }),
      });
    } catch (err) {
      console.warn(err);
    }
  };

  const handleRejectCall = async () => {
    if (!activeCallSession) return;
    try {
      await invokeTauri('send_call_signal', {
        recipientId: activeCallSession.peer.peer_id,
        callId: activeCallSession.callId,
        signalType: 'reject',
        payload: JSON.stringify({ type: 'reject' }),
      });
    } catch (err) {
      console.warn(err);
    }
    setActiveCallSession(null);
  };

  const handleEndCall = async () => {
    if (!activeCallSession) return;
    try {
      await invokeTauri('send_call_signal', {
        recipientId: activeCallSession.peer.peer_id,
        callId: activeCallSession.callId,
        signalType: 'hangup',
        payload: JSON.stringify({ type: 'hangup' }),
      });
    } catch (err) {
      console.warn(err);
    }
    setActiveCallSession(null);
  };

  const handleViewMyProfile = () => {
    if (!profile) return;
    setSelectedPeerForDetails({
      peer_id: profile.peer_id,
      name: `${profile.display_name} (เครื่องของคุณ)`,
      ip: profile.ip_address || '127.0.0.1',
      port: profile.port,
      pubkey: profile.pubkey,
      online: true,
      unread_count: 0,
      status_text: profile.status_text,
      status_sticker: profile.status_sticker,
      avatar_url: profile.avatar_url,
    });
  };

  const unreadTotal =
    peers.reduce((sum, p) => sum + p.unread_count, 0) +
    groups.reduce((sum, g) => sum + g.unread_count, 0);
  const onlinePeerCount = peers.filter((p) => p.online).length;

  return (
    <div className="flex h-screen h-[100dvh] w-screen overflow-hidden antialiased bg-gray-100 dark:bg-[#181B20] relative">
      {/* 1. Left Navigation Bar (LINE PC Desktop Sidebar + Mobile Bottom Tab Bar) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        profile={profile}
        unreadTotal={unreadTotal}
        onlinePeerCount={onlinePeerCount}
        onOpenSettings={() => setSettingsOpen(true)}
        onViewMyProfile={handleViewMyProfile}
        onOpenStatusModal={() => setStatusModalOpen(true)}
        onOpenAvatarModal={() => setAvatarModalOpen(true)}
        onOpenGuide={() => setGuideOpen(true)}
        isChatActive={!!selectedPeer || !!selectedGroup}
      />

      {/* 2. Middle Peer/Group List */}
      <div className={`h-full ${selectedPeer || selectedGroup ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-shrink-0`}>
        <PeerList
          peers={peers}
          groups={groups}
          selectedPeer={selectedPeer}
          selectedGroup={selectedGroup}
          profile={profile}
          onSelectPeer={handleSelectPeer}
          onSelectGroup={handleSelectGroup}
          onViewDeviceDetails={(peer) => setSelectedPeerForDetails(peer)}
          onRefreshDiscovery={handleRefreshDiscovery}
          onOpenCreateGroup={() => setCreateGroupOpen(true)}
          onOpenStatusModal={() => setStatusModalOpen(true)}
          onOpenAvatarModal={() => setAvatarModalOpen(true)}
          onStartBluetoothScan={handleStartBluetoothScan}
          isScanning={isScanning}
          isBluetoothScanning={isBluetoothScanning}
          sidebarTab={activeTab}
        />
      </div>

      {/* 3. Right Chat Window */}
      <div className={`h-full flex-1 ${selectedPeer || selectedGroup ? 'flex fixed inset-0 z-30 md:static md:z-auto' : 'hidden md:flex'}`}>
        <ChatWindow
          peer={selectedPeer}
          group={selectedGroup}
          messages={messages}
          chatBackground={profile?.chat_background || '#ABC1D1'}
          onSendMessage={handleSendMessage}
          onSendFile={handleSendFile}
          onOpenFileLocation={handleOpenFileLocation}
          onViewDeviceDetails={(peer) => setSelectedPeerForDetails(peer)}
          onStartCall={handleStartCall}
          onOpenWallpaperModal={() => setWallpaperModalOpen(true)}
          onBack={() => {
            setSelectedPeer(null);
            setSelectedGroup(null);
          }}
        />
      </div>

      {/* User Status with Sticker Modal (LINE PC Style) */}
      <StatusModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        profile={profile}
        onSaveStatus={handleSaveStatus}
      />

      {/* Avatar Customization Modal */}
      <AvatarModal
        isOpen={avatarModalOpen}
        onClose={() => setAvatarModalOpen(false)}
        currentAvatar={profile?.avatar_url}
        displayName={profile?.display_name || 'My Computer'}
        onSaveAvatar={handleSaveAvatar}
      />

      {/* Chat Wallpaper Customization Modal */}
      <WallpaperModal
        isOpen={wallpaperModalOpen}
        onClose={() => setWallpaperModalOpen(false)}
        currentBackground={profile?.chat_background || '#ABC1D1'}
        onSaveBackground={handleSaveWallpaper}
      />

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={createGroupOpen}
        onClose={() => setCreateGroupOpen(false)}
        peers={peers}
        onCreateGroup={handleCreateGroup}
      />

      {/* Voice & Video Call Modal (LINE PC Style) */}
      <CallModal
        session={activeCallSession}
        onAcceptCall={handleAcceptCall}
        onRejectCall={handleRejectCall}
        onEndCall={handleEndCall}
      />

      {/* Device Details Modal */}
      <DeviceDetailModal
        isOpen={!!selectedPeerForDetails}
        onClose={() => setSelectedPeerForDetails(null)}
        peer={selectedPeerForDetails}
        onStartChat={(peer) => {
          handleSelectPeer(peer);
          setActiveTab('chats');
        }}
        onSendFilePrompt={(peer) => {
          handleSelectPeer(peer);
          setActiveTab('chats');
        }}
        onOpenStatusModal={() => {
          setSelectedPeerForDetails(null);
          setStatusModalOpen(true);
        }}
        onStartCall={handleStartCall}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        profile={profile}
        onSaveProfile={handleSaveProfile}
        onOpenStatusModal={() => {
          setSettingsOpen(false);
          setStatusModalOpen(true);
        }}
        onOpenAvatarModal={() => {
          setSettingsOpen(false);
          setAvatarModalOpen(true);
        }}
        onOpenGuide={() => {
          setSettingsOpen(false);
          setGuideOpen(true);
        }}
      />

      {/* In-App Interactive User Guide & Manual Modal */}
      <UserGuideModal
        isOpen={guideOpen}
        onClose={() => setGuideOpen(false)}
      />
    </div>
  );
};

export default App;
