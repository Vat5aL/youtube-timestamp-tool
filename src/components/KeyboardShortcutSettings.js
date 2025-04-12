import React, { useState, useEffect, useRef } from 'react';
import './KeyboardShortcutSettings.css';

const KeyboardShortcutSettings = ({ shortcuts, onUpdateShortcuts, isOpen, onClose }) => {
  const [editingShortcuts, setEditingShortcuts] = useState({});
  const [currentlyEditing, setCurrentlyEditing] = useState(null);
  const modalRef = useRef(null);

  // Initialize editing shortcuts when modal opens
  useEffect(() => {
    if (isOpen) {
      setEditingShortcuts({ ...shortcuts });
      setCurrentlyEditing(null);
    }
  }, [isOpen, shortcuts]);

  // Handle click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Start editing a shortcut
  const startEditing = (shortcutKey) => {
    setCurrentlyEditing(shortcutKey);
  };

  // Handle key press when editing a shortcut
  const handleKeyDown = (e) => {
    if (!currentlyEditing) return;

    e.preventDefault();
    
    // Don't allow Escape as a shortcut
    if (e.key === 'Escape') {
      setCurrentlyEditing(null);
      return;
    }

    // Update the shortcut
    setEditingShortcuts({
      ...editingShortcuts,
      [currentlyEditing]: e.key
    });
    
    setCurrentlyEditing(null);
  };

  // Save changes
  const saveChanges = () => {
    onUpdateShortcuts(editingShortcuts);
    onClose();
  };

  // Reset to defaults
  const resetToDefaults = () => {
    const defaultShortcuts = {
      addTimestamp: 't',
      addEndTimestamp: 'e',
      playPause: ' ',
      seekForward: 'ArrowRight',
      seekBackward: 'ArrowLeft'
    };
    
    setEditingShortcuts(defaultShortcuts);
  };

  // Get display name for a key
  const getKeyDisplayName = (key) => {
    if (key === ' ') return 'Space';
    if (key === 'ArrowRight') return '→';
    if (key === 'ArrowLeft') return '←';
    if (key === 'ArrowUp') return '↑';
    if (key === 'ArrowDown') return '↓';
    return key;
  };

  // Get display name for a shortcut action
  const getActionDisplayName = (action) => {
    switch (action) {
      case 'addTimestamp': return 'Add Timestamp';
      case 'addEndTimestamp': return 'Add End Timestamp';
      case 'playPause': return 'Play/Pause';
      case 'seekForward': return 'Seek Forward';
      case 'seekBackward': return 'Seek Backward';
      default: return action;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="shortcut-settings-overlay">
      <div 
        className="shortcut-settings-modal" 
        ref={modalRef}
        onKeyDown={handleKeyDown}
        tabIndex="0"
      >
        <h2>Keyboard Shortcuts</h2>
        
        <div className="shortcut-list">
          {Object.entries(editingShortcuts).map(([action, key]) => (
            <div key={action} className="shortcut-item">
              <div className="shortcut-action">
                {getActionDisplayName(action)}
              </div>
              
              <button 
                className={`shortcut-key ${currentlyEditing === action ? 'editing' : ''}`}
                onClick={() => startEditing(action)}
              >
                {currentlyEditing === action 
                  ? 'Press a key...' 
                  : getKeyDisplayName(key)}
              </button>
            </div>
          ))}
        </div>
        
        <div className="shortcut-settings-footer">
          <button 
            className="reset-shortcuts-btn"
            onClick={resetToDefaults}
          >
            Reset to Defaults
          </button>
          
          <div className="modal-actions">
            <button 
              className="cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>
            
            <button 
              className="save-btn"
              onClick={saveChanges}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutSettings;