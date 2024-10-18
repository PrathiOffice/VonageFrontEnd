// src/App.tsx
import React from 'react';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import VideoComponent from './Vonage/VideoComponent'; 

function App() {
  const sessionId = '2_MX40NjY5OTQ2Mn5-MTcyOTE2NjM0NzM2MX5CRkV0VHNDY29VU2Uwck9CYnl5bHpRNXR-UH5-'; // Your real token
  const token = 'T1==cGFydG5lcl9pZD00NjY5OTQ2MiZzaWc9ZDNjMWFjOGVmOTAyODg0YTAyZmZiNmIwYWM3YTU3MTQyYWIwZDk3MzpzZXNzaW9uX2lkPTJfTVg0ME5qWTVPVFEyTW41LU1UY3lPVEUyTmpNME56TTJNWDVDUmtWMFZITkRZMjlWVTJVd2NrOUNZbmw1YkhwUk5YUi1VSDUtJmNyZWF0ZV90aW1lPTE3MjkyMzU5NDkmcm9sZT1wdWJsaXNoZXImbm9uY2U9MTcyOTIzNTk0OS41NDAxODAyNDQ2MTU1JmluaXRpYWxfbGF5b3V0X2NsYXNzX2xpc3Q9'; // Your real sessionId

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<VideoComponent apiKey={'46699462'} roomName={''}/>} />
      </Routes>
    </div>
  );
}

export default App;
