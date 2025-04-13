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
  const [editTimeValue, setEditTimeValue] = useState('');
  
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

  // Improved time parsing function
  const parseTimeToSeconds = (timeString) => {
    const parts = timeString.split(':');
    if (parts.length !== 3) return null;
    
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseInt(parts[2], 10);
    
    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) return null;
    
    return hours * 3600 + minutes * 60 + seconds;
  };

  // Fixed function to handle manual time edit
  const handleTimeEdit = (timestampId, isStart, timeString) => {
    const seconds = parseTimeToSeconds(timeString);
    if (seconds !== null) {
      // Calculate the difference and use the existing onUpdateTime function
      const timestamp = timestamps.find(t => t.id === timestampId);
      if (timestamp) {
        const currentTime = isStart ? timestamp.startTime : timestamp.endTime;
        const diff = seconds - currentTime;
        onUpdateTime(timestampId, isStart, diff);
      }
    }
    setEditingTime(null);
  };

  // Start editing a timestamp
  const startEditingTime = (timestampId, isStart) => {
    const timestamp = timestamps.find(t => t.id === timestampId);
    if (timestamp) {
      const time = isStart ? timestamp.startTime : timestamp.endTime;
      setEditTimeValue(formatTime(time));
      setEditingTime(`${timestampId}-${isStart ? 'start' : 'end'}`);
    }
  };

  // Filter timestamps based on selected category
  const filteredTimestamps = filter === 'all' 
    ? timestamps 
    : timestamps.filter(ts => ts.category === filter);

  return (
    <div className="timestamp-list">
      <div className="timestamp-header">
        <h3>Timestamps</h3>
        
        <div className="header-controls">
          <button 
            className={`mode-toggle-btn ${editMode ? 'edit-mode' : 'view-mode'}`}
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? 'View Mode' : 'Edit Mode'}
          </button>
          
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
        </div>
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
                      onClick={() => onUpdateTime(timestamp.id, true, -1)}
                      title="Decrease by 1 second"
                    >
                      -
                    </button>
                  )}
                  
                  {editingTime === `${timestamp.id}-start` ? (
                    <input
                      type="text"
                      className="time-edit-input"
                      value={editTimeValue}
                      onChange={(e) => setEditTimeValue(e.target.value)}
                      onBlur={() => handleTimeEdit(timestamp.id, true, editTimeValue)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleTimeEdit(timestamp.id, true, editTimeValue);
                        }
                      }}
                      autoFocus
                    />
                  ) : (
                    <span 
                      className="timestamp-time clickable"
                      onClick={() => {
                        if (editMode) {
                          startEditingTime(timestamp.id, true);
                        } else {
                          onJumpToTime(timestamp.startTime);
                        }
                      }}
                      title={editMode ? "Click to edit time" : "Jump to this time"}
                    >
                      {formatTime(timestamp.startTime)}
                    </span>
                  )}
                  
                  {editMode && (
                    <button 
                      className="time-adjust-btn"
                      onClick={() => onUpdateTime(timestamp.id, true, 1)}
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
                        onClick={() => onUpdateTime(timestamp.id, false, -1)}
                        title="Decrease by 1 second"
                      >
                        -
                      </button>
                    )}
                    
                    {editingTime === `${timestamp.id}-end` ? (
                      <input
                        type="text"
                        className="time-edit-input"
                        value={editTimeValue}
                        onChange={(e) => setEditTimeValue(e.target.value)}
                        onBlur={() => handleTimeEdit(timestamp.id, false, editTimeValue)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleTimeEdit(timestamp.id, false, editTimeValue);
                          }
                        }}
                        autoFocus
                      />
                    ) : (
                      <span 
                        className="timestamp-time clickable"
                        onClick={() => {
                          if (editMode) {
                            startEditingTime(timestamp.id, false);
                          } else {
                            onJumpToTime(timestamp.endTime);
                          }
                        }}
                        title={editMode ? "Click to edit time" : "Jump to this time"}
                      >
                        {formatTime(timestamp.endTime)}
                      </span>
                    )}
                    
                    {editMode && (
                      <button 
                        className="time-adjust-btn"
                        onClick={() => onUpdateTime(timestamp.id, false, 1)}
                        title="Increase by 1 second"
                      >
                        +
                      </button>
                    )}
                  </div>
                )}
                
                {/* Only show delete button in edit mode */}
                {editMode && (
                  <button 
                    className="delete-timestamp-btn"
                    onClick={() => onDeleteTimestamp(timestamp.id)}
                    title="Delete timestamp"
                  >
                    🗑️
                  </button>
                )}
              </div>
              
              <input
                type="text"
                className="timestamp-comment"
                value={timestamp.comment}
                onChange={(e) => onUpdateComment(timestamp.id, e.target.value)}
                placeholder="Add comment"
                readOnly={!editMode}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TimestampList;