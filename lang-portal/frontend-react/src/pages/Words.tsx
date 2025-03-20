import React, { useEffect, useState } from 'react';
import { fetchWords } from '../services/api'; // Import the API service
import axios from 'axios';

export const Words: React.FC = () => {
  const [words, setWords] = useState<any[]>([]); // State to hold words
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const getWords = async () => {
      try {
        const data = await fetchWords();
        console.log('Fetched words:', data); // Log the fetched data
        setWords(data.words); // Ensure you're setting the correct structure
      } catch (error) {
        console.error('Error fetching words:', error);
        if (axios.isAxiosError(error)) {
          console.error('Error message:', error.message);
          console.error('Error response:', error.response);
        } else {
          console.error('Unexpected error:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    getWords();
  }, []);

  if (loading) return <div>Loading...</div>; // Loading state

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h2 className="text-2xl font-bold leading-7 text-gray-900">Words</h2>
        <p className="mt-1 text-sm leading-6 text-gray-500">Browse and manage your vocabulary</p>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead>
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">English</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Arabic</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Root</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Correct</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Wrong</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {words.map((word) => (
              <tr key={word.id}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{word.english}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 font-amiri">{word.arabic}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{word.root}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-green-600">{word.correct}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-red-600">{word.wrong}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}