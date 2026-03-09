import Home from './pages/Home';

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
            // 1. Read the JSON sent by FastAPI
            const data = await res.json();
            
            // 2. Stop the polling loop
            clearInterval(interval);
            
            // 3. Put the Azure URL directly into the image slider
            setResultUrl(data.url);
            setIsProcessing(false);
            
          } else if (res.status !== 404) {
            clearInterval(interval);
            setIsProcessing(false);
            alert("Processing failed on the server.");
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 3000);
    };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center justify-center p-6 selection:bg-indigo-500/30">
      
      {/* Background Glow Effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none"></div>

      <Home />
      
    </div>
  );
}