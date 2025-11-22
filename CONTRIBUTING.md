# Contributing to DoubleTrack Browser

Thank you for your interest in contributing to DoubleTrack Browser! This document provides guidelines for contributing to the project.

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of background or experience level.

### Expected Behavior

- Be respectful and constructive in discussions
- Focus on what is best for the community and project
- Show empathy towards other community members
- Accept constructive criticism gracefully

### Unacceptable Behavior

- Harassment, discrimination, or derogatory comments
- Personal attacks or trolling
- Publishing others' private information
- Other conduct which could reasonably be considered inappropriate

## How to Contribute

### Reporting Bugs

Before creating bug reports:
- Check existing issues to avoid duplicates
- Collect relevant information (browser version, OS, extension version)
- Try to reproduce the issue consistently

When creating a bug report, include:
- Clear, descriptive title
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Browser and extension version
- Any error messages from console

### Suggesting Features

Feature suggestions are welcome! When proposing a feature:
- Check if it aligns with project goals (privacy through noise)
- Explain the use case clearly
- Consider privacy implications
- Describe the desired behavior
- Discuss potential implementation approaches

### Pull Requests

#### Before Starting

1. Check existing issues and PRs
2. For large changes, open an issue first to discuss
3. Fork the repository
4. Create a feature branch from `main`

#### Development Process

1. **Set up your environment** (see DEVELOPMENT.md)
2. **Make your changes**
   - Follow code style guidelines
   - Write tests for new functionality
   - Update documentation as needed
3. **Test thoroughly**
   - Run all test suites
   - Test the extension manually in browser
   - Verify no regressions
4. **Commit your changes**
   - Use clear, descriptive commit messages
   - Reference related issues
   - Keep commits focused and atomic

#### Commit Message Guidelines

Follow this format:

```
<type>: <subject>

<body>

<footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Example:
```
feat: Add customizable activity schedule per weekday

Allows users to configure different activity patterns for each day
of the week. This enables more realistic simulation patterns.

Closes #123
```

#### Pull Request Process

1. Update README.md or CLAUDE.md if needed
2. Update CHANGELOG.md under "Unreleased"
3. Ensure all tests pass
4. Request review from maintainers
5. Address review feedback
6. Once approved, it will be merged by a maintainer

## Development Guidelines

### Code Style

#### Rust

- Follow Rust standard style (`rustfmt`)
- Use `cargo clippy` and address warnings
- Document public APIs with doc comments
- Write tests for new functionality
- Keep functions focused and single-purpose

Example:
```rust
/// Generates a new browsing profile with optional seed
///
/// # Arguments
/// * `seed` - Optional RNG seed for reproducible profiles
///
/// # Returns
/// A newly generated `Profile`
pub fn generate_profile(seed: Option<u64>) -> Profile {
    // implementation
}
```

#### TypeScript

- Use ESLint configuration provided
- No `any` types (use `unknown` if needed)
- Prefer `async/await` over callbacks
- Document complex functions with JSDoc
- Use meaningful variable names

Example:
```typescript
/**
 * Generates browsing activities for a profile
 *
 * @param profile - The profile to generate activities for
 * @param durationHours - How many hours worth of activities
 * @returns Array of generated activities
 */
async function generateActivities(
  profile: Profile,
  durationHours: number
): Promise<BrowsingActivity[]> {
  // implementation
}
```

### Testing

All new features should include tests:

#### Rust Tests
```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_profile_generation() {
        let mut gen = ProfileGenerator::new(Some(42));
        let profile = gen.generate();
        assert!(profile.is_valid());
    }
}
```

#### TypeScript Tests
```typescript
describe('StorageManager', () => {
  it('should save and retrieve config', async () => {
    const config: ExtensionConfig = { /* ... */ };
    await StorageManager.setConfig(config);
    const retrieved = await StorageManager.getConfig();
    expect(retrieved).toEqual(config);
  });
});
```

### Documentation

- Update inline code comments for complex logic
- Update CLAUDE.md if architecture changes
- Update README.md for user-facing changes
- Update DEVELOPMENT.md for dev workflow changes
- Add JSDoc/doc comments to public APIs

### Privacy Considerations

This project deals with browsing data. All contributions must:

- **Never leak real browsing data** - Maintain strict separation
- **Be transparent** - Users should understand what's happening
- **Minimize permissions** - Only request what's necessary
- **Secure storage** - Protect sensitive data
- **No external calls** - Don't phone home or transmit data

When adding features, ask:
- Could this compromise user privacy?
- Is this data stored securely?
- Is this behavior transparent to users?
- Could this be misused?

### Performance Considerations

- Profile code before optimizing
- Avoid blocking the main thread
- Use `chrome.alarms` instead of timers
- Batch storage operations
- Minimize WASM boundary crossings
- Consider memory usage for long-running simulations

## Areas for Contribution

### High Priority

- **Icon design** - Create professional extension icons
- **Browser testing** - Test on different browsers
- **Profile variety** - More diverse profile generation
- **URL database** - Expand realistic URL generation
- **Documentation** - Improve user and developer docs

### Medium Priority

- **Activity patterns** - More sophisticated simulation
- **Import/export** - Profile and settings portability
- **Visualization** - Activity pattern dashboards
- **Localization** - Multi-language support
- **Accessibility** - Improve UI accessibility

### Advanced Features

- **Machine learning** - Learn from real patterns (privacy-preserving)
- **Cross-browser sync** - Sync profiles across browsers
- **Advanced scheduling** - Context-aware activity
- **Analytics** - Privacy-preserving usage analytics
- **Profile templates** - Pre-made persona templates

## Questions?

- Open an issue for questions
- Check DEVELOPMENT.md for technical details
- Review CLAUDE.md for architecture context
- Read existing code and comments

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to DoubleTrack Browser! Your efforts help protect user privacy in the age of surveillance capitalism.
