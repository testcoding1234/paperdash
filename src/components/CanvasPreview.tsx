import { useRef, useEffect, useCallback } from 'react';
import type { WidgetConfig } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants';
import { renderWidgetToCanvas, type RenderData } from '../utils/widgetRenderer';
import { fetchWeather } from '../utils/weather';
import { fetchGithubContributions } from '../utils/github';
import type { WeatherSettings, GithubSettings } from '../types';

// 2-column layout constants (must match ImageGenerator)
const COL_GAP = 6;
const MARGIN_H = 10;
const MARGIN_V = 8;
const COL_WIDTH = Math.floor((CANVAS_WIDTH - MARGIN_H * 2 - COL_GAP) / 2);
const WIDGET_HEIGHT = CANVAS_HEIGHT - MARGIN_V * 2;

interface CanvasPreviewProps {
  widgets: WidgetConfig[];
}

export const CanvasPreview: React.FC<CanvasPreviewProps> = ({ widgets }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const renderPreview = useCallback(async () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const enabledWidgets = [...widgets]
      .filter(w => w.enabled)
      .sort((a, b) => a.order - b.order)
      .slice(0, 2);

    const liveData: RenderData = { weather: {}, github: {} };

    await Promise.all(
      enabledWidgets.map(async (widget) => {
        if (widget.type === 'weather') {
          const settings = widget.settings as WeatherSettings;
          const code = settings.locationCode || '130000';
          try {
            liveData.weather![code] = await fetchWeather(code);
          } catch { /* fallback to empty */ }
        } else if (widget.type === 'github') {
          const settings = widget.settings as GithubSettings;
          if (settings.username) {
            try {
              liveData.github![settings.username] = await fetchGithubContributions(
                settings.username,
                settings.range || 7
              );
            } catch { /* fallback to empty */ }
          }
        }
      })
    );

    enabledWidgets.forEach((widget, i) => {
      const x = MARGIN_H + i * (COL_WIDTH + COL_GAP);
      renderWidgetToCanvas(ctx, widget, x, MARGIN_V, COL_WIDTH, WIDGET_HEIGHT, liveData);
    });
  }, [widgets]);

  useEffect(() => {
    renderPreview();
  }, [renderPreview]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      className="border border-gray-300 bg-white"
      style={{ width: '100%', imageRendering: 'pixelated' }}
    />
  );
};
