import React, { useState } from 'react';
import './TimestampControls.css';

const TimestampControls = ({ currentTime, onAddTimestamp, onAddEndTimestamp, onClearAll }) => {
  const [comment, setComment] = useState('');

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    return [
      h > 0 ? h.toString().padStart(2, '0') : '00',
      m.toString().padStart(2, '0'),
      s.toString().padStart(2, '0')
    ].join(':');
  };

  const handleAddTimestamp = () => {
    onAddTimestamp(comment);
    setComment('');
  };

  return (
    <div className="timestamp-controls">
      <div className="current-time">
        <span className="time-label">Current Time:</span>
        <span className="time-value">{formatTime(currentTime)}</span>
      </div>
      
      <div className="controls-row">
        <input
          type="text"
          placeholder="Add a comment (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="comment-input"
        />
        
        <div className="button-group">
          <button 
            className="add-timestamp-btn"
            onClick={handleAddTimestamp}
            title="Add timestamp at current position (minus 2 seconds)"
          >
            Add Timestamp
          </button>
          
          <button 
            className="add-end-timestamp-btn"
            onClick={onAddEndTimestamp}
            title="Add end time to the most recent timestamp"
          >
            Add End Time
          </button>
          
          <button 
            className="clear-all-btn"
            onClick={() => {
              if (window.confirm('Are you sure you want to clear all timestamps?')) {
                onClearAll();
              }
            }}
            title="Clear all timestamps"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimestampControls;