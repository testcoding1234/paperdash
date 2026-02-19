import { useState } from 'react';
import type { TodoSettings, TodoItem } from '../types';

interface TodoEditorProps {
  settings: TodoSettings;
  onUpdate: (settings: TodoSettings) => void;
}

export const TodoEditor: React.FC<TodoEditorProps> = ({ settings, onUpdate }) => {
  const [newTodo, setNewTodo] = useState('');

  const addTodo = () => {
    if (!newTodo.trim()) return;

    const newItem: TodoItem = {
      id: `todo-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      text: newTodo,
      completed: false,
    };

    onUpdate({
      items: [...settings.items, newItem],
    });

    setNewTodo('');
  };

  const toggleTodo = (id: string) => {
    onUpdate({
      items: settings.items.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      ),
    });
  };

  const deleteTodo = (id: string) => {
    onUpdate({
      items: settings.items.filter((item) => item.id !== id),
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block font-bold mb-2">To-Do管理</label>
        
        {/* 追加フォーム */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTodo()}
            placeholder="新しいタスクを入力"
            className="flex-1 border-2 border-black px-3 py-2"
          />
          <button
            onClick={addTodo}
            className="border-2 border-black px-4 py-2 font-bold hover:bg-black hover:text-white"
          >
            追加
          </button>
        </div>

        {/* Todoリスト */}
        <div className="space-y-2 border-2 border-black p-3 bg-gray-50 max-h-96 overflow-y-auto" role="list">
          {settings.items.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-4">
              タスクがありません
            </div>
          ) : (
            settings.items.map((item) => (
              <div
                key={item.id}
                role="listitem"
                className="flex items-center gap-3 bg-white p-2 border border-gray-300"
              >
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => toggleTodo(item.id)}
                  className="w-5 h-5"
                />
                <span
                  className={`flex-1 ${
                    item.completed ? 'line-through opacity-50' : ''
                  }`}
                >
                  {item.text}
                </span>
                <button
                  onClick={() => deleteTodo(item.id)}
                  className="border border-black px-3 py-1 text-sm hover:bg-black hover:text-white"
                >
                  削除
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
