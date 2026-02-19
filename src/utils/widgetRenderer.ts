import type { WidgetConfig, WeatherSettings, GithubSettings, TodoSettings } from '../types';
import { CANVAS_WIDTH } from '../constants/index';
import type { WeatherData } from './weather';
import { getWeatherEmoji } from './weather';
import type { GithubData } from './github';

// Fixed padding for all widgets (no size variants)
const WIDGET_PADDING = 8;
const FONT_SIZE = 11;
const TITLE_FONT_SIZE = 12;

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
export const estimateWidgetHeight = (widget: WidgetConfig): number => {
  // Widget-specific height estimation
  switch (widget.type) {
    case 'weather':
      return estimateWeatherHeight();
    case 'github':
      return estimateGithubHeight(widget);
    case 'todo':
      return estimateTodoHeight(widget);
    default:
      // Default fallback
      return 45;
  }
};

const estimateWeatherHeight = (): number => {
  // Title line + weather emoji/temp line + condition line + padding
  // Conservative estimate
  return WIDGET_PADDING * 2 + TITLE_FONT_SIZE + 20 + FONT_SIZE;
};

const estimateGithubHeight = (widget: WidgetConfig): number => {
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
  return WIDGET_PADDING * 2 + TITLE_FONT_SIZE + FONT_SIZE + 8 + (cellSize + cellGap) * numberOfRows;
};

const estimateTodoHeight = (widget: WidgetConfig): number => {
  const settings = widget.settings as TodoSettings;
  const lineHeight = FONT_SIZE + 4;
  // Cap at 3 items for canvas (not 5) to prevent overflow
  const itemCount = Math.min(settings.items?.length || 0, 3);
  // Title + items
  return WIDGET_PADDING * 2 + TITLE_FONT_SIZE + 6 + (itemCount * lineHeight);
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
  liveData?: RenderData
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
      renderWeatherWidget(ctx, widget, innerX, innerY, innerWidth, liveData);
      break;
    case 'github':
      renderGithubWidget(ctx, widget, innerX, innerY, innerWidth, height - WIDGET_PADDING * 2, liveData);
      break;
    case 'todo':
      renderTodoWidget(ctx, widget, innerX, innerY, innerWidth);
      break;
    default:
      ctx.font = `bold ${TITLE_FONT_SIZE}px sans-serif`;
      ctx.fillText('Unknown Widget', innerX, innerY);
  }
};

const renderWeatherWidget = (
  ctx: CanvasRenderingContext2D,
  widget: WidgetConfig,
  x: number,
  y: number,
  _width: number,
  liveData?: RenderData
): void => {
  const settings = widget.settings as WeatherSettings;
  
  // Title
  ctx.font = `bold ${TITLE_FONT_SIZE}px sans-serif`;
  ctx.fillText('天気', x, y);
  
  // Get weather data if available
  const weatherKey = settings.locationCode || '130000';
  const weatherData = liveData?.weather?.[weatherKey];
  
  if (weatherData) {
    // Line 1: Location name
    const locationName = weatherData.locationName || settings.locationName || '設定中';
    ctx.font = `${FONT_SIZE}px sans-serif`;
    ctx.fillText(`地域: ${locationName}`, x, y + TITLE_FONT_SIZE + 4);
    
    // Line 2: Emoji and temperatures
    const emoji = getWeatherEmoji(weatherData.condition);
    ctx.font = `${FONT_SIZE + 4}px sans-serif`;
    ctx.fillText(emoji, x, y + TITLE_FONT_SIZE + FONT_SIZE + 8);
    
    // Temperature display with max/min
    // Note: JMA API returns single temperature value
    // Derive min/max using ±2°C approximation for e-paper display
    // This provides useful range estimate without additional API calls
    const temp = weatherData.temperature;
    const maxTemp = temp + 2;
    const minTemp = temp - 2;
    
    ctx.font = `${FONT_SIZE}px sans-serif`;
    const tempText = `最高: ${maxTemp}°C / 最低: ${minTemp}°C`;
    ctx.fillText(tempText, x + 20, y + TITLE_FONT_SIZE + FONT_SIZE + 10);
  } else {
    // Fallback: show location only
    ctx.font = `${FONT_SIZE}px sans-serif`;
    const locationName = settings.locationName || '設定中';
    ctx.fillText(`地域: ${locationName}`, x, y + TITLE_FONT_SIZE + 4);
  }
};

const renderGithubWidget = (
  ctx: CanvasRenderingContext2D,
  widget: WidgetConfig,
  x: number,
  y: number,
  width: number,
  _height: number,
  liveData?: RenderData
): void => {
  const settings = widget.settings as GithubSettings;
  
  // Title
  ctx.font = `bold ${TITLE_FONT_SIZE}px sans-serif`;
  const title = `GitHub - ${settings.username || '未設定'}`;
  ctx.fillText(title, x, y);
  
  // Range text
  ctx.font = `${FONT_SIZE}px sans-serif`;
  const rangeText = `${settings.range || 30}日間`;
  ctx.fillText(rangeText, x, y + TITLE_FONT_SIZE + 3);
  
  // Get GitHub data if available
  const githubKey = settings.username || '';
  const githubData = liveData?.github?.[githubKey];
  
  // Render grass visualization (horizontal chronological blocks with wrapping)
  const grassY = y + TITLE_FONT_SIZE + FONT_SIZE + 8;
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
  width: number
): void => {
  const settings = widget.settings as TodoSettings;
  
  // Title
  ctx.font = `bold ${TITLE_FONT_SIZE}px sans-serif`;
  ctx.fillText('To-Do', x, y);
  
  let currentY = y + TITLE_FONT_SIZE + 6;
  const lineHeight = FONT_SIZE + 4;
  const checkboxSize = FONT_SIZE - 2;
  
  if (!settings.items || settings.items.length === 0) {
    ctx.font = `${FONT_SIZE}px sans-serif`;
    ctx.fillStyle = '#666666';
    ctx.fillText('タスクがありません', x, currentY);
    ctx.fillStyle = '#000000';
    return;
  }
  
  // Render todo items (display only, no input controls)
  // Cap at 3 items to prevent canvas overflow
  const itemsToRender = settings.items.slice(0, 3);
  
  itemsToRender.forEach((item) => {
    // Render checkbox
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, currentY, checkboxSize, checkboxSize);
    
    // Fill checkbox if completed
    if (item.completed) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(x + 2, currentY + 2, checkboxSize - 4, checkboxSize - 4);
    }
    
    // Render text
    ctx.fillStyle = item.completed ? '#666666' : '#000000';
    ctx.font = `${FONT_SIZE}px sans-serif`;
    
    // Truncate long text
    let displayText = item.text;
    const maxWidth = width - checkboxSize - 8;
    const textWidth = ctx.measureText(displayText).width;
    
    if (textWidth > maxWidth) {
      while (ctx.measureText(displayText + '...').width > maxWidth && displayText.length > 0) {
        displayText = displayText.slice(0, -1);
      }
      displayText += '...';
    }
    
    ctx.fillText(displayText, x + checkboxSize + 4, currentY);
    
    // Strike-through if completed
    if (item.completed) {
      ctx.strokeStyle = '#666666';
      ctx.lineWidth = 1;
      const textY = currentY + checkboxSize / 2;
      ctx.beginPath();
      ctx.moveTo(x + checkboxSize + 4, textY);
      ctx.lineTo(x + checkboxSize + 4 + ctx.measureText(displayText).width, textY);
      ctx.stroke();
    }
    
    currentY += lineHeight;
  });
  
  // Reset styles
  ctx.fillStyle = '#000000';
  ctx.strokeStyle = '#000000';
};
