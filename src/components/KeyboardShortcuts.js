import { useEffect } from 'react';

const KeyboardShortcuts = ({ 
  player, 
  onAddTimestamp, 
  onAddEndTimestamp, 
  isInputFocused,
  customShortcuts 
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts when typing in input fields
      if (isInputFocused()) return;
      
      // Get the pressed key
      const key = e.key;
      
      // Check against custom shortcuts
      if (key === customShortcuts.addTimestamp) {
        onAddTimestamp();
      } else if (key === customShortcuts.addEndTimestamp) {
        onAddEndTimestamp();
      } else if (key === customShortcuts.playPause) {
        if (player) {
          const state = player.getPlayerState();
          if (state === 1) { // playing
            player.pauseVideo();
          } else {
            player.playVideo();
          }
        }
      } else if (key === customShortcuts.seekForward) {
        if (player) {
          player.seekTo(player.getCurrentTime() + 5, true);
        }
      } else if (key === customShortcuts.seekBackward) {
        if (player) {
          player.seekTo(player.getCurrentTime() - 5, true);
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [player, onAddTimestamp, onAddEndTimestamp, isInputFocused, customShortcuts]);
  
  return null;
};

export default KeyboardShortcuts;