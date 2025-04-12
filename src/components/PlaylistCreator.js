import React, { useState, useEffect } from 'react';
import './PlaylistCreator.css';

const PlaylistCreator = ({ timestamps, videoId, player }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playlistName, setPlaylistName] = useState('My Playlist');
  const [autoPlay, setAutoPlay] = useState(true);
  const [playbackInterval, setPlaybackInterval] = useState(null);

  // Filter timestamps that have both start and end times
  const validSegments = timestamps.filter(ts => ts.endTime !== null);

  // Start playing the playlist
  const startPlaylist = () => {
    if (validSegments.length === 0 || !player) return;
    
    setIsPlaying(true);
    setCurrentIndex(0);
    
    // Jump to the first segment
    player.seekTo(validSegments[0].startTime);
    player.playVideo();
    
    // Set up interval to check if we need to move to the next segment
    const interval = setInterval(checkPlaybackPosition, 500);
    setPlaybackInterval(interval);
  };

  // Stop the playlist
  const stopPlaylist = () => {
    setIsPlaying(false);
    if (playbackInterval) {
      clearInterval(playbackInterval);
      setPlaybackInterval(null);
    }
  };

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (playbackInterval) {
        clearInterval(playbackInterval);
      }
    };
  }, [playbackInterval]);

  // Check if we need to move to the next segment
  const checkPlaybackPosition = () => {
    if (!isPlaying || !player) return;
    
    const currentTime = player.getCurrentTime();
    const currentSegment = validSegments[currentIndex];
    
    // If we've reached the end of the current segment
    if (currentTime >= currentSegment.endTime) {
      // Move to the next segment if available
      if (currentIndex < validSegments.length - 1) {
        setCurrentIndex(currentIndex + 1);
        player.seekTo(validSegments[currentIndex + 1].startTime);
      } else {
        // End of playlist
        stopPlaylist();
      }
    }
  };

  // Jump to a specific segment
  const jumpToSegment = (index) => {
    if (!player || index < 0 || index >= validSegments.length) return;
    
    setCurrentIndex(index);
    player.seekTo(validSegments[index].startTime);
    
    if (!isPlaying && autoPlay) {
      setIsPlaying(true);
      player.playVideo();
      
      // Set up interval if not already set
      if (!playbackInterval) {
        const interval = setInterval(checkPlaybackPosition, 500);
        setPlaybackInterval(interval);
      }
    }
  };

  // Format time for display
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

  // Format duration
  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="playlist-creator">
      <h3>Playlist Creator</h3>
      
      {validSegments.length === 0 ? (
        <div className="no-segments">
          <p>No segments available for playlist. Add timestamps with end times first.</p>
        </div>
      ) : (
        <>
          <div className="playlist-header">
            <input
              type="text"
              className="playlist-name-input"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              placeholder="Playlist Name"
            />
            
            <div className="playlist-controls">
              {isPlaying ? (
                <button 
                  className="playlist-control-btn stop"
                  onClick={stopPlaylist}
                >
                  Stop
                </button>
              ) : (
                <button 
                  className="playlist-control-btn play"
                  onClick={startPlaylist}
                >
                  Play All
                </button>
              )}
              
              <label className="autoplay-label">
                <input
                  type="checkbox"
                  checked={autoPlay}
                  onChange={() => setAutoPlay(!autoPlay)}
                />
                Auto-play
              </label>
            </div>
          </div>
          
          <div className="playlist-items">
            {validSegments.map((segment, index) => (
              <div 
                key={segment.id} 
                className={`playlist-item ${index === currentIndex && isPlaying ? 'playing' : ''}`}
                onClick={() => jumpToSegment(index)}
              >
                <div className="playlist-item-number">{index + 1}</div>
                <div className="playlist-item-details">
                  <div className="playlist-item-time">
                    {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
                  </div>
                  <div className="playlist-item-comment">
                    {segment.comment || "No comment"}
                  </div>
                </div>
                <div className="playlist-item-duration">
                  {formatDuration(segment.endTime - segment.startTime)}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PlaylistCreator;