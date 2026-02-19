import type { WidgetConfig, LayoutMode } from '../types';
import { WIDGET_REGISTRY } from '../widgets';

interface DashboardProps {
  widgets: WidgetConfig[];
  layout: LayoutMode;
  onWidgetUpdate: (widget: WidgetConfig) => void;
  previewMode?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  widgets,
  layout,
  onWidgetUpdate,
  previewMode = false,
}) => {
  const sorted = [...widgets]
    .filter((w) => w.enabled)
    .sort((a, b) => a.order - b.order);

  // E-paper optimized: fixed layout without responsive breakpoints
  const layoutClass = layout === '2-column' 
    ? 'grid grid-cols-2 gap-3' 
    : 'flex flex-col gap-3';

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
            className={layout === '2-column' && widget.size === 'L' ? 'col-span-2' : ''}
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
