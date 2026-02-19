import type { WidgetConfig, WeatherSettings, GithubSettings, TodoSettings } from '../types';

/**
 * Estimate the height needed to render a widget
 * This should match the actual rendering logic in renderWidgetToCanvas
 */
export const estimateWidgetHeight = (widget: WidgetConfig): number => {
  // Base padding
  const padding = widget.size === 'S' ? 4 : widget.size === 'L' ? 12 : 8;
  
  // Widget-specific height estimation
  switch (widget.type) {
    case 'weather':
      return estimateWeatherHeight(widget, padding);
    case 'github':
      return estimateGithubHeight(widget, padding);
    case 'todo':
      return estimateTodoHeight(widget, padding);
    default:
      // Default fallback
      return widget.size === 'S' ? 30 : widget.size === 'L' ? 60 : 45;
  }
};

const estimateWeatherHeight = (widget: WidgetConfig, padding: number): number => {
  const fontSize = widget.size === 'S' ? 10 : widget.size === 'L' ? 16 : 12;
  // Title + location line + padding
  return padding * 2 + fontSize * 2 + 8;
};

const estimateGithubHeight = (widget: WidgetConfig, padding: number): number => {
  const settings = widget.settings as GithubSettings;
  const fontSize = widget.size === 'S' ? 9 : widget.size === 'L' ? 14 : 11;
  const cellSize = widget.size === 'S' ? 3 : widget.size === 'L' ? 6 : 4;
  const cellGap = 1;
  
  // Calculate how many cells fit per row based on available width
  // Using conservative estimate: canvas width (296) - margins (20) - padding (2 * padding)
  const availableWidth = 296 - 20 - (padding * 2);
  const maxCellsPerRow = Math.floor(availableWidth / (cellSize + cellGap));
  const daysToShow = settings.range || 30;
  const numberOfRows = Math.ceil(daysToShow / maxCellsPerRow);
  
  // Title + range text + grass grid (dynamic rows based on wrapping)
  return padding * 2 + fontSize * 2 + 8 + (cellSize + cellGap) * numberOfRows;
};

const estimateTodoHeight = (widget: WidgetConfig, padding: number): number => {
  const settings = widget.settings as TodoSettings;
  const fontSize = widget.size === 'S' ? 9 : widget.size === 'L' ? 14 : 11;
  const lineHeight = fontSize + 4;
  const itemCount = Math.min(settings.items?.length || 0, 5); // Cap at 5 visible items
  // Title + items
  return padding * 2 + fontSize + 6 + (itemCount * lineHeight);
};

/**
 * Render a widget to canvas using its data model, not DOM textContent
 * This ensures proper rendering of visual markers (GitHub grass) and excludes UI controls
 * 
 * Note: This renderer uses static widget configuration data only.
 * Dynamic data (weather conditions, GitHub contributions) fetched at runtime
 * is not passed to this function and will show placeholder values.
 * 
 * For production use with live data, consider:
 * 1. Passing fetched data as an additional parameter
 * 2. Storing fetched data in widget config before image generation
 * 3. Using a separate data cache mechanism
 */
export const renderWidgetToCanvas = (
  ctx: CanvasRenderingContext2D,
  widget: WidgetConfig,
  x: number,
  y: number,
  width: number,
  height: number
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

  const padding = widget.size === 'S' ? 4 : widget.size === 'L' ? 12 : 8;
  const innerX = x + padding;
  const innerY = y + padding;
  const innerWidth = width - padding * 2;

  switch (widget.type) {
    case 'weather':
      renderWeatherWidget(ctx, widget, innerX, innerY, innerWidth);
      break;
    case 'github':
      renderGithubWidget(ctx, widget, innerX, innerY, innerWidth, height - padding * 2);
      break;
    case 'todo':
      renderTodoWidget(ctx, widget, innerX, innerY, innerWidth);
      break;
    default:
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('Unknown Widget', innerX, innerY);
  }
};

const renderWeatherWidget = (
  ctx: CanvasRenderingContext2D,
  widget: WidgetConfig,
  x: number,
  y: number,
  _width: number
): void => {
  const settings = widget.settings as WeatherSettings;
  const fontSize = widget.size === 'S' ? 10 : widget.size === 'L' ? 16 : 12;
  
  // Title
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.fillText('天気', x, y);
  
  // Note: This renders placeholder data from widget config only.
  // Live weather data fetched at runtime is not available here.
  // To show current conditions, pass weather data as an additional parameter.
  ctx.font = `${fontSize}px sans-serif`;
  const locationName = settings.locationName || '設定中';
  ctx.fillText(`地域: ${locationName}`, x, y + fontSize + 4);
};

const renderGithubWidget = (
  ctx: CanvasRenderingContext2D,
  widget: WidgetConfig,
  x: number,
  y: number,
  width: number,
  _height: number
): void => {
  const settings = widget.settings as GithubSettings;
  const fontSize = widget.size === 'S' ? 9 : widget.size === 'L' ? 14 : 11;
  
  // Title
  ctx.font = `bold ${fontSize}px sans-serif`;
  const title = `GitHub - ${settings.username || '未設定'}`;
  ctx.fillText(title, x, y);
  
  // Note: This renders placeholder grass visualization only.
  // Live contribution data fetched at runtime is not available here.
  // To show actual contributions, pass GitHub data as an additional parameter.
  ctx.font = `${fontSize - 2}px sans-serif`;
  const rangeText = `${settings.range || 30}日間`;
  ctx.fillText(rangeText, x, y + fontSize + 3);
  
  // Render grass visualization (horizontal chronological blocks with wrapping)
  // All cells shown as empty (level 0) until contribution data is provided
  const grassY = y + fontSize * 2 + 8;
  const cellSize = widget.size === 'S' ? 3 : widget.size === 'L' ? 6 : 4;
  const cellGap = 1;
  
  // Calculate how many cells fit per row
  const maxCellsPerRow = Math.floor(width / (cellSize + cellGap));
  const daysToShow = settings.range || 30;
  
  // Render cells horizontally, wrapping to next row when needed
  for (let i = 0; i < daysToShow; i++) {
    const row = Math.floor(i / maxCellsPerRow);
    const col = i % maxCellsPerRow;
    
    const cellX = x + col * (cellSize + cellGap);
    const cellY = grassY + row * (cellSize + cellGap);
    
    // Mock contribution level (0-4) - ALWAYS 0 until live data is passed
    const level = 0;
    
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
  const fontSize = widget.size === 'S' ? 9 : widget.size === 'L' ? 14 : 11;
  
  // Title
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.fillText('To-Do', x, y);
  
  let currentY = y + fontSize + 6;
  const lineHeight = fontSize + 4;
  const checkboxSize = fontSize - 2;
  
  if (!settings.items || settings.items.length === 0) {
    ctx.font = `${fontSize - 2}px sans-serif`;
    ctx.fillStyle = '#666666';
    ctx.fillText('タスクがありません', x, currentY);
    ctx.fillStyle = '#000000';
    return;
  }
  
  // Render todo items (display only, no input controls)
  // Cap at 5 items to match estimateTodoHeight
  const itemsToRender = settings.items.slice(0, 5);
  
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
    ctx.font = `${fontSize}px sans-serif`;
    
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
