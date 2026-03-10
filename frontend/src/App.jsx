import Home from './pages/Home';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center justify-center overflow-x-hidden selection:bg-indigo-500/30">
      
      <div className="w-full flex flex-col items-center transform scale-[0.75] origin-center relative">
        
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none"></div>

        <Home />

      </div>
      
    </div>
  );
}