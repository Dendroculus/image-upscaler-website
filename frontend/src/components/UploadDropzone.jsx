import { useState, useRef } from 'react';
import PropTypes from 'prop-types';

export default function UploadDropzone({ onFileSelect }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files?.length > 0) {
      handleFiles(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInputRef.current.click();
    }
  };

  const handleChange = (e) => {
    const files = e.target.files;
    if (files?.length > 0) {
      handleFiles(files[0]);
    }
  };

  const handleFiles = (file) => {
    if (file?.type.match('image/(jpeg|png|webp)')) {
      onFileSelect(file);
    } else {
      alert('Please upload a valid image file (PNG, JPG, WEBP).');
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload image file"
      className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors duration-200 ease-in-out shadow-sm
        ${isDragging ? 'border-slate-800 bg-slate-100' : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
        onChange={handleChange}
        accept="image/png, image/jpeg, image/webp"
      />
      <div className="flex flex-col items-center justify-center space-y-3 pointer-events-none">
        <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
        </svg>
        <div className="text-slate-600">
          <p className="font-medium text-lg text-slate-900">Click to upload or drag & drop</p>
          <p className="text-sm mt-1">Supports PNG, JPG, WEBP</p>
        </div>
      </div>
    </div>
  );
}

UploadDropzone.propTypes = {
  onFileSelect: PropTypes.func.isRequired,
};