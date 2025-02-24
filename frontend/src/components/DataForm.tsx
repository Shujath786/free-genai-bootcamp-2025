import React, { useState } from 'react';

function DataForm() {
  const [formData, setFormData] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: formData }),
      });

      const result = await response.json();
      setMessage(result.message);
      if (response.ok) {
        setFormData(''); // Clear form on success
      }
    } catch (error) {
      setMessage('Failed to connect to server. Is the backend running?');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={formData}
          onChange={(e) => setFormData(e.target.value)}
          placeholder="Enter data"
          className="w-full p-2 border rounded"
          disabled={isLoading}
        />
        <button 
          type="submit" 
          className="px-4 py-2 bg-blue-500 text-white rounded"
          disabled={isLoading}
        >
          {isLoading ? 'Sending...' : 'Submit'}
        </button>
      </form>
      {message && (
        <p className={`mt-4 ${message.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
          {message}
        </p>
      )}
    </div>
  );
}

export default DataForm; 