import { useRef, useEffect, useState } from 'react';
import { JAPANESE_LABELS, CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants';
import { downloadCanvas } from '../utils/renderer';

interface ImageGeneratorProps {
  dashboardRef: React.RefObject<HTMLDivElement>;
  onClose: () => void;
}

export const ImageGenerator: React.FC<ImageGeneratorProps> = ({ dashboardRef, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    generateImage();
  }, []);

  const generateImage = async () => {
    if (!canvasRef.current || !dashboardRef.current) return;

    setGenerating(true);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear with white background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Set up rendering
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 14px sans-serif';

      // Simple text-based rendering
      const widgets = dashboardRef.current.querySelectorAll('[data-widget]');
      let yOffset = 10;

      widgets.forEach((widget) => {
        const text = widget.textContent || '';
        const lines = text.split('\n').filter(l => l.trim());
        
        lines.forEach((line, index) => {
          if (yOffset < CANVAS_HEIGHT - 20) {
            if (index === 0) {
              ctx.font = 'bold 14px sans-serif';
            } else {
              ctx.font = '12px sans-serif';
            }
            ctx.fillText(line.trim().substring(0, 50), 10, yOffset);
            yOffset += 16;
          }
        });
        
        yOffset += 10;
      });
    } catch (error) {
      console.error('Image generation error:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!canvasRef.current) return;
    await downloadCanvas(canvasRef.current, 'paperdash.png');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white border-4 border-black max-w-2xl w-full p-6">
        <h2 className="text-2xl font-bold mb-6">{JAPANESE_LABELS.imageTitle}</h2>

        <div className="mb-6 border-2 border-black p-4 bg-gray-50 overflow-auto">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="border border-gray-300 bg-white mx-auto"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>

        <div className="text-sm mb-4 text-gray-600">
          サイズ: {CANVAS_WIDTH} x {CANVAS_HEIGHT}px (2.9インチ e-paper用)
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleDownload}
            disabled={generating}
            className="flex-1 bg-black text-white py-3 font-bold hover:bg-gray-800 disabled:opacity-50"
          >
            {JAPANESE_LABELS.download}
          </button>
          <button
            onClick={onClose}
            className="flex-1 border-2 border-black py-3 font-bold hover:bg-gray-100"
          >
            {JAPANESE_LABELS.cancel}
          </button>
        </div>
      </div>
    </div>
  );
};
