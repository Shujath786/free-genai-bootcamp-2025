import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Clock, BookOpen, Brain, Pencil, VolumeX } from 'lucide-react';

const activities = [
  {
    id: 1,
    name: 'Vocabulary Quiz',
    description: 'Test your knowledge of Arabic vocabulary with interactive flashcards',
    icon: BookOpen,
    image: 'https://images.unsplash.com/photo-1544928147-79a2dbc1f389?w=800&q=80',
    color: 'from-blue-500 to-blue-700',
  },
  {
    id: 2,
    name: 'Listening Practice',
    description: 'Improve your Arabic listening skills with native speakers',
    icon: VolumeX,
    image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800&q=80',
    color: 'from-purple-500 to-purple-700',
  },
  {
    id: 3,
    name: 'Writing Exercise',
    description: 'Practice writing Arabic letters and words',
    icon: Pencil,
    image: 'https://images.unsplash.com/photo-1527690789675-4ea7d8357fd3?w=800&q=80',
    color: 'from-green-500 to-green-700',
  },
  {
    id: 4,
    name: 'Memory Game',
    description: 'Match Arabic words with their meanings in a fun memory game',
    icon: Brain,
    image: 'https://images.unsplash.com/photo-1471970394675-613138e45da3?w=800&q=80',
    color: 'from-orange-500 to-orange-700',
  },
];

export function StudyActivities() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h2 className="text-2xl font-bold leading-7 text-gray-900">Study Activities</h2>
        <p className="mt-1 text-sm leading-6 text-gray-500">Choose an activity to begin your study session</p>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-100 rounded-full p-3">
            <Clock className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">Recent Activity</h3>
            <p className="text-sm text-gray-500">Vocabulary Quiz - Basic Greetings</p>
          </div>
          <Link
            to="/study-activities/1"
            className="ml-auto inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Continue <Play className="ml-1.5 h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="group relative bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
          >
            <div className="h-48 overflow-hidden">
              <div
                className={`absolute inset-0 bg-gradient-to-br ${activity.color} opacity-90 mix-blend-multiply`}
              />
              <img
                src={activity.image}
                alt={activity.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <activity.icon className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{activity.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{activity.description}</p>
              <div className="flex items-center justify-between">
                <Link
                  to={`/study-activities/${activity.id}`}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  View Details
                </Link>
                <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <Play className="h-4 w-4 mr-1.5" />
                  Start
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Study Tips */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-6 mt-8">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Brain className="h-6 w-6 text-amber-600" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Study Tips</h3>
            <p className="text-sm text-gray-600">
              Regular practice is key to mastering Arabic. Try to complete at least one activity daily
              and review previously learned words frequently.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}