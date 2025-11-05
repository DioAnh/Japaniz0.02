
export interface VocabularyItem {
  japanese: string;
  romaji: string;
  vietnamese: string;
}

export interface Feedback {
  type: 'correct' | 'incorrect' | 'info' | 'error';
  message: string;
}

export interface EvaluationResult {
    isCorrect: boolean;
    feedback: string;
}
