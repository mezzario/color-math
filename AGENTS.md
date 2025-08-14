# Development Instructions

## Workflow Requirements

- **Always run linting after code updates**: After making any code changes, run `npm run lint` to check both ESLint and Prettier formatting
- This ensures code quality and consistent formatting across the project
- NEVER edit ./src/parser.js - it is auto generated using "build:parser" command in package.json

## Project Configuration

### Module System
- Project uses ES modules (`"type": "module"` in package.json)
- Source files use ES module syntax (import/export)
- Generated parser.js uses CommonJS with ES module exports appended via build:parser command

### Build System
- **Vite** for building library bundles
- Multiple output formats: ES modules (es/), CommonJS (lib/), and UMD (dist/)
- Separate configs: `vite.config.js` (UMD), `vite.lib.config.js` (ES/CJS)

### Code Quality
- **ESLint** with modern flat config (eslint.config.mjs)
- **Prettier** integrated with ESLint for code formatting
- **Mocha** with Babel for testing

### Development Commands
- `npm start` - Interactive REPL for testing color math expressions
- `npm run build` - Full build (parser + all output formats)
- `npm run lint` - Code quality and formatting checks
- `npm test` - Run test suite
