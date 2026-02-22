import type { WidgetConfig, WeatherSettings, GithubSettings, TodoSettings } from '../types';
import { CANVAS_WIDTH } from '../constants/index';
import type { WeatherData } from './weather';
import { getWeatherEmoji, TEMP_VARIANCE } from './weather';
import type { GithubData } from './github';

// Fixed padding for all widgets (no size variants)
const WIDGET_PADDING = 8;
const FONT_SIZE = 11;
const TITLE_FONT_SIZE = 12;

// Compute font sizes from scale, enforcing readable minimums (10px body, 11px title)
const getScaledFonts = (fontScale: number = 1) => ({
  fontSize: Math.max(10, Math.floor(FONT_SIZE * fontScale)),
  titleFontSize: Math.max(11, Math.floor(TITLE_FONT_SIZE * fontScale)),
});

// Optional live data that can be passed to renderer
export interface RenderData {
  weather?: Record<string, WeatherData>;
  github?: Record<string, GithubData>;
}

/**
 * Estimate the height needed to render a widget
 * This should match the actual rendering logic in renderWidgetToCanvas
 * MUST be conservative to prevent canvas overflow
 */
export const estimateWidgetHeight = (widget: WidgetConfig, fontScale: number = 1): number => {
  // Widget-specific height estimation
  switch (widget.type) {
    case 'weather':
      return estimateWeatherHeight(fontScale);
    case 'github':
      return estimateGithubHeight(widget, fontScale);
    case 'todo':
      return estimateTodoHeight(fontScale);
    default:
      // Default fallback
      return 45;
  }
};

const estimateWeatherHeight = (fontScale: number = 1): number => {
  const { fontSize, titleFontSize } = getScaledFonts(fontScale);
  // Title line + emoji/condition line + temp line + padding
  return WIDGET_PADDING * 2 + titleFontSize + 4 + (fontSize + 4) + 4 + (fontSize + 4);
};

const estimateGithubHeight = (widget: WidgetConfig, fontScale: number = 1): number => {
  const { fontSize, titleFontSize } = getScaledFonts(fontScale);
  const settings = widget.settings as GithubSettings;
  const cellSize = 4;
  const cellGap = 1;
  
  // Calculate how many cells fit per row based on available width
  // Canvas dimensions: CANVAS_WIDTH - horizontal margins - widget padding
  const CANVAS_HORIZONTAL_MARGINS = 20;
  const availableWidth = CANVAS_WIDTH - CANVAS_HORIZONTAL_MARGINS - (WIDGET_PADDING * 2);
  const maxCellsPerRow = Math.floor(availableWidth / (cellSize + cellGap));
  const daysToShow = settings.range || 7;
  // Cap at 2 rows maximum to fit e-paper display (296x128) constraint
  const numberOfRows = Math.min(2, Math.ceil(daysToShow / maxCellsPerRow));
  
  // Title + range text + grass grid
  return WIDGET_PADDING * 2 + titleFontSize + fontSize + 8 + (cellSize + cellGap) * numberOfRows;
};

const estimateTodoHeight = (fontScale: number = 1): number => {
  const { fontSize, titleFontSize } = getScaledFonts(fontScale);
  const lineHeight = fontSize + 4;
  // Title + up to 2 lines containing tasks joined with full-width spaces
  return WIDGET_PADDING * 2 + titleFontSize + 6 + lineHeight * 2;
};

/**
 * Render a widget to canvas using its data model, not DOM textContent
 * This ensures proper rendering of visual markers (GitHub grass) and excludes UI controls
 * Uses fixed padding and font sizes for consistent e-paper display
 */
export const renderWidgetToCanvas = (
  ctx: CanvasRenderingContext2D,
  widget: WidgetConfig,
  x: number,
  y: number,
  width: number,
  height: number,
  liveData?: RenderData,
  fontScale: number = 1
): void => {
  // Draw widget border
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, height);

  // Fill widget background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(x + 1, y + 1, width - 2, height - 2);

  // Set text rendering properties
  ctx.fillStyle = '#000000';
  ctx.textBaseline = 'top';

  const innerX = x + WIDGET_PADDING;
  const innerY = y + WIDGET_PADDING;
  const innerWidth = width - WIDGET_PADDING * 2;

  switch (widget.type) {
    case 'weather':
      renderWeatherWidget(ctx, widget, innerX, innerY, innerWidth, liveData, fontScale);
      break;
    case 'github':
      renderGithubWidget(ctx, widget, innerX, innerY, innerWidth, height - WIDGET_PADDING * 2, liveData, fontScale);
      break;
    case 'todo':
      renderTodoWidget(ctx, widget, innerX, innerY, innerWidth, fontScale);
      break;
    default: {
      const { titleFontSize } = getScaledFonts(fontScale);
      ctx.font = `bold ${titleFontSize}px sans-serif`;
      ctx.fillText('Unknown Widget', innerX, innerY);
    }
  }
};

const renderWeatherWidget = (
  ctx: CanvasRenderingContext2D,
  widget: WidgetConfig,
  x: number,
  y: number,
  _width: number,
  liveData?: RenderData,
  fontScale: number = 1
): void => {
  const { fontSize, titleFontSize } = getScaledFonts(fontScale);
  const settings = widget.settings as WeatherSettings;
  
  // Get weather data if available
  const weatherKey = settings.locationCode || '130000';
  const weatherData = liveData?.weather?.[weatherKey];
  const locationName = weatherData?.locationName || settings.locationName || '設定中';

  // Line 1: Title + location combined into one line with full-width space
  ctx.font = `bold ${titleFontSize}px sans-serif`;
  ctx.fillText(`天気\u3000${locationName}`, x, y);
  
  if (weatherData) {
    // Line 2: Emoji and condition
    const emoji = getWeatherEmoji(weatherData.condition);
    ctx.font = `${fontSize + 4}px sans-serif`;
    ctx.fillText(emoji, x, y + titleFontSize + 4);
    
    ctx.font = `${fontSize}px sans-serif`;
    ctx.fillText(weatherData.condition, x + 22, y + titleFontSize + 6);
    
    // Line 3: Temperature (max/min) using explicit Number() to prevent string concatenation
    // Bug fix: JMA API temps array may contain strings; Number() ensures numeric addition
    const temp = Number(weatherData.temperature);
    const maxTemp = temp + TEMP_VARIANCE;
    const minTemp = temp - TEMP_VARIANCE;
    
    const tempText = `最高${maxTemp}°C 最低${minTemp}°C`;
    ctx.fillText(tempText, x, y + titleFontSize + 4 + (fontSize + 4) + 4);
  }
};

const renderGithubWidget = (
  ctx: CanvasRenderingContext2D,
  widget: WidgetConfig,
  x: number,
  y: number,
  width: number,
  _height: number,
  liveData?: RenderData,
  fontScale: number = 1
): void => {
  const { fontSize, titleFontSize } = getScaledFonts(fontScale);
  const settings = widget.settings as GithubSettings;
  
  // Title — use monospace font for better readability on e-paper
  ctx.font = `bold ${titleFontSize}px monospace`;
  const title = `GitHub - ${settings.username || '未設定'}`;
  ctx.fillText(title, x, y);
  
  // Range text — monospace for consistent character widths
  ctx.font = `${fontSize}px monospace`;
  const rangeText = `${settings.range || 7}日間`;
  ctx.fillText(rangeText, x, y + titleFontSize + 3);
  
  // Get GitHub data if available
  const githubKey = settings.username || '';
  const githubData = liveData?.github?.[githubKey];
  
  // Render grass visualization (horizontal chronological blocks with wrapping)
  const grassY = y + titleFontSize + fontSize + 8;
  const cellSize = 4;
  const cellGap = 1;
  
  // Calculate how many cells fit per row
  const maxCellsPerRow = Math.floor(width / (cellSize + cellGap));
  const daysToShow = settings.range || 7;
  
  // Render cells horizontally, wrapping to next row when needed
  // Maximum 2 rows for e-paper display
  const maxRows = 2;
  const totalCells = Math.min(daysToShow, maxCellsPerRow * maxRows);
  
  for (let i = 0; i < totalCells; i++) {
    const row = Math.floor(i / maxCellsPerRow);
    const col = i % maxCellsPerRow;
    
    const cellX = x + col * (cellSize + cellGap);
    const cellY = grassY + row * (cellSize + cellGap);
    
    // Use live data if available, otherwise show empty cells
    const level = githubData?.contributions?.[i]?.level ?? 0;
    
    const color = getGrassColor(level);
    ctx.fillStyle = color;
    ctx.fillRect(cellX, cellY, cellSize, cellSize);
    
    // Border for empty cells
    if (level === 0) {
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.strokeRect(cellX, cellY, cellSize, cellSize);
    }
  }
  
  // Reset fill style
  ctx.fillStyle = '#000000';
};

const getGrassColor = (level: number): string => {
  switch (level) {
    case 0: return '#FFFFFF';
    case 1: return '#D0D0D0';
    case 2: return '#909090';
    case 3: return '#606060';
    case 4: return '#000000';
    default: return '#FFFFFF';
  }
};

const renderTodoWidget = (
  ctx: CanvasRenderingContext2D,
  widget: WidgetConfig,
  x: number,
  y: number,
  width: number,
  fontScale: number = 1
): void => {
  const { fontSize, titleFontSize } = getScaledFonts(fontScale);
  const settings = widget.settings as TodoSettings;
  
  // Title
  ctx.font = `bold ${titleFontSize}px sans-serif`;
  ctx.fillText('To-Do', x, y);
  
  const contentY = y + titleFontSize + 6;
  
  if (!settings.items || settings.items.length === 0) {
    ctx.font = `${fontSize}px sans-serif`;
    ctx.fillStyle = '#666666';
    ctx.fillText('タスクがありません', x, contentY);
    ctx.fillStyle = '#000000';
    return;
  }
  
  // Build single-line text: all tasks joined with full-width spaces
  // Use ☐ for unchecked, ☑ for checked
  const parts = settings.items.map(item => `${item.completed ? '☑' : '☐'}${item.text}`);
  const fullText = parts.join('\u3000');
  
  ctx.font = `${fontSize}px sans-serif`;
  const lineHeight = fontSize + 4;
  
  ctx.fillStyle = '#000000';
  
  // If the combined text fits on one line, display it directly
  if (ctx.measureText(fullText).width <= width) {
    ctx.fillText(fullText, x, contentY);
  } else {
    // Wrap at full-width space boundaries between tasks (max 2 lines)
    const lines: string[] = [];
    let currentLine = '';
    
    for (const part of parts) {
      const candidate = currentLine ? currentLine + '\u3000' + part : part;
      if (ctx.measureText(candidate).width > width && currentLine) {
        lines.push(currentLine);
        currentLine = part;
      } else {
        currentLine = candidate;
      }
    }
    if (currentLine) lines.push(currentLine);
    
    // Render up to 2 lines
    lines.slice(0, 2).forEach((line, index) => {
      ctx.fillText(line, x, contentY + index * lineHeight);
    });
  }
};
