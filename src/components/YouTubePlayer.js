import React, { useEffect, useRef } from 'react';
import './YouTubePlayer.css';

const YouTubePlayer = ({ videoId, onPlayerReady, onPlayStateChange, onTimeUpdate }) => {
  const playerRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    // Load YouTube IFrame API
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    // Initialize player when API is ready
    window.onYouTubeIframeAPIReady = initializePlayer;

    // If API was already loaded, initialize directly
    if (window.YT && window.YT.Player) {
      initializePlayer();
    }

    return () => {
      // Clean up
      if (playerRef.current && playerRef.current.timeUpdateInterval) {
        clearInterval(playerRef.current.timeUpdateInterval);
      }
    };
  }, [videoId]);

  const initializePlayer = () => {
    if (!videoId || !containerRef.current) return;

    // Destroy existing player if it exists
    if (playerRef.current) {
      if (playerRef.current.timeUpdateInterval) {
        clearInterval(playerRef.current.timeUpdateInterval);
      }
      playerRef.current.destroy();
    }

    // Create new player
    playerRef.current = new window.YT.Player(containerRef.current, {
      videoId: videoId,
      playerVars: {
        autoplay: 0,
        controls: 1,
        rel: 0,
        modestbranding: 1,
      },
      events: {
        onReady: (event) => {
          const player = event.target;
          onPlayerReady(player);
          
          // Set up time update interval
          if (playerRef.current.timeUpdateInterval) {
            clearInterval(playerRef.current.timeUpdateInterval);
          }
          
          playerRef.current.timeUpdateInterval = setInterval(() => {
            if (playerRef.current) {
              onTimeUpdate(playerRef.current.getCurrentTime());
            }
          }, 200); // Update more frequently for smoother UI
        },
        onStateChange: (event) => {
          // Update playing state (1 = playing)
          onPlayStateChange(event.data === 1);
        }
      }
    });
  };

  return (
    <div className="youtube-player-container">
      {!videoId ? (
        <div className="placeholder">
          <p>Enter a YouTube URL to load a video</p>
        </div>
      ) : (
        <div ref={containerRef} className="youtube-player"></div>
      )}
    </div>
  );
};

export default YouTubePlayer;