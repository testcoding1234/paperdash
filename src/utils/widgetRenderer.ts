import type { WidgetConfig, WeatherSettings, GithubSettings, TodoSettings } from '../types';
import { CANVAS_WIDTH } from '../constants/index';
import type { WeatherData } from './weather';
import { getWeatherEmoji } from './weather';
import type { GithubData } from './github';

// Fixed padding for all widgets (no size variants)
const WIDGET_PADDING = 8;
const FONT_SIZE = 11;
const TITLE_FONT_SIZE = 12;

// Compute font sizes from scale, enforcing readable minimums
const getScaledFonts = (fontScale: number = 1) => ({
  fontSize: Math.max(6, Math.floor(FONT_SIZE * fontScale)),
  titleFontSize: Math.max(7, Math.floor(TITLE_FONT_SIZE * fontScale)),
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
  // Title+location (one combined line) + emoji/temp line + padding
  return WIDGET_PADDING * 2 + titleFontSize + 4 + (fontSize + 4);
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
  const daysToShow = settings.range || 30;
  // Cap at 2 rows maximum to fit e-paper display (296x128) constraint
  // Prevents canvas overflow when showing 30-day range
  const numberOfRows = Math.min(2, Math.ceil(daysToShow / maxCellsPerRow));
  
  // Title + range text + grass grid
  return WIDGET_PADDING * 2 + titleFontSize + fontSize + 8 + (cellSize + cellGap) * numberOfRows;
};

const estimateTodoHeight = (fontScale: number = 1): number => {
  const { fontSize, titleFontSize } = getScaledFonts(fontScale);
  const lineHeight = fontSize + 4;
  // Title + single line containing all tasks joined with full-width spaces
  return WIDGET_PADDING * 2 + titleFontSize + 6 + lineHeight;
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

  // Line 1: Title + location combined into one line
  ctx.font = `bold ${titleFontSize}px sans-serif`;
  ctx.fillText(`天気 ${locationName}`, x, y);
  
  if (weatherData) {
    // Line 2: Emoji and temperatures on the same row
    const emoji = getWeatherEmoji(weatherData.condition);
    ctx.font = `${fontSize + 4}px sans-serif`;
    ctx.fillText(emoji, x, y + titleFontSize + 4);
    
    // Temperature display with max/min
    // Note: JMA API returns single temperature value
    // Derive min/max using ±2°C approximation for e-paper display
    // This provides useful range estimate without additional API calls
    const temp = weatherData.temperature;
    const maxTemp = temp + 2;
    const minTemp = temp - 2;
    
    ctx.font = `${fontSize}px sans-serif`;
    const tempText = `最高: ${maxTemp}°C / 最低: ${minTemp}°C`;
    ctx.fillText(tempText, x + 20, y + titleFontSize + 6);
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
  const rangeText = `${settings.range || 30}日間`;
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
  const daysToShow = settings.range || 30;
  
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
  let lineText = parts.join('　');
  
  ctx.font = `${fontSize}px sans-serif`;
  
  // Truncate if the combined text is too wide for the widget
  if (ctx.measureText(lineText).width > width) {
    while (lineText.length > 0 && ctx.measureText(lineText + '…').width > width) {
      lineText = lineText.slice(0, -1);
    }
    lineText += '…';
  }
  
  ctx.fillStyle = '#000000';
  ctx.fillText(lineText, x, contentY);
};
