const ERROR_MESSAGES = {
  ATTACK: "Are you trying to attack the web? Well that's unfortunate 😝",
  // NEW: Specific message for spoofed files
  SPOOFED: "Nice try! That file is disguised as an image, are you trying to trick us?", 
  SVG: "SVGs are math! They already have infinite resolution 🤓",
  OTHER_IMAGE: "Nice picture, but we only support static PNG, JPG, and WEBP right now 🎨",
  VIDEO: "Why do you even try to upload a video to an image upscaler web? 🤔",
  DEFAULT: "Uh oh! This file is not supported."
};

/**
 * Validates a file's MIME type and performs a pre-flight image rendering
 * check to prevent extension spoofing (e.g., .txt renamed to .jpg).
 * 
 * @param {File} file - The file object from the dropzone/input.
 * @returns {Promise<{isValid: boolean, error?: string, file?: File}>}
 */
export const validateImageUpload = (file) => {
  return new Promise((resolve) => {
    if (!file) {
      return resolve({ isValid: false, error: ERROR_MESSAGES.DEFAULT });
    }

    const fileType = file.type || "";
    const isSupportedImage = fileType.match('image/(jpeg|png|webp)');
    const isSvg = fileType === 'image/svg+xml';
    const isOtherImage = fileType.startsWith('image/') && !isSupportedImage && !isSvg;
    const isVideo = fileType.startsWith('video/');

    if (isSupportedImage) {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve({ isValid: true, file }); 
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve({ isValid: false, error: ERROR_MESSAGES.SPOOFED }); 
      };

      img.src = objectUrl;
      return;
    }

    if (isSvg) {
      return resolve({ isValid: false, error: ERROR_MESSAGES.SVG });
    }
    
    if (isOtherImage) {
      return resolve({ isValid: false, error: ERROR_MESSAGES.OTHER_IMAGE });
    }
    
    if (isVideo) {
      return resolve({ isValid: false, error: ERROR_MESSAGES.VIDEO });
    }

    return resolve({ isValid: false, error: ERROR_MESSAGES.ATTACK });
  });
};