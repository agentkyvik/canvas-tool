/**
 * Canvas Tool - Main Application
 * Integrates drawing engine with UI controls
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize canvas and drawing engine
  const canvas = document.getElementById('canvas');
  const drawingEngine = new DrawingEngine(canvas);

  // Get UI elements
  const toolButtons = document.querySelectorAll('.tool-btn');
  const colorPicker = document.getElementById('color-picker');
  const strokeWidthInput = document.getElementById('stroke-width');
  const widthValue = document.querySelector('.width-value');
  const undoBtn = document.getElementById('undo-btn');
  const redoBtn = document.getElementById('redo-btn');
  const clearBtn = document.getElementById('clear-btn');
  const exportBtn = document.getElementById('export-btn');

  // Tool selection event listeners
  toolButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons
      toolButtons.forEach(btn => btn.classList.remove('active'));

      // Add active class to clicked button
      button.classList.add('active');

      // Set tool in drawing engine
      const tool = button.getAttribute('data-tool');
      drawingEngine.setTool(tool);

      console.log(`Tool selected: ${tool}`);
    });
  });

  // Color picker event listener
  colorPicker.addEventListener('input', (e) => {
    const color = e.target.value;
    drawingEngine.setColor(color);
    console.log(`Color changed: ${color}`);
  });

  // Also handle change event for better browser compatibility
  colorPicker.addEventListener('change', (e) => {
    const color = e.target.value;
    drawingEngine.setColor(color);
  });

  // Stroke width event listener
  strokeWidthInput.addEventListener('input', (e) => {
    const width = parseInt(e.target.value, 10);
    drawingEngine.setStrokeWidth(width);
    widthValue.textContent = width;
    console.log(`Stroke width changed: ${width}`);
  });

  // Undo button event listener
  undoBtn.addEventListener('click', () => {
    const success = drawingEngine.undo();
    if (success) {
      console.log('Undo performed');
    } else {
      console.log('Nothing to undo');
    }
  });

  // Redo button event listener
  redoBtn.addEventListener('click', () => {
    const success = drawingEngine.redo();
    if (success) {
      console.log('Redo performed');
    } else {
      console.log('Nothing to redo');
    }
  });

  // Clear button event listener with confirmation
  clearBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear the canvas? This action cannot be undone.')) {
      drawingEngine.clear();
      console.log('Canvas cleared');
    }
  });

  // Export button event listener
  exportBtn.addEventListener('click', () => {
    try {
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `canvas-drawing-${timestamp}.png`;

      // Get canvas data URL
      const dataURL = drawingEngine.exportImage('image/png');

      // Create download link
      const downloadLink = document.createElement('a');
      downloadLink.href = dataURL;
      downloadLink.download = filename;

      // Trigger download
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      console.log(`Canvas exported successfully: ${filename}`);

      // Optional: Show success feedback
      exportBtn.textContent = 'Exported!';
      setTimeout(() => {
        exportBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          <span>Export PNG</span>
        `;
      }, 1500);
    } catch (error) {
      console.error('Error exporting canvas:', error);
      alert('Failed to export canvas. Please try again.');
    }
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Z for undo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      drawingEngine.undo();
    }

    // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y for redo
    if ((e.ctrlKey || e.metaKey) && (e.shiftKey && e.key === 'z' || e.key === 'y')) {
      e.preventDefault();
      drawingEngine.redo();
    }

    // Keyboard shortcuts for tools (1-4)
    if (e.key >= '1' && e.key <= '4' && !e.ctrlKey && !e.metaKey) {
      const tools = ['freehand', 'rectangle', 'circle', 'line'];
      const toolIndex = parseInt(e.key, 10) - 1;
      const tool = tools[toolIndex];

      // Update button states
      toolButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-tool') === tool) {
          btn.classList.add('active');
        }
      });

      drawingEngine.setTool(tool);
      console.log(`Tool selected via keyboard: ${tool}`);
    }

    // C key for clear (with confirmation)
    if (e.key === 'c' && !e.ctrlKey && !e.metaKey) {
      clearBtn.click();
    }

    // E key for export
    if (e.key === 'e' && !e.ctrlKey && !e.metaKey) {
      exportBtn.click();
    }
  });

  console.log('Canvas Tool initialized successfully');
  console.log('Keyboard shortcuts:');
  console.log('  1-4: Select tools (Freehand, Rectangle, Circle, Line)');
  console.log('  Ctrl/Cmd + Z: Undo');
  console.log('  Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y: Redo');
  console.log('  C: Clear canvas');
  console.log('  E: Export to PNG');
});
