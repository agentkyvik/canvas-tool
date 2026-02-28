/**
 * DrawingEngine - Core drawing functionality for canvas-tool
 * Handles canvas interactions, drawing tools, and state management
 */
class DrawingEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { willReadFrequently: false });

    // Drawing state
    this.currentTool = 'freehand';
    this.currentColor = '#000000';
    this.strokeWidth = 2;
    this.isDrawing = false;

    // Drawing coordinates
    this.startX = 0;
    this.startY = 0;
    this.lastX = 0;
    this.lastY = 0;

    // Undo/redo stacks
    this.undoStack = [];
    this.redoStack = [];
    this.maxUndoSteps = 50;

    // Temporary canvas for shape preview
    this.tempCanvas = document.createElement('canvas');
    this.tempCtx = this.tempCanvas.getContext('2d');

    // Initialize
    this._initializeCanvas();
    this._attachEventListeners();
    this._saveState();
  }

  _initializeCanvas() {
    // Set canvas size
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;

    // Match temp canvas size
    this.tempCanvas.width = this.canvas.width;
    this.tempCanvas.height = this.canvas.height;

    // Set default context properties
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.strokeStyle = this.currentColor;
    this.ctx.lineWidth = this.strokeWidth;

    // Fill with white background
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  _attachEventListeners() {
    // Mouse events
    this.canvas.addEventListener('mousedown', this._handleStart.bind(this));
    this.canvas.addEventListener('mousemove', this._handleMove.bind(this));
    this.canvas.addEventListener('mouseup', this._handleEnd.bind(this));
    this.canvas.addEventListener('mouseleave', this._handleEnd.bind(this));

    // Touch events
    this.canvas.addEventListener('touchstart', this._handleStart.bind(this), { passive: false });
    this.canvas.addEventListener('touchmove', this._handleMove.bind(this), { passive: false });
    this.canvas.addEventListener('touchend', this._handleEnd.bind(this));
    this.canvas.addEventListener('touchcancel', this._handleEnd.bind(this));

    // Window resize
    window.addEventListener('resize', this._handleResize.bind(this));
  }

  _getCoordinates(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;

    if (e.type.startsWith('touch')) {
      e.preventDefault();
      const touch = e.touches[0] || e.changedTouches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    }
  }

  _handleStart(e) {
    this.isDrawing = true;
    const coords = this._getCoordinates(e);
    this.startX = coords.x;
    this.startY = coords.y;
    this.lastX = coords.x;
    this.lastY = coords.y;

    if (this.currentTool === 'freehand') {
      this.ctx.beginPath();
      this.ctx.moveTo(coords.x, coords.y);
    } else {
      // Save current canvas state for shape preview
      this.tempCtx.clearRect(0, 0, this.tempCanvas.width, this.tempCanvas.height);
      this.tempCtx.drawImage(this.canvas, 0, 0);
    }
  }

  _handleMove(e) {
    if (!this.isDrawing) return;

    const coords = this._getCoordinates(e);

    if (this.currentTool === 'freehand') {
      this._drawFreehand(coords.x, coords.y);
    } else {
      this._drawShapePreview(coords.x, coords.y);
    }

    this.lastX = coords.x;
    this.lastY = coords.y;
  }

  _handleEnd(e) {
    if (!this.isDrawing) return;

    if (this.currentTool !== 'freehand') {
      const coords = this._getCoordinates(e);
      this._drawShape(coords.x, coords.y);
    }

    this.isDrawing = false;
    this._saveState();
  }

  _handleResize() {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);

    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
    this.tempCanvas.width = this.canvas.width;
    this.tempCanvas.height = this.canvas.height;

    this.ctx.putImageData(imageData, 0, 0);
    this._applyContextSettings();
  }

  _applyContextSettings() {
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.strokeStyle = this.currentColor;
    this.ctx.lineWidth = this.strokeWidth;
  }

  _drawFreehand(x, y) {
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
  }

  _drawShapePreview(x, y) {
    // Restore canvas to state before preview
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(this.tempCanvas, 0, 0);

    // Draw preview shape
    this.ctx.beginPath();
    this._drawShapePath(this.startX, this.startY, x, y);
    this.ctx.stroke();
  }

  _drawShape(x, y) {
    // Restore canvas to state before preview
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(this.tempCanvas, 0, 0);

    // Draw final shape
    this.ctx.beginPath();
    this._drawShapePath(this.startX, this.startY, x, y);
    this.ctx.stroke();
  }

  _drawShapePath(x1, y1, x2, y2) {
    switch (this.currentTool) {
      case 'rectangle':
        this.ctx.rect(x1, y1, x2 - x1, y2 - y1);
        break;

      case 'circle':
        const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        this.ctx.arc(x1, y1, radius, 0, 2 * Math.PI);
        break;

      case 'line':
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        break;
    }
  }

  _saveState() {
    // Save current canvas state to undo stack
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    this.undoStack.push(imageData);

    // Limit undo stack size
    if (this.undoStack.length > this.maxUndoSteps) {
      this.undoStack.shift();
    }

    // Clear redo stack when new action is performed
    this.redoStack = [];
  }

  _restoreState(imageData) {
    this.ctx.putImageData(imageData, 0, 0);
    this._applyContextSettings();
  }

  // Public API methods

  setTool(tool) {
    const validTools = ['freehand', 'rectangle', 'circle', 'line'];
    if (validTools.includes(tool)) {
      this.currentTool = tool;
    } else {
      console.warn(`Invalid tool: ${tool}. Valid tools are: ${validTools.join(', ')}`);
    }
  }

  setColor(color) {
    this.currentColor = color;
    this.ctx.strokeStyle = color;
  }

  setStrokeWidth(width) {
    this.strokeWidth = Math.max(1, Math.min(width, 50));
    this.ctx.lineWidth = this.strokeWidth;
  }

  undo() {
    if (this.undoStack.length <= 1) {
      console.log('Nothing to undo');
      return false;
    }

    // Move current state to redo stack
    const currentState = this.undoStack.pop();
    this.redoStack.push(currentState);

    // Restore previous state
    const previousState = this.undoStack[this.undoStack.length - 1];
    this._restoreState(previousState);

    return true;
  }

  redo() {
    if (this.redoStack.length === 0) {
      console.log('Nothing to redo');
      return false;
    }

    // Get state from redo stack
    const state = this.redoStack.pop();
    this.undoStack.push(state);

    // Restore state
    this._restoreState(state);

    return true;
  }

  clear() {
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this._applyContextSettings();
    this._saveState();
  }

  getCanvas() {
    return this.canvas;
  }

  getContext() {
    return this.ctx;
  }

  exportImage(format = 'image/png') {
    return this.canvas.toDataURL(format);
  }

  resize(width, height) {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);

    this.canvas.width = width;
    this.canvas.height = height;
    this.tempCanvas.width = width;
    this.tempCanvas.height = height;

    this.ctx.putImageData(imageData, 0, 0);
    this._applyContextSettings();
  }

  destroy() {
    // Remove event listeners
    this.canvas.removeEventListener('mousedown', this._handleStart);
    this.canvas.removeEventListener('mousemove', this._handleMove);
    this.canvas.removeEventListener('mouseup', this._handleEnd);
    this.canvas.removeEventListener('mouseleave', this._handleEnd);
    this.canvas.removeEventListener('touchstart', this._handleStart);
    this.canvas.removeEventListener('touchmove', this._handleMove);
    this.canvas.removeEventListener('touchend', this._handleEnd);
    this.canvas.removeEventListener('touchcancel', this._handleEnd);
    window.removeEventListener('resize', this._handleResize);

    // Clear stacks
    this.undoStack = [];
    this.redoStack = [];
  }
}

// Export for use in both browser and Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DrawingEngine;
}
