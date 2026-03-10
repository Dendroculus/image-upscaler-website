export default function ActionControls({ modelType, setModelType, isProcessing, handleCancel, handleUpscale }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto">
      <select 
        value={modelType}
        onChange={(e) => setModelType(e.target.value)}
        disabled={isProcessing}
        className="bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block px-3 py-2.5 disabled:opacity-50 outline-none"
      >
        <option value="general">General Model</option>
        <option value="anime">Anime / Art Model</option>
      </select>

      <button 
        onClick={handleCancel}
        disabled={isProcessing}
        className="px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
      >
        Cancel
      </button>
      <button 
        onClick={handleUpscale}
        disabled={isProcessing}
        className="flex items-center justify-center min-w-[140px] px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors shadow-[0_0_15px_rgba(79,70,229,0.4)] hover:shadow-[0_0_25px_rgba(79,70,229,0.6)] disabled:opacity-50 disabled:shadow-none"
      >
        {isProcessing ? "Processing..." : "Upscale Image"}
      </button>
    </div>
  );
}