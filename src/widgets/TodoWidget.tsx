import type { WidgetProps, TodoSettings } from '../types';

export const TodoWidget: React.FC<WidgetProps> = ({ config }) => {
  const settings = (config.settings as TodoSettings) || { items: [] };

  return (
    <div className="border-2 border-black bg-white p-4 md:p-6">
      <div className="font-bold mb-2 text-base md:text-lg lg:text-xl">To-Do</div>
      
      <div className="flex flex-wrap text-sm md:text-base lg:text-lg">
        {settings.items.map((item, index) => (
          <span key={item.id} className="whitespace-nowrap">
            {item.completed ? '☑' : '☐'}{item.text}
            {index < settings.items.length - 1 ? '\u3000' : ''}
          </span>
        ))}
        {settings.items.length === 0 && (
          <span className="text-sm md:text-base text-gray-500">タスクがありません</span>
        )}
      </div>
    </div>
  );
};
