import axios from 'axios';

export const appendToGoogleSheets = async (data) => {
  try {
    const response = await axios.post('/api/googleSheets', { data });
    return response.data;
  } catch (error) {
    throw new Error(error.response ? error.response.data : error.message);
  }
};
