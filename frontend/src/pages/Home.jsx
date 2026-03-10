import { useState } from 'react';
import UploadDropzone from '../components/UploadDropzone';
import ResultViewer from '../components/ResultViewer';
import Header from '../components/Header';
import ProgressBar from '../components/ProgressBar';
import ActionControls from '../components/ActionControls';
import { useUpscalePipeline } from '../hooks/useUpscalePipeline';
import { useSimulatedProgress } from '../hooks/useSimulatedProgress';

export default function Home() {
  const [progress, setProgress] = useState(0);
  
  const {
    selectedFile,
    previewUrl,
    isProcessing,
    resultUrl,
    modelType,
    setModelType,
    handleFileSelect,
    handleCancel,
    handleUpscale
  } = useUpscalePipeline(setProgress);

  useSimulatedProgress(isProcessing, setProgress);

  return (
    <div className="max-w-4xl w-full my-auto space-y-10 text-center relative z-10">
      
      <Header />

      {/* State 1: Upload */}
      {!selectedFile && (
        <div className="bg-slate-900/50 backdrop-blur-xl p-2 rounded-2xl border border-slate-800 shadow-2xl">
          <UploadDropzone onFileSelect={handleFileSelect} />
        </div>
      )}

      {/* State 2 & 3: Preview, Processing, and Result */}
      {selectedFile && (
        <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-slate-800 space-y-6">
          
          {!resultUrl ? (
            <div className="bg-slate-950 rounded-xl p-2 border border-slate-800/50 flex justify-center overflow-hidden">
              <img 
                src={previewUrl} 
                alt="Upload preview" 
                className={`max-h-[400px] w-auto object-contain rounded-lg transition-all duration-700 ${isProcessing ? 'scale-105 opacity-40 blur-sm' : 'opacity-100'}`}
              />
            </div>
          ) : (
            <div className="rounded-xl overflow-hidden border border-slate-800">
              <ResultViewer originalImage={previewUrl} upscaledImage={resultUrl} />
            </div>
          )}
          
          {isProcessing && <ProgressBar progress={progress} />}

          {!resultUrl && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
              <p className="text-sm text-slate-400 font-medium truncate max-w-[250px]">
                {selectedFile.name}
              </p>
              
              <ActionControls 
                modelType={modelType}
                setModelType={setModelType}
                isProcessing={isProcessing}
                handleCancel={handleCancel}
                handleUpscale={handleUpscale}
              />
            </div>
          )}

          {resultUrl && (
            <div className="flex justify-between items-center pt-2">
              <button 
                onClick={handleCancel}
                className="px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                Upload Another Image
              </button>
              <a 
                href={resultUrl}
                download={`4K-${selectedFile.name}`}
                className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-all shadow-[0_0_15px_rgba(79,70,229,0.4)]"
              >
                Download Result
              </a>
            </div>
          )}

        </div>
      )}

    </div>
  );
}