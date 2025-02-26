import React from 'react';

export function WordGroups() {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h2 className="text-2xl font-bold leading-7 text-gray-900">Word Groups</h2>
        <p className="mt-1 text-sm leading-6 text-gray-500">Manage your vocabulary groups</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Example Group Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900">Basic Greetings</h3>
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <span>20 words</span>
          </div>
          <div className="mt-4">
            <div className="h-2 bg-gray-200 rounded-full">
              <div className="h-2 bg-indigo-600 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>
          <div className="mt-4">
            <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
              View Details →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}