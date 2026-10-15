import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  Volume2,
  Minimize2,
  Maximize2,
  Radio,
} from 'lucide-react';
import { Peer } from '../types';

export interface CallSession {
  callId: string;
  peer: Peer;
  callType: 'audio' | 'video';
  status: 'incoming' | 'calling' | 'connected';
}

interface CallModalProps {
  session: CallSession | null;
  onAcceptCall: () => void;
  onRejectCall: () => void;
  onEndCall: () => void;
}

export const CallModal: React.FC<CallModalProps> = ({
  session,
  onAcceptCall,
  onRejectCall,
  onEndCall,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoDisabled, setIsVideoDisabled] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Timer for connected call
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (session?.status === 'connected') {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [session?.status]);

  // Initialize camera and microphone when call starts or connects
  useEffect(() => {
    if (session && (session.status === 'calling' || session.status === 'connected')) {
      startLocalMedia(session.callType === 'video');
    } else {
      stopLocalMedia();
    }
    return () => {
      stopLocalMedia();
    };
  }, [session?.status, session?.callType]);

  const startLocalMedia = async (withVideo: boolean) => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: withVideo ? { width: 640, height: 480 } : false,
        });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      }
    } catch (err) {
      console.warn('Microphone/Webcam not accessible, using mock visual feed:', err);
    }
  };

  const stopLocalMedia = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = isMuted;
      });
    }
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = isVideoDisabled;
      });
    }
    setIsVideoDisabled(!isVideoDisabled);
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Revert to camera
      startLocalMedia(session?.callType === 'video');
      setIsScreenSharing(false);
    } else {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
          const screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
          });
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = screenStream;
          }
          setIsScreenSharing(true);
        }
      } catch (err) {
        console.warn('Screen share cancelled:', err);
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!session) return null;

  // 1. Incoming Call Dialog (สไตล์ LINE PC)
  if (session.status === 'incoming') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm select-none p-4 animate-fadeIn">
        <div className="bg-[#1E232A] w-full max-w-sm rounded-3xl shadow-2xl border border-gray-700 p-6 flex flex-col items-center text-center text-white relative">
          {/* Ringing Waves Animation */}
          <div className="relative mb-4">
            <div className="absolute inset-0 rounded-full bg-line-green/30 animate-ping scale-125" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 border-4 border-line-green flex items-center justify-center text-3xl font-extrabold shadow-xl">
              {session.peer.name.slice(0, 2).toUpperCase()}
            </div>
          </div>

          <h3 className="text-base font-bold text-white mb-0.5">{session.peer.name}</h3>
          <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 mb-1">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>สายเรียกเข้าในวงแลน ({session.callType === 'video' ? 'วิดีโอคอล' : 'โทรด้วยเสียง'})</span>
          </p>
          <p className="text-[11px] font-mono text-gray-400 mb-6">
            IP: {session.peer.ip}:{session.peer.port}
          </p>

          {/* Accept / Decline Buttons */}
          <div className="flex items-center justify-center gap-8 w-full">
            <button
              onClick={onRejectCall}
              className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white shadow-lg transition-transform active:scale-95"
              title="ปฏิเสธสาย"
            >
              <PhoneOff className="w-6 h-6" />
            </button>

            <button
              onClick={onAcceptCall}
              className="w-14 h-14 rounded-full bg-line-green hover:bg-line-green-hover flex items-center justify-center text-white shadow-lg transition-transform active:scale-95 animate-bounce"
              title="รับสาย"
            >
              {session.callType === 'video' ? (
                <Video className="w-6 h-6" />
              ) : (
                <Phone className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Calling (Outbound) or Connected Call Window (สไตล์ LINE PC)
  return (
    <div
      className={`fixed z-50 transition-all select-none ${
        isMinimized
          ? 'bottom-4 right-4 w-72 h-44 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden'
          : 'inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md p-4'
      }`}
    >
      <div
        className={`bg-[#181B20] w-full ${
          isMinimized ? 'h-full' : 'max-w-4xl h-[82vh] rounded-3xl'
        } shadow-2xl border border-gray-700 overflow-hidden flex flex-col relative`}
      >
        {/* Top Header of Call Window */}
        <div className="h-12 px-4 bg-[#20252D]/90 border-b border-gray-700/60 flex items-center justify-between text-white z-20">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-xs font-bold">
              {session.peer.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <span className="text-xs font-bold block">{session.peer.name}</span>
              <span className="text-[10px] text-emerald-400 font-mono">
                {session.status === 'calling'
                  ? 'กำลังโทรหา...'
                  : formatDuration(callDuration)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 hover:bg-gray-700 rounded-lg text-gray-300 transition-colors"
              title={isMinimized ? 'ขยายหน้าต่าง' : 'ย่อหน้าต่าง'}
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Video Area */}
        <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
          {session.callType === 'video' ? (
            <>
              {/* Remote Video (Full Size) */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />

              {/* If no remote video, show charming LINE avatar */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none bg-gradient-to-b from-gray-900 via-[#1E232A] to-gray-900">
                <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-extrabold shadow-2xl mb-4 border-4 border-gray-700">
                  {session.peer.name.slice(0, 2).toUpperCase()}
                </div>
                <h4 className="text-sm font-bold text-gray-200">{session.peer.name}</h4>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1 font-mono">
                  <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>Direct P2P LAN Connection</span>
                </p>
              </div>

              {/* Picture-in-Picture Local Video (Bottom Right) */}
              <div className="absolute bottom-4 right-4 w-40 h-28 rounded-2xl bg-[#1E232A] border-2 border-gray-700 shadow-2xl overflow-hidden z-20">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${isVideoDisabled ? 'hidden' : 'block'}`}
                />
                {isVideoDisabled && (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-xs">
                    <VideoOff className="w-6 h-6 mb-1 text-red-400" />
                    <span>ปิดกล้องแล้ว</span>
                  </div>
                )}
                <span className="absolute bottom-1 left-2 text-[9px] bg-black/60 px-1.5 py-0.5 rounded text-white/90">
                  คุณ
                </span>
              </div>
            </>
          ) : (
            /* Voice Call Graphic Screen (Audio Waves) */
            <div className="flex flex-col items-center justify-center text-white">
              <div className="relative mb-6">
                <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-line-green to-emerald-400 flex items-center justify-center text-white text-5xl font-extrabold shadow-2xl">
                  {session.peer.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-emerald-500 border-4 border-black flex items-center justify-center">
                  <Volume2 className="w-3.5 h-3.5 text-white" />
                </span>
              </div>
              <h3 className="text-lg font-bold">{session.peer.name}</h3>
              <p className="text-xs text-emerald-400 font-mono mt-1">
                {session.status === 'calling' ? 'กำลังเชื่อมต่อ...' : `สนทนาสาย: ${formatDuration(callDuration)}`}
              </p>
            </div>
          )}
        </div>

        {/* Bottom Floating Control Bar (LINE PC Style) */}
        <div className="h-20 bg-[#20252D] border-t border-gray-700/80 flex items-center justify-center gap-4 px-6 z-20">
          {/* Mute Mic */}
          <button
            onClick={toggleMute}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isMuted
                ? 'bg-red-500 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
            }`}
            title={isMuted ? 'เปิดไมโครโฟน' : 'ปิดไมโครโฟน'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Toggle Camera (If video call) */}
          {session.callType === 'video' && (
            <button
              onClick={toggleVideo}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                isVideoDisabled
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
              }`}
              title={isVideoDisabled ? 'เปิดกล้อง' : 'ปิดกล้อง'}
            >
              {isVideoDisabled ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>
          )}

          {/* Screen Share (If video call) */}
          {session.callType === 'video' && (
            <button
              onClick={toggleScreenShare}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                isScreenSharing
                  ? 'bg-line-green text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
              }`}
              title={isScreenSharing ? 'หยุดแชร์หน้าจอ' : 'แชร์หน้าจอของคุณ'}
            >
              <Monitor className="w-5 h-5" />
            </button>
          )}

          {/* End Call Button */}
          <button
            onClick={onEndCall}
            className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white shadow-xl transition-transform active:scale-95 ml-2"
            title="วางสาย"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
