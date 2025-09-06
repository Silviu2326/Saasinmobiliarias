import { CommissionItem } from "../types";

interface AdjustmentsDialogProps {
  item: CommissionItem | null;
  onSave: () => void;
  onCancel: () => void;
  open: boolean;
}

export default function AdjustmentsDialog({
  item,
  onSave,
  onCancel,
  open,
}: AdjustmentsDialogProps) {
  if (!open || !item) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Ajustar comisión</h2>
        </div>
        <div className="p-6">
          <p className="mb-4">Ajuste para {item.ref}</p>
          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={onSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}