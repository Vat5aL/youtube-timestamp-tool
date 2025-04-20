import React, { useState } from 'react';
import './VideoDownloader.css';

const VideoDownloader = ({ timestamps, videoId }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [downloadLinks, setDownloadLinks] = useState([]);

  const generateDownloadLinks = () => {
    if (!videoId) {
      setError('No video loaded. Please enter a YouTube URL first.');
      return;
    }

    if (timestamps.length === 0) {
      setError('No timestamps created. Please add timestamps first.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Filter timestamps that have both start and end times
      const validTimestamps = timestamps.filter(ts => 
        ts.startTime !== null && ts.endTime !== null
      );

      if (validTimestamps.length === 0) {
        throw new Error('No timestamps with both start and end times found. Please add end times to your timestamps.');
      }

      // Generate download links using youtube-dl format
      const links = validTimestamps.map(ts => {
        const startTime = Math.floor(ts.startTime);
        const endTime = Math.floor(ts.endTime);
        const duration = endTime - startTime;
        
        // Create a sanitized filename from the comment
        const sanitizedComment = ts.comment
          ? ts.comment.replace(/[^\w\s-]/g, '')
              .replace(/\s+/g, '_')
              .substring(0, 30)
          : 'segment';
        
        const filename = `${videoId}_${sanitizedComment}_${startTime}-${endTime}.mp4`;
        
        // Create download command for youtube-dl
        const downloadCommand = `youtube-dl -f best -o "${filename}" --external-downloader ffmpeg --external-downloader-args "ffmpeg_i:-ss ${startTime} -t ${duration}" "https://www.youtube.com/watch?v=${videoId}"`;
        
        // Create alternative download link using yt-dlp (more modern alternative)
        const ytDlpCommand = `yt-dlp -f best -o "${filename}" --external-downloader ffmpeg --external-downloader-args "ffmpeg_i:-ss ${startTime} -t ${duration}" "https://www.youtube.com/watch?v=${videoId}"`;
        
        return {
          id: ts.id,
          comment: ts.comment || `Segment ${startTime}-${endTime}`,
          startTime,
          endTime,
          filename,
          downloadCommand,
          ytDlpCommand,
          // Direct link to online service that can download segments
          onlineLink: `https://ytcutter.com/watch/${videoId}/${startTime}/${endTime}`
        };
      });

      setDownloadLinks(links);
    } catch (err) {
      console.error('Error generating download links:', err);
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        // Show temporary success message
        const tempElement = document.createElement('div');
        tempElement.className = 'copy-success';
        tempElement.textContent = 'Copied!';
        document.body.appendChild(tempElement);
        
        setTimeout(() => {
          document.body.removeChild(tempElement);
        }, 2000);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
      });
  };

  return (
    <div className="video-downloader">
      <h3>Download Video Segments</h3>
      
      <button 
        className="generate-links-btn"
        onClick={generateDownloadLinks}
        disabled={isGenerating}
      >
        {isGenerating ? 'Generating...' : 'Generate Download Options'}
      </button>
      
      {error && <p className="error-message">{error}</p>}
      
      {downloadLinks.length > 0 && (
        <div className="download-links">
          <p className="download-instructions">
            To download segments, you have several options:
          </p>
          
          <ol className="download-methods">
            <li>
              <strong>Use an online service:</strong> Click the "Online Cutter" links below
            </li>
            <li>
              <strong>Use youtube-dl:</strong> Copy the command and run it in your terminal
            </li>
            <li>
              <strong>Use yt-dlp:</strong> Copy the command and run it in your terminal (recommended)
            </li>
          </ol>
          
          <div className="download-links-list">
            {downloadLinks.map(link => (
              <div key={link.id} className="download-link-item">
                <div className="download-link-header">
                  <h4>{link.comment}</h4>
                  <span className="timestamp-range">
                    {new Date(link.startTime * 1000).toISOString().substr(11, 8)} - 
                    {new Date(link.endTime * 1000).toISOString().substr(11, 8)}
                  </span>
                </div>
                
                <div className="download-options">
                  <a 
                    href={link.onlineLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="online-cutter-link"
                  >
                    Open in Online Cutter
                  </a>
                  
                  <button 
                    className="copy-command-btn"
                    onClick={() => copyToClipboard(link.ytDlpCommand)}
                  >
                    Copy yt-dlp Command
                  </button>
                  
                  <button 
                    className="copy-command-btn"
                    onClick={() => copyToClipboard(link.downloadCommand)}
                  >
                    Copy youtube-dl Command
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="download-help">
            <h4>Installation Help</h4>
            <p>To use the commands above, you need to install:</p>
            <ul>
              <li>
                <a 
                  href="https://github.com/yt-dlp/yt-dlp#installation" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  yt-dlp (recommended)
                </a>
              </li>
              <li>
                <a 
                  href="https://ffmpeg.org/download.html" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  FFmpeg
                </a>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoDownloader;