import { useState } from 'react';
import { apiService } from '../services/apiService';

export function useUpscalePipeline(setProgress) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState(null);
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
    setIsProcessing(false);
  };

  const pollForResult = (jobId) => {
    const interval = setInterval(async () => {
      try {
        const result = await apiService.pollResult(jobId);
        
        if (result.success) {
          clearInterval(interval);
          setProgress(100); 
          
          setTimeout(() => {
            setResultUrl(result.data.url);
            setIsProcessing(false);
          }, 400);

        } else if (result.error) {
          clearInterval(interval);
          setIsProcessing(false);
          alert("Server error processing image.");
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 3000);
  };

  const handleUpscale = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);

    try {
      const data = await apiService.uploadImage(selectedFile, modelType);
      pollForResult(data.job_id);
    } catch (error) {
      console.error("Error:", error);
      alert(error.message); 
      setIsProcessing(false);
    }
  };

  return {
    selectedFile,
    previewUrl,
    isProcessing,
    resultUrl,
    modelType,
    setModelType,
    handleFileSelect,
    handleCancel,
    handleUpscale
  };
}