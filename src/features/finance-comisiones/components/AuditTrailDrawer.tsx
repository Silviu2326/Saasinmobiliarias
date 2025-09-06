import { CommissionItem } from "../types";

interface AuditTrailDrawerProps {
  item: CommissionItem | null;
  open: boolean;
  onClose: () => void;
}

export default function AuditTrailDrawer({
  item,
  open,
  onClose,
}: AuditTrailDrawerProps) {
  if (!open || !item) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-end z-50">
      <div className="bg-white w-full max-w-md h-full overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Auditoría</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              ✕
            </button>
          </div>
        </div>
        <div className="p-6">
          <p className="text-gray-500">Trazabilidad para {item.ref} en desarrollo...</p>
        </div>
      </div>
    </div>
  );
}