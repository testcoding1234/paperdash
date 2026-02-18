import type { WidgetConfig, WidgetSize } from '../types';
import { WIDGET_REGISTRY } from '../widgets';
import { JAPANESE_LABELS } from '../constants';

interface WidgetListProps {
  widgets: WidgetConfig[];
  onMove: (id: string, direction: 'up' | 'down') => void;
  onSizeChange: (id: string, size: WidgetSize) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onSettings: (id: string) => void;
}

export const WidgetList: React.FC<WidgetListProps> = ({
  widgets,
  onMove,
  onSizeChange,
  onToggle,
  onDelete,
  onSettings,
}) => {
  const sorted = [...widgets].sort((a, b) => a.order - b.order);

  return (
    <div className="border-2 border-black bg-white p-4">
      <h3 className="font-bold text-lg mb-4">ウィジェット一覧</h3>
      
      {sorted.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          <div>{JAPANESE_LABELS.noWidgets}</div>
          <div className="text-sm mt-2">{JAPANESE_LABELS.addFirstWidget}</div>
        </div>
      )}

      <div className="space-y-2">
        {sorted.map((widget, index) => {
          const widgetInfo = WIDGET_REGISTRY[widget.type as keyof typeof WIDGET_REGISTRY];
          
          return (
            <div
              key={widget.id}
              className="border border-black p-3 bg-white"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={widget.enabled}
                    onChange={() => onToggle(widget.id)}
                    className="w-4 h-4"
                  />
                  <span className="font-bold">{widgetInfo?.name || widget.type}</span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => onMove(widget.id, 'up')}
                    disabled={index === 0}
                    className="border border-black px-2 py-1 text-xs disabled:opacity-30 hover:bg-black hover:text-white"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => onMove(widget.id, 'down')}
                    disabled={index === sorted.length - 1}
                    className="border border-black px-2 py-1 text-xs disabled:opacity-30 hover:bg-black hover:text-white"
                  >
                    ↓
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {(['S', 'M', 'L'] as WidgetSize[]).map((size) => (
                    <button
                      key={size}
                      onClick={() => onSizeChange(widget.id, size)}
                      className={`border border-black px-3 py-1 text-xs ${
                        widget.size === size
                          ? 'bg-black text-white'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => onSettings(widget.id)}
                  className="ml-auto border border-black px-3 py-1 text-xs hover:bg-black hover:text-white"
                >
                  {JAPANESE_LABELS.settings}
                </button>

                <button
                  onClick={() => onDelete(widget.id)}
                  className="border border-black px-3 py-1 text-xs hover:bg-epaper-red hover:text-white"
                >
                  {JAPANESE_LABELS.delete}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
