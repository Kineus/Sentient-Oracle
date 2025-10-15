# Contributing to Sentient Crypto Oracle Bot

Thank you for your interest in contributing to the Sentient Crypto Oracle Bot! This document provides guidelines for contributing to the project.

## 🤝 How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/sentient-agi/sentient-crypto-oracle-bot/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (Node.js version, OS, etc.)
   - Relevant logs or screenshots

### Suggesting Features

1. Check existing [Issues](https://github.com/sentient-agi/sentient-crypto-oracle-bot/issues) for similar requests
2. Create a new issue with:
   - Clear feature description
   - Use case and benefits
   - Any implementation ideas

### Code Contributions

1. **Fork the repository**
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**:
   - Follow the existing code style
   - Add comments for complex logic
   - Test your changes thoroughly
4. **Commit your changes**:
   ```bash
   git commit -m "Add: brief description of changes"
   ```
5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Create a Pull Request**

## 📋 Development Guidelines

### Code Style

- Use **2 spaces** for indentation
- Use **single quotes** for strings
- Use **camelCase** for variables and functions
- Use **PascalCase** for classes
- Add **JSDoc comments** for functions
- Keep lines under **100 characters**

### File Structure

- Commands go in `src/commands/`
- Utilities go in `src/utils/`
- Events go in `src/events/`
- Use descriptive file names

### Error Handling

- Always wrap API calls in try-catch blocks
- Provide meaningful error messages
- Log errors with context
- Handle edge cases gracefully

### Testing

- Test commands with various inputs
- Test error scenarios
- Verify Discord embed formatting
- Test with different permissions

## 🎯 Areas for Contribution

### High Priority

- **New Commands**: Portfolio tracking, price predictions, market analysis
- **API Integrations**: Additional data sources (Binance, CoinMarketCap)
- **UI Improvements**: Better embed designs, interactive components
- **Performance**: Caching, rate limiting, optimization

### Medium Priority

- **Localization**: Multi-language support
- **Analytics**: Usage tracking and insights
- **Configuration**: More customization options
- **Documentation**: Code comments, tutorials

### Low Priority

- **Testing**: Unit tests, integration tests
- **Monitoring**: Health checks, metrics
- **Security**: Input validation, rate limiting
- **Deployment**: Docker support, CI/CD

## 🔧 Development Setup

### Prerequisites

- Node.js 16.9.0+
- Discord Bot Token
- Fireworks AI API Key

### Setup

1. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/sentient-crypto-oracle-bot.git
   cd sentient-crypto-oracle-bot
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment**:
   ```bash
   cp env.example .env
   # Edit .env with your credentials
   ```

4. **Deploy commands** (for testing):
   ```bash
   npm run deploy-commands
   ```

5. **Run in development mode**:
   ```bash
   npm run dev
   ```

## 📝 Pull Request Guidelines

### Before Submitting

- [ ] Code follows the style guidelines
- [ ] All tests pass (if applicable)
- [ ] Documentation is updated
- [ ] No console.log statements left in
- [ ] Error handling is implemented

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] Commands work as expected
- [ ] No errors in console

## Screenshots
(If applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes
```

## 🏷️ Commit Convention

We follow [Conventional Commits](https://conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

Examples:
```bash
git commit -m "feat: add portfolio tracking command"
git commit -m "fix: resolve price alert notification issue"
git commit -m "docs: update README with new commands"
```

## 🐛 Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Use command '...'
2. With parameters '...'
3. See error

**Expected behavior**
What you expected to happen.

**Environment:**
- Node.js version:
- OS:
- Bot version:

**Additional context**
Any other relevant information.
```

## 💡 Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Other solutions you've thought about.

**Additional context**
Any other context about the feature request.
```

## 📞 Getting Help

- **Discord**: Join our [Discord Server](https://discord.gg/sentient-agi)
- **GitHub Discussions**: Use for questions and ideas
- **Issues**: For bugs and feature requests

## 🏆 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Discord server recognition
- GitHub contributors list

Thank you for contributing to Sentient Crypto Oracle Bot! 🚀
