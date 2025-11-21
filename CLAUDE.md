# CLAUDE.md - Development Guide for DoubleTrack Browser

This document provides context for AI assistants working on the DoubleTrack Browser project.

## Project Overview

DoubleTrack Browser is an experimental browser extension that creates a fictional digital presence alongside a user's real browsing patterns. Instead of hiding data, it generates believable but fictional browsing behavior to obscure real patterns from tracking systems.

**Core Philosophy**: Visibility as camouflage in the age of surveillance capitalism.

## Architecture

### Technology Stack

- **Rust Core** (`rust_core/`): Profile generation and activity simulation engine
  - Compiled to WebAssembly for browser integration
  - Provides memory-safe handling of sensitive data
  - Implements the core logic for identity generation and behavior simulation

- **TypeScript Shell**: Browser API integration and UI
  - Handles WebExtensions API interactions
  - Manages background processes and user interface

- **WebAssembly**: Bridge between Rust and TypeScript
  - Compiled using `wasm-pack`
  - Enables high-performance Rust code to run in the browser

### Key Components

1. **Profile Generator**: Creates consistent, believable alternative browsing personas
2. **Activity Simulator**: Generates background browsing behavior
3. **Browser Integration**: Hooks into WebExtensions API for seamless operation
4. **Configuration System**: Allows users to adjust noise levels and behavior patterns

## Project Structure

```
double-track-browser/
├── rust_core/           # Rust/WASM core logic
│   └── (build with wasm-pack)
├── src/                 # TypeScript source (expected)
├── dist/                # Built extension (gitignored)
├── README.md            # User-facing documentation
└── CLAUDE.md            # This file
```

## Development Setup

### Prerequisites

- Node.js and npm
- Rust toolchain
- `wasm-pack` for building Rust to WebAssembly

### Initial Setup

```bash
# Install dependencies
npm install

# Build Rust core
cd rust_core
wasm-pack build
cd ..

# Build extension
npm run build
```

### Loading the Extension

Load from the `dist/` directory into your browser's extension developer mode.

## Key Considerations

### Privacy and Security

- This project deals with sensitive browsing data
- The Rust core is designed to maintain separation between real and fictional identities
- All real user data must remain protected and never mixed with simulated data
- Code changes should maintain memory safety guarantees

### Behavior Simulation

- Generated profiles must be consistent and believable
- Simulated browsing should not interfere with real user activity
- Background processes should be resource-efficient

### Browser Compatibility

- Target modern browsers supporting WebExtensions API
- Consider Firefox and Chrome/Chromium differences
- Ensure WASM compatibility across target browsers

## Common Development Tasks

### Building the Project

```bash
# Full build
npm run build

# Development build (if configured)
npm run dev

# Rust core only
cd rust_core && wasm-pack build
```

### Testing

When implementing tests:
- Unit tests for Rust core (`cargo test`)
- Integration tests for TypeScript components
- Manual testing with the loaded extension
- Profile consistency validation
- Resource usage monitoring

### Adding Features

1. **Profile Generation**: Modify Rust core in `rust_core/`
2. **UI Components**: Update TypeScript in `src/`
3. **Browser Integration**: Work with WebExtensions API bindings
4. **Configuration**: Update both UI and core logic for new parameters

## Code Quality

### Rust Code
- Follow Rust idioms and ownership patterns
- Maintain memory safety
- Document public APIs
- Write tests for core logic

### TypeScript Code
- Use strict TypeScript settings
- Type all browser API interactions
- Handle async operations properly
- Document complex interactions

## Important Notes

### Experimental Nature

This is experimental software exploring unconventional privacy approaches. Code changes should:
- Consider potential unintended consequences
- Maintain security boundaries
- Be well-documented for review
- Include warnings for risky operations

### Performance

- Background activity must be lightweight
- WASM calls should be optimized
- Avoid blocking main thread operations
- Monitor memory usage

### Ethics and Responsibility

- This tool is designed for personal privacy protection
- Code should not enable malicious uses
- Features should respect website terms of service
- Document any potentially concerning capabilities

## Useful Commands

```bash
# Check Rust code
cd rust_core && cargo check

# Run Rust tests
cd rust_core && cargo test

# Build for production
npm run build

# Clean build artifacts
npm run clean  # (if configured)
```

## Contributing Guidelines

See `CONTRIBUTING.md` for detailed contribution guidelines (if it exists).

When making changes:
1. Test thoroughly with the extension loaded
2. Verify no real user data leakage
3. Check resource usage impact
4. Document new configuration options
5. Update this file if architecture changes

## License

MIT License - See LICENSE file

## Getting Help

- Review README.md for user-facing documentation
- Check inline code comments for implementation details
- Refer to Rust and WebExtensions documentation for platform-specific questions

---

*Last updated: 2025-11-21*
