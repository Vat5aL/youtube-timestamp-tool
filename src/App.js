import React, { useState, useEffect } from 'react';
import YouTubePlayer from './components/YouTubePlayer';
import TimestampControls from './components/TimestampControls';
import TimestampList from './components/TimestampList';
import ImportExport from './components/ImportExport';
import ProgressBar from './components/ProgressBar';
import './App.css';
import KeyboardShortcuts from './components/KeyboardShortcuts';
import HelpModal from './components/HelpModal';
import VideoDownloader from './components/VideoDownloader';
import ThumbnailGenerator from './components/ThumbnailGenerator';
// Remove these imports
// import PlaylistCreator from './components/PlaylistCreator';
// import AIFeatures from './components/AIFeatures';
import ThemeToggle from './components/ThemeToggle';
import KeyboardShortcutSettings from './components/KeyboardShortcutSettings';

function App() {
  const [videoId, setVideoId] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [player, setPlayer] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [timestamps, setTimestamps] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [shortcutSettingsOpen, setShortcutSettingsOpen] = useState(false);
  // Add videoTitle state
  const [videoTitle, setVideoTitle] = useState('');
  const [customShortcuts, setCustomShortcuts] = useState({
    addTimestamp: 't',
    addEndTimestamp: 'e',
    playPause: ' ',
    seekForward: 'ArrowRight',
    seekBackward: 'ArrowLeft'
  });

  // Load theme and shortcuts from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
      document.body.className = savedTheme;
    } else {
      document.body.className = 'dark';
    }

    const savedShortcuts = localStorage.getItem('customShortcuts');
    if (savedShortcuts) {
      setCustomShortcuts(JSON.parse(savedShortcuts));
    }
  }, []);

  // Save theme to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Function to check if any input is focused
  const isInputFocused = () => {
    const activeElement = document.activeElement;
    return activeElement.tagName === 'INPUT' || 
           activeElement.tagName === 'TEXTAREA' || 
           activeElement.isContentEditable;
  };

  // Handle player ready event
  // Update handlePlayerReady to also get the video title
  const handlePlayerReady = (ytPlayer) => {
    setPlayer(ytPlayer);
    setDuration(ytPlayer.getDuration());
    // Try to get video title if available
    try {
      setVideoTitle(ytPlayer.getVideoData().title);
    } catch (err) {
      console.log('Could not get video title');
    }
  };

  // Handle URL change
  const handleUrlChange = (url) => {
    setVideoUrl(url);
    
    // Extract video ID from URL
    const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (videoIdMatch && videoIdMatch[1]) {
      setVideoId(videoIdMatch[1]);
    }
  };

  // Jump to specific time in the video
  const jumpToTime = (time) => {
    if (player) {
      player.seekTo(time, true);
    }
  };

  // Add a new timestamp
  const addTimestamp = (comment = '') => {
    if (player) {
      const time = player.getCurrentTime();
      const newTimestamp = {
        id: Date.now(),
        startTime: time,
        endTime: null,
        comment: comment,
        category: 'default'
      };
      setTimestamps([...timestamps, newTimestamp]);
    }
  };

  // Add end time to the last timestamp
  const addEndTimestamp = () => {
    if (player && timestamps.length > 0) {
      const time = player.getCurrentTime();
      const lastTimestamp = timestamps[timestamps.length - 1];
      
      // Only update if the end time is after the start time
      if (time > lastTimestamp.startTime) {
        const updatedTimestamps = [...timestamps];
        updatedTimestamps[timestamps.length - 1] = {
          ...lastTimestamp,
          endTime: time
        };
        setTimestamps(updatedTimestamps);
      }
    }
  };

  // Update timestamp time
  const updateTimestampTime = (id, newTime, isEndTime = false) => {
    const updatedTimestamps = timestamps.map(timestamp => {
      if (timestamp.id === id) {
        if (isEndTime) {
          return { ...timestamp, endTime: newTime };
        } else {
          return { ...timestamp, startTime: newTime };
        }
      }
      return timestamp;
    });
    setTimestamps(updatedTimestamps);
  };

  // Update timestamp comment
  const updateTimestampComment = (id, newComment) => {
    const updatedTimestamps = timestamps.map(timestamp => {
      if (timestamp.id === id) {
        return { ...timestamp, comment: newComment };
      }
      return timestamp;
    });
    setTimestamps(updatedTimestamps);
  };

  // Update timestamp category
  const updateTimestampCategory = (id, category) => {
    const updatedTimestamps = timestamps.map(timestamp => {
      if (timestamp.id === id) {
        return { ...timestamp, category };
      }
      return timestamp;
    });
    setTimestamps(updatedTimestamps);
  };

  // Delete a timestamp
  const deleteTimestamp = (id) => {
    const updatedTimestamps = timestamps.filter(timestamp => timestamp.id !== id);
    setTimestamps(updatedTimestamps);
  };

  // Clear all timestamps
  const clearAllTimestamps = () => {
    if (window.confirm('Are you sure you want to clear all timestamps?')) {
      setTimestamps([]);
    }
  };

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.body.className = newTheme;
  };

  // Update keyboard shortcuts
  const updateShortcuts = (newShortcuts) => {
    setCustomShortcuts(newShortcuts);
    localStorage.setItem('customShortcuts', JSON.stringify(newShortcuts));
  };

  // Add this function to handle adding multiple timestamps at once
  const handleAddMultipleTimestamps = (newTimestamps) => {
    setTimestamps(prevTimestamps => [...prevTimestamps, ...newTimestamps]);
  };

  return (
    <div className={`app ${theme === 'dark' ? 'dark-mode' : 'light-mode'}`}>
      <KeyboardShortcuts
        player={player}
        onAddTimestamp={() => addTimestamp('')}
        onAddEndTimestamp={addEndTimestamp}
        isPlaying={isPlaying}
        customShortcuts={customShortcuts}
        isInputFocused={isInputFocused}
      />
      
      <div className="app-header-controls">
        <div className="app-branding">
          <h1 className="app-title">TimeClips</h1>
          <span className="app-credits">by Vat5aL</span>
        </div>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
        <button 
          className="shortcut-settings-btn"
          onClick={() => setShortcutSettingsOpen(true)}
        >
          Keyboard Shortcuts
        </button>
      </div>
      
      <main className="app-main">
        <div className="player-container">
          <YouTubePlayer
            videoId={videoId}
            onPlayerReady={handlePlayerReady}
            onPlayStateChange={setIsPlaying}
            onTimeUpdate={setCurrentTime}
          />
          
          <ProgressBar
            currentTime={currentTime}
            duration={duration}
            timestamps={timestamps}
            onSeek={jumpToTime}
          />
          
          <TimestampControls
            currentTime={currentTime}
            onAddTimestamp={addTimestamp}
            onAddEndTimestamp={addEndTimestamp}
            onClearAll={clearAllTimestamps}
          />
        </div>
        
        <div className="sidebar">
          <div className="sidebar-url-input">
            <input
              type="text"
              placeholder="Enter YouTube Video URL"
              value={videoUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
            />
            <button 
              className="help-button"
              onClick={() => setHelpModalOpen(true)}
            >
              ?
            </button>
          </div>
          
          <TimestampList
            timestamps={timestamps}
            onJumpToTime={jumpToTime}
            onUpdateTime={updateTimestampTime}
            onUpdateComment={updateTimestampComment}
            onDeleteTimestamp={deleteTimestamp}
            onUpdateCategory={updateTimestampCategory}
          />
          
          <ImportExport
            timestamps={timestamps}
            videoId={videoId}
            setTimestamps={setTimestamps}
          />
          
          <VideoDownloader
            timestamps={timestamps}
            videoId={videoId}
          />
          
          <ThumbnailGenerator
            videoId={videoId}
            timestamps={timestamps}
          />
          
          {/* Remove these components
          <PlaylistCreator
            timestamps={timestamps}
            videoId={videoId}
            player={player}
          />
          
          <AIFeatures 
            videoId={videoId}
            videoTitle={videoTitle}
            onAddTimestamps={handleAddMultipleTimestamps}
          />
          */}
          
          <ThemeToggle 
            theme={theme} 
            onToggle={toggleTheme} 
          />
        </div>
      </main>
      
      <HelpModal 
        isOpen={helpModalOpen} 
        onClose={() => setHelpModalOpen(false)} 
      />
      
      <KeyboardShortcutSettings
        isOpen={shortcutSettingsOpen}
        onClose={() => setShortcutSettingsOpen(false)}
        shortcuts={customShortcuts}
        onUpdateShortcuts={updateShortcuts}
      />
      
      {/* Remove this component
      <AIFeatures 
        videoId={videoId}
        videoTitle={videoTitle}
        onAddTimestamps={handleAddMultipleTimestamps}
      />
      */}
      
      <div className="timestamps-section">
        {/* ... existing TimestampList component ... */}
      </div>
    </div>
  );
}

export default App;
