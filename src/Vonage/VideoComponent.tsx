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
import MenuIcon from '@mui/icons-material/Menu';
import DownIcon from '@mui/icons-material/KeyboardArrowDown';
import UpIcon from '@mui/icons-material/KeyboardArrowUp';
import HomeIcon from '@mui/icons-material/Home';
import NorthEastIcon from '@mui/icons-material/NorthEast';
import NorthWestIcon from '@mui/icons-material/NorthWest';




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
  const [loading, setLoading] = useState<boolean>(true);
  const isDataFetched = useRef(false);
  const [isSubscriberActive, setIsSubscriberActive] = useState(false);
  const [isPublisherActive, setIsPublisherActive] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mouseCommand, setMouseCommand] = useState<CameraCommand | null>(null);
  const mouseStartPos = useRef<{ x: number; y: number } | null>(null);
  const mouseControlIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const getSessionData = async () => {
      if (isDataFetched.current) return;
      setLoading(true);
      try {
        const { session_id, token, room_name } = await fetchSessionData();
        if (session_id && token && room_name) {
          setSessionId(session_id);
          setToken(token);
          setFetchedRoomName(room_name);
          isDataFetched.current = true;
        } else {
          setErrorMessage('Invalid session data received.');
        }
      } catch (error) {
        setErrorMessage('Failed to join the video call. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    getSessionData();
  }, [apiKey]);

  useEffect(() => {
    if (!sessionId || !token || !fetchedRoomName) return;

    const session = OT.initSession(apiKey, sessionId);
    sessionRef.current = session;

    session.on('streamCreated', (event) => {
      setIsSubscriberActive(true);
      if (containerRef.current) {
        session.subscribe(
          event.stream,
          containerRef.current,
          {
            insertMode: 'append',
            width: '100%',
            height: '100%',
          },
          (err) => {
            if (err) {
              console.error('Error subscribing to stream:', err.message);
              setErrorMessage(`Error subscribing to stream: ${err.message}`);
            }
          }
        );
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
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      if (publisherRef.current) {
        const publisher = OT.initPublisher(
          publisherRef.current,
          {
            insertMode: 'append',
            width: '100%',
            height: '100%',
          },
          (err) => {
            if (err) {
              console.error('Error initializing publisher:', err.message);
              setErrorMessage(`Error initializing publisher: ${err.message}`);
              return;
            }
            session.publish(publisher, (err) => {
              if (err) {
                console.error('Error publishing video stream:', err.message);
                setErrorMessage(`Error publishing video stream: ${err.message}`);
              } else {
                setAudioStarted(true);
                setIsPublisherActive(true);
              }
            });
          }
        );
      } else {
        setErrorMessage('Publisher element not found.');
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
      setErrorMessage('An error occurred while accessing media devices.');
    }
  };

  const controlCamera = (command: CameraCommand) => {
    adjustCamera(command)
      .then(() => console.log(`Camera command ${command} executed successfully.`))
      .catch((error) => {
        console.error('Error executing camera command:', error);
        setErrorMessage(`Error executing camera command: ${error.message}`);
      });
  };

  const handleStopCamera = async () => {
    if (mouseCommand) {
      const stopCommand = mouseCommand.replace('_start', '_stop') as CameraCommand;
      try {
        await adjustCamera(stopCommand);
        console.log(`Camera stop command "${stopCommand}" sent successfully.`);
      } catch (error) {
        console.error('Error sending camera stop command:', error);
      }
      setMouseCommand(null);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (mouseCommand) {
      if (e.movementY > 0) {
        controlCamera('down_start');
      } else if (e.movementY < 0) {
        controlCamera('up_start');
      }
      if (e.movementX > 0) {
        controlCamera('right_start');
      } else if (e.movementX < 0) {
        controlCamera('left_start');
      }
    }
  };

  const handleMouseDown = (command: CameraCommand) => {
    setMouseCommand(command);
    controlCamera(command);
    mouseControlIntervalRef.current = setInterval(() => {
      controlCamera(command);
    }, 100);
  };

  const handleMouseUp = () => {
    handleStopCamera();
    setMouseCommand(null);
    if (mouseControlIntervalRef.current) {
      clearInterval(mouseControlIntervalRef.current);
      mouseControlIntervalRef.current = null;
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [mouseCommand]);

  return (
    <div
      style={{
        position: 'fixed', // Changed to fixed
        top: 0,
        left: 0,
        height: '100vh',
        width: '100vw',
        overflow: 'hidden', // Hide overflow
        zIndex: 0,
      }}
    >
      {loading && <div className="loading-message">Loading...</div>}
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      {/* {fetchedRoomName && <div>Room Name: {fetchedRoomName}</div>}
      {!audioStarted && (
        <button onClick={() => handleStart(sessionRef.current as OT.Session)}>
          Start Audio & Video
        </button>
      )} */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          overflow: 'hidden',
          zIndex: 1,
        }}
      />
      <div
        ref={publisherRef}
        style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          width: '200px',
          height: '150px',
          border: '2px solid #fff',
          borderRadius: '10px',
          zIndex: 10,
          overflow: 'hidden',
        }}
      />
      {isSubscriberActive && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            color: 'white',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            padding: '5px',
            borderRadius: '5px',
            zIndex: 20,
          }}
        >
          Subscriber is active
        </div>
      )}
 {/* Menu Button */}
 <div className='absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30'>
 <IconButton 
    className="bg-gradient-to-r from-blue-500 to-blue-300 text-white rounded-full p-4 "
    onClick={toggleMenu}
    style={{ zIndex: 100 }}
  >
    <MenuIcon />
  </IconButton>
 </div>
  {/* Camera Controls Menu */}
  {isMenuOpen && (
    <div className="absolute inset-0 bg-transparent bg-opacity-50 z-10">
      <div className="flex justify-center items-center h-full">
        <div className="flex justify-center items-center text-white space-x-4 absolute bottom-20">
          <IconButton
            className="text-white bg-gradient-to-r from-blue-500 to-blue-300 rounded-full p-4 mx-2"
            onMouseDown={() => handleMouseDown('up_start')}
            onMouseUp={handleMouseUp}
          >
            <UpIcon />
          </IconButton>

          <IconButton
            className="text-white bg-gradient-to-r from-blue-500 to-blue-300 rounded-full p-4 mx-2"
            onMouseDown={() => handleMouseDown('down_start')}
            onMouseUp={handleMouseUp}
            
          >
            <DownIcon />
          </IconButton>

          <IconButton
            className="text-white bg-gradient-to-r from-blue-500 to-blue-300 rounded-full p-4 mx-2"
            onMouseDown={() => handleMouseDown('left_start')}
            onMouseUp={handleMouseUp}

          >
            <ArrowBackIcon />
            </IconButton>

          <IconButton
            className="text-white bg-gradient-to-r from-blue-500 to-blue-300 rounded-full p-4 mx-2"
            onMouseDown={() => handleMouseDown('right_start')}
            onMouseUp={handleMouseUp}
          >
            <ArrowForwardIcon />
          </IconButton>

          <IconButton
            className="text-white bg-gradient-to-r from-blue-500 to-blue-300 rounded-full p-4 mx-2"
            onMouseDown={() => handleMouseDown('go_home')}
            onMouseUp={handleMouseUp}
          >
            <HomeIcon />
          </IconButton>


          <IconButton
            className="text-white bg-gradient-to-r from-blue-500 to-blue-300 rounded-full p-4 mx-2"
            onClick={() => controlCamera('zoomadd_start')}
            
          >
            <ZoomInIcon />
          </IconButton>

          <IconButton
            className="text-white bg-gradient-to-r from-blue-500 to-blue-300 rounded-full p-4 mx-2"
            onClick={() => controlCamera('zoomdec_start')}
          >
            <ZoomOutIcon />
          </IconButton>
        </div>
      </div>
    </div>
  )}
</div>


  );
};

export default VideoComponent;
