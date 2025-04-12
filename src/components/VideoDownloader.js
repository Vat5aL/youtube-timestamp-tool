import React, { useState } from 'react';
import './VideoDownloader.css';

const VideoDownloader = ({ timestamps, videoId }) => {
  const [selectedTimestamp, setSelectedTimestamp] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);

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

  const getDownloadOptions = () => {
    return timestamps
      .filter(ts => ts.endTime !== null) // Only include timestamps with end times
      .map(ts => ({
        id: ts.id,
        label: `${formatTime(ts.startTime)} - ${formatTime(ts.endTime)}${ts.comment ? ` (${ts.comment})` : ''}`,
        startTime: ts.startTime,
        endTime: ts.endTime
      }));
  };

  const handleDownload = () => {
    if (!selectedTimestamp || !videoId) return;
    
    setIsDownloading(true);
    setDownloadError(null);
    
    // Create download URL for external service
    // Note: This uses a third-party service as an example
    const timestamp = timestamps.find(ts => ts.id === parseInt(selectedTimestamp));
    if (!timestamp) return;
    
    const startTime = Math.floor(timestamp.startTime);
    const endTime = Math.floor(timestamp.endTime);
    const duration = endTime - startTime;
    
    // Example URL for a hypothetical download service
    const downloadUrl = `https://example-download-service.com/download?videoId=${videoId}&start=${startTime}&duration=${duration}`;
    
    // In a real implementation, you would integrate with a proper download service
    // For now, we'll just open the URL in a new tab
    window.open(downloadUrl, '_blank');
    
    setIsDownloading(false);
  };

  const downloadOptions = getDownloadOptions();

  return (
    <div className="video-downloader">
      <h3>Download Video Segments</h3>
      
      {downloadOptions.length === 0 ? (
        <div className="no-segments">
          <p>No segments available for download. Add timestamps with end times first.</p>
        </div>
      ) : (
        <>
          <div className="download-form">
            <select
              value={selectedTimestamp || ''}
              onChange={(e) => setSelectedTimestamp(e.target.value)}
              className="segment-select"
              disabled={isDownloading}
            >
              <option value="">Select a segment to download</option>
              {downloadOptions.map(option => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <button
              className="download-button"
              onClick={handleDownload}
              disabled={!selectedTimestamp || isDownloading}
            >
              {isDownloading ? 'Processing...' : 'Download Segment'}
            </button>
          </div>
          
          {downloadError && (
            <div className="download-error">
              {downloadError}
            </div>
          )}
          
          <div className="download-note">
            <p>Note: This feature requires a third-party service to process the download.</p>
          </div>
        </>
      )}
    </div>
  );
};

export default VideoDownloader;