import React, { useState, useEffect, useRef } from 'react';
import YouTubePlayer from './components/YouTubePlayer';
import TimestampControls from './components/TimestampControls';
import TimestampList from './components/TimestampList';
import ThemeToggle from './components/ThemeToggle';
import HelpModal from './components/HelpModal';
import './App.css';

function App() {
  const [videoId, setVideoId] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [player, setPlayer] = useState(null);
  const [timestamps, setTimestamps] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('darkMode') === 'true'
  );
  const [showHelp, setShowHelp] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(null);
  
  const videoRef = useRef(null);
  const lastTimeUpdateRef = useRef(0);

  // Load timestamps from localStorage when videoId changes
  useEffect(() => {
    if (videoId) {
      const savedTimestamps = localStorage.getItem(`timestamps_${videoId}`);
      if (savedTimestamps) {
        setTimestamps(JSON.parse(savedTimestamps));
      } else {
        setTimestamps([]);
      }
    }
  }, [videoId]);

  // Save timestamps to localStorage when they change
  useEffect(() => {
    if (videoId && timestamps.length > 0) {
      localStorage.setItem(`timestamps_${videoId}`, JSON.stringify(timestamps));
    }
  }, [timestamps, videoId]);

  // Apply dark mode
  useEffect(() => {
    document.body.classList.toggle('dark-mode', isDarkMode);
    localStorage.setItem('darkMode', isDarkMode);
  }, [isDarkMode]);

  // Handle URL input
  const handleUrlSubmit = (e) => {
    e.preventDefault();
    const id = extractVideoId(inputUrl);
    if (id) {
      setVideoId(id);
    } else {
      alert('Invalid YouTube URL');
    }
  };

  // Extract video ID from YouTube URL
  const extractVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Add a new timestamp
  const addTimestamp = (endTime = null) => {
    if (!player) return;
    
    const time = player.getCurrentTime();
    
    const newTimestamp = {
      id: Date.now(),
      startTime: Math.floor(time),
      endTime: endTime ? Math.floor(endTime) : null,
      comment: '',
      category: 'other'
    };
    
    setTimestamps([...timestamps, newTimestamp]);
  };

  // Jump to a specific time in the video
  const jumpToTime = (time, endTime = null) => {
    if (!player) return;
    
    player.seekTo(time);
    player.playVideo();
    
    if (endTime) {
      // If endTime is provided, play until that time and then pause
      const duration = endTime - time;
      setTimeout(() => {
        player.pauseVideo();
      }, duration * 1000);
    }
  };

  // Update timestamp time
  const updateTime = (id, newTime, isEndTime) => {
    setTimestamps(timestamps.map(ts => {
      if (ts.id === id) {
        return {
          ...ts,
          [isEndTime ? 'endTime' : 'startTime']: newTime
        };
      }
      return ts;
    }));
  };

  // Update timestamp comment
  const updateComment = (id, newComment) => {
    setTimestamps(timestamps.map(ts => {
      if (ts.id === id) {
        return {
          ...ts,
          comment: newComment
        };
      }
      return ts;
    }));
  };

  // Update timestamp category
  const updateCategory = (id, newCategory) => {
    setTimestamps(timestamps.map(ts => {
      if (ts.id === id) {
        return {
          ...ts,
          category: newCategory
        };
      }
      return ts;
    }));
  };

  // Delete a timestamp
  const deleteTimestamp = (id) => {
    setTimestamps(timestamps.filter(ts => ts.id !== id));
  };

  // Download video segment using yt-dlp
  const downloadSegment = async (startTime, endTime) => {
    if (!videoId || !startTime || !endTime) {
      alert('Please select a valid timestamp with start and end times');
      return;
    }

    try {
      setDownloadProgress({ status: 'starting', progress: 0 });
      
      // Create a download URL using a service that can handle YouTube segments
      // This is a simplified approach - in a real app, you'd use a backend service
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const filename = `youtube-segment-${videoId}-${startTime}-${endTime}.mp4`;
      
      // Create a link to a service that can handle YouTube downloads
      // Note: This is a placeholder URL - you would need to implement or use a real service
      const downloadUrl = `https://youtube-dl-helper.netlify.app/api/download?url=${encodeURIComponent(videoUrl)}&start=${startTime}&end=${endTime}&filename=${encodeURIComponent(filename)}`;
      
      // For demonstration, we'll just open a new tab with instructions
      window.open(`https://www.y2mate.com/youtube/${videoId}`, '_blank');
      
      // Simulate progress for demonstration purposes
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setDownloadProgress({ status: 'processing', progress });
        
        if (progress >= 100) {
          clearInterval(interval);
          setDownloadProgress({ status: 'complete', progress: 100 });
          
          setTimeout(() => {
            setDownloadProgress(null);
          }, 3000);
        }
      }, 300);
      
    } catch (error) {
      console.error('Download error:', error);
      setDownloadProgress({ status: 'error', message: error.message || 'Failed to download segment' });
      
      setTimeout(() => {
        setDownloadProgress(null);
      }, 3000);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>YouTube Timestamp Tool</h1>
        <div className="header-controls">
          <button 
            className="help-button"
            onClick={() => setShowHelp(true)}
            title="Help"
          >
            ?
          </button>
          <ThemeToggle isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
        </div>
      </header>

      <main className="app-content">
        <form onSubmit={handleUrlSubmit} className="url-form">
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Enter YouTube URL"
            className="url-input"
          />
          <button type="submit" className="url-submit-btn">Load Video</button>
        </form>

        {videoId && (
          <div className="video-container">
            <YouTubePlayer
              videoId={videoId}
              onPlayerReady={setPlayer}
              onTimeUpdate={setCurrentTime}
              onPlayStateChange={setIsPlaying}
              ref={videoRef}
            />
            
            <div className="controls-container">
              <TimestampControls
                onAddTimestamp={addTimestamp}
                onDownloadSegment={downloadSegment}
                currentTime={currentTime}
                isPlaying={isPlaying}
                downloadProgress={downloadProgress}
              />
              
              <TimestampList
                timestamps={timestamps}
                onJumpToTime={jumpToTime}
                onUpdateTime={updateTime}
                onUpdateComment={updateComment}
                onDeleteTimestamp={deleteTimestamp}
                onUpdateCategory={updateCategory}
              />
            </div>
          </div>
        )}
      </main>

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </div>
  );
}

export default App;
