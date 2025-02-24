import { apiClient } from '../client';

interface Word {
  id: number;
  word: string;
  meaning: string;
  // Add other word properties
}

export const wordsAPI = {
  getWords: () => apiClient.get<Word[]>('/api/words'),
  getWord: (id: number) => apiClient.get<Word>(`/api/words/${id}`),
  createWord: (word: Omit<Word, 'id'>) => apiClient.post<Word>('/api/words', word),
  updateWord: (id: number, word: Partial<Word>) => apiClient.put<Word>(`/api/words/${id}`, word),
  deleteWord: (id: number) => apiClient.delete<void>(`/api/words/${id}`),
};