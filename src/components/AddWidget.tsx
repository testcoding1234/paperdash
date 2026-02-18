import { WIDGET_REGISTRY } from '../widgets';
import { JAPANESE_LABELS } from '../constants';

interface AddWidgetProps {
  onAdd: (type: string) => void;
  onClose: () => void;
}

export const AddWidget: React.FC<AddWidgetProps> = ({ onAdd, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white border-4 border-black max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-6">{JAPANESE_LABELS.addWidget}</h2>

        <div className="space-y-3 mb-6">
          {Object.entries(WIDGET_REGISTRY).map(([type, info]) => (
            <button
              key={type}
              onClick={() => {
                onAdd(type);
                onClose();
              }}
              className="w-full border-2 border-black p-4 text-left font-bold hover:bg-black hover:text-white"
            >
              {info.name}
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full border-2 border-black py-3 font-bold hover:bg-gray-100"
        >
          {JAPANESE_LABELS.cancel}
        </button>
      </div>
    </div>
  );
};
