const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS for frontend requests
app.use(cors({
  origin: 'http://localhost:3000' // Your React frontend URL
}));

// Parse JSON bodies
app.use(express.json());

// Example route
app.post('/api/data', (req, res) => {
  const data = req.body;
  console.log('Received data:', data);
  res.json({ message: 'Data received successfully' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 