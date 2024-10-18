// src/components/Home.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomeScreen: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4">Navigate to Pages</h1>
      <button
        onClick={() => handleNavigate('/page-one')}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-2 hover:bg-blue-600 transition"
      >
        Go to Page One
      </button>
      <button
        onClick={() => handleNavigate('/page-two')}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
      >
        Go to Page Two
      </button>
    </div>
  );
};

export default HomeScreen;
