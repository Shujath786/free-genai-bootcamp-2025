import React, { useState } from 'react';

function DataForm() {
  const [formData, setFormData] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Sending data:', formData);
      const response = await fetch('http://localhost:5000/api/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ data: formData }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Response received:', result);
      setMessage(result.message);
    } catch (error) {
      console.error('Detailed error:', error);
      setMessage(`Error submitting data: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
        <input
          type="text"
          value={formData}
          onChange={(e) => setFormData(e.target.value)}
          placeholder="Enter data"
          style={{ padding: '8px' }}
        />
        <button type="submit" style={{ padding: '8px' }}>Submit</button>
      </form>
      {message && <p style={{ marginTop: '10px', color: message.includes('Error') ? 'red' : 'green' }}>{message}</p>}
    </div>
  );
}

export default DataForm; 