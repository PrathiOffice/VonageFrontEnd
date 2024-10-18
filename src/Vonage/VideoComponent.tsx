import React, { useEffect, useRef, useState } from 'react';
import OT from '@opentok/client';
import { fetchSessionData } from '../Service/apiservice';

interface VideoComponentProps {
  apiKey: string; 
  roomName: string; 
}

const VideoComponent: React.FC<VideoComponentProps> = ({ apiKey, roomName }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sessionRef = useRef<OT.Session | null>(null);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [fetchedRoomName, setFetchedRoomName] = useState<string | null>(null); // New state for room name
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const getSessionData = async () => {
      try {
        const { session_id, token, room_name } = await fetchSessionData(roomName); // Destructure room_name
        setSessionId(session_id);
        setToken(token);
        setFetchedRoomName(room_name); // Set room name in state
      } catch (error) {
        console.error('Failed to fetch session data:', error);
        setErrorMessage('Failed to join the video call. Please try again.');
      }
    };

    getSessionData();
  }, [roomName]);

  useEffect(() => {
    if (!sessionId || !token) return;
  
    const session = OT.initSession(apiKey, sessionId);
    sessionRef.current = session;
  
    session.on('streamCreated', (event) => {
      if (containerRef.current) {
        session.subscribe(event.stream, containerRef.current, {
          insertMode: 'append',
          width: '100%',
          height: '100%',
        }, (err) => {
          if (err) {
            console.error('Error subscribing to stream:', err.message);
          }
        });
      }
    });
  
    session.connect(token, (error) => {
      if (error) {
        console.error('Error connecting to the session:', error.message);
        setErrorMessage('Error connecting to the video call. Please try again.');
      } else {
        console.log('Connected to the session');
        // Ensure containerRef.current is not null before passing to OT.initPublisher
        if (containerRef.current) {
          const publisher = OT.initPublisher(containerRef.current, {
            insertMode: 'append',
            width: '100%',
            height: '100%',
          }, (err) => {
            if (err) {
              console.error('Error initializing publisher:', err.message);
            }
          });
  
          session.publish(publisher, (err) => {
            if (err) {
              console.error('Error publishing to the session:', err.message);
              setErrorMessage('Error publishing video stream.');
            } else {
              console.log('Publishing to the session');
            }
          });
        } else {
          console.error('containerRef.current is null');
        }
      }
    });
  
    return () => {
      if (session) {
        session.disconnect();
      }
    };
  }, [sessionId, token, apiKey]);
  

  return (
    <div>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      {fetchedRoomName && <div>Room Name: {fetchedRoomName}</div>} {/* Display room name */}
      <div ref={containerRef} style={{ width: '100%', height: '500px' }} />
    </div>
  );
};

export default VideoComponent;
