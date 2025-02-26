
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  Folder, 
  Clock, 
  Settings 
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Study Activities", path: "/study-activities", icon: BookOpen },
  { label: "Words", path: "/words", icon: FileText },
  { label: "Word Groups", path: "/groups", icon: Folder },
  { label: "Sessions", path: "/study_sessions", icon: Clock },
  { label: "Settings", path: "/settings", icon: Settings },
];

export const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/dashboard" className="text-xl font-semibold text-gray-900 dark:text-white">
                تَذْكِرَة
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors gap-2
                      ${
                        location.pathname === item.path
                          ? "border-primary text-primary"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )}
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
