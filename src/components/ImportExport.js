import React, { useState } from 'react';
import './ImportExport.css';

const ImportExport = ({ timestamps, videoId, setTimestamps }) => {
  const [importText, setImportText] = useState('');
  const [showImport, setShowImport] = useState(false);

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

  const exportAsList = () => {
    let exportText = '';
    
    timestamps.forEach(timestamp => {
      const startTime = formatTime(timestamp.startTime);
      const endTime = timestamp.endTime ? formatTime(timestamp.endTime) : '';
      const timeRange = endTime ? `${startTime} - ${endTime}` : startTime;
      exportText += `${timeRange} ${timestamp.comment}\n`;
    });
    
    copyToClipboard(exportText);
  };

  const exportAsLinks = () => {
    if (!videoId) {
      alert('No video loaded. Please load a video first.');
      return;
    }
    
    let exportText = '';
    
    timestamps.forEach(timestamp => {
      const startSeconds = Math.floor(timestamp.startTime);
      const comment = timestamp.comment || 'Timestamp';
      exportText += `${comment} youtu.be/${videoId}?t=${startSeconds}\n`;
    });
    
    copyToClipboard(exportText);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('Copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        alert('Failed to copy to clipboard');
      });
  };

  const importTimestamps = () => {
    if (!importText.trim()) {
      alert('Please enter some text to import');
      return;
    }
    
    const lines = importText.split('\n').filter(line => line.trim());
    const newTimestamps = [];
    
    lines.forEach(line => {
      // Try to parse different formats
      let timestamp = parseTimestampLine(line);
      
      if (timestamp) {
        newTimestamps.push({
          id: Date.now() + Math.random(),
          ...timestamp
        });
      }
    });
    
    if (newTimestamps.length > 0) {
      setTimestamps([...timestamps, ...newTimestamps]);
      setImportText('');
      setShowImport(false);
    } else {
      alert('No valid timestamps found in the imported text');
    }
  };

  const parseTimestampLine = (line) => {
    // Format: "HH:MM:SS - HH:MM:SS Comment"
    const rangeRegex = /(\d{1,2}:\d{2}:\d{2})\s*-\s*(\d{1,2}:\d{2}:\d{2})\s*(.*)/;
    
    // Format: "HH:MM:SS Comment"
    const singleRegex = /(\d{1,2}:\d{2}:\d{2})\s*(.*)/;
    
    let match = line.match(rangeRegex);
    if (match) {
      return {
        startTime: timeToSeconds(match[1]),
        endTime: timeToSeconds(match[2]),
        comment: match[3].trim()
      };
    }
    
    match = line.match(singleRegex);
    if (match) {
      return {
        startTime: timeToSeconds(match[1]),
        endTime: null,
        comment: match[2].trim()
      };
    }
    
    return null;
  };

  const timeToSeconds = (timeStr) => {
    const parts = timeStr.split(':').map(Number);
    
    if (parts.length === 3) {
      // HH:MM:SS
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      // MM:SS
      return parts[0] * 60 + parts[1];
    }
    
    return 0;
  };

  return (
    <div className="import-export">
      <div className="buttons">
        <button onClick={() => setShowImport(!showImport)}>
          {showImport ? 'Cancel Import' : 'Import'}
        </button>
        <button onClick={exportAsList}>Export List</button>
        <button onClick={exportAsLinks}>Export Links</button>
      </div>
      
      {showImport && (
        <div className="import-container">
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="Paste timestamps here (HH:MM:SS - HH:MM:SS Comment)"
            rows={5}
          />
          <button onClick={importTimestamps}>Import Timestamps</button>
        </div>
      )}
    </div>
  );
};

export default ImportExport;