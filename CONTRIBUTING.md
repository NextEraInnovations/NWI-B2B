# Contributing to NWI B2B Platform

Thank you for your interest in contributing to the NWI B2B Platform! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Bugs

1. **Check existing issues** first to avoid duplicates
2. **Use the bug report template** when creating new issues
3. **Provide detailed information**:
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Browser/OS information

### Suggesting Features

1. **Check the roadmap** to see if it's already planned
2. **Use the feature request template**
3. **Explain the use case** and benefits
4. **Consider implementation complexity**

### Code Contributions

1. **Fork the repository**
2. **Create a feature branch** from `main`
3. **Make your changes** following our coding standards
4. **Write tests** for new functionality
5. **Update documentation** as needed
6. **Submit a pull request**

## 🛠 Development Setup

1. **Clone your fork**
   ```bash
   git clone https://github.com/yourusername/nwi-b2b-platform.git
   cd nwi-b2b-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 📝 Coding Standards

### TypeScript
- Use strict TypeScript configuration
- Define proper interfaces and types
- Avoid `any` type when possible
- Use meaningful variable names

### React
- Use functional components with hooks
- Follow React best practices
- Use proper prop types
- Implement error boundaries

### Styling
- Use Tailwind CSS classes
- Follow mobile-first responsive design
- Maintain consistent spacing and colors
- Use semantic HTML elements

### Code Organization
- Keep components small and focused
- Use proper file and folder structure
- Separate business logic from UI
- Write reusable utility functions

## 🧪 Testing

### Running Tests
```bash
npm test
```

### Writing Tests
- Write unit tests for utilities
- Write integration tests for components
- Test error scenarios
- Maintain good test coverage

## 📚 Documentation

- Update README.md for new features
- Add JSDoc comments for functions
- Update API documentation
- Include examples in documentation

## 🔄 Pull Request Process

1. **Update your branch** with latest main
2. **Run tests** and ensure they pass
3. **Run linting** and fix any issues
4. **Write descriptive commit messages**
5. **Fill out the PR template**
6. **Request review** from maintainers

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Example:
```
feat(checkout): add Kazang payment integration

- Implement official Kazang payment flow
- Add payment status monitoring
- Update checkout UI for Kazang option

Closes #123
```

## 🏗 Architecture Guidelines

### Component Structure
```
src/
├── components/
│   ├── Common/          # Reusable components
│   ├── Dashboards/      # Role-specific dashboards
│   ├── Auth/            # Authentication components
│   └── Layout/          # Layout components
├── hooks/               # Custom React hooks
├── services/            # API and external services
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
└── context/             # React context providers
```

### State Management
- Use React Context for global state
- Use local state for component-specific data
- Implement proper error handling
- Use optimistic updates where appropriate

### Database Integration
- Use Supabase for all data operations
- Implement proper error handling
- Use Row Level Security (RLS)
- Follow database naming conventions

## 🚀 Release Process

1. **Version bump** following semantic versioning
2. **Update changelog** with new features and fixes
3. **Create release notes** with migration guides
4. **Tag the release** in Git
5. **Deploy to staging** for testing
6. **Deploy to production** after approval

## 📋 Code Review Checklist

- [ ] Code follows style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No breaking changes (or properly documented)
- [ ] Performance impact considered
- [ ] Security implications reviewed
- [ ] Accessibility standards met

## 🎯 Areas for Contribution

### High Priority
- Payment gateway integrations
- Mobile responsiveness improvements
- Performance optimizations
- Security enhancements

### Medium Priority
- Additional analytics features
- UI/UX improvements
- Documentation updates
- Test coverage improvements

### Low Priority
- Code refactoring
- Developer tooling
- Build process improvements

## 📞 Getting Help

- **Discord**: Join our developer community
- **Email**: dev@nwi-b2b.com
- **Issues**: Use GitHub issues for technical questions
- **Discussions**: Use GitHub discussions for general questions

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation
- Annual contributor highlights

Thank you for helping make the NWI B2B Platform better! 🚀