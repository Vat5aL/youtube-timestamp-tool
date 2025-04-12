import React, { useState } from 'react';
import './TimestampControls.css';

const TimestampControls = ({ 
  onAddTimestamp, 
  onDownloadSegment, 
  currentTime,
  isPlaying,
  downloadProgress
}) => {
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  
  // Format seconds to time string (HH:MM:SS)
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
  
  // Set start time for segment
  const setSegmentStart = () => {
    setStartTime(Math.floor(currentTime));
  };
  
  // Set end time for segment
  const setSegmentEnd = () => {
    setEndTime(Math.floor(currentTime));
  };
  
  // Add timestamp with current segment
  const addSegmentTimestamp = () => {
    if (startTime !== null && endTime !== null && startTime < endTime) {
      onAddTimestamp(endTime);
      // Reset segment times
      setStartTime(null);
      setEndTime(null);
    } else {
      alert('Please set valid start and end times (start must be before end)');
    }
  };
  
  // Download current segment
  const downloadCurrentSegment = () => {
    if (startTime !== null && endTime !== null && startTime < endTime) {
      onDownloadSegment(startTime, endTime);
    } else {
      alert('Please set valid start and end times (start must be before end)');
    }
  };
  
  // Reset segment times
  const resetSegment = () => {
    setStartTime(null);
    setEndTime(null);
  };

  return (
    <div className="timestamp-controls">
      <div className="current-time">
        Current Time: <span className="time-display">{formatTime(currentTime)}</span>
        <span className="play-status">{isPlaying ? '▶️ Playing' : '⏸️ Paused'}</span>
      </div>
      
      <div className="controls-section">
        <h3>Add Timestamp</h3>
        <div className="button-group">
          <button 
            onClick={() => onAddTimestamp()} 
            className="control-btn"
            title="Add timestamp at current position"
          >
            Add Current Position
          </button>
        </div>
      </div>
      
      <div className="controls-section">
        <h3>Segment Controls</h3>
        <div className="segment-times">
          <div className="segment-time">
            <span>Start: </span>
            <span className="time-display">{formatTime(startTime)}</span>
            <button 
              onClick={setSegmentStart} 
              className="time-set-btn"
              title="Set segment start time to current position"
            >
              Set
            </button>
          </div>
          <div className="segment-time">
            <span>End: </span>
            <span className="time-display">{formatTime(endTime)}</span>
            <button 
              onClick={setSegmentEnd} 
              className="time-set-btn"
              title="Set segment end time to current position"
            >
              Set
            </button>
          </div>
        </div>
        
        <div className="button-group">
          <button 
            onClick={addSegmentTimestamp} 
            className="control-btn"
            disabled={startTime === null || endTime === null || startTime >= endTime}
            title="Add timestamp with current segment"
          >
            Add Segment
          </button>
          <button 
            onClick={resetSegment} 
            className="control-btn secondary"
            disabled={startTime === null && endTime === null}
            title="Reset segment times"
          >
            Reset
          </button>
        </div>
      </div>
      
      <div className="controls-section">
        <h3>Download Segment</h3>
        <div className="button-group">
          <button 
            onClick={downloadCurrentSegment} 
            className="control-btn download-btn"
            disabled={startTime === null || endTime === null || startTime >= endTime || downloadProgress?.status === 'processing'}
            title="Download current segment"
          >
            {downloadProgress ? 
              `${downloadProgress.status === 'error' ? 'Error' : 
                downloadProgress.status === 'complete' ? 'Download Complete' : 
                `Downloading... ${downloadProgress.progress}%`}` : 
              'Download Segment'}
          </button>
        </div>
        
        {downloadProgress?.status === 'error' && (
          <div className="download-error">
            Error: {downloadProgress.message}
          </div>
        )}
        
        <div className="download-info">
          <p>Note: Segment download uses an external service and may not work for all videos due to YouTube's restrictions.</p>
        </div>
      </div>
    </div>
  );
};

export default TimestampControls;