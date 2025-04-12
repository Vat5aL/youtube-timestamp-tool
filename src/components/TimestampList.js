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

  // Filter timestamps based on selected category
  const filteredTimestamps = filter === 'all' 
    ? timestamps 
    : timestamps.filter(ts => ts.category === filter);

  return (
    <div className="timestamp-list">
      <div className="timestamp-header">
        <h3>Timestamps</h3>
        
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
                  <button 
                    className="time-adjust-btn"
                    onClick={() => onUpdateTime(timestamp.id, true, -1)}
                    title="Decrease by 1 second"
                  >
                    -
                  </button>
                  
                  <span 
                    className="timestamp-time clickable"
                    onClick={() => onJumpToTime(timestamp.startTime)}
                    title="Jump to this time"
                  >
                    {formatTime(timestamp.startTime)}
                  </span>
                  
                  <button 
                    className="time-adjust-btn"
                    onClick={() => onUpdateTime(timestamp.id, true, 1)}
                    title="Increase by 1 second"
                  >
                    +
                  </button>
                </div>
                
                {/* Arrow between times */}
                {timestamp.endTime !== null && (
                  <span className="time-separator">→</span>
                )}
                
                {/* End time controls (if exists) */}
                {timestamp.endTime !== null && (
                  <div className="time-control">
                    <button 
                      className="time-adjust-btn"
                      onClick={() => onUpdateTime(timestamp.id, false, -1)}
                      title="Decrease by 1 second"
                    >
                      -
                    </button>
                    
                    <span 
                      className="timestamp-time clickable"
                      onClick={() => onJumpToTime(timestamp.endTime)}
                      title="Jump to this time"
                    >
                      {formatTime(timestamp.endTime)}
                    </span>
                    
                    <button 
                      className="time-adjust-btn"
                      onClick={() => onUpdateTime(timestamp.id, false, 1)}
                      title="Increase by 1 second"
                    >
                      +
                    </button>
                  </div>
                )}
                
                {/* Category selector */}
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
                
                {/* Delete button */}
                <button 
                  className="delete-timestamp-btn"
                  onClick={() => onDeleteTimestamp(timestamp.id)}
                  title="Delete timestamp"
                >
                  🗑️
                </button>
              </div>
              
              <input
                type="text"
                className="timestamp-comment"
                value={timestamp.comment}
                onChange={(e) => onUpdateComment(timestamp.id, e.target.value)}
                placeholder="Add comment"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TimestampList;