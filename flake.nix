{
  description = "DoubleTrack Browser - Privacy through deliberate visibility";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    rust-overlay.url = "github:oxalica/rust-overlay";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, rust-overlay, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        overlays = [ (import rust-overlay) ];
        pkgs = import nixpkgs {
          inherit system overlays;
        };

        # Rust toolchain with wasm target
        rustToolchain = pkgs.rust-bin.stable.latest.default.override {
          extensions = [ "rust-src" "rust-analyzer" ];
          targets = [ "wasm32-unknown-unknown" ];
        };

        # Project dependencies
        nativeBuildInputs = with pkgs; [
          rustToolchain
          wasm-pack
          wasm-bindgen-cli
          nodejs_20
          nodePackages.npm
          just
          git
        ];

        buildInputs = with pkgs; [
          openssl
          pkg-config
        ];

        # Development dependencies
        devInputs = with pkgs; [
          # Rust development
          cargo-audit
          cargo-edit
          cargo-watch
          cargo-tarpaulin

          # Node development
          nodePackages.typescript
          nodePackages.eslint
          nodePackages.prettier

          # Utilities
          jq
          ripgrep
          fd

          # Browser testing
          chromium  # For manual testing
        ];

      in
      {
        # Development shell
        devShells.default = pkgs.mkShell {
          inherit buildInputs nativeBuildInputs;
          packages = devInputs;

          shellHook = ''
            echo "🦀 DoubleTrack Browser Development Environment"
            echo ""
            echo "Available tools:"
            echo "  rustc:      $(rustc --version)"
            echo "  cargo:      $(cargo --version)"
            echo "  wasm-pack:  $(wasm-pack --version)"
            echo "  node:       $(node --version)"
            echo "  npm:        $(npm --version)"
            echo "  just:       $(just --version)"
            echo ""
            echo "Quick start:"
            echo "  just install    # Install dependencies"
            echo "  just build      # Build project"
            echo "  just test       # Run tests"
            echo "  just dev        # Start development mode"
            echo ""
            echo "See 'just --list' for all commands"
            echo ""

            # Set up environment variables
            export RUST_BACKTRACE=1
            export CARGO_TARGET_DIR="$PWD/target"
            export NPM_CONFIG_PREFIX="$PWD/.npm-global"
            export PATH="$NPM_CONFIG_PREFIX/bin:$PATH"
          '';

          # Environment variables
          RUST_SRC_PATH = "${rustToolchain}/lib/rustlib/src/rust/library";
          OPENSSL_DIR = "${pkgs.openssl.dev}";
          OPENSSL_LIB_DIR = "${pkgs.openssl.out}/lib";
        };

        # Build package
        packages.default = pkgs.stdenv.mkDerivation {
          pname = "doubletrack-browser";
          version = "0.1.0";

          src = ./.;

          inherit nativeBuildInputs buildInputs;

          buildPhase = ''
            echo "Building Rust core..."
            cd rust_core
            wasm-pack build --target web --release
            cd ..

            echo "Installing npm dependencies..."
            npm ci --prefer-offline --no-audit

            echo "Building extension..."
            npm run build
          '';

          installPhase = ''
            mkdir -p $out
            cp -r dist/* $out/

            # Create metadata
            cat > $out/build-info.json <<EOF
            {
              "version": "0.1.0",
              "buildDate": "$(date -Iseconds)",
              "nixHash": "${self.rev or "dirty"}",
              "rustVersion": "$(rustc --version)",
              "nodeVersion": "$(node --version)"
            }
            EOF
          '';

          meta = with pkgs.lib; {
            description = "Browser extension for privacy through deliberate visibility";
            homepage = "https://github.com/yourusername/double-track-browser";
            license = licenses.mit;
            platforms = platforms.all;
          };
        };

        # Checks (tests and lints)
        checks = {
          # Rust tests
          rust-tests = pkgs.stdenv.mkDerivation {
            name = "rust-tests";
            src = ./rust_core;
            inherit nativeBuildInputs buildInputs;

            buildPhase = ''
              cargo test --release
            '';

            installPhase = "mkdir -p $out";
          };

          # Rust formatting
          rust-fmt = pkgs.stdenv.mkDerivation {
            name = "rust-fmt";
            src = ./rust_core;
            inherit nativeBuildInputs;

            buildPhase = ''
              cargo fmt -- --check
            '';

            installPhase = "mkdir -p $out";
          };

          # Rust clippy
          rust-clippy = pkgs.stdenv.mkDerivation {
            name = "rust-clippy";
            src = ./rust_core;
            inherit nativeBuildInputs buildInputs;

            buildPhase = ''
              cargo clippy -- -D warnings
            '';

            installPhase = "mkdir -p $out";
          };

          # TypeScript type checking
          ts-typecheck = pkgs.stdenv.mkDerivation {
            name = "ts-typecheck";
            src = ./.;
            inherit nativeBuildInputs;

            buildPhase = ''
              npm ci --prefer-offline --no-audit
              npm run type-check
            '';

            installPhase = "mkdir -p $out";
          };

          # ESLint
          ts-lint = pkgs.stdenv.mkDerivation {
            name = "ts-lint";
            src = ./.;
            inherit nativeBuildInputs;

            buildPhase = ''
              npm ci --prefer-offline --no-audit
              npm run lint
            '';

            installPhase = "mkdir -p $out";
          };
        };

        # Apps
        apps = {
          # Run tests
          test = flake-utils.lib.mkApp {
            drv = pkgs.writeShellScriptBin "test" ''
              cd ${./.}
              ${pkgs.just}/bin/just test
            '';
          };

          # Build extension
          build = flake-utils.lib.mkApp {
            drv = pkgs.writeShellScriptBin "build" ''
              cd ${./.}
              ${pkgs.just}/bin/just build
            '';
          };

          # Validate RSR compliance
          validate = flake-utils.lib.mkApp {
            drv = pkgs.writeShellScriptBin "validate" ''
              cd ${./.}
              ${pkgs.just}/bin/just validate-rsr
            '';
          };
        };

        # Formatter
        formatter = pkgs.nixpkgs-fmt;
      }
    );
}
