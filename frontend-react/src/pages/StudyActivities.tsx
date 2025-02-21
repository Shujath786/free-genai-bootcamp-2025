
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Eye } from "lucide-react";

const StudyActivities = () => {
  return (
    <div className="space-y-6 animate-slideIn">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Study Activities</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Choose an activity to begin studying</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6 space-y-4">
          <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Adventure MUD</h3>
          <div className="flex space-x-2">
            <Button variant="default" className="flex items-center">
              <ExternalLink className="mr-2 h-4 w-4" />
              Launch
            </Button>
            <Button variant="outline" className="flex items-center">
              <Eye className="mr-2 h-4 w-4" />
              View
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StudyActivities;
