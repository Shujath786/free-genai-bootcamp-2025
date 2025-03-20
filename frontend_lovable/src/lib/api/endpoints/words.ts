import { apiClient } from '../client';

interface Word {
  id: number;
  arabic: string;
  english: string;
  parts: Array<{
    letter: string;
    transliteration: string;
  }>;
  root?: string;
  transliteration?: string;
  wrong_count?: number;
  correct_count?: number;
}

export const wordsAPI = {
  getWords: () => apiClient.get<Word[]>('/words'),
  getWord: (id: number) => apiClient.get<Word>(`/words/${id}`),
  createWord: (word: Omit<Word, 'id'>) => apiClient.post<Word>('/words', word),
  updateWord: (id: number, word: Partial<Word>) => apiClient.put<Word>(`/words/${id}`, word),
  deleteWord: (id: number) => apiClient.delete<void>(`/words/${id}`),
};