import axios from 'axios';
import API_BASE_URL from '../lib/apiConfig'; // Adjust the path if necessary

export const fetchWords = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/words`);
    return response.data; // Ensure this returns the expected structure
  } catch (error) {
    console.error('Error fetching words:', error);
    throw error; // Rethrow the error for further handling
  }
};

export const addWord = async (word: { english: string; arabic: string; root: string }) => {
  const response = await axios.post(`${API_BASE_URL}/words`, word);
  return response.data;
}; 