import { useState } from 'react';
import UploadDropzone from './components/UploadDropzone';
import ResultViewer from './components/ResultViewer';

export default function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState(null);
  
  // New state for the dropdown
  const [modelType, setModelType] = useState('general');

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResultUrl(null); 
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResultUrl(null);
  };

  const handleUpscale = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    
    // 1. Pack the file and the selected model type
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('model_type', modelType); 

    try {
      // 2. Send to FastAPI
      const response = await fetch('http://localhost:8000/api/upscale', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

      const data = await response.json();
      const jobId = data.job_id;
      
      // 3. Start Polling the Result Endpoint
      pollForResult(jobId);

    } catch (error) {
      console.error("Error uploading:", error);
      alert(error.message);
      setIsProcessing(false);
    }
  };

  const pollForResult = (jobId) => {
    // Check the server every 3 seconds
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/result/${jobId}`);
        
        if (res.ok) {
          // Success! The server returned the image.
          clearInterval(interval);
          setResultUrl(`http://localhost:8000/api/result/${jobId}`);
          setIsProcessing(false);
        } else if (res.status !== 404) {
          // A real error occurred (not just a "still processing" 404)
          clearInterval(interval);
          setIsProcessing(false);
          alert("Processing failed on the server.");
        }
        // If it's a 404, we just do nothing and wait for the next 3-second check.
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 3000);
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
            
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-slate-500 font-medium truncate max-w-[200px]">
                {selectedFile.name}
              </p>
              
              <div className="flex items-center space-x-3 w-full sm:w-auto">
                {/* Model Selection Dropdown */}
                <select 
                  value={modelType}
                  onChange={(e) => setModelType(e.target.value)}
                  disabled={isProcessing}
                  className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-slate-500 focus:border-slate-500 block w-full p-2 disabled:opacity-50 cursor-pointer"
                >
                  <option value="general">General Model</option>
                  <option value="anime">Anime Model</option>
                </select>

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