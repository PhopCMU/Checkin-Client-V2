import { useAlert } from "./AlertContext";

export function AlertBottomSheet() {
  const { alert, hideAlert } = useAlert();

  if (!alert) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={hideAlert} />

      {/* Sheet */}
      <div className="relative w-full bg-white rounded-t-2xl p-5 animate-slide-up">
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4" />

        <p className="text-center text-gray-800 font-medium">{alert.message}</p>

        {alert.actionText && alert.onAction && (
          <button
            onClick={() => {
              alert.onAction?.();
              hideAlert();
            }}
            className="mt-4 w-full bg-blue-600 text-white py-3 rounded-xl font-semibold"
          >
            {alert.actionText}
          </button>
        )}
      </div>
    </div>
  );
}
