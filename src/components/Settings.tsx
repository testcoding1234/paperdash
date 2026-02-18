import { useState } from 'react';
import type { DashboardState } from '../types';
import { JAPANESE_LABELS, WEATHER_LOCATIONS } from '../constants';

interface SettingsProps {
  state: DashboardState;
  onUpdate: (state: DashboardState) => void;
  onClose: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ state, onUpdate, onClose }) => {
  const [settings, setSettings] = useState(state.settings);

  const handleSave = () => {
    onUpdate({ ...state, settings });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white border-4 border-black max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-6">{JAPANESE_LABELS.settingsTitle}</h2>

        <div className="space-y-4">
          <div>
            <label className="block font-bold mb-2">
              {JAPANESE_LABELS.weatherLocation}
            </label>
            <select
              value={settings.defaultLocation}
              onChange={(e) =>
                setSettings({ ...settings, defaultLocation: e.target.value })
              }
              className="w-full border-2 border-black p-2"
            >
              {WEATHER_LOCATIONS.map((loc) => (
                <option key={loc.code} value={loc.code}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold mb-2">
              {JAPANESE_LABELS.githubUsername}
            </label>
            <input
              type="text"
              value={settings.githubUsername}
              onChange={(e) =>
                setSettings({ ...settings, githubUsername: e.target.value })
              }
              className="w-full border-2 border-black p-2"
              placeholder="username"
            />
          </div>

          <div>
            <label className="block font-bold mb-2">
              {JAPANESE_LABELS.grassRange}
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="7"
                  checked={settings.grassRange === 7}
                  onChange={() => setSettings({ ...settings, grassRange: 7 })}
                  className="mr-2"
                />
                {JAPANESE_LABELS.days7}
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="30"
                  checked={settings.grassRange === 30}
                  onChange={() => setSettings({ ...settings, grassRange: 30 })}
                  className="mr-2"
                />
                {JAPANESE_LABELS.days30}
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-8">
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
