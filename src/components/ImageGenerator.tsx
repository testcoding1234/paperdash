import { useRef, useEffect, useState } from 'react';
import { JAPANESE_LABELS, CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants';
import { downloadCanvas, renderDashboardToCanvas } from '../utils/renderer';
import type { WidgetConfig, GithubSettings, WeatherSettings } from '../types';
import { fetchGithubContributions } from '../utils/github';
import { fetchWeather, getWeatherEmoji } from '../utils/weather';

interface ImageGeneratorProps {
  widgets: WidgetConfig[];
  onClose: () => void;
}

export const ImageGenerator: React.FC<ImageGeneratorProps> = ({ widgets, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    generateImage();
  }, []);

  const generateImage = async () => {
    if (!canvasRef.current) return;

    setGenerating(true);

    try {
      const canvas = canvasRef.current;
      
      // Collect data for all enabled widgets
      const widgetData = new Map<string, any>();
      const enabledWidgets = widgets.filter(w => w.enabled);
      
      // Fetch data for each widget type
      await Promise.all(
        enabledWidgets.map(async (widget) => {
          try {
            if (widget.type === 'github') {
              const settings = widget.settings as GithubSettings;
              if (settings.username) {
                const data = await fetchGithubContributions(
                  settings.username,
                  settings.range || 30
                );
                widgetData.set(widget.id, data);
              }
            } else if (widget.type === 'weather') {
              const settings = widget.settings as WeatherSettings;
              const data = await fetchWeather(settings.locationCode || '130000');
              const emoji = getWeatherEmoji(data.condition);
              widgetData.set(widget.id, { ...data, emoji });
            }
            // Todo widget doesn't need external data - it's already in settings
          } catch (error) {
            console.error(`Error fetching data for widget ${widget.id}:`, error);
          }
        })
      );

      // Render to canvas using structured renderer
      renderDashboardToCanvas(canvas, enabledWidgets, widgetData);
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
