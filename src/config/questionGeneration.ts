export const MAX_QUESTION_FILES = 3;

export const QUESTION_TYPES = [
  { key: 'CHOICE', label: 'Choice' },
  { key: 'MULTIPLE_CHOICE', label: 'Multiple choice' },
  { key: 'SHORT_ANSWER', label: 'Short answer' },
  { key: 'TRUE_FALSE', label: 'True/False' },
  { key: 'COMPLIANCE', label: 'Compliance' },
  { key: 'ESSAY', label: 'Essay' },
] as const;

export type QuestionType = typeof QUESTION_TYPES[number]['key'];
export type QuestionCounts = Record<QuestionType, number>;