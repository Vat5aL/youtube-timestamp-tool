import React from 'react';
import './HelpModal.css';

const HelpModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Keyboard Shortcuts</h2>
        
        <table className="shortcuts-table">
          <thead>
            <tr>
              <th>Key</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Space</td>
              <td>Play/Pause video</td>
            </tr>
            <tr>
              <td>T</td>
              <td>Add timestamp at current position (minus 2 seconds)</td>
            </tr>
            <tr>
              <td>E</td>
              <td>Add end time to the most recent timestamp</td>
            </tr>
            <tr>
              <td>Left Arrow</td>
              <td>Seek backward 5 seconds</td>
            </tr>
            <tr>
              <td>Right Arrow</td>
              <td>Seek forward 5 seconds</td>
            </tr>
          </tbody>
        </table>
        
        <div className="modal-footer">
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;