import { useState } from 'react';
import PropTypes from 'prop-types';

export default function ResultViewer({ originalImage, upscaledImage }) {
  const [sliderPosition, setSliderPosition] = useState(50);

  return (
    <div className="relative w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50 aspect-video">
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
        className="absolute top-0 bottom-0 w-px bg-slate-300 pointer-events-none"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 bg-white rounded-full shadow-sm flex items-center justify-center border border-slate-200">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
            <path d="M9 18l-6-6 6-6" />
            <path d="M15 6l6 6-6 6" />
          </svg>
        </div>
      </div>

      {/* Invisible Range Input */}
      <input
        type="range"
        min="0"
        max="100"
        value={sliderPosition}
        onChange={(e) => setSliderPosition(e.target.value)}
        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-ew-resize m-0 z-10"
      />

      {/* Badges */}
      <div className="absolute top-3 left-3 bg-white/90 text-slate-600 text-[10px] font-medium px-2 py-0.5 rounded border border-slate-200 pointer-events-none z-0 uppercase tracking-wide">
        Original
      </div>
      <div className="absolute top-3 right-3 bg-slate-900/80 text-white text-[10px] font-medium px-2 py-0.5 rounded pointer-events-none z-0 uppercase tracking-wide">
        Upscaled
      </div>
    </div>
  );
}

ResultViewer.propTypes = {
  originalImage: PropTypes.string.isRequired,
  upscaledImage: PropTypes.string.isRequired
};