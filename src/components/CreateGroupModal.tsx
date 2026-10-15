import React, { useState } from 'react';
import { X, Users, Search, Check, Shield } from 'lucide-react';
import { Peer } from '../types';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  peers: Peer[];
  onCreateGroup: (name: string, memberIds: string[]) => void;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  peers,
  onCreateGroup,
}) => {
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeerIds, setSelectedPeerIds] = useState<string[]>([]);

  if (!isOpen) return null;

  const filteredPeers = peers.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.ip.includes(searchQuery)
  );

  const togglePeer = (peerId: string) => {
    setSelectedPeerIds((prev) =>
      prev.includes(peerId) ? prev.filter((id) => id !== peerId) : [...prev, peerId]
    );
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || selectedPeerIds.length === 0) return;
    onCreateGroup(groupName.trim(), selectedPeerIds);
    setGroupName('');
    setSelectedPeerIds([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-[#20242B] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-line-green">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">
                สร้างกลุ่มแชทในวง LAN
              </h3>
              <p className="text-[11px] text-gray-400">P2P Decentralized Group Chat</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleCreate} className="flex-1 flex flex-col overflow-hidden p-5 gap-4">
          {/* Group Name Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              ชื่อกลุ่ม <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={40}
              placeholder="เช่น ทีมพัฒนา CraftChat, แผนกเน็ตเวิร์ก..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:border-line-green dark:focus:border-line-green transition-colors"
            />
          </div>

          {/* Member Selection Section */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                เลือกสมาชิกในกลุ่ม
              </label>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                เลือกแล้ว {selectedPeerIds.length} คน
              </span>
            </div>

            {/* Search filter */}
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหาเพื่อนใน LAN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:border-line-green transition-colors"
              />
            </div>

            {/* Peer List with Checkboxes */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800/60 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-900/30">
              {filteredPeers.length === 0 ? (
                <div className="p-4 text-center text-xs text-gray-400">
                  ไม่พบอุปกรณ์อื่นในวงแลน
                </div>
              ) : (
                filteredPeers.map((peer) => {
                  const isChecked = selectedPeerIds.includes(peer.peer_id);
                  return (
                    <div
                      key={peer.peer_id}
                      onClick={() => togglePeer(peer.peer_id)}
                      className={`flex items-center justify-between p-2.5 cursor-pointer hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-colors ${
                        isChecked ? 'bg-emerald-50/80 dark:bg-emerald-950/30' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm flex-shrink-0">
                          {peer.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">
                            {peer.name}
                          </p>
                          <p className="text-[10px] text-gray-400 font-mono">
                            {peer.ip}:{peer.port}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          isChecked
                            ? 'bg-line-green border-line-green text-white'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Privacy Note */}
          <div className="p-2 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-2 text-[10px] text-emerald-800 dark:text-emerald-300">
            <Shield className="w-3.5 h-3.5 flex-shrink-0 text-line-green" />
            <span>
              กลุ่มแชทจะส่งข้อมูลแบบ Full-Mesh P2P ตรงไปยังอุปกรณ์ของสมาชิกทุกเครื่องโดยไม่ผ่านเซิร์ฟเวอร์
            </span>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={!groupName.trim() || selectedPeerIds.length === 0}
              className="px-4 py-2 text-xs font-bold text-white bg-line-green hover:bg-line-green-hover disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all"
            >
              สร้างกลุ่ม ({selectedPeerIds.length})
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
