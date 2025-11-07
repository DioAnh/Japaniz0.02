
export interface VocabularyItem {
  japanese: string;
  hiragana: string;
  romaji: string;
  vietnamese: string;
}

export interface Topic {
  topicName: string; // Tên topic (ví dụ: "Chào hỏi")
  vocabulary: VocabularyItem[]; // Danh sách từ vựng trong topic đó
}

export interface Feedback {
  type: 'correct' | 'incorrect' | 'info' | 'error';
  message: string;
}

export interface EvaluationResult {
    isCorrect: boolean;
    feedback: string;
}
