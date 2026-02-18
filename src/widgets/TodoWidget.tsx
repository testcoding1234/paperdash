import { useState } from 'react';
import type { WidgetProps, TodoSettings, TodoItem } from '../types';

export const TodoWidget: React.FC<WidgetProps> = ({ config, onUpdate, previewMode }) => {
  const settings = (config.settings as TodoSettings) || { items: [] };
  const [newTodo, setNewTodo] = useState('');

  const addTodo = () => {
    if (!newTodo.trim()) return;

    const newItem: TodoItem = {
      id: `todo-${Date.now()}`,
      text: newTodo,
      completed: false,
    };

    onUpdate({
      ...config,
      settings: {
        ...settings,
        items: [...settings.items, newItem],
      },
    });

    setNewTodo('');
  };

  const toggleTodo = (id: string) => {
    onUpdate({
      ...config,
      settings: {
        ...settings,
        items: settings.items.map((item) =>
          item.id === id ? { ...item, completed: !item.completed } : item
        ),
      },
    });
  };

  const deleteTodo = (id: string) => {
    onUpdate({
      ...config,
      settings: {
        ...settings,
        items: settings.items.filter((item) => item.id !== id),
      },
    });
  };

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
      
      {!previewMode && (
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTodo()}
            placeholder="新しいタスク"
            className="flex-1 border border-black px-2 py-1 text-sm"
          />
          <button
            onClick={addTodo}
            className="border border-black px-3 py-1 text-sm bg-white hover:bg-black hover:text-white"
          >
            追加
          </button>
        </div>
      )}

      <div className="space-y-1">
        {settings.items.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={item.completed}
              onChange={() => toggleTodo(item.id)}
              className="w-4 h-4"
              disabled={previewMode}
            />
            <span className={item.completed ? 'line-through opacity-50' : ''}>
              {item.text}
            </span>
            {!previewMode && (
              <button
                onClick={() => deleteTodo(item.id)}
                className="ml-auto text-xs border border-black px-2 py-0.5 hover:bg-black hover:text-white"
              >
                削除
              </button>
            )}
          </div>
        ))}
        {settings.items.length === 0 && (
          <div className="text-sm text-gray-500">タスクがありません</div>
        )}
      </div>
    </div>
  );
};
