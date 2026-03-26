export interface WordDefinition {
  word: string;
  phonetic: string;
  meaning: string;
  example: string;
  grammar_notes: string[];
  level: 'Dễ' | 'Trung bình' | 'Khó';
}
