export const mockActivities = [
  {
    id: 1,
    name: "Vocabulary Quiz",
    description: "Test your knowledge of Arabic vocabulary with interactive flashcards",
    thumbnail_url: "https://images.unsplash.com/photo-1544928147-79a2dbc1f389?w=800&q=80"
  },
  {
    id: 2,
    name: "Listening Practice",
    description: "Improve your Arabic listening skills with native speakers",
    thumbnail_url: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800&q=80"
  }
];

export const mockSessions = [
  {
    id: 1,
    activity_name: "Vocabulary Quiz",
    group_name: "Basic Greetings",
    start_time: "2024-03-10T10:00:00Z",
    end_time: "2024-03-10T10:20:00Z",
    review_items_count: 20
  },
  {
    id: 2,
    activity_name: "Vocabulary Quiz",
    group_name: "Numbers",
    start_time: "2024-03-09T15:30:00Z",
    end_time: "2024-03-09T15:45:00Z",
    review_items_count: 15
  }
];

export const mockGroups = [
  {
    id: 1,
    name: "Basic Greetings",
    word_count: 20
  },
  {
    id: 2,
    name: "Numbers 1-100",
    word_count: 100
  },
  {
    id: 3,
    name: "Common Verbs",
    word_count: 50
  }
];

export const mockWords = [
  {
    id: 1,
    word_english: "Hello",
    word_arabic: "مرحبا",
    word_transliteration: "marhaba",
    parts_of_speech: "interjection",
    gender: "neutral",
    pronunciation: "mar-ha-ba",
    group_id: 1
  },
  {
    id: 2,
    word_english: "Good morning",
    word_arabic: "صباح الخير",
    word_transliteration: "sabah al-khair",
    parts_of_speech: "phrase",
    gender: "neutral",
    pronunciation: "sa-bah al-khayr",
    group_id: 1
  }
];