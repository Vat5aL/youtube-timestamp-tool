import React, { useState } from 'react';
import './TimestampList.css';

const TimestampList = ({ 
  timestamps, 
  onJumpToTime, 
  onUpdateTime, 
  onUpdateComment, 
  onDeleteTimestamp,
  onUpdateCategory
}) => {
  const [filter, setFilter] = useState('all');
  const [editMode, setEditMode] = useState(true);
  const [editingTime, setEditingTime] = useState(null);
  const [timeInputValue, setTimeInputValue] = useState('');
  
  const categories = [
    { id: 'important', name: 'Important', color: '#ff5252' },
    { id: 'funny', name: 'Funny', color: '#ffb142' },
    { id: 'technical', name: 'Technical', color: '#3ea6ff' },
    { id: 'question', name: 'Question', color: '#9c27b0' },
    { id: 'other', name: 'Other', color: '#757575' }
  ];

  // Helper function to safely find a category
  const findCategory = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category || categories.find(c => c.id === 'other') || { id: 'other', name: 'Other', color: '#757575' };
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

  // Start editing time
  const startTimeEdit = (timestamp, isEndTime) => {
    if (!editMode) return;
    
    const timeValue = isEndTime ? timestamp.endTime : timestamp.startTime;
    setEditingTime({
      id: timestamp.id,
      isEndTime,
      originalValue: timeValue
    });
    setTimeInputValue(formatTime(timeValue));
  };

  // Save edited time
  const saveTimeEdit = () => {
    if (!editingTime) return;
    
    const seconds = convertTimeToSeconds(timeInputValue);
    if (seconds !== null) {
      onUpdateTime(editingTime.id, seconds, editingTime.isEndTime);
    }
    
    setEditingTime(null);
    setTimeInputValue('');
  };

  // Cancel time editing
  const cancelTimeEdit = () => {
    setEditingTime(null);
    setTimeInputValue('');
  };

  // Convert time string (HH:MM:SS) to seconds
  const convertTimeToSeconds = (timeStr) => {
    const match = timeStr.match(/^(?:(\d+):)?(\d+):(\d+)$/);
    if (match) {
      const [, hours = '0', minutes, seconds] = match;
      return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);
    }
    return null;
  };

  // Handle key press in time input
  const handleTimeKeyPress = (e) => {
    if (e.key === 'Enter') {
      saveTimeEdit();
    } else if (e.key === 'Escape') {
      cancelTimeEdit();
    }
  };

  // Filter timestamps based on selected category
  const filteredTimestamps = filter === 'all' 
    ? timestamps 
    : timestamps.filter(ts => ts.category === filter);

  return (
    <div className="timestamp-list">
      <div className="timestamp-header">
        <div className="timestamp-title-row">
          <h3>Timestamps</h3>
          <button 
            className={`mode-toggle-btn ${editMode ? 'edit-mode' : 'view-mode'}`}
            onClick={() => setEditMode(!editMode)}
            title={editMode ? "Switch to View Mode" : "Switch to Edit Mode"}
          >
            {editMode ? "View Mode" : "Edit Mode"}
          </button>
        </div>
        
        {editMode && (
          <div className="category-filter">
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="category-select"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      {filteredTimestamps.length === 0 ? (
        <div className="no-timestamps">
          <p>{filter === 'all' ? 'No timestamps added yet' : 'No timestamps in this category'}</p>
        </div>
      ) : (
        <ul>
          {filteredTimestamps.map((timestamp) => (
            <li key={timestamp.id} className="timestamp-item">
              <div className="timestamp-times">
                {/* Start time controls */}
                <div className="time-control">
                  {editMode && (
                    <button 
                      className="time-adjust-btn"
                      onClick={() => onUpdateTime(timestamp.id, timestamp.startTime - 1, false)}
                      title="Decrease by 1 second"
                    >
                      -
                    </button>
                  )}
                  
                  {editingTime && editingTime.id === timestamp.id && !editingTime.isEndTime ? (
                    <div className="time-edit-input">
                      <input
                        type="text"
                        value={timeInputValue}
                        onChange={(e) => setTimeInputValue(e.target.value)}
                        onKeyDown={handleTimeKeyPress}
                        onBlur={saveTimeEdit}
                        autoFocus
                      />
                    </div>
                  ) : (
                    <span 
                      className={`timestamp-time ${!editMode ? 'clickable' : ''}`}
                      onClick={() => editMode ? startTimeEdit(timestamp, false) : onJumpToTime(timestamp.startTime)}
                      title={editMode ? "Click to edit time" : "Jump to this time"}
                    >
                      {formatTime(timestamp.startTime)}
                    </span>
                  )}
                  
                  {editMode && (
                    <button 
                      className="time-adjust-btn"
                      onClick={() => onUpdateTime(timestamp.id, timestamp.startTime + 1, false)}
                      title="Increase by 1 second"
                    >
                      +
                    </button>
                  )}
                </div>
                
                {/* Arrow between times */}
                {timestamp.endTime !== null && (
                  <span className="time-separator">→</span>
                )}
                
                {/* End time controls (if exists) */}
                {timestamp.endTime !== null && (
                  <div className="time-control">
                    {editMode && (
                      <button 
                        className="time-adjust-btn"
                        onClick={() => onUpdateTime(timestamp.id, timestamp.endTime - 1, true)}
                        title="Decrease by 1 second"
                      >
                        -
                      </button>
                    )}
                    
                    {editingTime && editingTime.id === timestamp.id && editingTime.isEndTime ? (
                      <div className="time-edit-input">
                        <input
                          type="text"
                          value={timeInputValue}
                          onChange={(e) => setTimeInputValue(e.target.value)}
                          onKeyDown={handleTimeKeyPress}
                          onBlur={saveTimeEdit}
                          autoFocus
                        />
                      </div>
                    ) : (
                      <span 
                        className={`timestamp-time ${!editMode ? 'clickable' : ''}`}
                        onClick={() => editMode ? startTimeEdit(timestamp, true) : onJumpToTime(timestamp.endTime)}
                        title={editMode ? "Click to edit time" : "Jump to this time"}
                      >
                        {formatTime(timestamp.endTime)}
                      </span>
                    )}
                    
                    {editMode && (
                      <button 
                        className="time-adjust-btn"
                        onClick={() => onUpdateTime(timestamp.id, timestamp.endTime + 1, true)}
                        title="Increase by 1 second"
                      >
                        +
                      </button>
                    )}
                  </div>
                )}
                
                {/* Category selector */}
                {editMode ? (
                  <select
                    className="timestamp-category-select"
                    value={timestamp.category || 'other'}
                    onChange={(e) => onUpdateCategory(timestamp.id, e.target.value)}
                    style={{
                      backgroundColor: findCategory(timestamp.category || 'other').color,
                    }}
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                ) : (
                  <span 
                    className="timestamp-category-label"
                    style={{
                      backgroundColor: findCategory(timestamp.category || 'other').color,
                    }}
                  >
                    {findCategory(timestamp.category || 'other').name}
                  </span>
                )}
                
                {/* Delete button */}
                {editMode && (
                  <button 
                    className="delete-timestamp-btn"
                    onClick={() => onDeleteTimestamp(timestamp.id)}
                    title="Delete timestamp"
                  >
                    🗑️
                  </button>
                )}
                
                {/* Play segment button in view mode */}
                {!editMode && timestamp.endTime && (
                  <button 
                    className="play-segment-btn"
                    onClick={() => onJumpToTime(timestamp.startTime, timestamp.endTime)}
                    title="Play this segment"
                  >
                    ▶️
                  </button>
                )}
              </div>
              
              {editMode ? (
                <input
                  type="text"
                  className="timestamp-comment"
                  value={timestamp.comment}
                  onChange={(e) => onUpdateComment(timestamp.id, e.target.value)}
                  placeholder="Add comment"
                />
              ) : (
                <div className="timestamp-comment-display">
                  {timestamp.comment || "No comment"}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TimestampList;