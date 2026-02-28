/**
 * Export utilities for canvas-tool
 * Handles exporting canvas content to various formats
 */

/**
 * Export canvas to PNG and trigger download
 * @param {HTMLCanvasElement} canvas - The canvas element to export
 * @param {string} filename - The desired filename (default: 'canvas-drawing.png')
 */
function exportToPNG(canvas, filename = 'canvas-drawing.png') {
  try {
    // Get canvas data as PNG
    const dataURL = canvas.toDataURL('image/png');

    // Create temporary download link
    const downloadLink = document.createElement('a');
    downloadLink.href = dataURL;
    downloadLink.download = filename;

    // Trigger download
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    console.log(`Successfully exported: ${filename}`);
    return true;
  } catch (error) {
    console.error('Error exporting to PNG:', error);
    return false;
  }
}

/**
 * Export canvas to JPEG and trigger download
 * @param {HTMLCanvasElement} canvas - The canvas element to export
 * @param {string} filename - The desired filename (default: 'canvas-drawing.jpg')
 * @param {number} quality - JPEG quality 0-1 (default: 0.9)
 */
function exportToJPEG(canvas, filename = 'canvas-drawing.jpg', quality = 0.9) {
  try {
    const dataURL = canvas.toDataURL('image/jpeg', quality);

    const downloadLink = document.createElement('a');
    downloadLink.href = dataURL;
    downloadLink.download = filename;

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    console.log(`Successfully exported: ${filename}`);
    return true;
  } catch (error) {
    console.error('Error exporting to JPEG:', error);
    return false;
  }
}

/**
 * Get canvas data URL for preview or further processing
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @param {string} format - Image format (default: 'image/png')
 * @param {number} quality - Quality for lossy formats (default: 0.9)
 * @returns {string} Data URL of the canvas content
 */
function getCanvasDataURL(canvas, format = 'image/png', quality = 0.9) {
  try {
    return canvas.toDataURL(format, quality);
  } catch (error) {
    console.error('Error getting canvas data URL:', error);
    return null;
  }
}

// Export for use in both browser and Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { exportToPNG, exportToJPEG, getCanvasDataURL };
}
