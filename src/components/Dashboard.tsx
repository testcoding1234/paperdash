import type { WidgetConfig } from '../types';
import { WIDGET_REGISTRY } from '../widgets';

interface DashboardProps {
  widgets: WidgetConfig[];
  onWidgetUpdate: (widget: WidgetConfig) => void;
  previewMode?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  widgets,
  onWidgetUpdate,
  previewMode = false,
}) => {
  const sorted = [...widgets]
    .filter((w) => w.enabled)
    .sort((a, b) => a.order - b.order);

  // Single column layout - full-width banner widgets stacked vertically
  const layoutClass = 'flex flex-col gap-3';

  return (
    <div className={layoutClass}>
      {sorted.map((widget) => {
        const widgetInfo = WIDGET_REGISTRY[widget.type as keyof typeof WIDGET_REGISTRY];
        if (!widgetInfo) return null;

        const WidgetComponent = widgetInfo.component;

        return (
          <div
            key={widget.id}
            data-widget={widget.type}
          >
            <WidgetComponent
              config={widget}
              onUpdate={onWidgetUpdate}
              previewMode={previewMode}
            />
          </div>
        );
      })}
    </div>
  );
};
