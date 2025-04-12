import React, { useRef } from 'react';
import './ProgressBar.css';

const ProgressBar = ({ currentTime, duration, timestamps, onSeek }) => {
  const progressBarRef = useRef(null);

  const handleClick = (e) => {
    if (!progressBarRef.current) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left;
    const percentage = clickPosition / rect.width;
    const seekTime = percentage * duration;
    
    onSeek(seekTime);
  };

  const renderMarkers = () => {
    if (!duration) return null;
    
    return timestamps.map((timestamp) => {
      const startPosition = (timestamp.startTime / duration) * 100;
      
      // For range timestamps (with end time)
      if (timestamp.endTime !== null) {
        const endPosition = (timestamp.endTime / duration) * 100;
        const width = endPosition - startPosition;
        
        return (
          <React.Fragment key={timestamp.id}>
            {/* Start marker */}
            <div 
              className="timestamp-marker start-marker"
              style={{ left: `${startPosition}%` }}
              title={`${formatTime(timestamp.startTime)} - ${timestamp.comment}`}
              onClick={() => onSeek(timestamp.startTime)}
            />
            
            {/* End marker */}
            <div 
              className="timestamp-marker end-marker"
              style={{ left: `${endPosition}%` }}
              title={`${formatTime(timestamp.endTime)} - ${timestamp.comment} (end)`}
              onClick={() => onSeek(timestamp.endTime)}
            />
            
            {/* Range highlight */}
            <div 
              className="timestamp-range"
              style={{ 
                left: `${startPosition}%`, 
                width: `${width}%` 
              }}
              title={`${formatTime(timestamp.startTime)} - ${formatTime(timestamp.endTime)} ${timestamp.comment}`}
            />
          </React.Fragment>
        );
      } else {
        // Single timestamp (no end time)
        return (
          <div 
            key={timestamp.id}
            className="timestamp-marker single-marker"
            style={{ left: `${startPosition}%` }}
            title={`${formatTime(timestamp.startTime)} - ${timestamp.comment}`}
            onClick={() => onSeek(timestamp.startTime)}
          />
        );
      }
    });
  };

  const formatTime = (seconds) => {
    if (seconds === null) return '--:--:--';
    
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    return [
      h > 0 ? h.toString().padStart(2, '0') : '00',
      m.toString().padStart(2, '0'),
      s.toString().padStart(2, '0')
    ].join(':');
  };

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div 
      className="progress-bar-container"
      ref={progressBarRef}
      onClick={handleClick}
    >
      <div className="progress-bar-background">
        {renderMarkers()}
        <div 
          className="progress-bar-fill"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      <div className="current-time-display">
        {formatTime(currentTime)} / {formatTime(duration)}
      </div>
    </div>
  );
};

export default ProgressBar;