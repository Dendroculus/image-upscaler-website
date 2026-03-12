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
    <div className="w-full">
      
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
          Free & Open Source — No sign-up required
        </div>
        
        <Header />

        {/* Upload Area */}
        <div className="mt-12">
          {!selectedFile && (
            <div className="bg-slate-900/60 backdrop-blur-2xl p-2 rounded-2xl border border-slate-800/80 shadow-2xl shadow-teal-500/5">
              <UploadDropzone onFileSelect={handleFileSelect} />
            </div>
          )}

          {selectedFile && (
            <div className="bg-slate-900/60 backdrop-blur-2xl p-6 rounded-2xl shadow-2xl border border-slate-800/80 space-y-6">
              
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
                    className="px-6 py-2.5 text-sm font-bold text-white bg-teal-600 rounded-lg hover:bg-teal-500 transition-all shadow-[0_0_15px_rgba(13,148,136,0.4)]"
                  >
                    Download Result
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Trusted formats badge */}
        <div className="mt-6 flex items-center justify-center gap-4 text-xs text-slate-500">
          <span>Supports:</span>
          {['PNG', 'JPG', 'WEBP'].map((fmt) => (
            <span key={fmt} className="px-2 py-0.5 rounded bg-slate-800/50 border border-slate-700/50 text-slate-400 font-mono">
              .{fmt.toLowerCase()}
            </span>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-2xl font-bold text-center mb-2">Why Neural Upscaler?</h2>
        <p className="text-slate-400 text-center mb-12 max-w-xl mx-auto">Enterprise-grade image enhancement powered by state-of-the-art AI models.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              ),
              title: 'Lightning Fast',
              desc: 'GPU-accelerated processing delivers 4x upscaled images in seconds, not minutes.'
            },
            {
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              ),
              title: 'Secure & Private',
              desc: 'Your images are processed and immediately deleted. No data is ever stored or shared.'
            },
            {
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              ),
              title: 'Two AI Models',
              desc: 'Choose between General (photos) and Anime/Art models for optimal results on any image type.'
            }
          ].map((feature, i) => (
            <div key={i} className="group p-6 rounded-2xl bg-slate-900/40 border border-slate-800/60 hover:border-slate-700/80 transition-all hover:bg-slate-900/60">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-4 group-hover:bg-teal-500/20 transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-2xl font-bold text-center mb-2">How It Works</h2>
        <p className="text-slate-400 text-center mb-12">Three simple steps to enhance your images.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Upload', desc: 'Drag & drop or click to upload any PNG, JPG, or WEBP image.' },
            { step: '02', title: 'Enhance', desc: 'Our Real-ESRGAN model upscales your image to 4x resolution with AI.' },
            { step: '03', title: 'Download', desc: 'Compare the before & after, then download your enhanced image instantly.' },
          ].map((item, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl font-black text-teal-500/20 mb-3">{item.step}</div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}