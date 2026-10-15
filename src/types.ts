export type NetworkTransport = 'quic' | 'tcp' | 'bluetooth';

export interface Peer {
  peer_id: string;
  name: string;
  ip: string;
  port: number;
  pubkey: string;
  online: boolean;
  unread_count: number;
  last_message?: string;
  last_message_time?: string;
  status_text?: string;
  status_sticker?: string;
  avatar_url?: string;
  transport?: NetworkTransport;
  bluetooth_address?: string;
  rssi?: number; // signal strength in dBm (-30 to -90)
}

export interface NetworkStatus {
  quic_active: boolean;
  tcp_active: boolean;
  bluetooth_available: boolean;
  bluetooth_status: string;
  internet_connected: boolean;
  default_transport: NetworkTransport;
}

export interface DiscoveredBtPeer {
  peer_id: string;
  name: string;
  address: string;
  rssi?: number;
  pubkey: string;
  status_text?: string;
  status_sticker?: string;
}

export interface GroupChat {
  group_id: string;
  name: string;
  members: string[]; // list of peer_ids
  created_at: string;
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
}

export type MessageType = 'text' | 'image' | 'file' | 'sticker';

export interface Message {
  id: string;
  sender_id: string;
  sender_name?: string;
  recipient_id: string;
  group_id?: string | null;
  content: string;
  message_type: MessageType;
  sticker_id?: string;
  file_name?: string;
  file_path?: string;
  file_size?: number;
  reply_to_id?: string | null;
  reply_message?: {
    sender_name: string;
    content: string;
  } | null;
  is_mine: boolean;
  created_at: string;
  status?: 'sending' | 'sent' | 'delivered' | 'failed';
}

export interface UserProfile {
  peer_id: string;
  display_name: string;
  port: number;
  pubkey: string;
  download_dir: string;
  ip_address?: string;
  status_text?: string;
  status_sticker?: string;
  avatar_url?: string;
  chat_background?: string;
}

export interface FileTransferProgress {
  transfer_id: string;
  file_name: string;
  total_bytes: number;
  transferred_bytes: number;
  percent: number;
  direction: 'inbound' | 'outbound';
  is_done: boolean;
  error?: string;
}
