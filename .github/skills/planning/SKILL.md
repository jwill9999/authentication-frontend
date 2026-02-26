---
name: planning
description: Plan, document, and manage new features and backlog items for this project. Use this skill to create, update, or review feature and backlog documentation, break down requirements into subtasks, and track planning status. Supported slash commands: /new-feature, /add-subtask, /update-status, /close-feature, /archive-feature, /new-backlog, /move-to-feature, /list-features, /list-backlog, /help /planning
---

argument-hint:
/new-feature: |
Parameters: name (required), description (required), requirements (optional), dependencies (optional), mode (parallel/sequential, required), relatedDocs (optional)
Action: Prompt for missing details, clarify requirements, ask if agent or engineer should break down subtasks, document in backlog.md (if not started) or index.md (if work begins), confirm with engineer before saving.
Example: /new-feature name="User Profile Redesign" description="Redesign user profile page for accessibility" mode=sequential
/add-subtask: |
Parameters: featureId (required), name (required), dependencies (optional), mode (parallel/sequential, required), notes/links (optional)
Action: Prompt for missing details, add subtask to specified feature, confirm dependencies and mode, update feature entry in index.md, confirm with engineer.
Example: /add-subtask featureId=feature-2026-02-24-001 name="Implement mobile styles" mode=parallel dependencies=subtask-001
/update-status: |
Parameters: featureId or backlogId (required), subtaskId (optional), status (required)
Action: Update the status of the specified feature, backlog item, or subtask. Confirm with engineer if status is set to complete or archived.
Example: /update-status featureId=feature-2026-02-24-001 subtaskId=subtask-002 status=complete
/close-feature: |
Parameters: featureId (required)
Action: Mark the feature as complete, prompt engineer for confirmation before archiving, update index.md.
Example: /close-feature featureId=feature-2026-02-24-001
/archive-feature: |
Parameters: featureId (required)
Action: Move the completed feature to the archive section or file, confirm with engineer.
Example: /archive-feature featureId=feature-2026-02-24-001
/new-backlog: |
Parameters: name (required), description (required), priority (required), effort (required), dependencies (optional), relatedDocs (optional)
Action: Prompt for missing details, document backlog item in backlog.md, confirm with engineer.
Example: /new-backlog name="Add dark mode" description="Support dark mode in UI" priority=Medium effort=Small
/move-to-feature: |
Parameters: backlogId (required)
Action: Promote the backlog item to a feature, move entry from backlog.md to index.md, prompt for any additional required details.
Example: /move-to-feature backlogId=backlog-2026-02-24-002
/list-features: |
Parameters: none
Action: List all features and their statuses from index.md.
Example: /list-features
/list-backlog: |
Parameters: none
Action: List all backlog items and their statuses from backlog.md.
Example: /list-backlog
/help /planning: |
Parameters: none or command name (optional)
Action: Display a table of all available planning slash commands, their parameters, and descriptions. If a command is specified, show detailed help for that command.
Example: /help /planning /add-subtask

## Documentation Streams

There are two documentation streams:

1. **Feature Index**: For new features that are being planned or are ready to be implemented. Documented in `docs/planning/index.md`.
2. **Backlog Index**: For backlog items that are not yet being worked on. Documented in `docs/planning/backlog.md`.

## Feature Template

Use this template for each feature in the feature index:

### [Feature Name] (`feature-slug`)

**ID:** feature-unique-id
**Status:** not started | in progress | complete | archived

1. **Feature Index**: For new features that are being planned or are ready to be implemented. Documented in `docs/planning/feature-index.md`.
   **Completed:** DD/MM/YYYY (GMT, UK time, if applicable)
   **Mode:** parallel | sequential
   **Description:** Brief summary of the feature
   **Dependencies:** (optional) List of feature/backlog IDs this depends on
   **Related Docs:** Links to additional files (e.g., requirements, Figma, designs)

#### Subtasks

| Subtask      | ID         | Status                           | Mode                | Depends On    | Created          | Completed        |
| ------------ | ---------- | -------------------------------- | ------------------- | ------------- | ---------------- | ---------------- |
| Subtask name | subtask-id | not started/in progress/complete | parallel/sequential | subtask-id(s) | DD/MM/YYYY (GMT) | DD/MM/YYYY (GMT) |

## Backlog Template

Use this template for each backlog item in the backlog index:

### [Backlog Item Name] (`backlog-slug`)

**ID:** backlog-unique-id
**Status:** not started | in progress | complete | archived
**Created:** DD/MM/YYYY (GMT, UK time)
**Date Completed:** DD/MM/YYYY (GMT, UK time, leave blank until completed) - Document the feature in backlog.md (if not started) or feature-index.md (if work begins).
**Effort:** Small | Medium | Large
**Description:** Brief summary of the backlog item
**Dependencies:** (optional) List of feature/backlog IDs this depends on
**Related Docs:** Links to additional files (e.g., requirements, designs)

---

This planning skill covers the planning phase up to the point where the plan is agreed and documented. Implementation of subtasks and features will be handled by a separate skill.

---

## Archiving

- Completed features can be moved to an archive section or file, or tagged as archived in the index.
- Archived features should remain accessible for future reference.

## Slash Command Workflow

### Help Command

Use `/help /planning` to display a table of all available planning slash commands and their parameters. - Update the feature entry in feature-index.md.
| Command | Parameters | Description | - Move the entry from backlog.md to feature-index.md.
| /new-feature | name, description, requirements, dependencies, mode, relatedDocs | Start a new feature and prompt for details | - List all features and their statuses from feature-index.md.
| /update-status | featureId or backlogId, subtaskId (optional), status | Update the status of a feature, backlog item, or subtask |
| /close-feature | featureId | Mark a feature as complete, prompt for confirmation before archiving |
| /archive-feature | featureId | Move a completed feature to the archive |
| /new-backlog | name, description, priority, effort, dependencies, relatedDocs | Add a new backlog item |
| /move-to-feature | backlogId | Promote a backlog item to a feature |
| /list-features | | List all features and their statuses |
| /list-backlog | | List all backlog items and their statuses |

For each command, the agent will prompt for any required parameters if not provided.

The following slash commands are supported for planning and tracking:

- `/new-feature` – Start a new feature, prompt for name, requirements, and stories.
- `/add-subtask` – Add a subtask to a feature, prompt for dependencies and mode.
- `/update-status` – Update the status of a feature or subtask.
- `/close-feature` – Mark a feature as complete, prompt for confirmation before archiving.
- `/archive-feature` – Move a completed feature to the archive.
- `/new-backlog` – Add a new backlog item.
- `/move-to-feature` – Promote a backlog item to a feature.
- `/list-features` – List all features and their statuses.
- `/list-backlog` – List all backlog items and their statuses.

The agent should always confirm with the engineer before closing or archiving a feature. For large or complex subtasks, link to additional documentation as needed.

## Example Feature Entry

### User Profile Redesign (`user-profile-redesign`)

**ID:** feature-2026-02-24-001
**Status:** in progress
**Created:** 24/02/2026 (GMT)
**Date Completed:**
**Mode:** sequential
**Description:** Redesign the user profile page for improved accessibility and mobile responsiveness.
**Dependencies:**
**Related Docs:** [UI Mockups](../design/user-profile-mockups.md)

#### Subtasks

| Subtask                   | ID          | Status      | Mode       | Depends On  | Created          | Completed        |
| ------------------------- | ----------- | ----------- | ---------- | ----------- | ---------------- | ---------------- |
| Create new profile layout | subtask-001 | complete    | sequential |             | 24/02/2026 (GMT) | 25/02/2026 (GMT) |
| Implement mobile styles   | subtask-002 | in progress | parallel   | subtask-001 | 25/02/2026 (GMT) |                  |
| Add accessibility tests   | subtask-003 | not started | parallel   | subtask-001 | 25/02/2026 (GMT) |                  |

---

## Purpose

This skill guides agents and contributors through the planning process for new features, ensuring all planning, backlog, and documentation requirements are met according to project standards.

## Planning Workflow Overview

- Add new features to `docs/planning/backlog.md` using the provided template.
- Move completed features to `docs/planning/index.md` with full details and links to related docs.
- Update `docs/planning/roadmap.md` for long-term or strategic features.
- Create or update architecture, API, and guide docs as needed for significant changes.
- Add changelog entries for all significant changes.

## Templates and Checklist

- Use the backlog and index entry templates from the documentation guidelines.
- Follow the review checklist to ensure all documentation is up to date.

---

This file should be updated as the planning process evolves or new requirements are introduced.
