import { useState, useRef } from 'react';
import PropTypes from 'prop-types';

export default function UploadDropzone({ onFileSelect }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files?.length > 0) handleFiles(e.dataTransfer.files[0]);
  };
  const handleClick = () => fileInputRef.current.click();
  const handleKeyDown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current.click(); } };
  const handleChange = (e) => { if (e.target.files?.length > 0) handleFiles(e.target.files[0]); };
  const handleFiles = (file) => {
    if (file?.type.match('image/(jpeg|png|webp)')) onFileSelect(file);
    else alert('Please upload a valid image file (PNG, JPG, WEBP).');
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload image file"
      className={`border-2 border-dashed rounded-xl p-16 text-center cursor-pointer transition-all duration-200 ease-in-out
        ${isDragging 
          ? 'border-teal-500 bg-teal-500/5' 
          : 'border-slate-700 bg-slate-900/30 hover:border-slate-500 hover:bg-slate-800/30'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <input type="file" className="hidden" ref={fileInputRef} onChange={handleChange} accept="image/png, image/jpeg, image/webp" />
      <div className="flex flex-col items-center justify-center space-y-4 pointer-events-none">
        <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
          <svg className="w-7 h-7 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-lg text-slate-200">Click to upload or drag & drop</p>
          <p className="text-sm mt-1.5 text-slate-500">Supports PNG, JPG, WEBP • Max 10MB</p>
        </div>
      </div>
    </div>
  );
}

UploadDropzone.propTypes = { onFileSelect: PropTypes.func.isRequired };