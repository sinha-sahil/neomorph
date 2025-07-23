# 🎨 Skin Walker - Interactive Theme Designer

> A complete toolkit for building interactive theme designers for any web application

Skin Walker is a comprehensive solution that enables developers to quickly add theme customization capabilities to their web applications. With just a few lines of code, users can design, preview, and apply custom themes in real-time.

## 🚀 Features

- **🔧 Universal SDK** - Easy integration with any web framework
- **🎨 Visual Theme Designer** - Drag-and-drop interface for theme creation
- **⚡ Real-time Preview** - See changes instantly as you design
- **📱 Responsive Design** - Works seamlessly across all devices
- **🔌 Simple Integration** - Just add one script tag to get started
- **💾 Theme Export/Import** - Save and share themes as JSON
- **🎯 CSS Variable Based** - Works with any application using CSS custom properties

## 📋 Prerequisites

Your web application must use CSS custom properties (CSS variables) for theming. For example:

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

## 🏗️ Architecture

The project consists of three main components:

### 1. 📦 SDK (`/packages/sdk`)

The core JavaScript SDK that provides APIs for theme management and integration.

**Key Features:**

- Theme validation and parsing
- CSS variable management
- Event system for theme changes
- Export/import functionality
- Framework-agnostic design

### 2. 🎨 Theme Designer (`/packages/designer`)

A standalone web application that provides the visual interface for theme creation.

**Key Features:**

- Color picker with accessibility validation
- Typography controls
- Spacing and layout adjustments
- Real-time preview
- Theme templates and presets
- Export to multiple formats

### 3. �️ Weaver Script (`/packages/weaver`)

A lightweight script that weaves themes seamlessly into your application.

**Key Features:**

- Automatic CSS variable detection
- Cross-origin communication
- Theme persistence
- Hot-swapping capabilities
- Minimal performance impact

## 🚀 Quick Start

> **Note:** The project is currently in development. Usage examples and API documentation will be added once the interfaces are finalized.

## 🎯 Use Cases

- **SaaS Applications** - Let users customize their dashboard themes
- **E-commerce Platforms** - Allow merchants to brand their stores
- **Content Management Systems** - Enable theme customization for websites
- **White-label Products** - Provide branding capabilities to clients
- **Design Systems** - Create theme variations for different brands

## 🛠️ Development

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Modern browser with ES2020 support

### Setup

> **Note:** Setup instructions will be finalized once the project structure is implemented.

```bash
# Clone the repository
git clone https://github.com/sinha-sahil/skin-walker.git
cd skin-walker

# Setup instructions coming soon...
```

### Project Structure

```
skin-walker/
├── packages/
│   ├── sdk/              # Core vanilla JS SDK
│   ├── designer/         # Theme designer application
│   └── weaver/           # Weaver script
├── examples/             # Basic integration examples
└── docs/                 # Documentation
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests for new functionality
5. Run the test suite: `pnpm test`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Made with ❤️ by [Sahil Sinha](https://github.com/sinha-sahil)
