# IT PMO — Kanban Project Board

A single-file, zero-dependency Kanban project board built for internal IT Project Management Office (PMO) delivery and portfolio tracking.

**Live Demo:** [https://tsimlw.github.io/kanban12/](https://tsimlw.github.io/kanban12/)

## Features

- **Four-Column Kanban Workflow**: Manage tasks across **Backlog**, **In Progress**, **Blocked**, and **Done** columns with drag-and-drop and quick-move controls.
- **Live Summary Strip**: Real-time task counts by status and overdue indicators in the header.
- **Multi-Facet Filtering**: Filter cards by **Project / Workstream**, **Assignee** search, and **Priority** (`Critical`, `High`, `Medium`, `Low`) with one-click filter reset.
- **Add & Manage Tasks**: Accessible modal form with field validation, character counters, due dates, categories, inline delete confirmation, and toast notifications.
- **Optional Email Notifications**: Built-in [FormSubmit](https://formsubmit.co/) AJAX hook (`FORMSUBMIT_ENDPOINT` in `index.html`) for notifying a recipient when new tasks are created.
- **Responsive & Accessible**: Adapts cleanly across desktop, tablet, and mobile viewports with ARIA live regions and keyboard-friendly controls.

## Tech Stack

- **HTML5 / CSS3 / Vanilla JavaScript** — single self-contained [index.html](index.html) with no build step or external dependencies.
- **GitHub Actions & GitHub Pages** — automated static deployment via [.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml).

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/tsimlw/kanban12.git
   cd kanban12
   ```
2. Open `index.html` directly in any modern web browser (or serve it with a local static server).
3. *(Optional)* To enable FormSubmit email notifications on new task creation, replace `YOUR_EMAIL@example.com` in `FORMSUBMIT_ENDPOINT` inside `index.html` with your notification email address.

## Deployment

Every push to the `main` branch automatically triggers the **Deploy static site to GitHub Pages** workflow ([.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml)), publishing the latest version to [https://tsimlw.github.io/kanban12/](https://tsimlw.github.io/kanban12/).
