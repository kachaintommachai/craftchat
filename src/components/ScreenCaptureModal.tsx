import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Download,
  RotateCcw,
  Square,
  MoveRight,
  Pen,
  Camera,
} from 'lucide-react';

interface ScreenCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendCapturedImage: (dataUrl: string) => void;
}

type DrawTool = 'pen' | 'rect' | 'arrow';

const COLORS = [
  '#EF4444', // LINE Red
  '#06C755', // LINE Green
  '#3B82F6', // Blue
  '#FACC15', // Yellow
  '#FFFFFF', // White
  '#1E293B', // Dark Slate
];

const STROKE_WIDTHS = [2, 4, 8];

export const ScreenCaptureModal: React.FC<ScreenCaptureModalProps> = ({
  isOpen,
  onClose,
  onSendCapturedImage,
}) => {
  const [currentTool, setCurrentTool] = useState<DrawTool>('pen');
  const [currentColor, setCurrentColor] = useState<string>('#EF4444');
  const [strokeWidth, setStrokeWidth] = useState<number>(4);
  const [isDrawing, setIsDrawing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const historyRef = useRef<ImageData[]>([]);
  const startPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Initialize or trigger screen capture
  useEffect(() => {
    if (isOpen) {
      startCapture();
    } else {
      historyRef.current = [];
    }
  }, [isOpen]);

  const startCapture = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: { displaySurface: 'monitor' },
        });

        const video = document.createElement('video');
        video.srcObject = stream;
        video.play();

        video.onloadedmetadata = () => {
          setTimeout(() => {
            const canvas = canvasRef.current;
            const previewCanvas = previewCanvasRef.current;
            if (!canvas || !previewCanvas) return;

            // Set dimensions
            const width = Math.min(video.videoWidth, 1280);
            const height = Math.min(video.videoHeight, 720);
            canvas.width = width;
            canvas.height = height;
            previewCanvas.width = width;
            previewCanvas.height = height;

            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(video, 0, 0, width, height);
              // Save baseline image to history
              historyRef.current = [ctx.getImageData(0, 0, width, height)];
            }

            // Stop all video tracks
            stream.getTracks().forEach((track) => track.stop());
          }, 300);
        };
      } else {
        createBlankCanvas();
      }
    } catch (err) {
      console.warn('Screen capture cancelled or not permitted, fallback to drawing canvas:', err);
      createBlankCanvas();
    }
  };

  const createBlankCanvas = () => {
    const canvas = canvasRef.current;
    const previewCanvas = previewCanvasRef.current;
    if (!canvas || !previewCanvas) return;

    const width = 800;
    const height = 500;
    canvas.width = width;
    canvas.height = height;
    previewCanvas.width = width;
    previewCanvas.height = height;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw modern checkered/light background
      ctx.fillStyle = '#1E232A';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#64748B';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('วาดเส้น ตีกรอบ หรือขีดเขียนบนภาพได้ตามต้องการ', width / 2, height / 2);

      historyRef.current = [ctx.getImageData(0, 0, width, height)];
    }
  };

  // Mouse & Touch Drawing Events
  const getCanvasCoords = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (clientX: number, clientY: number) => {
    const coords = getCanvasCoords(clientX, clientY);
    startPos.current = coords;
    setIsDrawing(true);

    if (currentTool === 'pen') {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y);
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = strokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  };

  const draw = (clientX: number, clientY: number) => {
    if (!isDrawing) return;
    const coords = getCanvasCoords(clientX, clientY);

    if (currentTool === 'pen') {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
      }
    } else {
      // Preview shapes on preview canvas
      const pCtx = previewCanvasRef.current?.getContext('2d');
      if (!pCtx || !previewCanvasRef.current) return;
      pCtx.clearRect(0, 0, previewCanvasRef.current.width, previewCanvasRef.current.height);

      pCtx.strokeStyle = currentColor;
      pCtx.lineWidth = strokeWidth;
      pCtx.lineCap = 'round';
      pCtx.lineJoin = 'round';

      if (currentTool === 'rect') {
        const x = Math.min(startPos.current.x, coords.x);
        const y = Math.min(startPos.current.y, coords.y);
        const w = Math.abs(coords.x - startPos.current.x);
        const h = Math.abs(coords.y - startPos.current.y);
        pCtx.strokeRect(x, y, w, h);
      } else if (currentTool === 'arrow') {
        drawArrow(pCtx, startPos.current.x, startPos.current.y, coords.x, coords.y);
      }
    }
  };

  const endDrawing = (clientX: number, clientY: number) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const coords = getCanvasCoords(clientX, clientY);

    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    if (currentTool === 'rect') {
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = strokeWidth;
      const x = Math.min(startPos.current.x, coords.x);
      const y = Math.min(startPos.current.y, coords.y);
      const w = Math.abs(coords.x - startPos.current.x);
      const h = Math.abs(coords.y - startPos.current.y);
      ctx.strokeRect(x, y, w, h);
    } else if (currentTool === 'arrow') {
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = strokeWidth;
      drawArrow(ctx, startPos.current.x, startPos.current.y, coords.x, coords.y);
    }

    // Clear preview canvas
    const pCtx = previewCanvasRef.current?.getContext('2d');
    if (pCtx && previewCanvasRef.current) {
      pCtx.clearRect(0, 0, previewCanvasRef.current.width, previewCanvasRef.current.height);
    }

    // Push state to history for Undo
    if (canvasRef.current) {
      historyRef.current.push(ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height));
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    startDrawing(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    draw(e.clientX, e.clientY);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    endDrawing(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      startDrawing(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      draw(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.changedTouches.length === 1) {
      endDrawing(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
    }
  };

  const drawArrow = (
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number
  ) => {
    const headlen = 15 + strokeWidth;
    const angle = Math.atan2(toY - fromY, toX - fromX);

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fill();
  };

  const handleUndo = () => {
    if (historyRef.current.length > 1) {
      historyRef.current.pop();
      const prev = historyRef.current[historyRef.current.length - 1];
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx && prev) {
        ctx.putImageData(prev, 0, 0);
      }
    }
  };

  const handleSend = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSendCapturedImage(dataUrl);
    onClose();
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `screenshot-${Date.now()}.png`;
    a.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md select-none p-4 animate-fadeIn">
      <div className="bg-[#1E232A] w-full max-w-5xl rounded-3xl shadow-2xl border border-gray-700 overflow-hidden flex flex-col relative max-h-[92vh]">
        {/* Top Floating Annotation Toolbar */}
        <div className="h-14 px-3 sm:px-5 bg-[#252B34] border-b border-gray-700/80 flex items-center justify-between z-10 select-none overflow-x-auto gap-2 no-scrollbar">
          {/* Tools: Pen, Rectangle, Arrow */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentTool('pen')}
              className={`p-2 rounded-xl flex items-center gap-1 text-xs font-semibold transition-all ${
                currentTool === 'pen'
                  ? 'bg-line-green text-white shadow-md'
                  : 'text-gray-300 hover:bg-gray-700/60'
              }`}
              title="วาดเส้นอิสระ (Pen)"
            >
              <Pen className="w-4 h-4" />
              <span>ปากกา</span>
            </button>

            <button
              onClick={() => setCurrentTool('rect')}
              className={`p-2 rounded-xl flex items-center gap-1 text-xs font-semibold transition-all ${
                currentTool === 'rect'
                  ? 'bg-line-green text-white shadow-md'
                  : 'text-gray-300 hover:bg-gray-700/60'
              }`}
              title="ตีกรอบสี่เหลี่ยม (Rectangle)"
            >
              <Square className="w-4 h-4" />
              <span>กรอบ</span>
            </button>

            <button
              onClick={() => setCurrentTool('arrow')}
              className={`p-2 rounded-xl flex items-center gap-1 text-xs font-semibold transition-all ${
                currentTool === 'arrow'
                  ? 'bg-line-green text-white shadow-md'
                  : 'text-gray-300 hover:bg-gray-700/60'
              }`}
              title="วาดลูกศรชี้ (Arrow)"
            >
              <MoveRight className="w-4 h-4" />
              <span>ลูกศร</span>
            </button>

            <div className="h-5 w-[1px] bg-gray-700 mx-1" />

            {/* Color Palette */}
            <div className="flex items-center gap-1">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrentColor(c)}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    currentColor === c ? 'scale-110 border-white' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>

            <div className="h-5 w-[1px] bg-gray-700 mx-1" />

            {/* Stroke Width Selector */}
            <div className="flex items-center gap-1 bg-gray-800/80 p-1 rounded-xl">
              {STROKE_WIDTHS.map((w) => (
                <button
                  key={w}
                  onClick={() => setStrokeWidth(w)}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-lg transition-colors ${
                    strokeWidth === w ? 'bg-line-green text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {w}px
                </button>
              ))}
            </div>

            {/* Undo Button */}
            <button
              onClick={handleUndo}
              disabled={historyRef.current.length <= 1}
              className={`p-2 rounded-xl text-gray-300 transition-colors ${
                historyRef.current.length > 1
                  ? 'hover:bg-gray-700 hover:text-white'
                  : 'opacity-40 cursor-not-allowed'
              }`}
              title="ย้อนกลับ (Undo)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Right Action Group: Download, Send to Chat, Close */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-2 hover:bg-gray-700/60 text-gray-300 hover:text-white rounded-xl transition-colors"
              title="บันทึกภาพลงเครื่อง (Save Image)"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={handleSend}
              className="px-4 py-2 rounded-xl bg-line-green hover:bg-line-green-hover text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>ส่งเข้าแชท</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-700/60 transition-colors"
              title="ปิด"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center Canvas Workspace */}
        <div className="flex-1 flex items-center justify-center p-4 overflow-auto bg-[#14171C]">
          <div className="relative shadow-2xl rounded-xl overflow-hidden border border-gray-700/60 cursor-crosshair">
            {/* The Active Drawing Canvas */}
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="block max-h-[70vh] max-w-full object-contain touch-none"
            />
            {/* The Shape Preview Canvas overlay */}
            <canvas
              ref={previewCanvasRef}
              className="absolute inset-0 pointer-events-none w-full h-full"
            />
          </div>
        </div>

        {/* Bottom Status bar */}
        <div className="px-5 py-2 bg-[#252B34] border-t border-gray-700/80 flex items-center justify-between text-[11px] text-gray-400 select-none">
          <span className="flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5 text-line-green" />
            <span>โหมดจับภาพและวาดเส้นสไตล์ LINE PC</span>
          </span>
          <span>คลิกและลากเมาส์บนภาพเพื่อวาดเส้น ตีกรอบ หรือชี้ลูกศร</span>
        </div>
      </div>
    </div>
  );
};
