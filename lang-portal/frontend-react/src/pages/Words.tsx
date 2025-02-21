
import { Card } from "@/components/ui/card";

const Words = () => {
  const sampleWords = [
    { word: "كتاب", translation: "Book", category: "Nouns", lastReviewed: "2 days ago" },
    { word: "قلم", translation: "Pen", category: "Nouns", lastReviewed: "1 week ago" },
    { word: "مدرسة", translation: "School", category: "Nouns", lastReviewed: "3 days ago" },
    { word: "بيت", translation: "House", category: "Nouns", lastReviewed: "Today" },
  ];

  return (
    <div className="space-y-6 animate-slideIn">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Words</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Manage your vocabulary</p>
      </header>
      
      <Card className="p-6">
        <div className="grid gap-4">
          <div className="grid grid-cols-4 font-medium text-gray-700 dark:text-gray-300">
            <div>Word</div>
            <div>Translation</div>
            <div>Category</div>
            <div>Last Reviewed</div>
          </div>
          {sampleWords.map((word, index) => (
            <div key={index} className="grid grid-cols-4 border-t py-3 text-gray-600 dark:text-gray-400">
              <div className="text-primary font-medium">{word.word}</div>
              <div>{word.translation}</div>
              <div>{word.category}</div>
              <div>{word.lastReviewed}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Words;
