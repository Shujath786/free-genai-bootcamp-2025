
import { Card } from "@/components/ui/card";

const Sessions = () => {
  const sampleSessions = [
    { date: "March 15, 2024", duration: "25 mins", wordsReviewed: 30, accuracy: "92%" },
    { date: "March 14, 2024", duration: "15 mins", wordsReviewed: 20, accuracy: "85%" },
    { date: "March 13, 2024", duration: "40 mins", wordsReviewed: 45, accuracy: "88%" },
    { date: "March 12, 2024", duration: "20 mins", wordsReviewed: 25, accuracy: "90%" },
  ];

  return (
    <div className="space-y-6 animate-slideIn">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sessions</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Your study history</p>
      </header>
      
      <Card className="p-6">
        <div className="grid gap-4">
          <div className="grid grid-cols-4 font-medium text-gray-700 dark:text-gray-300">
            <div>Date</div>
            <div>Duration</div>
            <div>Words Reviewed</div>
            <div>Accuracy</div>
          </div>
          {sampleSessions.map((session, index) => (
            <div key={index} className="grid grid-cols-4 border-t py-3 text-gray-600 dark:text-gray-400">
              <div className="text-primary font-medium">{session.date}</div>
              <div>{session.duration}</div>
              <div>{session.wordsReviewed}</div>
              <div>{session.accuracy}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Sessions;
