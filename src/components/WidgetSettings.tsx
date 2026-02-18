import { useState } from 'react';
import type { WidgetConfig, WeatherSettings, GithubSettings } from '../types';
import { JAPANESE_LABELS, WEATHER_LOCATIONS } from '../constants';

interface WidgetSettingsProps {
  widget: WidgetConfig;
  onUpdate: (widget: WidgetConfig) => void;
  onClose: () => void;
}

export const WidgetSettings: React.FC<WidgetSettingsProps> = ({
  widget,
  onUpdate,
  onClose,
}) => {
  const [settings, setSettings] = useState(widget.settings);

  const handleSave = () => {
    onUpdate({ ...widget, settings });
    onClose();
  };

  const renderWeatherSettings = () => {
    const weatherSettings = settings as WeatherSettings;
    return (
      <div>
        <label className="block font-bold mb-2">
          {JAPANESE_LABELS.location}
        </label>
        <select
          value={weatherSettings.locationCode || '130000'}
          onChange={(e) => {
            const loc = WEATHER_LOCATIONS.find((l) => l.code === e.target.value);
            setSettings({
              locationCode: e.target.value,
              locationName: loc?.name || '',
            });
          }}
          className="w-full border-2 border-black p-2"
        >
          {WEATHER_LOCATIONS.map((loc) => (
            <option key={loc.code} value={loc.code}>
              {loc.name}
            </option>
          ))}
        </select>
      </div>
    );
  };

  const renderGithubSettings = () => {
    const githubSettings = settings as GithubSettings;
    return (
      <div className="space-y-4">
        <div>
          <label className="block font-bold mb-2">
            {JAPANESE_LABELS.username}
          </label>
          <input
            type="text"
            value={githubSettings.username || ''}
            onChange={(e) =>
              setSettings({ ...githubSettings, username: e.target.value })
            }
            className="w-full border-2 border-black p-2"
            placeholder="username"
          />
        </div>

        <div>
          <label className="block font-bold mb-2">
            {JAPANESE_LABELS.githubToken}
          </label>
          <input
            type="password"
            value={githubSettings.token || ''}
            onChange={(e) =>
              setSettings({ ...githubSettings, token: e.target.value })
            }
            className="w-full border-2 border-black p-2"
            placeholder="ghp_..."
          />
        </div>

        <div>
          <label className="block font-bold mb-2">
            {JAPANESE_LABELS.range}
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                checked={githubSettings.range === 7}
                onChange={() => setSettings({ ...githubSettings, range: 7 })}
                className="mr-2"
              />
              {JAPANESE_LABELS.days7}
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                checked={githubSettings.range === 30}
                onChange={() => setSettings({ ...githubSettings, range: 30 })}
                className="mr-2"
              />
              {JAPANESE_LABELS.days30}
            </label>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white border-4 border-black max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-6">
          {JAPANESE_LABELS.widgetSettings}
        </h2>

        <div className="mb-6">
          {widget.type === 'weather' && renderWeatherSettings()}
          {widget.type === 'github' && renderGithubSettings()}
          {widget.type === 'todo' && (
            <div className="text-sm text-gray-600">
              To-Doウィジェットには設定項目がありません
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleSave}
            className="flex-1 bg-black text-white py-3 font-bold hover:bg-gray-800"
          >
            {JAPANESE_LABELS.save}
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
