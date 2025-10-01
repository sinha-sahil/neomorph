# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Skin Walker is an interactive theme designer toolkit that enables developers to add theme customization capabilities to web applications. The project consists of three main packages working together to provide a complete theming solution based on CSS custom properties.

**Prerequisites:** Applications must use CSS custom properties (CSS variables) for theming.

**Use Cases:**
- SaaS Applications - Let users customize their dashboard themes
- E-commerce Platforms - Allow merchants to brand their stores  
- Content Management Systems - Enable theme customization for websites
- White-label Products - Provide branding capabilities to clients
- Design Systems - Create theme variations for different brands

## Architecture

This is a monorepo with three distinct packages:

### 1. Loomer (`/packages/loomer`) - Theme Designer UI
- **Technology:** SvelteKit static application
- **Purpose:** Visual interface for creating and editing themes
- **Key Features:**
  - Color picker with accessibility validation
  - Typography controls
  - Spacing and layout adjustments
  - Real-time preview functionality
  - Theme templates and presets
  - Export to multiple formats
  - Drag-and-drop interface that communicates with target applications via PostMessage API

### 2. Weaver (`/packages/weaver`) - Integration Script  
- **Technology:** Vanilla TypeScript compiled with Rollup
- **Purpose:** Lightweight script that enables cross-origin communication and CSS variable scraping
- **Key Features:**
  - Automatic CSS variable detection (including shadow DOM)
  - Cross-origin communication via PostMessage
  - Theme persistence
  - Hot-swapping capabilities
  - Minimal performance impact
  - Mutation observer for dynamic content changes

### 3. SDK (`/packages/sdk`) - Core API
- **Technology:** Vanilla TypeScript (framework-agnostic)
- **Purpose:** Core theme management and validation APIs
- **Planned Features:**
  - Theme validation and parsing
  - CSS variable management
  - Event system for theme changes
  - Export/import functionality
  - Framework-agnostic design
- **Status:** Basic structure only, implementation pending

## Common Commands

### Turborepo Commands (Recommended)
```bash
# Build all packages
pnpm build:all

# Start development for all packages
pnpm dev

# Build specific packages
pnpm build:loomer     # Build Loomer only
pnpm build:weaver     # Build Weaver only  
pnpm build:sdk        # Build SDK only

# Start development for specific packages
pnpm dev:loomer       # Start Loomer dev server
pnpm dev:weaver       # Start Weaver dev server
pnpm dev:sdk          # Start SDK dev server

# Other commands
pnpm lint             # Run linting across all packages
pnpm format           # Format code across all packages
pnpm check            # Type checking across all packages
pnpm clean            # Clean build artifacts across all packages
```

### Individual Package Commands
If you need to work within a specific package:

### Loomer (Theme Designer)
```bash
cd packages/loomer
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm preview      # Preview build
pnpm lint         # Run linting
pnpm format       # Format code
pnpm check        # Type checking
pnpm clean        # Clean build artifacts
```

### Weaver (Integration Script)
```bash
cd packages/weaver
pnpm dev          # Start development with watch mode and dev server
pnpm build        # Build for production
pnpm lint         # Run linting
pnpm format       # Format code
pnpm clean        # Clean build artifacts
```

### SDK (Core API)
```bash
cd packages/sdk
pnpm dev          # Start development with watch mode
pnpm build        # Build for production
pnpm lint         # Run linting
pnpm format       # Format code
pnpm clean        # Clean build artifacts
```

### Root Project
```bash
pnpm install      # Install all dependencies (monorepo)
pnpm test         # Run test suite (mentioned in development workflow)
```

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm
- Modern browser with ES2020 support

## Key Technical Details

### Weaver Architecture
- **Entry Point:** `packages/weaver/src/index.ts` - Initializes the weaver and sets up DOM ready handling
- **Core Logic:** `packages/weaver/src/core.ts` - Handles PostMessage communication and SDK payload processing
- **Scraping:** `packages/weaver/src/scraper.ts` - CSS variable detection and mutation observation
- **Types:** `packages/weaver/src/types.ts` - TypeScript definitions for communication protocols

### Communication Protocol
Weaver uses PostMessage API for cross-origin communication:
- **Message Format:** JSON with `source: 'skinweaver'` identifier
- **Payload Structure:** Contains `requestId`, `service`, and action-specific payloads
- **Actions:** Currently supports `listenCssVariables` action for CSS variable scraping

### CSS Variable Detection
- Detects variables starting with `--` or containing `var(--`
- Supports both document and shadow DOM scraping
- Uses mutation observers to track dynamic changes
- Organizes results by CSS selector and document host

## Development Notes

- The project uses pnpm as the package manager with workspaces
- Turborepo is configured for build orchestration and caching
- TypeScript is configured for strict type checking
- ESLint and Prettier are configured for code quality
- Rollup is used for building the weaver and SDK packages with CORS-enabled dev server
- SvelteKit handles the loomer application build process

### Turborepo Configuration
- **Build Caching:** Automatic caching of build outputs for faster subsequent builds
- **Task Dependencies:** Builds respect package dependency order (SDK → Weaver/Loomer)
- **Parallel Execution:** Tasks run in parallel when possible for optimal performance
- **Selective Builds:** Use filters (`--filter=package-name`) to build specific packages

## Performance & Quality Targets

### Performance Targets
- **SDK Bundle Size:** < 50KB gzipped
- **Weaver Bundle Size:** < 10KB gzipped  
- **Designer Load Time:** < 2 seconds
- **Theme Apply Time:** < 100ms

### Quality Targets
- **Test Coverage:** > 90%
- **TypeScript Coverage:** 100%
- **Accessibility Score:** AAA compliance
- **Performance Score:** > 95 (Lighthouse)

## Current Status

Based on PROGRESS.md, the project is approximately 25% complete:
- **Weaver package:** Has basic structure and communication framework implemented (40% complete)
- **Loomer:** Has SvelteKit setup complete (25% complete)
- **SDK package:** Basic structure only, needs initial implementation (0% complete)
- **Timeline:** Q3-Q4 2025 target
- **Phase 1 Focus:** Foundation & Core SDK development

### Key Naming Changes
- Original "Injector" renamed to "Weaver"
- Original "Designer" renamed to "Loomer"

### Known Potential Blockers
1. **Browser Compatibility:** CSS custom property support across target browsers
2. **Security Considerations:** Cross-origin communication security implications  
3. **Performance:** Ensuring real-time theme updates don't impact application performance

## Testing

No test framework is currently configured. When implementing tests:
- Consider Vitest for unit testing (mentioned in roadmap)
- Plan for cross-browser compatibility testing
- Include integration tests for PostMessage communication