export const fetchSessionData = async (roomName = 'teleconsult', role = 'publisher') => {
  try {
    const response = await fetch('http://127.0.0.1:8000/join-room', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ room_name: roomName, role: role }), // Send room name and role in the body
    });

    const responseText = await response.text();
    console.log('Raw response:', responseText);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return JSON.parse(responseText); // Parse response
  } catch (error) {
    console.error('Failed to fetch session data:', error);
    throw error; // Rethrow the error for further handling if necessary
  }
};
