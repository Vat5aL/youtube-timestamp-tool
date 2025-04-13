import React, { useState } from 'react';
import './AIFeatures.css';

const AIFeatures = ({ videoId, onAddTimestamps }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateTimestamps = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      // Call your backend API that interfaces with Gemini
      const response = await fetch('/api/generate-timestamps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate timestamps');
      }
      
      const data = await response.json();
      
      // Add the AI-generated timestamps to your app
      if (data.timestamps && data.timestamps.length > 0) {
        onAddTimestamps(data.timestamps);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="ai-features">
      <h3>AI Features</h3>
      
      <button 
        className="ai-button"
        onClick={generateTimestamps}
        disabled={isGenerating}
      >
        {isGenerating ? 'Generating...' : 'Generate Timestamps with AI'}
      </button>
      
      {error && <p className="error-message">{error}</p>}
      
      <div className="ai-info">
        <p>This feature uses Gemini AI to analyze the video and automatically generate timestamps for key moments.</p>
      </div>
    </div>
  );
};

export default AIFeatures;