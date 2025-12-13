import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

interface RenameDialogProps {
  isOpen: boolean;
  currentName: string;
  onClose: () => void;
  onConfirm: (newName: string) => Promise<void>;
  suggestedName?: string | null;
}

const splitFileName = (name: string) => {
  const lastDot = name.lastIndexOf(".");
  if (lastDot === -1) {
    return { base: name, ext: "" };
  }
  return {
    base: name.slice(0, lastDot),
    ext: name.slice(lastDot + 1)
  };
};

const RenameDialog: React.FC<RenameDialogProps> = ({ isOpen, onClose, currentName, onConfirm, suggestedName }) => {
  const [value, setValue] = useState(currentName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggest, setSuggest] = useState<string | null>(suggestedName ?? null);
  const isFile = currentName.includes(".");
  

  const [{ base, ext }, setParts] = useState(() =>
    splitFileName(currentName)
  );

  useEffect(() => {
    const name = suggestedName || currentName;
    const parts = splitFileName(name);
    setValue(name);
    setError(null);
    setSuggest(suggestedName ?? null);
    setParts(parts);
  }, [currentName, suggestedName, isOpen]);

  if (!isOpen) return null;

  const submit = async () => {
    const trimmed = value.trim();
    const validationError = getNameError(trimmed);

    if (validationError) {
        setError(validationError);
        return;
    }

    setLoading(true);
    setError(null);

    try {
      await onConfirm(trimmed);
      onClose();
    } catch (e: any) {
      setError(e.message || "Rename failed");
      if ((e as any).suggestedName) {
        setSuggest((e as any).suggestedName);
      }
    } finally {
      setLoading(false);
    }
  };

  const INVALID_CHARS = /[\\/:*?"<>|]/;

  const isValidName = (name: string) => {
    if (!name.trim()) return false;
    if (INVALID_CHARS.test(name)) return false;
    return true;
  };

  const getNameError = (name: string) => {
    if (!name.trim()) return "Name cannot be empty";
    if (INVALID_CHARS.test(name))
        return 'Name contains invalid characters: \\ / : * ? " < > |';
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl w-full max-w-md p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-[#3A3A3C]">Rename</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-md">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <label className="text-sm text-gray-600">New name</label>
          <div className="flex items-center space-x-2">
            <input
                value={base}
                onChange={(e) => {
                const newBase = e.target.value;
                if (INVALID_CHARS.test(newBase)) {
                    return;
                }

                setParts(prev => ({ ...prev, base: newBase }));
                setValue(ext ? `${newBase}.${ext}` : newBase);
                // синхронизируем value
                setValue(ext ? `${newBase}.${ext}` : newBase);
                }}
                className="flex-1 px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4B67F5]"
                onKeyDown={(e) => {
                if (e.key === "Enter") submit();
                }}
            />

            {isFile && (
                <input
                value={`.${ext}`}
                disabled
                className="w-24 px-3 py-2 border rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed"
                />
            )}
          </div>

          {suggest && (
            <div className="text-sm text-gray-600">
              Suggested:{" "}
              <button
                onClick={() => {
                    const parts = splitFileName(suggest);
                    setParts(parts);
                    setValue(suggest);
                    setError(null);
                }}
                className="text-blue-600 underline"
              >
                {suggest}
              </button>
            </div>
          )}

          {error && <div className="text-sm text-red-500">{error}</div>}

          <div className="flex justify-end space-x-2 mt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-100"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={submit}
              className="px-4 py-2 rounded-xl bg-[#4B67F5] text-white hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RenameDialog;
