# @neomorph/sdk

Advanced theme transformation SDK for web applications. Enables dynamic theme customization through CSS custom properties with cross-origin communication support.

[![npm version](https://badge.fury.io/js/@neomorph%2Fsdk.svg)](https://www.npmjs.com/package/@neomorph/sdk)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

## 🎯 Overview

The Neomorph SDK provides communication tools for building theme designer interfaces. It enables theme designers to retrieve CSS variable data from target applications and build custom theme customization UIs.

## 🏗️ Architecture

```
┌─────────────────┐                           ┌─────────────────┐
│ Your Application│←──── Neomorph Bridge ────→│ Theme Designer  │
├─────────────────┤                           ├─────────────────┤
│ CSS Variables   │                           │ Custom UI       │
│ • --primary     │                           │ • Color Pickers │
│ • --font-size   │                           │ • Sliders       │
│ • --border      │                           │ • Input Fields  │
└─────────────────┘                           └─────────────────┘
```

## 📦 Installation

```bash
npm install @neomorph/sdk
```

## 🚀 Quick Start

### Prerequisites

Your application must use CSS custom properties for theming:

```css
:root {
  --primary-color: #3498db;
  --secondary-color: #2ecc71;
  --background-color: #ffffff;
  --text-color: #333333;
  --border-radius: 4px;
  --font-size-base: 16px;
}

.button {
  background-color: var(--primary-color);
  color: var(--text-color);
  border-radius: var(--border-radius);
  font-size: var(--font-size-base);
}
```

## 📖 Use Cases

### Loomer Integration (Theme Designer Side)

Use the Loomer class to communicate with applications and retrieve CSS variable data. The SDK provides the data and communication layer - you build the actual theme designer UI based on the returned JSON data.

#### Basic Data Retrieval

```typescript
import { Loomer, type SDKResponse } from '@neomorph/sdk';

// Initialize Loomer for theme designer communication
const loomer = new Loomer();

// Load target application in iframe with callback
loomer.loadApplication('https://your-app.com', (response: SDKResponse | null) => {
  if (response) {
    console.log('Received data:', response);

    // Actual response structure:
    // {
    //   requestId: "randomId",
    //   service: "skinweaver",
    //   payload: { action: "listenCssVariables", ...cssData }
    // }

    // YOU process this data and build UI
    buildYourThemeDesigner(response);
  }
});

// Request CSS variables from the loaded application
function startListening() {
  loomer.listenCssVariables(); // Sends PostMessage to iframe
}

// Example: Build your own theme designer UI
function buildYourThemeDesigner(response: SDKResponse) {
  // Extract data from the response payload
  const cssData = response.payload;

  // Create your own UI based on the received data
  // YOU implement the color pickers, sliders, inputs, etc.
  createCustomThemeControls(cssData);
}
```

#### Advanced Data Retrieval with Configuration

```typescript
import { Loomer, type SDKResponse } from '@neomorph/sdk';

const loomer = new Loomer({
  // Custom iframe container
  container: document.getElementById('preview-container'),

  // Communication timeout
  timeout: 5000,

  // Enable debugging
  debug: true
});

// Load application with error handling
try {
  await loomer.loadApplication('https://your-app.com', {
    onLoad: () => console.log('Application loaded'),
    onError: (error) => console.error('Load failed:', error),
    onThemeChange: (variables) => console.log('Theme applied:', variables)
  });

  // Request available CSS variables
  const response = await loomer.getCssVariables();

  if (response.success) {
    const { cssVariables, metadata } = response.data;

    // Process and group the JSON data
    const groupedVars = groupVariablesByCategory(cssVariables);

    // Build your custom theme designer UI with the data
    buildYourThemeDesignerUI(groupedVars);
  }

} catch (error) {
  console.error('Integration failed:', error);
}

// Batch update multiple variables
function applyTheme(theme: Record<string, string>) {
  Object.entries(theme).forEach(([variable, value]) => {
    loomer.updateCssVariable(variable, value);
  });
}
```

## 🔒 Security Considerations

- **Cross-Origin Communication**: All PostMessage communication includes origin validation
- **CSS Variable Exposure**: Only explicitly exposed variables are accessible via Weaver
- **Iframe Sandboxing**: Consider appropriate iframe sandbox attributes for security
- **Input Validation**: Always validate CSS variable values before applying

## 🐛 Troubleshooting

### Common Issues

**PostMessage not working**
- Ensure both applications are served over HTTPS (or both over HTTP in development)
- Check that iframe src and parent window origins are correctly configured
- Verify that Weaver script is loaded before Loomer attempts communication

**CSS Variables not detected**
- Confirm variables are defined in `:root` or explicitly exposed via Weaver options
- Check browser DevTools for CSS custom property support
- Ensure variables use the `--` prefix

**Cross-origin errors**
- Verify CORS headers are properly configured on target application
- Use appropriate iframe sandbox attributes
- Consider using a proxy for local development

## 🤝 Contributing

See the main [repository README](../../README.md) for contribution guidelines.

## 📄 License

ISC - See [LICENSE](../../LICENSE) for details.

---

**Made with ❤️ by the Neomorph team**

For more information, visit the [main repository](https://github.com/sinha-sahil/neomorph).