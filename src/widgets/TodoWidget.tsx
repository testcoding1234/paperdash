import type { WidgetProps, TodoSettings } from '../types';

export const TodoWidget: React.FC<WidgetProps> = ({ config }) => {
  const settings = (config.settings as TodoSettings) || { items: [] };

  const getSizeClasses = () => {
    switch (config.size) {
      case 'S':
        return 'p-2 text-sm';
      case 'L':
        return 'p-6 text-lg';
      default:
        return 'p-4 text-base';
    }
  };

  return (
    <div className={`border-2 border-black bg-white ${getSizeClasses()}`}>
      <div className="font-bold mb-2">To-Do</div>
      
      <div className="space-y-1">
        {settings.items.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={item.completed}
              readOnly
              className="w-4 h-4"
            />
            <span className={item.completed ? 'line-through opacity-50' : ''}>
              {item.text}
            </span>
          </div>
        ))}
        {settings.items.length === 0 && (
          <div className="text-sm text-gray-500">タスクがありません</div>
        )}
      </div>
    </div>
  );
};
