import { useState } from 'react';
import UploadDropzone from './components/UploadDropzone';
import ResultViewer from './components/ResultViewer';

export default function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  // New states for processing and results
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState(null);

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResultUrl(null); // Reset result if uploading a new file
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResultUrl(null);
  };

const handleUpscale = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    
    // 1. Prepare the file to be sent via HTTP
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      // 2. Send the file to our FastAPI backend
      const response = await fetch('http://localhost:8000/api/upscale', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

      const data = await response.json();
      console.log("Success! Backend returned:", data);
      
      // We don't have Real-ESRGAN running yet, so we will still just show the 
      // original image in the result viewer to keep the UI from breaking.
      setResultUrl(previewUrl); 

    } catch (error) {
      console.error("Error uploading file:", error);
      alert(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-900">
      <div className="max-w-3xl w-full space-y-8 text-center">
        
        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Image Upscaler
          </h1>
          <p className="text-lg text-slate-600">
            Enhance your images instantly using Real-ESRGAN. Secure, fast, and completely free.
          </p>
        </div>

        {/* State 1: Upload */}
        {!selectedFile && (
          <UploadDropzone onFileSelect={handleFileSelect} />
        )}

        {/* State 2: Preview & Processing */}
        {selectedFile && !resultUrl && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6">
            <div className="bg-slate-100 rounded-lg p-2 border border-slate-200 flex justify-center">
              <img 
                src={previewUrl} 
                alt="Upload preview" 
                className={`max-h-80 w-auto object-contain rounded transition-opacity duration-300 ${isProcessing ? 'opacity-50 grayscale' : 'opacity-100'}`}
              />
            </div>
            
            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-500 font-medium truncate max-w-[200px]">
                {selectedFile.name}
              </p>
              
              <div className="space-x-3 flex">
                <button 
                  onClick={handleCancel}
                  disabled={isProcessing}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpscale}
                  disabled={isProcessing}
                  className="flex items-center justify-center min-w-[130px] px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-80 cursor-pointer"
                >
                  {isProcessing ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    "Upscale Image"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* State 3: Result Slider */}
        {resultUrl && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ResultViewer originalImage={previewUrl} upscaledImage={resultUrl} />
            
            <div className="flex justify-between items-center">
              <button 
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Upload Another
              </button>
              <a 
                href={resultUrl}
                download={`upscaled-${selectedFile.name}`}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
              >
                Download Result
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}