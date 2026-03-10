export default function Header() {
  return (
    <div className="space-y-4">
      <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
        Neural Upscaler
      </h1>
      <p className="text-lg text-slate-400 max-w-2xl mx-auto">
        Enhance your images instantly using Real-ESRGAN. Secure, fast, and completely free.
      </p>
    </div>
  );
}