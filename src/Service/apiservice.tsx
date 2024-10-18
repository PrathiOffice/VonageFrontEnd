// src/Service/apiservice.tsx
const baseUrl = 'http://127.0.0.1:8000'; 

export const fetchSessionData = async (roomName: string) => {
  try {
    const response = await fetch(`${baseUrl}/room`); 
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.session_id && data.token && data.room_name) { // Ensure room_name is included in the response
      return { session_id: data.session_id, token: data.token, room_name: data.room_name }; // Return room_name
    } else {
      throw new Error('Session ID, token, or room name not found in the response.');
    }
  } catch (error) {
    console.error('Error fetching session data:', error);
    throw error; 
  }

};


