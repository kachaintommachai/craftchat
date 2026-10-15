import React, { useState } from 'react';
import {
  X,
  MessageSquare,
  Phone,
  Video,
  Zap,
  Bluetooth,
  ShieldCheck,
  Smartphone,
  Smile,
  Crop,
  Download,
  CheckCircle2,
  Sparkles,
  Info,
  LayoutGrid,
} from 'lucide-react';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type GuideSection =
  | 'start'
  | 'chat'
  | 'call'
  | 'network'
  | 'mobile'
  | 'security'
  | 'faq';

export const UserGuideModal: React.FC<UserGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeSection, setActiveSection] = useState<GuideSection>('start');

  if (!isOpen) return null;

  const sections = [
    { id: 'start', label: 'เริ่มต้นใช้งาน', icon: Sparkles, desc: 'ภาพรวมระบบ & การเชื่อมต่อ LAN' },
    { id: 'chat', label: 'แชท, ไฟล์ & สติกเกอร์', icon: MessageSquare, desc: 'ข้อความ, สตรีมไฟล์, เดาสติกเกอร์' },
    { id: 'call', label: 'โทร, วิดีโอ & วาดภาพ', icon: Phone, desc: 'โทรฟรีในแลน, แคปหน้าจอ, วาดเส้น' },
    { id: 'network', label: 'QUIC & Bluetooth ไร้เน็ต', icon: Zap, desc: 'UDP 0-RTT และ BLE P2P Proximity' },
    { id: 'mobile', label: 'การใช้งานบนมือถือ', icon: Smartphone, desc: 'มุมมองมือถือ & รายชื่อเพื่อนแบบไอคอน' },
    { id: 'security', label: 'ความปลอดภัย E2EE', icon: ShieldCheck, desc: 'สถาปัตยกรรมไร้เซิร์ฟเวอร์ ปลอดภัย 100%' },
    { id: 'faq', label: 'คำถามที่พบบ่อย (FAQ)', icon: Info, desc: 'วิธีแก้ปัญหา & เกร็ดการใช้งาน' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm select-none p-2 sm:p-4 animate-fadeIn">
      <div className="bg-white dark:bg-[#1E232A] w-full max-w-4xl h-[92vh] sm:h-[86vh] rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="h-14 px-4 sm:px-6 bg-gradient-to-r from-emerald-600 via-line-green to-teal-500 text-white flex items-center justify-between flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center overflow-hidden p-0.5 shadow-xs">
              <img src="/craftchat.png" alt="CraftChat Logo" className="w-full h-full object-cover rounded-lg" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold flex items-center gap-1.5 leading-tight">
                <span>คู่มือการใช้งาน CraftChat</span>
                <span className="text-[10px] bg-white/25 px-2 py-0.2 rounded-full font-mono">v1.0</span>
              </h2>
              <p className="text-[10px] text-white/80 hidden sm:block">
                Serverless LAN & Bluetooth P2P Messenger With End-to-End Encryption
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
            title="ปิดคู่มือ"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content Body: Responsive 2-Pane */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Menu / Mobile Top Tabs */}
          <div className="w-full md:w-64 bg-gray-50/80 dark:bg-[#181B20] border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 flex-shrink-0 flex md:flex-col overflow-x-auto md:overflow-y-auto p-2 sm:p-3 gap-1 no-scrollbar">
            {sections.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id as GuideSection)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all whitespace-nowrap md:whitespace-normal flex-shrink-0 md:flex-shrink md:w-full ${
                    isActive
                      ? 'bg-line-green text-white font-bold shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-line-green'}`} />
                  <div className="min-w-0">
                    <span className="text-xs block leading-tight">{sec.label}</span>
                    <span className={`text-[10px] hidden md:block truncate ${isActive ? 'text-white/80' : 'text-gray-400'}`}>
                      {sec.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Details Panel */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white dark:bg-[#20242B] text-gray-800 dark:text-gray-100">
            {/* 1. SECTION: เริ่มต้นใช้งาน */}
            {activeSection === 'start' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="p-4 rounded-2xl bg-gradient-to-tr from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 border border-emerald-200/60 dark:border-emerald-800/60">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm mb-1">
                    <Sparkles className="w-4 h-4 text-line-green" />
                    <span>ยินดีต้อนรับสู่ CraftChat</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                    CraftChat เป็นโปรแกรมส่งข้อความ, โทรด้วยเสียง, วิดีโอคอล, และส่งไฟล์แบบไร้เซิร์ฟเวอร์กลาง (Serverless Peer-to-Peer) ทำงานบนเครือข่ายแลน (LAN) และคลื่นวิทยุ Bluetooth ออกแบบมาให้ใช้งานได้แม้ไม่มีสัญญาณอินเทอร์เน็ตภายนอก พร้อมการเข้ารหัสความปลอดภัยขั้นสูงสุดระดับ End-to-End Encryption (E2EE)
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-line-green" />
                    <span>ขั้นตอนเริ่มต้นการใช้งาน</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 space-y-1">
                      <div className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-line-green flex items-center justify-center font-mono text-[11px]">1</span>
                        <span>เชื่อมต่อ Wi-Fi หรือสาย LAN</span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        ให้อุปกรณ์ทุกเครื่องที่ต้องการสนทนาต่อเข้ากับ Wi-Fi เราเตอร์เดียวกัน หรืออยู่ในวงเน็ตเวิร์ก Subnet เดียวกัน
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 space-y-1">
                      <div className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-line-green flex items-center justify-center font-mono text-[11px]">2</span>
                        <span>ค้นหาเพื่อนอัตโนมัติ (mDNS)</span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        ระบบจะส่งสัญญาณ Multicast ค้นหาเครื่องใกล้เคียงและแลกเปลี่ยนกุญแจเข้ารหัสทันทีโดยไม่ต้องลงทะเบียนบัญชีใดๆ
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 space-y-1">
                      <div className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-line-green flex items-center justify-center font-mono text-[11px]">3</span>
                        <span>ตั้งชื่อและรูปประจำตัว</span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        คลิกที่รูปโปรไฟล์เพื่อเปลี่ยนชื่อเครื่อง รูป Avatar และสถานะอารมณ์สติกเกอร์ตามต้องการ
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 space-y-1">
                      <div className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-line-green flex items-center justify-center font-mono text-[11px]">4</span>
                        <span>เริ่มแชทและโทรหาเพื่อน</span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        แตะที่ชื่อเพื่อนเพื่อเปิดห้องแชท ส่งไฟล์ หรือกดปุ่มโทร/วิดีโอคอลคุยกันได้แบบเรียลไทม์
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. SECTION: แชท, ไฟล์ & สติกเกอร์ */}
            {activeSection === 'chat' && (
              <div className="space-y-4 animate-fadeIn text-xs leading-relaxed">
                <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-line-green" />
                  <span>การส่งข้อความ, ส่งไฟล์ และสติกเกอร์ LINE</span>
                </h3>

                <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/50 space-y-1.5">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-line-green" />
                    <span>ระบบเดาสติกเกอร์อัตโนมัติจากข้อความที่พิมพ์ (Predictive Stickers)</span>
                  </span>
                  <p className="text-[11px] text-gray-600 dark:text-gray-300">
                    เมื่อคุณพิมพ์ข้อความแสดงอารมณ์ เช่น <span className="font-bold text-line-green">"โกรธ"</span>, <span className="font-bold text-line-green">"รัก"</span>, <span className="font-bold text-line-green">"ขอบคุณ"</span>, <span className="font-bold text-line-green">"ดีใจ"</span>, <span className="font-bold text-line-green">"555"</span>, หรือ <span className="font-bold text-line-green">"นอน"</span> ระบบจะเดาและแสดงแถบสติกเกอร์ LINE และ Flaticon ที่สื่อถึงคำนั้นขึ้นมาทันที แตะครั้งเดียวเพื่อส่งได้ทันทีโดยไม่ต้องเปิดเมนูสติกเกอร์
                  </p>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                    <h4 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5 mb-1">
                      <Download className="w-3.5 h-3.5 text-emerald-500" />
                      <span>การส่งไฟล์ขนาดใหญ่แบบ Direct P2P</span>
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      คุณสามารถลากไฟล์ (Drag & Drop) เอกสาร รูปภาพ หรือวิดีโอจากคอมพิวเตอร์มาวางในหน้าต่างแชทได้ทันที ไฟล์จะถูกแบ่งเป็น Chunk และสตรีมตรงไปยังเครื่องปลายทางผ่านโปรโตคอล QUIC ด้วยความเร็วสูงสุดของเครือข่ายแลน ไร้ขีดจำกัดขนาดไฟล์
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                    <h4 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5 mb-1">
                      <Smile className="w-3.5 h-3.5 text-line-green" />
                      <span>คลังสติกเกอร์ LINE Official & Flaticon Message</span>
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      กดที่ไอคอนหน้ายิ้มข้างกล่องข้อความเพื่อเปิดกล่องสติกเกอร์ตัวละคร LINE ยอดนิยม (Brown, Cony, Moon, James, Sally) และไอคอนข้อความสื่ออารมณ์ พร้อมแถบค้นหาตามหมวดหมู่
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 3. SECTION: โทร, วิดีโอ & แคปหน้าจอ */}
            {activeSection === 'call' && (
              <div className="space-y-4 animate-fadeIn text-xs leading-relaxed">
                <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-line-green" />
                  <span>การโทรด้วยเสียง, วิดีโอคอล และเครื่องมือวาดภาพ</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 space-y-1.5">
                    <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <Phone className="w-4 h-4" />
                      <span>โทรด้วยเสียง (Voice Call)</span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      โทรคุยเสียงคมชัดแบบ P2P ผ่านวงแลน 100% ไม่เสียค่าบริการ ไม่ต้องมีอินเทอร์เน็ตบ้าน สามารถปิดเสียงไมค์ หรือย่อหน้าต่างเป็นโหมดลอยได้
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 space-y-1.5">
                    <div className="font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
                      <Video className="w-4 h-4" />
                      <span>วิดีโอคอล & แชร์หน้าจอ (Screen Share)</span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      คุยเห็นหน้าด้วยกล้องเว็บแคม หรือกดปุ่ม "แชร์หน้าจอ" เพื่อถ่ายทอดภาพหน้าจอคอมพิวเตอร์ของคุณให้เพื่อนร่วมงานดูได้ทันที
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 space-y-2">
                  <h4 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                    <Crop className="w-4 h-4 text-line-green" />
                    <span>เครื่องมือแคปหน้าจอและวาดเขียน (Screen Capture & Annotation)</span>
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    กดที่ไอคอนตัดภาพหน้าจอ (Crop) บนแถบพิมพ์ข้อความเพื่อจับภาพหน้าจอของคุณ จากนั้นใช้เครื่องมือวาดเส้น:
                  </p>
                  <ul className="list-disc list-inside text-[11px] text-gray-500 dark:text-gray-400 space-y-1 pl-1">
                    <li><span className="font-semibold text-gray-700 dark:text-gray-300">ปากกา (Pen):</span> วาดเขียนเส้นอิสระด้วยเมาส์หรือนิ้วสัมผัส</li>
                    <li><span className="font-semibold text-gray-700 dark:text-gray-300">ตีกรอบ (Rectangle):</span> เน้นข้อความหรือบริเวณสำคัญด้วยกรอบสี่เหลี่ยม</li>
                    <li><span className="font-semibold text-gray-700 dark:text-gray-300">ลูกศร (Arrow):</span> วาดลูกศรชี้จุดที่ต้องการให้สังเกต</li>
                    <li>สามารถเปลี่ยนสีเส้น เลือกระดับความหนา ย้อนกลับ (Undo) และกดส่งเข้าห้องแชทได้ทันที</li>
                  </ul>
                </div>
              </div>
            )}

            {/* 4. SECTION: QUIC & Bluetooth ไร้เน็ต */}
            {activeSection === 'network' && (
              <div className="space-y-4 animate-fadeIn text-xs leading-relaxed">
                <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>การเชื่อมต่อขั้นสูงด้วย QUIC และ Bluetooth ไร้เน็ต</span>
                </h3>

                <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/50 space-y-1.5">
                  <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 text-xs">
                    <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>QUIC Protocol (UDP 0-RTT Stream Multiplexing)</span>
                  </span>
                  <p className="text-[11px] text-gray-600 dark:text-gray-300">
                    โปรโตคอลยุคใหม่ที่ทำงานผ่าน UDP พร้อมการเข้ารหัส TLS 1.3 ในตัว แตกต่างจาก TCP ดั้งเดิมตรงที่:
                  </p>
                  <ul className="list-disc list-inside text-[11px] text-gray-600 dark:text-gray-300 space-y-0.5 pl-1">
                    <li><span className="font-semibold">0-RTT Handshake:</span> เชื่อมต่อและส่งข้อความถึงเพื่อนได้ทันทีโดยไม่ต้องรอ 3-Way Handshake ช้าๆ</li>
                    <li><span className="font-semibold">Anti-HoL Blocking:</span> เมื่อส่งไฟล์ใหญ่ ข้อความแชทธรรมดาจะไม่โดนบล็อกคิว ยังคงส่งและรับได้รวดเร็วทันใจ</li>
                    <li><span className="font-semibold">Auto-Fallback:</span> หากเราเตอร์บางตัวปิดกั้น UDP พอร์ต ระบบจะสลับไปใช้ TCP ให้อัตโนมัติ</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-800/50 space-y-1.5">
                  <span className="font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1.5 text-xs">
                    <Bluetooth className="w-3.5 h-3.5 text-blue-500" />
                    <span>Bluetooth Low Energy (BLE P2P Proximity เมื่อไม่มีเน็ต/ไร้เราเตอร์)</span>
                  </span>
                  <p className="text-[11px] text-gray-600 dark:text-gray-300">
                    หากคุณอยู่ในพื้นที่อับสัญญาณ ไม่มีเราเตอร์ Wi-Fi และไม่มีอินเทอร์เน็ต สามารถกดปุ่มไอคอน <span className="font-bold text-blue-600">Bluetooth</span> ที่หัวแถบรายชื่อเพื่อน ระบบจะค้นหาและเชื่อมต่อส่งข้อความระหว่างเครื่องผ่านคลื่น Bluetooth ตรงๆ ทันที พร้อมแสดงระดับสัญญาณความแรง RSSI (dBm)
                  </p>
                </div>
              </div>
            )}

            {/* 5. SECTION: การใช้งานบนมือถือ */}
            {activeSection === 'mobile' && (
              <div className="space-y-4 animate-fadeIn text-xs leading-relaxed">
                <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-line-green" />
                  <span>การใช้งานบนสมาร์ทโฟนและแท็บเล็ต (Mobile & Tablet)</span>
                </h3>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 space-y-1">
                    <h4 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                      <LayoutGrid className="w-4 h-4 text-line-green" />
                      <span>รายชื่อเพื่อนแบบไอคอน (Icon Grid View) เรียงตามตัวอักษร</span>
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      เมื่อแตะที่แท็บ "เพื่อน" บนมือถือ รายชื่อจะแสดงเป็นการ์ดไอคอน 3 คอลัมน์พร้อมรูป Avatar ขนาดใหญ่ จัดเรียงตามพจนานุกรม ก-ฮ และ A-Z อย่างเป็นระเบียบ มีป้ายหมวดอักษรช่วยให้ค้นหาเพื่อนได้ง่าย หรือสามารถกดสลับเป็นมุมมองรายการได้เช่นกัน
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 space-y-1">
                    <h4 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-emerald-500" />
                      <span>ปุ่มโทรด่วนและวิดีโอคอล</span>
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      ในหน้าห้องแชทบนมือถือ ปุ่มโทรและวิดีโอคอลจะแสดงผลชัดเจนที่มุมขวาบนเสมอ หรือแตะที่รูปโปรไฟล์เพื่อนในหน้ารายชื่อเพื่อกดปุ่ม "โทรด้วยเสียง" หรือ "วิดีโอคอล" ได้ทันที
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 space-y-1">
                    <h4 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-blue-500" />
                      <span>แถบเมนูด้านล่าง (Bottom Tab Bar)</span>
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      มีแถบเมนู 5 ปุ่มสไตล์ LINE Mobile สำหรับเปลี่ยนหน้าแชท, ดูรายชื่อเพื่อน, แก้ไขโปรไฟล์, สลับโหมดมืด/สว่าง, และการตั้งค่า โดยแถบนี้จะซ่อนตัวอัตโนมัติเมื่ออยู่ในห้องแชทเพื่อให้มีพื้นที่อ่านข้อความเต็มจอ
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 6. SECTION: ความปลอดภัย E2EE */}
            {activeSection === 'security' && (
              <div className="space-y-4 animate-fadeIn text-xs leading-relaxed">
                <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-line-green" />
                  <span>ความปลอดภัยและการเข้ารหัส End-to-End Encryption</span>
                </h3>

                <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/50 space-y-2">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300 text-xs">
                    ทำไม CraftChat ถึงปลอดภัย 100%?
                  </span>
                  <p className="text-[11px] text-gray-600 dark:text-gray-300">
                    ต่างจากแอพแชททั่วไปที่ข้อความของคุณต้องวิ่งผ่านเซิร์ฟเวอร์คลาวด์ของบริษัทผู้ให้บริการ CraftChat ทำงานแบบ Air-Gapped / Serverless 100%
                  </p>
                  <ul className="list-disc list-inside text-[11px] text-gray-600 dark:text-gray-300 space-y-1 pl-1">
                    <li><span className="font-semibold">ไม่มีเซิร์ฟเวอร์กลาง:</span> ข้อความและไฟล์ส่งตรงระหว่างเครื่อง (Peer-to-Peer) ในวงแลนเท่านั้น</li>
                    <li><span className="font-semibold">X25519 Elliptic Curve:</span> แลกเปลี่ยนกุญแจเข้ารหัสลับผ่านกระบวนการ Diffie-Hellman อัตโนมัติ</li>
                    <li><span className="font-semibold">ChaCha20-Poly1305:</span> เข้ารหัสเนื้อหาข้อความ รูปภาพ และไฟล์สตรีมมิ่งด้วยมาตรฐานความปลอดภัยระดับกองทัพ</li>
                    <li><span className="font-semibold">Zero Telemetry:</span> ไม่มีการเก็บประวัติการสนทนา ไม่มีการแอบส่งสถิติการใช้งานออกสู่อินเทอร์เน็ต</li>
                  </ul>
                </div>
              </div>
            )}

            {/* 7. SECTION: FAQ คำถามที่พบบ่อย */}
            {activeSection === 'faq' && (
              <div className="space-y-3 animate-fadeIn text-xs leading-relaxed">
                <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-line-green" />
                  <span>คำถามที่พบบ่อยและการแก้ปัญหา (FAQ)</span>
                </h3>

                <div className="space-y-2.5">
                  <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                    <span className="font-bold text-gray-800 dark:text-gray-200 block mb-1">
                      Q: ทำไมเปิดแอพแล้วไม่พบเครื่องเพื่อนในวงแลน?
                    </span>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      A: ให้ตรวจสอบว่าเครื่องทั้งสองต่อ Wi-Fi หรือเราเตอร์ตัวเดียวกันหรือไม่ หากต่อเราเตอร์คนละตัวหรือมี Guest Network แยก Subnet อาจมองไม่เห็นกัน นอกจากนี้สามารถกดปุ่ม <span className="font-bold text-line-green">สแกนใหม่ (Refresh)</span> หรือตรวจสอบว่า Firewall ของระบบปฏิบัติการไม่ได้บล็อกพอร์ต 4242
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                    <span className="font-bold text-gray-800 dark:text-gray-200 block mb-1">
                      Q: โหมด Bluetooth ใช้งานอย่างไร?
                    </span>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      A: เครื่องต้องมีตัวรับส่งสัญญาณ Bluetooth (เช่น โน้ตบุ๊ก มือถือ หรือ USB Bluetooth Dongle) จากนั้นกดปุ่มไอคอน Bluetooth บนหัวตารางเพื่อน ระบบจะสแกนหาเพื่อนในระยะ 10-20 เมตรเพื่อแชทได้โดยไม่ต้องเปิด Wi-Fi
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                    <span className="font-bold text-gray-800 dark:text-gray-200 block mb-1">
                      Q: ไฟล์และรูปภาพที่ได้รับถูกเก็บไว้ที่ไหน?
                    </span>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      A: สามารถกดที่ไอคอนโฟลเดอร์ข้างข้อความไฟล์ที่ได้รับ หรือไปที่เมนู <span className="font-bold text-gray-700 dark:text-gray-300">การตั้งค่า (Settings)</span> เพื่อดูและเปลี่ยนโฟลเดอร์ดาวน์โหลดเริ่มต้นได้ตามสะดวก
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                    <span className="font-bold text-gray-800 dark:text-gray-200 block mb-1">
                      Q: สามารถแชทคุยกันข้ามระบบปฏิบัติการได้หรือไม่?
                    </span>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      A: ได้อย่างสมบูรณ์แบบครับ CraftChat พัฒนาด้วยเทคโนโลยี Tauri v2 + Rust ทำให้สามารถเชื่อมต่อคุยข้ามระหว่าง Windows, macOS, Linux, Android และ iOS ได้อย่างลื่นไหล
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-gray-50 dark:bg-[#181B20] border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-400 select-none flex-shrink-0">
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-line-green" />
            <span>CraftChat • P2P LAN & Bluetooth Air-Gapped Messenger</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-line-green hover:bg-line-green-hover text-white font-bold text-xs shadow-sm transition-all"
          >
            เข้าใจแล้ว
          </button>
        </div>
      </div>
    </div>
  );
};
