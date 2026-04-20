export type ParsedQuestion =
  | {
      type: "choice";
      title?: string;
      question: string;
      options: { text: string; correct: boolean }[];
    }
  | {
      type: "multiple";
      title?: string;
      question: string;
      options: { text: string; weight: number; correct: boolean }[];
    }
  | {
      type: "short";
      title?: string;
      question: string;
      answers: string[];
    }
  | {
      type: "boolean";
      title?: string;
      question: string;
      answer: boolean;
    }
  | {
      type: "matching";
      title?: string;
      question: string;
      pairs: { left: string; right: string }[];
    }
  | {
      type: "essay";
      title?: string;
      question: string;
    };

export function parseGift(text: string): ParsedQuestion[] {
  const rawQuestions = text.split(/\n(?=::)/).filter(Boolean);
  const questions: ParsedQuestion[] = [];

  for (const raw of rawQuestions) {
    const match = raw.match(/::(.*?)::([\s\S]*)/);
    if (!match) continue;

    const title = match[1].trim();
    const rest = match[2].trim();

    const questionText = rest.slice(0, rest.indexOf("{")).trim();
    const answersBlock = rest.slice(
      rest.indexOf("{") + 1,
      rest.lastIndexOf("}")
    );

    const lines = answersBlock
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    // BOOLEAN
    if (answersBlock.includes("TRUE") || answersBlock.includes("FALSE")) {
      questions.push({
        type: "boolean",
        title,
        question: questionText,
        answer: answersBlock.includes("TRUE"),
      });
      continue;
    }

    // MATCHING
    if (lines.every((l) => l.startsWith("=") && l.includes("->"))) {
      questions.push({
        type: "matching",
        title,
        question: questionText,
        pairs: lines.map((l) => {
          const [lft, rgt] = l.slice(1).split("->");
          return { left: lft.trim(), right: rgt.trim() };
        }),
      });
      continue;
    }

    // SHORT
    if (lines.every((l) => l.startsWith("="))) {
      questions.push({
        type: "short",
        title,
        question: questionText,
        answers: lines.map((l) => l.slice(1).trim()),
      });
      continue;
    }

    // MULTIPLE
    if (lines.some((l) => l.includes("%"))) {
      questions.push({
        type: "multiple",
        title,
        question: questionText,
        options: lines.map((l) => {
            const match = l.match(/~%(.+?)%(.*)/);
            const weight = Number(match?.[1].replace(",", "."));
            return {
                weight,
                text: match?.[2].trim() ?? "",
                correct: weight > 0,
            };
        }),
      });
      continue;
    }

    // CHOICE
    if (lines.some((l) => l.startsWith("~") || l.startsWith("="))) {
      questions.push({
        type: "choice",
        title,
        question: questionText,
        options: lines.map((l) => ({
          text: l.slice(1).trim(),
          correct: l.startsWith("="),
        })),
      });
      continue;
    }

    // ESSAY
    questions.push({
      type: "essay",
      title,
      question: questionText,
    });
  }

  return questions;
}