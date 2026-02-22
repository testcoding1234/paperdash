import { useRef, useEffect, useState } from 'react';
import type { WidgetConfig } from '../types';
import { JAPANESE_LABELS, CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants';
import { downloadCanvas } from '../utils/renderer';
import { renderWidgetToCanvas, type RenderData } from '../utils/widgetRenderer';
import { fetchWeather } from '../utils/weather';
import { fetchGithubContributions } from '../utils/github';
import type { WeatherSettings, GithubSettings } from '../types';

interface ImageGeneratorProps {
  widgets: WidgetConfig[];
  onClose: () => void;
}

export const ImageGenerator: React.FC<ImageGeneratorProps> = ({ 
  widgets, 
  onClose 
}) => {
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
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear with white background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Filter enabled widgets and sort by order, take first 2 for 2-column layout
      const enabledWidgets = widgets
        .filter(w => w.enabled)
        .sort((a, b) => a.order - b.order)
        .slice(0, 2);

      // Fetch live data for weather and github widgets
      const liveData: RenderData = {
        weather: {},
        github: {},
      };

      // Fetch weather data for all weather widgets
      const weatherWidgets = enabledWidgets.filter(w => w.type === 'weather');
      await Promise.all(
        weatherWidgets.map(async (widget) => {
          const settings = widget.settings as WeatherSettings;
          const locationCode = settings.locationCode || '130000';
          try {
            const data = await fetchWeather(locationCode);
            liveData.weather![locationCode] = data;
          } catch (error) {
            console.error('Failed to fetch weather for', locationCode, error);
          }
        })
      );

      // Fetch GitHub data for all github widgets
      const githubWidgets = enabledWidgets.filter(w => w.type === 'github');
      await Promise.all(
        githubWidgets.map(async (widget) => {
          const settings = widget.settings as GithubSettings;
          const username = settings.username;
          if (username) {
            try {
              const data = await fetchGithubContributions(username, settings.range || 7);
              liveData.github![username] = data;
            } catch (error) {
              console.error('Failed to fetch GitHub data for', username, error);
            }
          }
        })
      );

      // 2-column layout: each widget gets half the canvas width, full canvas height
      const COL_GAP = 6;
      const MARGIN_H = 10;
      const MARGIN_V = 8;
      const colWidth = Math.floor((CANVAS_WIDTH - MARGIN_H * 2 - COL_GAP) / 2);
      const widgetHeight = CANVAS_HEIGHT - MARGIN_V * 2;

      // Render each widget in its column
      enabledWidgets.forEach((widget, index) => {
        const x = MARGIN_H + index * (colWidth + COL_GAP);
        renderWidgetToCanvas(ctx, widget, x, MARGIN_V, colWidth, widgetHeight, liveData);
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
