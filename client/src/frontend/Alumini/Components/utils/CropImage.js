

export const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = new Image();
  image.src = imageSrc;
  
  // Wait for the image to load
  await new Promise((resolve) => {
    image.onload = resolve;
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Set canvas size to match the cropped area
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Draw the cropped image onto the canvas
  ctx.drawImage(
    image,
    pixelCrop.x,      // x position to start clipping
    pixelCrop.y,      // y position to start clipping
    pixelCrop.width,  // width of clipped image
    pixelCrop.height, // height of clipped image
    0,                // x position on canvas
    0,                // y position on canvas
    pixelCrop.width,  // width of image to use
    pixelCrop.height  // height of image to use
  );

  // Return the cropped image as a Blob (File)
  return new Promise((resolve, reject) => {
    canvas.toBlob((file) => {
      if (!file) {
        reject(new Error('Canvas is empty'));
        return;
      }
      file.name = 'cropped-signature.jpeg';
      // Returns a URL you can use in an <img> tag, or upload to a server
      resolve(URL.createObjectURL(file)); 
    }, 'image/jpeg', 1);
  });
};