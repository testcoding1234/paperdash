import { E_PAPER_COLORS, CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants';

export const createEpaperCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  return canvas;
};

export const renderDashboardToCanvas = (
  canvas: HTMLCanvasElement,
  dashboardElement: HTMLElement
): void => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Clear canvas with white background
  ctx.fillStyle = E_PAPER_COLORS.white;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Set up for rendering
  ctx.fillStyle = E_PAPER_COLORS.black;
  ctx.font = '12px sans-serif';

  // Clone and prepare the dashboard element for rendering
  
  // Simple text-based rendering (we'll improve this)
  renderElementToCanvas(ctx, dashboardElement, 0, 0);
};

const renderElementToCanvas = (
  ctx: CanvasRenderingContext2D,
  element: HTMLElement,
  x: number,
  y: number
): void => {
  // This is a simplified renderer
  // In production, you'd want to use html2canvas or similar
  const text = element.textContent || '';
  const lines = text.split('\n').filter(line => line.trim());
  
  let currentY = y + 10;
  lines.forEach(line => {
    if (currentY < CANVAS_HEIGHT - 10) {
      ctx.fillText(line.substring(0, 40), x + 5, currentY);
      currentY += 15;
    }
  });
};

export const canvasToBlob = (canvas: HTMLCanvasElement): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to create blob'));
      }
    }, 'image/png');
  });
};

export const downloadCanvas = async (canvas: HTMLCanvasElement, filename: string = 'dashboard.png'): Promise<void> => {
  try {
    const blob = await canvasToBlob(canvas);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download failed:', error);
  }
};
