export const fetchSessionData = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/join-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      const responseText = await response.text();
      console.log('Raw response:', responseText);
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      return JSON.parse(responseText); // Parse response
    } catch (error) {
      console.error('Failed to fetch session data:', error);
      throw error;
    }
  };
  