import React, { useMemo, useState } from "react";
import { X, Copy, Sparkles, FileText } from "lucide-react";
import { toast } from "react-toastify";
import { generateQuestions } from "../services/questions";
import { MAX_QUESTION_FILES, QUESTION_TYPES, type QuestionCounts } from "../config/questionGeneration";
import type { FileItem } from "../services/interfaces";
import GiftPreview from "./GiftPreview";
import { MOCK_GIFT } from "../mocks/mockGift";

type Props = {
  open: boolean;
  files: FileItem[];
  selectedFileIds: string[];
  onClose: () => void;
};

const USE_MOCK = false;

const createDefaultCounts = (): QuestionCounts => ({
  CHOICE: 10,
  MULTIPLE_CHOICE: 5,
  SHORT_ANSWER: 0,
  TRUE_FALSE: 5,
  COMPLIANCE: 0,
  ESSAY: 0,
});

const QuestionGenerationWorkspace: React.FC<Props> = ({
  open,
  files,
  selectedFileIds,
  onClose,
}) => {
  const [counts, setCounts] = useState<QuestionCounts>(createDefaultCounts());
  const [provider, setProvider] = useState("GEMINI");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [viewMode, setViewMode] = useState<"raw" | "preview">("raw");

  const selectedFiles = useMemo(
    () => files.filter((f) => selectedFileIds.includes(f.id) && f.type === "file"),
    [files, selectedFileIds]
  );

  const handleGenerate = async () => {
    if (USE_MOCK) {
        setResult(MOCK_GIFT);
        setViewMode("preview");
        toast.success("Mock test loaded");
        return;
    }

    if (selectedFiles.length === 0) {
      toast.info("Выберите хотя бы один файл");
      return;
    }

    if (selectedFileIds.length > MAX_QUESTION_FILES) {
        toast.info(`Можно выбрать не более ${MAX_QUESTION_FILES} файлов`);
        return;
    }

    try {
      setLoading(true);
      setResult("");

      const resp = await generateQuestions({
        fileIds: selectedFiles.map((f) => f.id),
        questionCounts: counts,
        provider,
      });

      setResult(resp.result);
      toast.success("Тест сгенерирован");
    } catch (e) {
      console.error(e);
      toast.error("Не удалось сгенерировать тест");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    toast.success("Скопировано в буфер обмена");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/40">
      <div className="absolute right-0 top-0 h-full w-full max-w-4xl bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-[#3A3A3C] flex items-center gap-2">
              <Sparkles size={20} className="text-[#4B67F5]" />
              Question Generator
            </h2>
            <p className="text-sm text-gray-500">
              Selected files: {selectedFiles.length}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-[#3A3A3C]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[360px_1fr] min-h-0">
          <div className="border-r border-gray-200 p-6 overflow-y-auto">
            <h3 className="font-medium text-[#3A3A3C] mb-3">Files</h3>

            <div className="space-y-2 mb-6">
              {selectedFiles.map((file) => (
                <div key={file.id} className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2">
                  <FileText size={16} className="text-gray-400 shrink-0" />
                  <span className="text-sm text-[#3A3A3C] truncate">{file.name}</span>
                </div>
              ))}
            </div>

            <h3 className="font-medium text-[#3A3A3C] mb-3">Provider</h3>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 mb-6"
            >
              <option value="GEMINI">GEMINI</option>
              <option value="GIGA">GIGA</option>
            </select>

            <h3 className="font-medium text-[#3A3A3C] mb-3">Question counts</h3>
            <div className="space-y-3">
              {QUESTION_TYPES.map((type) => (
                <div key={type.key} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-[#3A3A3C]">{type.label}</span>
                  <input
                    type="number"
                    min={0}
                    value={counts[type.key]}
                    onChange={(e) =>
                      setCounts((prev) => ({
                        ...prev,
                        [type.key]: Math.max(0, Number(e.target.value) || 0),
                      }))
                    }
                    className="w-24 rounded-xl border border-gray-300 px-3 py-2"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || selectedFiles.length === 0}
              className="mt-6 w-full rounded-2xl bg-[#4B67F5] px-4 py-3 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Generating..." : "Generate test"}
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-[#3A3A3C]">Result</h3>

              {result && (
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
                >
                  <Copy size={14} />
                  Copy
                </button>
              )}
            </div>

            <div className="mb-4">
                <div className="relative grid grid-cols-2 rounded-2xl border border-gray-300 bg-gray-100 p-1 overflow-hidden">
                    
                    <div
                    className={`absolute top-1 bottom-1 left-1 right-1 grid grid-cols-2 transition-all duration-300`}
                    >
                    <div
                        className={`rounded-xl bg-white shadow-sm transition-transform duration-300
                        ${viewMode === "preview" ? "translate-x-full" : "translate-x-0"}
                        `}
                    />
                    </div>

                    <button
                    onClick={() => setViewMode("raw")}
                    className={`relative z-10 py-2 text-sm font-medium transition-colors
                        ${viewMode === "raw" ? "text-[#4B67F5]" : "text-gray-500"}
                    `}
                    >
                    Raw GIFT
                    </button>

                    <button
                    onClick={() => result && setViewMode("preview")}
                    disabled={!result}
                    className={`relative z-10 py-2 text-sm font-medium transition-colors
                        ${viewMode === "preview" ? "text-[#4B67F5]" : "text-gray-500"}
                        disabled:text-gray-400 disabled:cursor-not-allowed
                    `}
                    >
                    Preview Test
                    </button>
                </div>
            </div>

            <div className="flex-1 min-h-0 rounded-2xl border border-gray-200 bg-gray-50 p-4 overflow-auto">
              {result ? (
                viewMode === "raw" ? (
                    <pre className="whitespace-pre-wrap text-sm text-[#3A3A3C] leading-6">
                    {result}
                    </pre>
                ) : (
                    <GiftPreview gift={result} />
                )
                ) : (
                <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                    Generated test will appear here
                </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionGenerationWorkspace;
