import React, { useState, useEffect } from 'react';
import './ThumbnailGenerator.css';

const ThumbnailGenerator = ({ videoId, timestamps }) => {
  const [thumbnails, setThumbnails] = useState({});
  const [loading, setLoading] = useState(false);

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
      // In a real implementation, you might use a server-side solution to capture frames
      newThumbnails[timestamp.id] = {
        url: `https://img.youtube.com/vi/${videoId}/0.jpg`,
        time: timeInSeconds
      };
    });
    
    setThumbnails(newThumbnails);
    setLoading(false);
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
        <div className="thumbnail-grid">
          {timestamps.map(timestamp => (
            <div key={timestamp.id} className="thumbnail-item">
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