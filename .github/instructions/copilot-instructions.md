---
description: Global Copilot instructions for the login-app project. This file provides architectural context, coding patterns, and best practices for Copilot and other AI agents.
applyTo: '**/*'
---

# Global Copilot Instructions for login-app

## Environment Setup

You can run the application either locally or using Docker:

- For Docker-based setup, use the provided Dockerfile and docker-compose.yml. See [docs/guides/docker.md](../../docs/guides/docker.md) for details.
- For local development, follow the steps in [docs/guides/setup.md](../../docs/guides/setup.md) and [docs/guides/development.md](../../docs/guides/development.md).

Refer to the /docs/guides/ folder for additional setup and configuration guides.

## Architecture Overview

- The project is a React application bootstrapped with Vite.
- The codebase is structured with clear separation of concerns: components, context, pages, services, and types.
- State management is handled using React Context and hooks.
- The application is designed for modularity and scalability, with reusable components and service abstraction for API calls.
- Testing is integrated using a standard test directory and coverage is enforced.

## Coding Patterns and Best Practices

- Use environment variables for configuration and secrets. Never commit sensitive information (such as API keys, passwords, or tokens) to the repository. Store secrets securely using environment files or secret managers.

## Accessibility and UI/UX Standards

- All code, especially HTML and UI components, must meet accessibility requirements (a11y).
- The codebase enforces accessibility via eslint-plugin-jsx-a11y; linting and git hooks will check for common accessibility issues automatically.
- Follow best practices for semantic HTML, keyboard navigation, and ARIA attributes where appropriate.
- Ensure all user-facing features are accessible to users with disabilities.
- Do not use inline styling; all styles must be placed in separate styling files (e.g., CSS or CSS modules) to ensure maintainability and consistency.
- Use functional components and React hooks throughout.
- Prefer composition over inheritance.
- All new code must be accompanied by unit tests, with a minimum of 90% coverage.
- Use UK English for all code comments, documentation, and UI text.
- All dates and times must be in GMT (UK time).
- Follow the standard commit flow, ensuring Husky hooks and code quality checks are run before pushing.
- Do not bypass code quality checks (e.g., --no-verify is not allowed).
- Update documentation in /docs and the base README for any code or API changes.

- Adhere to the SOLID principles and the DRY (Don't Repeat Yourself) principle in all code.
- Each method must do one thing and do it well (single responsibility). Methods should not be excessively long; break down complex logic into small, reusable methods where appropriate.

## Folder Structure

- `src/components/`: Reusable UI components.
- `src/context/`: React Context providers and hooks for state management.
- `src/pages/`: Top-level route components.
- `src/services/`: API integration and business logic.
- `src/types/`: TypeScript type definitions.
- `src/test/`: Unit and integration tests.
- `docs/`: Project documentation, API contracts, guides, and changelogs.

## Testing

- All new features and bug fixes must include corresponding unit tests.
- Tests should cover all code paths and conditionals.
- Use descriptive test names and group related tests logically.

- Follow the existing code style: use functional components, React hooks, and clear, descriptive naming throughout.
- Use inline mocks for simple cases. For more complex or reusable mocks, place them in a folder named `mocks` or `__mocks__` adjacent to the test file to keep mocks and test helpers close to the tests they support.
- Keep test and mock code clean and maintainable by grouping related helpers and mocks with their respective tests.

## Documentation

- Keep documentation up to date with code changes.
- Document architectural decisions, API contracts, and any non-obvious patterns.

## Commit and Code Quality

- Code quality checks (linting, formatting, and tests) are enforced automatically by git hooks during the commit and push process; agents do not need to run these manually.

## Git Flow and Commit Process

- All commits must use the standard flow: `git add` followed by `git commit -m` with a message in the format:
  `<semantic-prefix>: <branch-name> <message>`
  - Example: `feat: feat/login-form Add validation for email and password fields`
- Do not use the `--no-verify` flag; all commits must trigger Husky hooks to enforce code quality, linting, and commit message standards.
- When pushing, use `git push origin <branch-name>`. This will also trigger Husky hooks to ensure all standards are met before code is pushed.
- The commit and push process is designed to maintain code quality, enforce standards, and ensure consistency across the repository.

---

## Further Reference

## Troubleshooting and FAQ

For common issues, troubleshooting steps, and frequently asked questions, refer to [docs/guides/troubleshooting.md](../../docs/guides/troubleshooting.md) or the relevant FAQ in the /docs folder.

## Common Commands Reference

The following commands are frequently used for development, testing, and CI. Run them from the project root:

### Makefile Commands

- `make quick-check` – Fast local checks (lint + typecheck)
- `make ci-local` – Full local CI checks (lint, typecheck, test, build)
- `make lint` – Run local lint
- `make typecheck` – TypeScript type checking
- `make test` – Run the test suite
- `make build` – Production build
- `make docker-up` / `make docker-down` – Start/stop the frontend container
- `make docker-logs` – Tail frontend container logs
- `make audit` – Audit production dependencies for vulnerabilities

### package.json Scripts

- `npm run dev` – Start the Vite development server
- `npm run build` – Build for production
- `npm run preview` – Preview the production build
- `npm run typecheck` – TypeScript type checking
- `npm run lint` – Lint the codebase
- `npm run lint:fix` – Lint and auto-fix issues
- `npm test` – Run all tests
- `npm run test:watch` – Run tests in watch mode
- `npm run test:coverage` – Run tests with coverage report
- `npm run format` – Format code with Prettier
- `npm run format:check` – Check formatting with Prettier
- `npm run audit` – Audit production dependencies
- `npm run audit:fix` – Attempt to fix vulnerabilities

For a full list, see the Makefile and package.json in the project root.

For more detailed information, refer to the following documentation in the /docs folder:

- [API Integration](../../docs/API_INTEGRATION.md)
- [API Contracts](../../docs/api/auth-contracts.md)
- [API Endpoints](../../docs/api/endpoints.md)
- [Architecture Overview](../../docs/architecture/overview.md)
- [Changelog](../../docs/changelog/)
- [Guides](../../docs/guides/)
- [Planning and Backlog](../../docs/planning/)
- [Base README](../../README.md)

These documents provide additional context on architecture, API usage, coding standards, and project planning.
