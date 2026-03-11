import PropTypes from 'prop-types';

function getStatusLabel(progress) {
  if (progress < 30) return "Uploading to Cloud...";
  if (progress < 99) return "AI Enhancing Details...";
  return "Finalizing...";
}

export default function ProgressBar({ progress }) {
  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-xs font-medium text-slate-400 px-1">
        <span>{getStatusLabel(progress)}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-slate-950 rounded-full h-2.5 border border-slate-800">
        <div 
          className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-2.5 rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}

ProgressBar.propTypes = {
  progress: PropTypes.number.isRequired,
};