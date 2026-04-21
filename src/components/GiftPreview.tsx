import React, { useMemo } from "react";
import { parseGift } from "../utils/giftParser";

type Props = { gift: string };

const typeLabels: Record<string, string> = {
  choice: "Single choice",
  multiple: "Multiple choice",
  short: "Short answer",
  boolean: "True / False",
  matching: "Matching",
  essay: "Essay",
};

const GiftPreview: React.FC<Props> = ({ gift }) => {
  const questions = useMemo(() => parseGift(gift), [gift]);
  const correctStyle = "bg-green-50 border border-green-300 text-green-900";

  return (
    <div className="space-y-6">
      {questions.map((q, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="font-semibold text-[#3A3A3C]">
              {idx + 1}. {q.title || q.question}
            </div>

            <span className="inline-flex items-center justify-center text-center 
                min-w-[110px] text-xs px-3 py-1 rounded-full bg-gray-100 border text-gray-600 leading-tight">
              {typeLabels[q.type]}
            </span>
          </div>

          {q.title && (
            <div className="text-sm text-gray-600 mb-4">
              {q.question}
            </div>
          )}

          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            {q.type === "choice" &&
                q.options.map((o, i) => (
                    <label
                    key={i}
                    className={`flex items-center gap-3 mb-2 p-2 rounded-lg border
                        ${o.correct ? correctStyle : "border-transparent hover:bg-white"}
                    `}
                    >
                    <input type="radio" disabled checked={o.correct} />
                    <span>{o.text}</span>

                    {o.correct && (
                        <span className="ml-auto text-xs font-medium text-green-700">
                        correct
                        </span>
                    )}
                    </label>
            ))}

            {q.type === "multiple" &&
                q.options.map((o, i) => (
                    <label
                    key={i}
                    className={`flex items-center gap-3 mb-2 p-2 rounded-lg border
                        ${o.correct ? correctStyle : "border-transparent hover:bg-white"}
                    `}
                    >
                    <input type="checkbox" disabled checked={o.correct} />
                    <span>{o.text}</span>

                    {o.correct && (
                        <span className="ml-auto text-xs font-medium text-green-700">
                        correct
                        </span>
                    )}
                    </label>
                ))}

            {q.type === "boolean" && (
                <div className="flex gap-6">
                    {["True", "False"].map((label) => {
                    const isCorrect =
                        (label === "True" && q.answer) ||
                        (label === "False" && !q.answer);

                    return (
                        <label
                        key={label}
                        className={`flex items-center gap-2 p-2 rounded-lg border
                            ${isCorrect ? correctStyle : "border-transparent"}
                        `}
                        >
                        <input type="radio" disabled checked={isCorrect} />
                        {label}
                        {isCorrect && (
                            <span className="text-xs font-medium text-green-700 ml-2">
                            correct
                            </span>
                        )}
                        </label>
                    );
                    })}
                </div>
                )}

            {q.type === "short" && (
                <div className="space-y-2">
                    {q.answers.map((a, i) => (
                    <div
                        key={i}
                        className="px-3 py-2 rounded-lg bg-green-50 border border-green-300 text-green-900 text-sm"
                    >
                        {a}
                    </div>
                    ))}
                </div>
                )}
            

            {q.type === "matching" &&
                q.pairs.map((p, i) => (
                    <div
                    key={i}
                    className="flex items-center justify-between py-2 px-2 border-b last:border-none bg-green-50 border-green-200 rounded-lg"
                    >
                    <span>{p.left}</span>
                    <span className="text-gray-400">↔</span>
                    <span>{p.right}</span>
                    </div>
                ))}

            {q.type === "essay" && (
                <textarea
                    disabled
                    rows={4}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 bg-white"
                    placeholder="Write your essay..."
                />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default GiftPreview;
