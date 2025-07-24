# double-track-browser
The pendulum has swung way too far on the privacy front. 
DoubleTrack Browser puts a hard stop to attempts to limit the reckless sharing of even your most intimate data.


# DoubleTrack Browser

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-experimental-red.svg)
![Privacy](https://img.shields.io/badge/privacy-enhanced-green.svg)

## The Pendulum Swings Back

**DoubleTrack Browser** is a radical experiment in digital identity management. While most privacy tools focus on hiding your data, DoubleTrack takes the opposite approach—it deliberately creates a rich, consistent, but entirely fictional digital presence alongside your real one.

> *"The best place to hide a leaf is in a forest."*

## Core Architecture

This project is built on a hybrid architecture that prioritizes both performance and memory safety:

- **Rust Core**: Powers the profile generation and activity simulation engine, compiled to WebAssembly for browser integration
- **TypeScript Shell**: Handles browser API integration and UI components
- **WebExtensions API**: Provides the hooks needed for background operation

## Key Features

- **Parallel Identity Generation**: Creates believable, consistent alternative browsing patterns
- **Background Activity Engine**: Simulates browsing behavior even when you're not actively using your computer
- **Memory-Safe Design**: Uses Rust's ownership model to ensure your real data remains protected
- **Configurable Noise Levels**: Adjust how active your alternative identity should be

## Why DoubleTrack Exists

In a world where your data is constantly harvested, the traditional approach of trying to hide becomes increasingly futile. Data brokers have become too sophisticated, tracking technologies too pervasive.

DoubleTrack explores a different hypothesis: What if, instead of trying to be invisible, you become deliberately, strategically visible—but in ways that obscure rather than reveal?

## Getting Started

```bash
# Clone the repository
git clone https://github.com/yourusername/double-track-browser.git

# Install dependencies
cd double-track-browser
npm install

# Build the Rust core
cd rust_core
wasm-pack build

# Build the extension
cd ..
npm run build
```

Then load the extension from the `dist/` directory into your browser of choice.

## Warning

This is experimental software. While designed with security in mind, it may have unintended consequences for your online experience. Use at your own risk and only on personal devices.

## Contributing

Contributions are welcome, particularly in the areas of profile generation algorithms and behavior simulation. See `CONTRIBUTING.md` for guidelines.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

*"In the age of surveillance capitalism, visibility can be a form of camouflage."*

---

# SafeBruteForce

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-active-green.svg)
![Language](https://img.shields.io/badge/language-LFE-purple.svg)

## Taming the Chaos

**SafeBruteForce** is a specialized tool for security researchers and system administrators that brings order to the typically chaotic process of brute force testing.

> *"The difference between a flood and an irrigation system is control."*

## The Problem

Traditional brute force tools generate overwhelming amounts of output, making it difficult to:
- Monitor progress in real-time
- Identify successful attempts among thousands of failures
- Decide when to adjust parameters or abort
- Avoid system resource exhaustion

## The Solution

SafeBruteForce implements a controlled, interactive approach to brute force operations:

- **Pause-and-Confirm**: Automatically pauses after every 25 attempts
- **Human-in-the-Loop**: Requires explicit confirmation to continue
- **Clean Output Management**: Organizes results for easy analysis
- **Resource Monitoring**: Prevents runaway processes

## Technical Implementation

Built in Lisp Flavored Erlang (LFE), SafeBruteForce leverages the Erlang VM's legendary reliability:

- **Fault Tolerance**: Isolated processes prevent total failure
- **Concurrency**: Optional parallel execution for faster testing
- **Hot Code Reloading**: Modify parameters without restarting
- **Functional Purity**: Predictable, testable behavior

## Use Cases

- Password recovery on your own systems
- Security auditing with client permission
- Testing rate limiting and lockout mechanisms
- Educational demonstrations of brute force concepts

## Getting Started

```bash
# Clone the repository
git clone https://github.com/yourusername/safe-brute-force.git

# Build with rebar3
cd safe-brute-force
rebar3 compile

# Run the example
rebar3 lfe run main
```

## Responsible Usage

This tool is designed for legitimate security testing on systems you own or have explicit permission to test. Unauthorized use against third-party systems is illegal and unethical.

## Contributing

Contributions are welcome, particularly in the areas of permutation generation algorithms and output formatting. See `CONTRIBUTING.md` for guidelines.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

*"Brute force isn't about strength; it's about patience and control."*
