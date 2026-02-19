import { useState, useEffect, useRef } from 'react';
import type { DashboardState, WidgetConfig, WidgetSize } from './types';
import { loadState, saveState, updateWidget, moveWidget, addWidget, deleteWidget } from './utils/storage';
import { WIDGET_REGISTRY } from './widgets';
import { JAPANESE_LABELS } from './constants';
import { Dashboard } from './components/Dashboard';
import { WidgetList } from './components/WidgetList';
import { Settings } from './components/Settings';
import { WidgetSettings } from './components/WidgetSettings';
import { AddWidget } from './components/AddWidget';
import { ImageGenerator } from './components/ImageGenerator';

function App() {
  const [state, setState] = useState<DashboardState>(loadState());
  const [showSettings, setShowSettings] = useState(false);
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [showImageGenerator, setShowImageGenerator] = useState(false);
  const [editingWidget, setEditingWidget] = useState<string | null>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const handleWidgetUpdate = (widget: WidgetConfig) => {
    setState({
      ...state,
      widgets: updateWidget(state.widgets, widget),
    });
  };

  const handleMoveWidget = (id: string, direction: 'up' | 'down') => {
    setState({
      ...state,
      widgets: moveWidget(state.widgets, id, direction),
    });
  };

  const handleSizeChange = (id: string, size: WidgetSize) => {
    const widget = state.widgets.find((w) => w.id === id);
    if (widget) {
      handleWidgetUpdate({ ...widget, size });
    }
  };

  const handleToggleWidget = (id: string) => {
    const widget = state.widgets.find((w) => w.id === id);
    if (widget) {
      handleWidgetUpdate({ ...widget, enabled: !widget.enabled });
    }
  };

  const handleAddWidget = (type: string) => {
    const widgetInfo = WIDGET_REGISTRY[type as keyof typeof WIDGET_REGISTRY];
    setState({
      ...state,
      widgets: addWidget(state.widgets, type, widgetInfo?.defaultSettings || {}),
    });
  };

  const handleDeleteWidget = (id: string) => {
    setState({
      ...state,
      widgets: deleteWidget(state.widgets, id),
    });
  };

  return (
    <div className="min-h-screen bg-white flex justify-center p-4">
      <div className="w-full max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-4 border-4 border-black bg-white p-4">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h1 className="text-3xl font-bold">{JAPANESE_LABELS.appTitle}</h1>
            <button
              onClick={() => setShowSettings(true)}
              className="border-2 border-black px-4 py-2 font-bold hover:bg-black hover:text-white"
            >
              {JAPANESE_LABELS.settings}
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => setShowAddWidget(true)}
              className="border-2 border-black px-4 py-2 font-bold hover:bg-black hover:text-white"
            >
              {JAPANESE_LABELS.addWidget}
            </button>

            <button
              onClick={() => setShowImageGenerator(true)}
              className="bg-black text-white px-4 py-2 font-bold hover:bg-gray-800"
            >
              {JAPANESE_LABELS.generateImage}
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col gap-4">
          {/* Widget list */}
          <div>
            <WidgetList
              widgets={state.widgets}
              onMove={handleMoveWidget}
              onSizeChange={handleSizeChange}
              onToggle={handleToggleWidget}
              onDelete={handleDeleteWidget}
              onSettings={setEditingWidget}
            />
          </div>

          {/* Dashboard preview */}
          <div>
            <div className="border-4 border-black bg-white p-4">
              <h3 className="font-bold text-lg mb-4">プレビュー</h3>
              <div ref={dashboardRef}>
                <Dashboard
                  widgets={state.widgets}
                  layout={state.layout}
                  onWidgetUpdate={handleWidgetUpdate}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        {showSettings && (
          <Settings
            state={state}
            onUpdate={setState}
            onClose={() => setShowSettings(false)}
          />
        )}

        {showAddWidget && (
          <AddWidget
            onAdd={handleAddWidget}
            onClose={() => setShowAddWidget(false)}
          />
        )}

        {editingWidget && (
          <WidgetSettings
            widget={state.widgets.find((w) => w.id === editingWidget)!}
            onUpdate={handleWidgetUpdate}
            onClose={() => setEditingWidget(null)}
          />
        )}

        {showImageGenerator && (
          <ImageGenerator
            widgets={state.widgets}
            onClose={() => setShowImageGenerator(false)}
          />
        )}
      </div>
    </div>
  );
}

export default App;
