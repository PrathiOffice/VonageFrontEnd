import React, { useEffect, useRef, useState } from 'react';
import OT from '@opentok/client';
import { fetchSessionData } from '../Service/apiservice';
import { adjustCamera, CameraCommand } from '../Service/cameraservice';
import IconButton from '@mui/material/IconButton';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';

interface VideoComponentProps {
  apiKey: string;
}

const VideoComponent: React.FC<VideoComponentProps> = ({ apiKey }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const publisherRef = useRef<HTMLDivElement | null>(null);
  const sessionRef = useRef<OT.Session | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [fetchedRoomName, setFetchedRoomName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [audioStarted, setAudioStarted] = useState<boolean>(false);

  useEffect(() => {
    const getSessionData = async () => {
      try {
        const { session_id, token, room_name } = await fetchSessionData();
        if (session_id && token && room_name) {
          setSessionId(session_id);
          setToken(token);
          setFetchedRoomName(room_name);
          // console.log("roomName"+roomName);
          console.log("room_name"+room_name);
        } else {
          setErrorMessage('Invalid session data received.');
        }
      } catch (error) {
        setErrorMessage('Failed to join the video call. Please try again.');
      }
    };

    getSessionData();
  }, [apiKey]);

  useEffect(() => {
    if (!sessionId || !token ||!fetchedRoomName) return;

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
            setErrorMessage(`Error subscribing to stream: ${err.message}`);
          }
        });
      }
    });

    session.connect(token, (error) => {
      if (error) {
        console.error('Error connecting to the video call:', error);
        setErrorMessage('Error connecting to the video call. Please try again.');
      } else {
        handleStart(session);
      }
    });

    return () => {
      session.disconnect();
      sessionRef.current = null;
    };
  }, [sessionId, token, apiKey]);

  const handleStart = async (session: OT.Session) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      setAudioStarted(true);

      if (publisherRef.current) {
        const publisher = OT.initPublisher(publisherRef.current, {
          insertMode: 'append',
          width: '100%',
          height: '100%',
        }, (err) => {
          if (err) {
            console.error('Error initializing publisher:', err.message);
            setErrorMessage(`Error initializing publisher: ${err.message}`);
            return;
          }
          session.publish(publisher, (err) => {
            if (err) {
              console.error('Error publishing video stream:', err.message);
              setErrorMessage(`Error publishing video stream: ${err.message}`);
            }
          });
        });
      } else {
        setErrorMessage('Publisher element not found.');
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
      setErrorMessage('An error occurred while accessing media devices.');
    }
  };

  // PTZ Camera Control Functions
  const controlCamera = (command: CameraCommand) => {
    adjustCamera(command)
      .then(() => console.log(`Camera command ${command} executed successfully.`))
      .catch((error) => console.error('Error executing camera command:', error));
  };

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100vw' }}>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      {fetchedRoomName && <div>Room Name: {fetchedRoomName}</div>}
      {!audioStarted && (
        <button onClick={() => handleStart(sessionRef.current as OT.Session)}>
          Start Audio & Video
        </button>
      )}
      <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} />
      <div ref={publisherRef} style={{ position: 'absolute', bottom: '10px', right: '10px', width: '200px', height: '150px', border: '2px solid #fff', borderRadius: '10px', zIndex: 10 }} />

      {/* PTZ Controls */}
      <div style={{ position: 'absolute', bottom: '70px', left: '10px', zIndex: 20 }}>
      <IconButton onClick={() => controlCamera('up_start')} aria-label="Move Up">
        <ArrowUpwardIcon />
      </IconButton>
      <IconButton onClick={() => controlCamera('down_start')} aria-label="Move Down">
        <ArrowDownwardIcon />
      </IconButton>
      <IconButton onClick={() => controlCamera('left_start')} aria-label="Move Left">
        <ArrowBackIcon />
      </IconButton>
      <IconButton onClick={() => controlCamera('right_start')} aria-label="Move Right">
        <ArrowForwardIcon />
      </IconButton>
      <IconButton onClick={() => controlCamera('zoomadd_start')} aria-label="Zoom In">
        <ZoomInIcon />
      </IconButton>
      <IconButton onClick={() => controlCamera('zoomdec_start')} aria-label="Zoom Out">
        <ZoomOutIcon />
      </IconButton>
      {/* Add stop buttons as needed */}
    </div>
    </div>
  );
};

export default VideoComponent;
