import { E_PAPER_COLORS, CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants';
import type { WidgetConfig, TodoSettings, GithubSettings, WeatherSettings, TodoItem, ContributionDay } from '../types';

export const createEpaperCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  return canvas;
};

interface WidgetBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Calculate layout for all widgets with centering
const calculateLayout = (widgets: WidgetConfig[], totalWidth: number, totalHeight: number): WidgetBounds[] => {
  const padding = 4; // Space between widgets
  const widgetSpacing = 3;
  
  // Estimate widget heights based on content
  const widgetHeights = widgets.map(widget => {
    switch (widget.type) {
      case 'todo': {
        const items = (widget.settings as TodoSettings)?.items || [];
        return 30 + Math.min(items.length * 16, 70); // Title + items (max 70px for items)
      }
      case 'github':
        return 55; // Title + stats + grass grid
      case 'weather':
        return 60; // Title + weather display
      default:
        return 40;
    }
  });

  // Calculate total height
  const totalContentHeight = widgetHeights.reduce((sum, h) => sum + h, 0) + 
                             (widgets.length - 1) * widgetSpacing;
  
  // Vertical centering
  const startY = Math.max(padding, (totalHeight - totalContentHeight) / 2);
  
  const bounds: WidgetBounds[] = [];
  let currentY = startY;
  
  widgets.forEach((_widget, index) => {
    const height = widgetHeights[index];
    const width = totalWidth - padding * 2;
    
    bounds.push({
      x: padding,
      y: currentY,
      width,
      height,
    });
    
    currentY += height + widgetSpacing;
  });
  
  return bounds;
};

// Render a single widget to canvas
const renderWidget = (
  ctx: CanvasRenderingContext2D,
  widget: WidgetConfig,
  bounds: WidgetBounds,
  data?: any
): void => {
  const { x, y, width, height } = bounds;
  const padding = 4;
  
  // Draw widget border
  ctx.strokeStyle = E_PAPER_COLORS.black;
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, height);
  
  // Fill widget background
  ctx.fillStyle = E_PAPER_COLORS.white;
  ctx.fillRect(x + 1, y + 1, width - 2, height - 2);
  
  const contentX = x + padding;
  const contentY = y + padding + 12; // Baseline for first line
  
  ctx.fillStyle = E_PAPER_COLORS.black;
  
  switch (widget.type) {
    case 'todo':
      renderTodoWidget(ctx, widget.settings as TodoSettings, contentX, contentY, width - padding * 2);
      break;
    case 'github':
      renderGithubWidget(ctx, widget.settings as GithubSettings, contentX, contentY, width - padding * 2, data);
      break;
    case 'weather':
      renderWeatherWidget(ctx, widget.settings as WeatherSettings, contentX, contentY, width - padding * 2, data);
      break;
  }
};

const renderTodoWidget = (
  ctx: CanvasRenderingContext2D,
  settings: TodoSettings,
  x: number,
  y: number,
  _maxWidth: number
): void => {
  // Title
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('To-Do', x, y);
  
  y += 16;
  
  // Render todo items
  const items = settings.items || [];
  ctx.font = '10px sans-serif';
  
  items.slice(0, 5).forEach((item: TodoItem) => { // Limit to 5 items for space
    // Checkbox
    const checkboxSize = 8;
    ctx.strokeStyle = E_PAPER_COLORS.black;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y - checkboxSize + 2, checkboxSize, checkboxSize);
    
    if (item.completed) {
      // Draw checkmark
      ctx.beginPath();
      ctx.moveTo(x + 2, y - 2);
      ctx.lineTo(x + 4, y);
      ctx.lineTo(x + 7, y - 5);
      ctx.stroke();
    }
    
    // Text
    const textX = x + checkboxSize + 4;
    const text = item.text.substring(0, 30); // Truncate long text
    
    if (item.completed) {
      ctx.fillStyle = '#888888';
      // Draw strikethrough
      const textWidth = ctx.measureText(text).width;
      ctx.fillRect(textX, y - 5, textWidth, 1);
    } else {
      ctx.fillStyle = E_PAPER_COLORS.black;
    }
    
    ctx.fillText(text, textX, y);
    ctx.fillStyle = E_PAPER_COLORS.black;
    
    y += 14;
  });
  
  if (items.length === 0) {
    ctx.fillStyle = '#888888';
    ctx.fillText('タスクがありません', x, y);
    ctx.fillStyle = E_PAPER_COLORS.black;
  }
};

const renderWeatherWidget = (
  ctx: CanvasRenderingContext2D,
  _settings: WeatherSettings,
  x: number,
  y: number,
  _maxWidth: number,
  data?: any
): void => {
  // Title
  ctx.font = 'bold 12px sans-serif';
  const title = data?.locationName ? `天気 - ${data.locationName}` : '天気';
  ctx.fillText(title, x, y);
  
  y += 16;
  
  if (!data) {
    ctx.font = '10px sans-serif';
    ctx.fillText('読み込み中...', x, y);
    return;
  }
  
  // Temperature (large)
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText(`${data.temperature}°C`, x, y + 18);
  
  // Condition
  ctx.font = '10px sans-serif';
  ctx.fillText(data.condition, x, y + 32);
  
  // Weather emoji (draw as text)
  ctx.font = '24px sans-serif';
  ctx.fillText(data.emoji || '🌤️', x + 80, y + 20);
};

const renderGithubWidget = (
  ctx: CanvasRenderingContext2D,
  settings: GithubSettings,
  x: number,
  y: number,
  maxWidth: number,
  data?: any
): void => {
  // Title
  ctx.font = 'bold 12px sans-serif';
  const title = `GitHub - ${settings.username}`;
  ctx.fillText(title, x, y);
  
  y += 14;
  
  if (!data || data.error) {
    ctx.font = '10px sans-serif';
    ctx.fillStyle = '#CC0000';
    ctx.fillText(data?.error || 'データなし', x, y);
    ctx.fillStyle = E_PAPER_COLORS.black;
    return;
  }
  
  // Stats
  ctx.font = '9px sans-serif';
  ctx.fillText(`${settings.range}日間: ${data.totalContributions} contributions`, x, y);
  
  y += 12;
  
  // Render contribution squares horizontally (chronological)
  const contributions = data.contributions || [];
  const cellSize = 3;
  const cellGap = 1;
  const maxCellsPerRow = Math.floor(maxWidth / (cellSize + cellGap));
  
  let currentX = x;
  let currentY = y;
  let cellsInRow = 0;
  
  contributions.forEach((day: ContributionDay) => {
    // Get color based on level
    let fillColor: string = E_PAPER_COLORS.white;
    if (day.level === 1) fillColor = '#CCCCCC';
    else if (day.level === 2) fillColor = '#888888';
    else if (day.level === 3) fillColor = '#444444';
    else if (day.level >= 4) fillColor = E_PAPER_COLORS.black;
    
    // Draw cell
    ctx.fillStyle = fillColor;
    ctx.fillRect(currentX, currentY, cellSize, cellSize);
    
    if (day.level === 0) {
      // Draw border for empty cells
      ctx.strokeStyle = E_PAPER_COLORS.black;
      ctx.lineWidth = 0.5;
      ctx.strokeRect(currentX, currentY, cellSize, cellSize);
    }
    
    ctx.fillStyle = E_PAPER_COLORS.black;
    
    currentX += cellSize + cellGap;
    cellsInRow++;
    
    // Wrap to next row if needed
    if (cellsInRow >= maxCellsPerRow) {
      currentX = x;
      currentY += cellSize + cellGap;
      cellsInRow = 0;
    }
  });
};

// Main rendering function
export const renderDashboardToCanvas = (
  canvas: HTMLCanvasElement,
  widgets: WidgetConfig[],
  widgetData: Map<string, any>
): void => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Clear canvas with white background
  ctx.fillStyle = E_PAPER_COLORS.white;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Filter enabled widgets and sort by order
  const enabledWidgets = widgets
    .filter(w => w.enabled)
    .sort((a, b) => a.order - b.order);

  if (enabledWidgets.length === 0) {
    // Draw "no widgets" message
    ctx.fillStyle = E_PAPER_COLORS.black;
    ctx.font = '12px sans-serif';
    ctx.fillText('ウィジェットがありません', CANVAS_WIDTH / 2 - 60, CANVAS_HEIGHT / 2);
    return;
  }

  // Calculate layout with centering
  const bounds = calculateLayout(enabledWidgets, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Render each widget
  enabledWidgets.forEach((widget, index) => {
    const data = widgetData.get(widget.id);
    renderWidget(ctx, widget, bounds[index], data);
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
