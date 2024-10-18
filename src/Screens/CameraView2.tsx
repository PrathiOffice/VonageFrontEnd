import React, { useEffect, useRef, useState } from 'react';

const CameraView2: React.FC = () => {
  const [hasCameraAccess, setHasCameraAccess] = useState<boolean>(false);
  const [hasMicrophoneAccess, setHasMicrophoneAccess] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const [isCalling, setIsCalling] = useState<boolean>(false);
  
  // Replace with your signaling server logic
  const signalingServer = {
    send: (message: any) => {
      console.log("Send to signaling server:", message);
    },
    onMessage: (callback: (message: any) => void) => {
      // Placeholder: Replace with your actual signaling server logic
      // For example, use WebSocket to listen for messages from other peers
    }
  };

  const startVideo = async () => {
    try {
      localStreamRef.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = localStreamRef.current;
        // Ensuring that the video starts playing without interruption
        videoRef.current.onloadedmetadata = async () => {
          await videoRef.current?.play();
        };
      }
      setHasCameraAccess(true);
      setHasMicrophoneAccess(true);
      setupWebRTC();
    } catch (error) {
      console.error("Error accessing media devices.", error);
      setHasCameraAccess(false);
      setHasMicrophoneAccess(false);
    }
  };

  const setupWebRTC = () => {
    peerConnectionRef.current = new RTCPeerConnection();

    // Add local stream tracks to the peer connection
    localStreamRef.current?.getTracks().forEach(track => {
      peerConnectionRef.current?.addTrack(track, localStreamRef.current!);
    });

    // Handle incoming tracks from remote peer
    peerConnectionRef.current.ontrack = (event) => {
      // Check if remote video element exists and if the stream has changed
      if (remoteVideoRef.current && remoteVideoRef.current.srcObject !== event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
        remoteVideoRef.current.onloadedmetadata = async () => {
          await remoteVideoRef.current?.play(); // Start playing the remote stream
        };
      }
    };

    // Handle ICE candidates
    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        signalingServer.send({ type: "candidate", candidate: event.candidate });
      }
    };

    // Listen for messages from the signaling server
    signalingServer.onMessage((message) => {
      if (message.type === "offer") {
        handleOffer(message.offer);
      } else if (message.type === "answer") {
        handleAnswer(message.answer);
      } else if (message.type === "candidate") {
        handleCandidate(message.candidate);
      }
    });
  };

  const handleOffer = async (offer: RTCSessionDescriptionInit) => {
    if (peerConnectionRef.current) {
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      signalingServer.send({ type: "answer", answer });
      setIsCalling(true);
    }
  };

  const handleAnswer = (answer: RTCSessionDescriptionInit) => {
    peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(answer));
  };

  const handleCandidate = (candidate: RTCIceCandidateInit) => {
    peerConnectionRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
  };

  const handleCall = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.createOffer()
        .then(offer => {
          return peerConnectionRef.current!.setLocalDescription(offer);
        })
        .then(() => {
          // Send the offer to the remote peer through your signaling server
          signalingServer.send({ type: "offer", offer: peerConnectionRef.current!.localDescription });
          setIsCalling(true);
        })
        .catch(error => console.error("Error creating offer:", error));
    }
  };

  useEffect(() => {
    startVideo();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 text-white">
      <h1 className="text-4xl font-bold mb-6">Video Call</h1>
      
      {/* Local Video Element */}
      <div className="mt-4">
        <video ref={videoRef} className="w-full max-w-md rounded-lg shadow-lg" autoPlay muted />
      </div>

      {/* Remote Video Element */}
      <div className="mt-4">
        <video ref={remoteVideoRef} id="remoteVideo" className="w-full max-w-md rounded-lg shadow-lg" autoPlay />
      </div>

      {/* Access Status */}
      <div className="mt-4 space-y-2">
        <p className={`font-semibold ${hasCameraAccess ? 'text-green-300' : 'text-red-300'}`}>
          Camera Access: {hasCameraAccess ? 'Granted' : 'Denied'}
        </p>
        <p className={`font-semibold ${hasMicrophoneAccess ? 'text-green-300' : 'text-red-300'}`}>
          Microphone Access: {hasMicrophoneAccess ? 'Granted' : 'Denied'}
        </p>
      </div>

      {/* Call Button */}
      {!isCalling ? (
        <button 
          onClick={handleCall} 
          className="bg-green-500 text-white px-6 py-3 rounded shadow hover:bg-green-600 transition duration-200 mt-6">
          Start Call
        </button>
      ) : (
        <p className="mt-6">Calling...</p>
      )}
    </div>
  );
};

export default CameraView2;
