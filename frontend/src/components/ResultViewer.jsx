import { useState } from 'react';

export default function ResultViewer({ originalImage, upscaledImage }) {
  const [sliderPosition, setSliderPosition] = useState(50);

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 aspect-video shadow-sm">
      {/* Upscaled Image (Background / Right Side) */}
      <img 
        src={upscaledImage} 
        alt="Upscaled result" 
        className="absolute top-0 left-0 w-full h-full object-contain" 
      />

      {/* Original Image (Foreground / Left Side, Clipped by the slider) */}
      <img
        src={originalImage}
        alt="Original input"
        className="absolute top-0 left-0 w-full h-full object-contain"
        style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
      />

      {/* Visual Slider Line & Handle */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white pointer-events-none shadow-[0_0_10px_rgba(0,0,0,0.3)]"
        style={{ left: `calc(${sliderPosition}% - 2px)` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border border-slate-200">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-700">
            <path d="M9 18l-6-6 6-6" />
            <path d="M15 6l6 6-6 6" />
          </svg>
        </div>
      </div>

      {/* Invisible Range Input (Handles the actual dragging mechanics) */}
      <input
        type="range"
        min="0"
        max="100"
        value={sliderPosition}
        onChange={(e) => setSliderPosition(e.target.value)}
        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-ew-resize m-0 z-10"
      />
      
      {/* Badges */}
      <div className="absolute top-4 left-4 bg-black/60 text-white text-xs font-medium px-2 py-1 rounded backdrop-blur-sm pointer-events-none z-0">
        Original
      </div>
      <div className="absolute top-4 right-4 bg-indigo-600/80 text-white text-xs font-medium px-2 py-1 rounded backdrop-blur-sm pointer-events-none z-0">
        Upscaled
      </div>
    </div>
  );
}