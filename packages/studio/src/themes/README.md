# Header Banner Theme Customization

This directory contains example theme files that demonstrate how to customize the Neomorph Studio header banner using CSS variables.

For more information about Neomorph and integration guides, visit the [GitHub repository](https://github.com/sinha-sahil/neomorph).

## Available Variables

### Header Layout
- `--header-bg-primary` - Primary background color
- `--header-bg-secondary` - Secondary background color (for gradients)
- `--header-border-color` - Bottom border color
- `--header-padding-top` - Top padding
- `--header-padding-bottom` - Bottom padding
- `--header-padding-horizontal` - Left/right padding
- `--content-max-width` - Maximum content width

### Badge Styling
- `--badge-bg-primary` - Badge primary background
- `--badge-bg-secondary` - Badge secondary background
- `--badge-text-color` - Badge text color
- `--badge-padding-y` - Badge vertical padding
- `--badge-padding-x` - Badge horizontal padding
- `--badge-border-radius` - Badge border radius
- `--badge-font-size` - Badge font size
- `--badge-font-weight` - Badge font weight
- `--badge-margin-bottom` - Badge bottom margin
- `--badge-shadow-color` - Badge shadow color
- `--badge-icon-size` - Badge icon size

### Title Styling
- `--title-font-size` - Title font size
- `--title-font-weight` - Title font weight
- `--title-margin-bottom` - Title bottom margin
- `--title-line-height` - Title line height
- `--title-bg-primary` - Title gradient primary color
- `--title-bg-secondary` - Title gradient secondary color
- `--title-letter-spacing` - Title letter spacing

### Subtitle Styling
- `--subtitle-font-size` - Subtitle font size
- `--subtitle-font-weight` - Subtitle font weight
- `--subtitle-margin-bottom` - Subtitle bottom margin
- `--subtitle-color` - Subtitle text color
- `--subtitle-line-height` - Subtitle line height
- `--subtitle-max-width` - Subtitle maximum width

### Feature Pills
- `--pills-gap` - Gap between pills
- `--pills-margin-top` - Top margin for pills container
- `--pill-bg` - Pill background color
- `--pill-color` - Pill text color
- `--pill-padding-y` - Pill vertical padding
- `--pill-padding-x` - Pill horizontal padding
- `--pill-border-radius` - Pill border radius
- `--pill-font-size` - Pill font size
- `--pill-font-weight` - Pill font weight
- `--pill-border-color` - Pill border color
- `--pill-shadow` - Pill shadow
- `--pill-shadow-hover` - Pill shadow on hover
- `--pill-transition` - Pill transition effects

### Background Elements
- `--element-bg-primary` - Background element primary color
- `--element-bg-secondary` - Background element secondary color
- `--element-animation-duration` - Animation duration for floating elements

## Usage

To apply a theme, import the CSS file after the main component styles:

```css
/* In your main CSS file or component */
@import './themes/dark-theme.css';
```

Or conditionally load themes:

```javascript
// Dynamically load theme
const loadTheme = (themeName) => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `/themes/${themeName}-theme.css`;
  document.head.appendChild(link);
};
```

## Example Themes

### Dark Theme (`dark-theme.css`)
- Dark background with light text
- Purple accent colors
- Larger spacing for premium feel
- Subtle shadows and effects

### Colorful Theme (`colorful-theme.css`)
- Warm yellow/orange gradient background
- Bold, vibrant colors
- Compact spacing
- Enhanced visual effects

## Creating Custom Themes

1. Copy one of the existing theme files
2. Modify the CSS variables to match your design
3. Test responsive behavior on different screen sizes
4. Consider accessibility (contrast ratios, readability)

## Tips

- Use CSS custom properties for easy runtime theme switching
- Test themes in both light and dark system preferences
- Ensure sufficient contrast for accessibility
- Consider animation performance on slower devices
- Use semantic color names in your own variables for maintainability