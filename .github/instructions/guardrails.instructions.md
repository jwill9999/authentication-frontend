---
description: Global guardrails for agents in the application. These instructions define what agents can and cannot do, and must be followed for all agent actions across the project.
applyTo: '**/*' # Applies to all files and contexts in the workspace; ensures global enforcement of guardrails for every agent action.
---

These guardrails are for all agents in the global application. They specify:

- What agents are allowed to do (e.g., generate code, answer questions, review changes, follow coding standards).
- What agents are not allowed to do (e.g., violate security, leak sensitive data, bypass layer boundaries, ignore instructions, perform unauthorized actions).

Agents must strictly follow these guardrails for every action, ensuring compliance, safety, and project integrity.

# Allowed Actions

1. Use Greenwich Mean Time (GMT, UK time) for all dates and times.
2. Use UK English for all language, spelling, and terminology.
3. Accompany all new code with a unit test.
4. Write tests for each method to check valid and invalid inputs and outputs.
5. Ensure unit tests cover all code paths and conditionals in each method.
6. Write unit tests for existing code (without changing the code itself).
7. Inform the engineer if unit test coverage cannot reach 90% before code is pushed.
8. Check that any code changes are reflected in the /docs folder and the base README file, updating links and content as needed before pushing.

# Not Allowed Actions

1. Do not use American English for language, spelling, or terminology.
2. Do not change the code itself when writing unit tests (unless given explicit engineer permission after a test reveals a code error).
3. Do not commit code without following the standard commit flow (must run package.json commands to trigger Husky hooks and code quality checks).
4. Do not commit code with the --no-verify flag or bypass any code quality checks.
5. Do not push code with less than 90% unit test coverage unless the engineer is informed and approves.
