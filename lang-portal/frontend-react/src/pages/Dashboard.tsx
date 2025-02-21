
import { Card } from "@/components/ui/card";
import { FileText, Users2, Activity, Clock } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="space-y-6 animate-slideIn">
      <div className="w-full">
        <img 
          src="/lovable-uploads/e4fe3d77-7858-4b57-aeab-ce3bc4c8517d.png"
          alt="Language learning banner"
          className="w-full h-48 object-cover"
        />
      </div>
      
      <header>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Welcome to your language learning journey</p>
      </header>

      <section>
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Last Session</h2>
        <Card className="p-6">
          <p className="text-gray-600 dark:text-gray-400">No recent sessions found</p>
        </Card>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Words</p>
            <p className="text-3xl font-bold mt-1">124</p>
          </div>
          <FileText className="h-8 w-8 text-blue-500" />
        </Card>

        <Card className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Study Sessions</p>
            <p className="text-3xl font-bold mt-1">28</p>
          </div>
          <Users2 className="h-8 w-8 text-red-500" />
        </Card>

        <Card className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Activities</p>
            <p className="text-3xl font-bold mt-1">12</p>
          </div>
          <Activity className="h-8 w-8 text-blue-500" />
        </Card>

        <Card className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Hours Learned</p>
            <p className="text-3xl font-bold mt-1">48</p>
          </div>
          <Clock className="h-8 w-8 text-red-500" />
        </Card>
      </section>
    </div>
  );
};

export default Dashboard;
