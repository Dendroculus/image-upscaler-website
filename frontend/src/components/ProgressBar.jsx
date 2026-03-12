import PropTypes from 'prop-types';

function getStatusLabel(progress) {
  if (progress < 30) return "Uploading to Cloud...";
  if (progress < 99) return "AI Enhancing Details...";
  return "Finalizing...";
}

export default function ProgressBar({ progress }) {
  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-xs font-bold text-slate-700 px-1">
        <span>{getStatusLabel(progress)}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-white/50 rounded-full h-2.5 border border-white/40 shadow-inner">
        <div 
          className="bg-slate-800 h-2.5 rounded-full transition-all duration-300 ease-out shadow-sm" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}

ProgressBar.propTypes = {
  progress: PropTypes.number.isRequired,
};