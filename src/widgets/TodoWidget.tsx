import type { WidgetProps, TodoSettings } from '../types';

export const TodoWidget: React.FC<WidgetProps> = ({ config }) => {
  const settings = (config.settings as TodoSettings) || { items: [] };

  return (
    <div className="border-2 border-black bg-white p-4 text-base">
      <div className="font-bold mb-2">To-Do</div>
      
      <div className="flex flex-wrap">
        {settings.items.map((item, index) => (
          <span key={item.id} className="whitespace-nowrap">
            {item.completed ? '☑' : '☐'}{item.text}
            {index < settings.items.length - 1 ? '\u3000' : ''}
          </span>
        ))}
        {settings.items.length === 0 && (
          <span className="text-sm text-gray-500">タスクがありません</span>
        )}
      </div>
    </div>
  );
};
