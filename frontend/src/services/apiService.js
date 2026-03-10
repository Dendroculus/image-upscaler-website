export const apiService = {
  async uploadImage(file, modelType) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('model_type', modelType);

    const response = await fetch('http://localhost:8000/api/upscale', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error('Upload failed');
    return response.json();
  },

  async pollResult(jobId) {
    const res = await fetch(`http://localhost:8000/api/result/${jobId}`);
    if (res.ok) {
      return { success: true, data: await res.json() };
    } else if (res.status !== 404) {
      return { success: false, error: true };
    }
    return { success: false, error: false }; // 404 means still processing
  }
};