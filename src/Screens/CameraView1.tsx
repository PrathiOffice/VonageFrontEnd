import React, { useEffect, useRef, useState } from 'react';

const CameraView1: React.FC = () => {
  const [hasCameraAccess, setHasCameraAccess] = useState<boolean>(false);
  const [hasMicrophoneAccess, setHasMicrophoneAccess] = useState<boolean>(false);
  const [hasLocationAccess, setHasLocationAccess] = useState<boolean>(false);
  const [networkSpeed, setNetworkSpeed] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [currentPermission, setCurrentPermission] = useState<'camera' | 'microphone' | 'location' | null>(null);
  const [showSuggestion, setShowSuggestion] = useState<boolean>(false);
  const [denialMessage, setDenialMessage] = useState<string | null>(null);

  // Check access functions
  const checkCameraAccess = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      setHasCameraAccess(true);
      requestPermission('microphone');
    } catch (error) {
      setHasCameraAccess(false);
      console.error("Camera access denied:", error);
      setShowSuggestion(true);
      requestPermission('microphone');
    }
  };

  const checkMicrophoneAccess = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasMicrophoneAccess(true);
      requestPermission('location'); // Still request location after microphone
    } catch (error) {
      setHasMicrophoneAccess(false);
      console.error("Microphone access denied:", error);
      setShowSuggestion(true);
      requestPermission('location'); // Request location even if microphone is denied
    }
  };

  const checkLocationAccess = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setHasLocationAccess(true);
        },
        () => {
          setHasLocationAccess(false);
          setShowSuggestion(true);
        }
      );
    } else {
      setHasLocationAccess(false);
      setShowSuggestion(true);
    }
  };

  // Function to request permissions
  const requestPermission = (permission: 'camera' | 'microphone' | 'location') => {
    setCurrentPermission(permission);
  };

  const handleAccept = () => {
    switch (currentPermission) {
      case 'camera':
        checkCameraAccess();
        break;
      case 'microphone':
        checkMicrophoneAccess();
        break;
      case 'location':
        checkLocationAccess();
        break;
      default:
        break;
    }
    setCurrentPermission(null); // Reset current permission after handling
    setDenialMessage(null); // Reset denial message
  };

  // Measure network speed
  const measureNetworkSpeed = () => {
    const startTime = new Date().getTime();
    const image = new Image();
    image.src = "https://www.google.com/images/phd/px.gif"; // Placeholder image

    image.onload = () => {
      const endTime = new Date().getTime();
      const duration = (endTime - startTime) / 1000; // in seconds
      const fileSize = 1000 * 1000; // Assuming the image size is ~1 MB
      const speed = (fileSize / duration) / 1024; // Speed in KBps
      setNetworkSpeed(speed);
    };

    image.onerror = () => {
      console.error("Image load failed.");
    };
  };

  const startVideo = async () => {
    if (videoRef.current && hasCameraAccess) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    }
  };

  useEffect(() => {
    measureNetworkSpeed();
    // Start the permission request flow with the camera
    requestPermission('camera');
  }, []);

  useEffect(() => {
    if (hasCameraAccess && hasMicrophoneAccess) {
      startVideo(); // Start video if both camera and microphone permissions are granted
    }
  }, [hasCameraAccess, hasMicrophoneAccess]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 text-white">
      <h1 className="text-4xl font-bold mb-6">Camera View</h1>
      
      {/* Permission Request Card */}
      {currentPermission && (
        <div className="bg-white text-gray-800 p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">{`${currentPermission.charAt(0).toUpperCase() + currentPermission.slice(1)} Permission Request`}</h2>
          <p className="mb-2">{`We need access to your ${currentPermission} to provide the best experience.`}</p>
          <div className="flex justify-center">
            <button onClick={handleAccept} className="bg-green-500 text-white px-6 py-3 rounded shadow hover:bg-green-600 transition duration-200">
              Access {currentPermission.charAt(0).toUpperCase() + currentPermission.slice(1)} Permission
            </button>
          </div>
        </div>
      )}

      {/* Video Element */}
      <div className="mt-4">
        <video ref={videoRef} className="w-full max-w-md rounded-lg shadow-lg" />
      </div>

      {/* Display access status */}
      <div className="mt-4 space-y-2">
        <p className={`font-semibold ${hasCameraAccess ? 'text-green-300' : 'text-red-300'}`}>
          Camera Access: {hasCameraAccess ? 'Granted' : 'Denied'}
        </p>
        <p className={`font-semibold ${hasMicrophoneAccess ? 'text-green-300' : 'text-red-300'}`}>
          Microphone Access: {hasMicrophoneAccess ? 'Granted' : 'Denied'}
        </p>
        <p className={`font-semibold ${hasLocationAccess ? 'text-green-300' : 'text-red-300'}`}>
          Location Access: {hasLocationAccess ? 'Granted' : 'Denied'}
        </p>
        <p className="font-semibold">
          Network Speed: {networkSpeed ? `${networkSpeed.toFixed(2)} KBps` : 'Calculating...'}
        </p>
      </div>

      {/* Suggestion for denied permissions */}
      {showSuggestion && (
        <div className="mt-6 text-center">
          <p className="text-lg">Please allow the necessary permissions for the best experience.</p>
        </div>
      )}

      {/* Denial message */}
      {denialMessage && (
        <div className="mt-6 text-center">
          <p className="text-lg text-red-300">{denialMessage}</p>
        </div>
      )}
    </div>
  );
};

export default CameraView1;
