import { useState } from 'react';
import UploadDropzone from './components/UploadDropzone';

export default function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-900">
      <div className="max-w-2xl w-full space-y-8 text-center">
        
        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Image Upscaler
          </h1>
          <p className="text-lg text-slate-600">
            Enhance your images instantly using Real-ESRGAN. Secure, fast, and completely free.
          </p>
        </div>

        {!selectedFile ? (
          <UploadDropzone onFileSelect={handleFileSelect} />
        ) : (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6">
            <div className="bg-slate-100 rounded-lg p-2 border border-slate-200">
              <img 
                src={previewUrl} 
                alt="Upload preview" 
                className="max-h-80 w-full object-contain rounded"
              />
            </div>
            
            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-500 font-medium truncate max-w-[200px]">
                {selectedFile.name}
              </p>
              <div className="space-x-3 flex">
                <button 
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
                >
                  Upscale Image
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}