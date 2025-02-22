
import { Card } from "@/components/ui/card";

const Groups = () => {
  const sampleGroups = [
    { name: "Basic Vocabulary", wordCount: 50, lastStudied: "Today", progress: "80%" },
    { name: "Common Phrases", wordCount: 30, lastStudied: "Yesterday", progress: "65%" },
    { name: "Food & Drinks", wordCount: 25, lastStudied: "3 days ago", progress: "45%" },
    { name: "Travel Words", wordCount: 40, lastStudied: "1 week ago", progress: "30%" },
  ];

  return (
    <div className="space-y-6 animate-slideIn">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Word Groups</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Organize your vocabulary</p>
      </header>
      
      <Card className="p-6">
        <div className="grid gap-4">
          <div className="grid grid-cols-4 font-medium text-gray-700 dark:text-gray-300">
            <div>Group Name</div>
            <div>Words</div>
            <div>Last Studied</div>
            <div>Progress</div>
          </div>
          {sampleGroups.map((group, index) => (
            <div key={index} className="grid grid-cols-4 border-t py-3 text-gray-600 dark:text-gray-400">
              <div className="text-primary font-medium">{group.name}</div>
              <div>{group.wordCount}</div>
              <div>{group.lastStudied}</div>
              <div>{group.progress}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Groups;
