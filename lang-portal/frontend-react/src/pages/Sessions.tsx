import React from 'react';

export function Sessions() {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h2 className="text-2xl font-bold leading-7 text-gray-900">Study Sessions</h2>
        <p className="mt-1 text-sm leading-6 text-gray-500">Review your learning history</p>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-300">
          <thead>
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">ID</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Activity</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Group</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Start Time</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Duration</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Items</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">#123</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">Vocabulary Quiz</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">Basic Greetings</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">2 hours ago</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">10 minutes</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">20</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}