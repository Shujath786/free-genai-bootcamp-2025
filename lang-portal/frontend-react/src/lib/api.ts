import axios, { AxiosError } from 'axios';
import { mockActivities, mockSessions, mockGroups, mockWords } from './mockData';
import API_BASE_URL from './apiConfig';

const isDevelopment = import.meta.env.MODE === 'development';

const api = axios.create({
  baseURL: isDevelopment ? 'http://localhost:5000/api' : '/api',
  withCredentials: true, // Enable sending cookies in cross-origin requests
  headers: {
    'Content-Type': 'application/json',
  },
  // Add timeout
  timeout: 10000,
});

// Add request interceptor for handling requests
api.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for handling responses
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<{ message: string }>) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response error:', error.response.data);
      throw new APIError(
        error.response.data.message || 'An error occurred while processing your request'
      );
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Request error:', error.request);
      throw new APIError('No response received from server');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error:', error.message);
      throw new APIError('Failed to make request');
    }
  }
);

export interface StudyActivity {
  id: number;
  name: string;
  thumbnail_url: string;
  description: string;
}

export interface StudySession {
  id: number;
  activity_name: string;
  group_name: string;
  start_time: string;
  end_time: string;
  review_items_count: number;
}

export interface WordGroup {
  id: number;
  name: string;
  word_count: number;
}

export interface Word {
  id: number;
  word_english: string;
  word_arabic: string;
  word_transliteration: string;
  parts_of_speech: string;
  gender: string;
  pronunciation: string;
  group_id: number | undefined;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
  };
}

export interface WordReviewItem {
  id: number;
  word_id: number;
  study_session_id: number;
  is_correct: boolean;
  created_at: string;
}

export interface DashboardStats {
  total_words: number;
  total_sessions: number;
  total_reviews: number;
  accuracy_rate: number;
  recent_activities: Array<{
    date: string;
    activity_count: number;
  }>;
}

export interface UserPreferences {
  theme: string;
  notifications: boolean;
  audio_enabled: boolean;
  show_transliteration: boolean;
  auto_advance: boolean;
  language: string;
}

export class APIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'APIError';
  }
}

const handleError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message || error.message;
    throw new APIError(`API Error: ${message}`);
  }
  throw new APIError('An unexpected error occurred');
};

const mockPaginatedResponse = <T>(items: T[]): PaginatedResponse<T> => ({
  items,
  pagination: {
    current_page: 1,
    total_pages: 1,
    total_items: items.length,
    items_per_page: 10
  }
});

export const getStudyActivity = async (id: string): Promise<StudyActivity> => {
  if (isDevelopment) {
    const activity = mockActivities.find(a => a.id === parseInt(id));
    if (!activity) {
      throw new APIError('Activity not found');
    }
    return new Promise(resolve => setTimeout(() => resolve(activity), 500));
  }

  try {
    const response = await api.get<StudyActivity>(`/study_activities/${id}`);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const getStudyActivitySessions = async (id: string): Promise<PaginatedResponse<StudySession>> => {
  if (isDevelopment) {
    return new Promise(resolve => 
      setTimeout(() => resolve(mockPaginatedResponse(mockSessions)), 500)
    );
  }

  try {
    const response = await api.get<PaginatedResponse<StudySession>>(`/study_activities/${id}/study-sessions`);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const getWordGroups = async (): Promise<PaginatedResponse<WordGroup>> => {
  if (isDevelopment) {
    return new Promise(resolve => 
      setTimeout(() => resolve(mockPaginatedResponse(mockGroups)), 500)
    );
  }

  try {
    const response = await api.get<PaginatedResponse<WordGroup>>('/groups');
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const createStudySession = async (activityId: string, groupId: number): Promise<{ id: number; group_id: number }> => {
  if (isDevelopment) {
    return new Promise(resolve =>
      setTimeout(() => resolve({ id: Math.floor(Math.random() * 1000), group_id: groupId }), 500)
    );
  }

  try {
    const response = await api.post('/study_activities', {
      study_activity_id: parseInt(activityId, 10),
      group_id: groupId,
    });
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const getSessionWords = async (groupId: number): Promise<Word[]> => {
  if (isDevelopment) {
    const words = mockWords.filter(w => w.group_id !== undefined && w.group_id === groupId);
    return new Promise(resolve => setTimeout(() => resolve(words), 500));
  }

  try {
    const response = await api.get<Word[]>(`/groups/${groupId}/words`);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const getUserPreferences = async (): Promise<UserPreferences> => {
  if (isDevelopment) {
    return new Promise(resolve =>
      setTimeout(() => resolve({
        theme: 'light',
        notifications: true,
        audio_enabled: true,
        show_transliteration: true,
        auto_advance: false,
        language: 'en'
      }), 500)
    );
  }

  try {
    const response = await api.get<UserPreferences>('/preferences');
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const updateUserPreferences = async (preferences: Partial<UserPreferences>): Promise<UserPreferences> => {
  if (isDevelopment) {
    return new Promise(resolve =>
      setTimeout(() => resolve({
        theme: 'light',
        notifications: true,
        audio_enabled: true,
        show_transliteration: true,
        auto_advance: false,
        language: 'en',
        ...preferences
      }), 500)
    );
  }

  try {
    const response = await api.patch<UserPreferences>('/preferences', preferences);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const exportUserData = async (): Promise<Blob> => {
  if (isDevelopment) {
    const mockData = {
      preferences: {
        theme: 'light',
        notifications: true,
        audio_enabled: true,
        show_transliteration: true,
        auto_advance: false,
        language: 'en'
      },
      progress: {
        words_learned: 150,
        study_sessions: 25
      }
    };
    return new Blob([JSON.stringify(mockData, null, 2)], { type: 'application/json' });
  }

  try {
    const response = await api.get('/export', { responseType: 'blob' });
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const importUserData = async (file: File): Promise<void> => {
  if (isDevelopment) {
    return new Promise(resolve => setTimeout(resolve, 500));
  }

  try {
    const formData = new FormData();
    formData.append('data', file);
    await api.post('/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  } catch (error) {
    throw handleError(error);
  }
};

export const resetUserProgress = async (): Promise<void> => {
  if (isDevelopment) {
    return new Promise(resolve => setTimeout(resolve, 500));
  }

  try {
    await api.post('/reset-progress');
  } catch (error) {
    throw handleError(error);
  }
};

// Words endpoints
export const getAllWords = async (): Promise<PaginatedResponse<Word>> => {
  try {
    const response = await api.get<PaginatedResponse<Word>>('/words');
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const getWordById = async (wordId: number): Promise<Word> => {
  try {
    const response = await api.get<Word>(`/words/${wordId}`);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const searchWords = async (query: string): Promise<PaginatedResponse<Word>> => {
  try {
    const response = await api.get<PaginatedResponse<Word>>('/words/search', {
      params: { q: query }
    });
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Word Review endpoints
export const submitWordReview = async (
  sessionId: number,
  wordId: number,
  isCorrect: boolean
): Promise<WordReviewItem> => {
  try {
    const response = await api.post<WordReviewItem>('/word-reviews', {
      study_session_id: sessionId,
      word_id: wordId,
      is_correct: isCorrect
    });
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const getWordReviews = async (
  wordId: number
): Promise<PaginatedResponse<WordReviewItem>> => {
  try {
    const response = await api.get<PaginatedResponse<WordReviewItem>>(
      `/words/${wordId}/reviews`
    );
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Dashboard endpoints
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await api.get<DashboardStats>('/dashboard/stats');
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Group management endpoints
export const createWordGroup = async (name: string): Promise<WordGroup> => {
  try {
    const response = await api.post<WordGroup>('/groups', { name });
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const updateWordGroup = async (
  groupId: number,
  name: string
): Promise<WordGroup> => {
  try {
    const response = await api.put<WordGroup>(`/groups/${groupId}`, { name });
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const deleteWordGroup = async (groupId: number): Promise<void> => {
  try {
    await api.delete(`/groups/${groupId}`);
  } catch (error) {
    throw handleError(error);
  }
};

// Word-Group association endpoints
export const addWordToGroup = async (
  groupId: number,
  wordId: number
): Promise<void> => {
  try {
    await api.post(`/groups/${groupId}/words`, { word_id: wordId });
  } catch (error) {
    throw handleError(error);
  }
};

export const removeWordFromGroup = async (
  groupId: number,
  wordId: number
): Promise<void> => {
  try {
    await api.delete(`/groups/${groupId}/words/${wordId}`);
  } catch (error) {
    throw handleError(error);
  }
};

export const fetchWords = async (page: number = 1) => {
  try {
    const response = await fetch(`${API_BASE_URL}/words?page=${page}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data; // This will return the words data
  } catch (error) {
    console.error('Error fetching words:', error);
    throw error; // Rethrow the error for further handling
  }
};