import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { validateImageUpload } from '../utils/fileValidation'; 
import config from '../../../app_config.json';

/**
 * A drag-and-drop file upload zone that visually handles drag states,
 * error states, and processes file validation before accepting an upload.
 */
export default function UploadDropzone({ onFileSelect }) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => { 
    e.preventDefault(); 
    setIsDragging(true); 
    if (error) setError(null); 
  };
  
  const handleDragLeave = (e) => { 
    e.preventDefault(); 
    setIsDragging(false); 
  };
  
  const handleDrop = (e) => { 
    e.preventDefault(); 
    setIsDragging(false); 
    if (e.dataTransfer.files?.length > 0) processFile(e.dataTransfer.files[0]); 
  };
  
  const handleClick = () => { 
    if (error) setError(null); 
    fileInputRef.current.click(); 
  };
  
  const handleKeyDown = (e) => { 
    if (e.key === 'Enter' || e.key === ' ') { 
      e.preventDefault(); 
      if (error) setError(null); 
      fileInputRef.current.click(); 
    } 
  };
  
  const handleChange = (e) => { 
    if (e.target.files?.length > 0) processFile(e.target.files[0]); 
  };
  
  const processFile = async (file) => {
    const result = await validateImageUpload(file);

    if (result.isValid) {
      setError(null);
      onFileSelect(result.file);
    } else {
      setError(result.error);
      setTimeout(() => setError(null), 5000);
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload image file"
      className={`border-2 border-dashed rounded-xl p-10 sm:p-16 text-center cursor-pointer transition-all duration-300 ease-in-out
        ${isDragging 
          ? 'border-slate-800 bg-white/60 scale-[1.02]' 
          : error 
            ? 'border-rose-400 bg-rose-50/50 hover:bg-rose-50' 
            : 'border-white/60 bg-white/30 hover:border-white hover:bg-white/50'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <input type="file" className="hidden" ref={fileInputRef} onChange={handleChange} />
      <div className="flex flex-col items-center justify-center space-y-4 pointer-events-none">
        <div className={`w-14 h-14 rounded-2xl shadow-sm border flex items-center justify-center transition-colors duration-300
          ${error ? 'bg-rose-100 border-rose-200 text-rose-600' : 'bg-white border-white/50 text-slate-700'}`}>
          {error ? (
            <svg className="w-7 h-7 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          )}
        </div>
        <div>
          {error ? (
            <>
              <p className="font-bold text-base sm:text-lg text-rose-600 max-w-[400px] mx-auto leading-snug px-4">{error}</p>
              <p className="text-sm mt-2 text-rose-500 font-medium">Strictly PNG, JPG, or WEBP only!</p>
            </>
          ) : (
            <>
              <p className="font-bold text-lg text-slate-800">Click to upload or drag & drop</p>
              <p className="text-sm mt-1.5 text-slate-600 font-medium">Supports PNG, JPG, WEBP • Max {config.MAX_FILE_SIZE_MB}MB</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

UploadDropzone.propTypes = { onFileSelect: PropTypes.func.isRequired };