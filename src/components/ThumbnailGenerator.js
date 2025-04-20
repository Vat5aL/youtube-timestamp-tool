import React, { useState, useEffect } from 'react';
import './ThumbnailGenerator.css';

const ThumbnailGenerator = ({ videoId, timestamps }) => {
  const [thumbnails, setThumbnails] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedTimestamp, setSelectedTimestamp] = useState(null);
  const [aiImage, setAiImage] = useState(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [error, setError] = useState(null);
  const [showAIThumbnail, setShowAIThumbnail] = useState(false);

  // Unsplash API credentials
  const UNSPLASH_ACCESS_KEY = 'mLGXcKdB6mkEl8WlPuTS7JzqD7dbvArCenEo57JUSwQ';

  // Generate thumbnails for all timestamps
  const generateAllThumbnails = () => {
    if (!videoId || timestamps.length === 0) return;
    
    setLoading(true);
    
    // Create a new object to store thumbnails
    const newThumbnails = {};
    
    // For each timestamp, generate a thumbnail URL
    timestamps.forEach(timestamp => {
      // Calculate the time in seconds for the thumbnail
      const timeInSeconds = Math.floor(timestamp.startTime);
      
      // Generate YouTube thumbnail URL
      // YouTube doesn't directly provide timestamp thumbnails, so we use the standard thumbnails
      newThumbnails[timestamp.id] = {
        url: `https://img.youtube.com/vi/${videoId}/0.jpg`,
        time: timeInSeconds
      };
    });
    
    setThumbnails(newThumbnails);
    setLoading(false);
  };

  // Generate AI thumbnail based on timestamp comment
  const generateAIThumbnail = async (timestamp) => {
    if (!timestamp || !timestamp.comment) {
      setError('Timestamp must have a comment to generate an AI image');
      return;
    }

    setSelectedTimestamp(timestamp);
    setIsGeneratingAI(true);
    setError(null);

    try {
      // Use Unsplash API to find an image related to the comment
      const query = encodeURIComponent(timestamp.comment);
      const response = await fetch(
        `https://api.unsplash.com/photos/random?query=${query}&client_id=${UNSPLASH_ACCESS_KEY}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Unsplash API error: ${errorData.errors?.[0] || 'Unknown error'}`);
      }

      const data = await response.json();
      setAiImage(data.urls.regular);
      setShowAIThumbnail(true); // Show AI thumbnail when generated
    } catch (err) {
      console.error('Error generating AI image:', err);
      setError(`Failed to generate image: ${err.message}`);
      
      // Fallback to text-based image
      generateTextThumbnail(timestamp.comment);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Generate a text-based thumbnail as fallback
  const generateTextThumbnail = (text) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Wrap text
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];
    
    for (let i = 1; i < words.length; i++) {
      const testLine = currentLine + ' ' + words[i];
      const metrics = ctx.measureText(testLine);
      if (metrics.width < canvas.width - 100) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = words[i];
      }
    }
    lines.push(currentLine);
    
    // Draw text lines
    const lineHeight = 60;
    const startY = canvas.height / 2 - (lines.length - 1) * lineHeight / 2;
    
    lines.forEach((line, i) => {
      ctx.fillText(line, canvas.width / 2, startY + i * lineHeight);
    });
    
    setAiImage(canvas.toDataURL('image/png'));
  };

  // Download the current thumbnail or AI image
  const downloadThumbnail = () => {
    if (!selectedTimestamp) return;
    
    const link = document.createElement('a');
    const time = Math.floor(selectedTimestamp.startTime);
    
    if (aiImage) {
      // Download AI-generated image
      link.href = aiImage;
      link.download = `thumbnail_${videoId}_${time}_ai.png`;
    } else {
      // Download YouTube thumbnail
      link.href = thumbnails[selectedTimestamp.id]?.url || `https://img.youtube.com/vi/${videoId}/0.jpg`;
      link.download = `thumbnail_${videoId}_${time}.jpg`;
    }
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Update thumbnails when timestamps or videoId changes
  useEffect(() => {
    if (videoId && timestamps.length > 0) {
      generateAllThumbnails();
    }
  }, [videoId, timestamps]);

  return (
    <div className="thumbnail-generator">
      <h3>Timestamp Thumbnails</h3>
      
      {loading ? (
        <div className="loading-thumbnails">Generating thumbnails...</div>
      ) : Object.keys(thumbnails).length === 0 ? (
        <div className="no-thumbnails">
          <p>No thumbnails available. Add timestamps first.</p>
        </div>
      ) : (
        <>
          <div className="thumbnail-grid">
            {timestamps.map(timestamp => (
              <div 
                key={timestamp.id} 
                className={`thumbnail-item ${selectedTimestamp?.id === timestamp.id ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedTimestamp(timestamp);
                  setShowAIThumbnail(false); // Reset to YouTube thumbnail when selecting a new timestamp
                  setAiImage(null);
                }}
              >
                <div className="thumbnail-image-container">
                  <img 
                    src={thumbnails[timestamp.id]?.url} 
                    alt={`Thumbnail at ${timestamp.startTime}s`}
                    className="thumbnail-image"
                  />
                  <div className="thumbnail-time">{formatTime(timestamp.startTime)}</div>
                </div>
                <div className="thumbnail-comment">{timestamp.comment || "No comment"}</div>
              </div>
            ))}
          </div>
          
          {selectedTimestamp && (
            <div className="thumbnail-detail">
              <h4>Selected Thumbnail</h4>
              
              <div className="thumbnail-preview">
                {showAIThumbnail && aiImage ? (
                  <>
                    <img 
                      src={aiImage} 
                      alt="AI Generated Thumbnail" 
                      className="ai-thumbnail-image"
                    />
                    <div className="thumbnail-source-indicator ai">AI Generated</div>
                  </>
                ) : (
                  <>
                    <img 
                      src={thumbnails[selectedTimestamp.id]?.url} 
                      alt={`Thumbnail at ${selectedTimestamp.startTime}s`}
                      className="selected-thumbnail-image"
                    />
                    <div className="thumbnail-source-indicator youtube">YouTube</div>
                  </>
                )}
              </div>
              
              <div className="thumbnail-actions">
                <button 
                  className="generate-ai-btn"
                  onClick={() => generateAIThumbnail(selectedTimestamp)}
                  disabled={isGeneratingAI || !selectedTimestamp.comment}
                >
                  {isGeneratingAI ? 'Generating...' : 'Generate AI Image'}
                </button>
                
                {showAIThumbnail && aiImage && (
                  <button 
                    className="toggle-thumbnail-btn"
                    onClick={() => setShowAIThumbnail(false)}
                  >
                    Show YouTube Thumbnail
                  </button>
                )}
                
                {!showAIThumbnail && aiImage && (
                  <button 
                    className="toggle-thumbnail-btn"
                    onClick={() => setShowAIThumbnail(true)}
                  >
                    Show AI Thumbnail
                  </button>
                )}
                
                <button 
                  className="download-btn"
                  onClick={downloadThumbnail}
                >
                  Download {showAIThumbnail && aiImage ? 'AI' : 'YouTube'} Thumbnail
                </button>
              </div>
              
              {error && <div className="error-message">{error}</div>}
            </div>
          )}
        </>
      )}
      
      <button 
        className="refresh-thumbnails-btn"
        onClick={generateAllThumbnails}
        disabled={loading || !videoId || timestamps.length === 0}
      >
        Refresh Thumbnails
      </button>
    </div>
  );
  
  function formatTime(seconds) {
    if (seconds === null) return '--:--:--';
    
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    return [
      h > 0 ? h.toString().padStart(2, '0') : '00',
      m.toString().padStart(2, '0'),
      s.toString().padStart(2, '0')
    ].join(':');
  }
};

export default ThumbnailGenerator;