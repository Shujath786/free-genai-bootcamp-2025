import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Clock, Calendar, ChevronRight, Users, BookOpen, Loader2 } from 'lucide-react';
import { StudyActivity, StudySession, getStudyActivity, getStudyActivitySessions, APIError } from '../lib/api';

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <p className="text-red-800">{message}</p>
    </div>
  );
}

export function StudyActivityDetail() {
  const { id } = useParams<{ id: string }>();
  const [activity, setActivity] = useState<StudyActivity | null>(null);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const [activityData, sessionsData] = await Promise.all([
          getStudyActivity(id),
          getStudyActivitySessions(id),
        ]);
        setActivity(activityData);
        setSessions(sessionsData.items);
      } catch (err) {
        const errorMessage = err instanceof APIError 
          ? err.message 
          : 'Failed to load study activity data. Please try again later.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!activity) return null;

  return (
    <div className="space-y-6">
      {/* Header with Hero Image */}
      <div className="relative h-64 rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 opacity-90 mix-blend-multiply" />
        <img
          src={activity.thumbnail_url}
          alt={activity.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center px-8">
          <div className="text-white max-w-2xl">
            <h1 className="text-3xl font-bold mb-4">{activity.name}</h1>
            <p className="text-lg text-gray-100">{activity.description}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <Calendar className="h-6 w-6 text-blue-600" />
            <h3 className="ml-2 text-sm font-medium text-gray-900">Total Sessions</h3>
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{sessions.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <BookOpen className="h-6 w-6 text-green-600" />
            <h3 className="ml-2 text-sm font-medium text-gray-900">Total Items</h3>
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {sessions.reduce((sum, session) => sum + session.review_items_count, 0)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <Users className="h-6 w-6 text-purple-600" />
            <h3 className="ml-2 text-sm font-medium text-gray-900">Last Session</h3>
          </div>
          <p className="mt-2 text-sm font-semibold text-gray-900">
            {sessions[0]?.start_time
              ? new Date(sessions[0].start_time).toLocaleDateString()
              : 'No sessions yet'}
          </p>
        </div>
      </div>

      {/* Launch Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Start New Session</h2>
            <p className="mt-1 text-sm text-gray-500">Choose a word group to begin studying</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              to={`/study-activities/${id}/launch`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Play className="h-4 w-4 mr-2" />
              Launch Activity
            </Link>
          </div>
        </div>
      </div>

      {/* Past Sessions */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Past Sessions</h2>
          <p className="mt-1 text-sm text-gray-500">Review your previous study sessions</p>
        </div>
        {sessions.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No study sessions found. Start a new session to begin learning!
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {sessions.map((session) => (
              <div key={session.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-900">{session.group_name}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(session.start_time).toLocaleDateString()} · 
                        {new Date(session.end_time).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="mr-4 text-right">
                      <p className="text-sm text-gray-500">{session.review_items_count} Items</p>
                    </div>
                    <Link
                      to={`/sessions/${session.id}`}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}