import React from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { BookOpen, Calendar, Trophy, Users } from 'lucide-react';
import { cn } from '../lib/utils';

const stats = [
  { name: 'Success Rate', value: '80%', icon: Trophy },
  { name: 'Study Sessions', value: '4', icon: Calendar },
  { name: 'Active Groups', value: '3', icon: Users },
  { name: 'Study Streak', value: '4 days', icon: BookOpen },
];

const tabs = [
  { name: 'Overview', href: '/dashboard' },
  { name: 'Progress', href: '/dashboard/progress' },
  { name: 'Statistics', href: '/dashboard/statistics' },
];

export function Dashboard() {
  const location = useLocation();

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#2A2D3E] to-[#1F2937] p-8 text-white">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Amiri, serif' }}>
            مرحباً بك في رحلة تعلم اللغة العربية
          </h1>
          <p className="text-gray-200 mb-6">Welcome to your Arabic learning journey</p>
          <Link 
            to="/study-activities"
            className="inline-block bg-white text-gray-900 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Start Studying
          </Link>
        </div>
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-10">
          <img
            src="https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=800&q=80"
            alt="Arabic Calligraphy"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Dashboard Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <Link
              key={tab.name}
              to={tab.href}
              className={cn(
                location.pathname === tab.href
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium'
              )}
            >
              {tab.name}
            </Link>
          ))}
        </nav>
      </div>

      <Routes>
        <Route path="/" element={<DashboardOverview stats={stats} />} />
        <Route path="/progress" element={<DashboardProgress />} />
        <Route path="/statistics" element={<DashboardStatistics />} />
      </Routes>
    </div>
  );
}

function DashboardOverview({ stats }: { stats: typeof stats }) {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6"
          >
            <dt>
              <div className="absolute rounded-md bg-indigo-500 p-3">
                <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">{stat.name}</p>
            </dt>
            <dd className="ml-16 flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
            </dd>
          </div>
        ))}
      </div>

      {/* Last Study Session */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Last Study Session</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Basic Greetings</p>
              <p className="text-sm font-medium text-gray-900">20 minutes ago</p>
            </div>
            <Link 
              to="/sessions"
              className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
            >
              View Details
            </Link>
          </div>
          <div className="flex space-x-4">
            <div className="flex-1 bg-green-50 rounded-lg p-4">
              <p className="text-green-700 font-medium">Correct</p>
              <p className="text-2xl font-bold text-green-800">15</p>
            </div>
            <div className="flex-1 bg-red-50 rounded-lg p-4">
              <p className="text-red-700 font-medium">Incorrect</p>
              <p className="text-2xl font-bold text-red-800">5</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardProgress() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Study Progress</h2>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm font-medium text-gray-900 mb-1">
            <span>Total Words Studied</span>
            <span>3/124</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div className="h-2 bg-indigo-500 rounded-full" style={{ width: '2.4%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardStatistics() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Detailed Statistics</h2>
      <div className="space-y-4">
        {/* Add detailed statistics content here */}
      </div>
    </div>
  );
}