import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Loader2, BookOpen, ArrowLeft } from 'lucide-react';
import { WordGroup, StudyActivity, getWordGroups, getStudyActivity, createStudySession, APIError } from '../lib/api';

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

export function StudyActivityLaunch() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<StudyActivity | null>(null);
  const [groups, setGroups] = useState<WordGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);
  const [launching, setLaunching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const [activityData, groupsData] = await Promise.all([
          getStudyActivity(id),
          getWordGroups(),
        ]);
        setActivity(activityData);
        setGroups(groupsData.items);
      } catch (err) {
        const errorMessage = err instanceof APIError 
          ? err.message 
          : 'Failed to load activity data. Please try again later.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  const handleLaunch = async () => {
    if (!id || !selectedGroupId) return;

    try {
      setLaunching(true);
      setError(null);
      const session = await createStudySession(id, selectedGroupId);
      navigate(`/sessions/${session.id}`);
    } catch (err) {
      const errorMessage = err instanceof APIError 
        ? err.message 
        : 'Failed to start study session. Please try again later.';
      setError(errorMessage);
      setLaunching(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!activity) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-6">
        <button
          onClick={() => navigate(`/study-activities/${id}`)}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Activity
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{activity.name}</h1>
          <p className="mt-1 text-gray-500">{activity.description}</p>
        </div>
      </div>

      {/* Launch Form */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="space-y-6">
          <div>
            <label htmlFor="group" className="block text-sm font-medium text-gray-700">
              Select Word Group
            </label>
            <select
              id="group"
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(Number(e.target.value))}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">Choose a group...</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name} ({group.word_count} words)
                </option>
              ))}
            </select>
          </div>

          {selectedGroupId && (
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <BookOpen className="h-5 w-5 text-blue-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Ready to Start
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      You'll be practicing with words from{' '}
                      {groups.find((g) => g.id === selectedGroupId)?.name}.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleLaunch}
              disabled={!selectedGroupId || launching}
              className={`
                inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white
                ${!selectedGroupId || launching
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }
              `}
            >
              {launching ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Starting...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Session
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}