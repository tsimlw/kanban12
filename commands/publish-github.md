---
name: publish-github
description: Safely audit for sensitive data, prepare documentation and CI/CD, push code to a GitHub repository, deploy GitHub Pages, and update the repository About section with the live Pages link.
---

# Publish Project to GitHub & GitHub Pages

When the user invokes this command and provides GitHub repository information (e.g., repository URL, `owner/repo`, or desired new repo name/visibility), execute the following steps in order.

---

## Step 1: Parse Repository Information & Verify Prerequisites

1. Extract `OWNER`, `REPO`, and repository visibility (`public` or `private`, defaulting to `public` for standard GitHub Pages) from the user's input. If any required info is missing, ask the user before proceeding.
2. Verify that `git` and GitHub CLI (`gh`) are available and authenticated:
   ```bash
   git --version
   gh auth status
   ```
   - If `gh` is not authenticated, stop and ask the user to authenticate (`gh auth login`).
3. Inspect the workspace to understand the project type (static HTML, Node/Vite/React, Python, etc.), build steps, and existing git/GitHub configuration.

---

## Step 2: Sensitive Data & Security Audit (MANDATORY GATE)

**Never commit or push any files until this audit passes.**

1. Scan all project files (and existing git history/staged changes, if `.git` exists) for sensitive data:
   - API keys, tokens, and secrets (e.g., `ghp_`, `github_pat_`, `sk-`, `AIza`, `AKIA`, `xoxb-`, `Bearer `, `api_key`, `secret`, `token`, `password`, `passwd`, `private_key`)
   - Private key blocks (`-----BEGIN .* PRIVATE KEY-----`)
   - Database/service connection strings with embedded credentials (`://user:pass@`)
   - Environment and credential files (`.env`, `.env.*`, `*.pem`, `*.key`, `*.p12`, `*.pfx`, `credentials.json`, `service-account*.json`, `id_rsa`, `secrets.*`)
   - Sensitive personal data, internal hostnames, or local-only configuration files
2. Check or create `.gitignore` to ensure sensitive, local, and build artifacts are excluded (e.g., `.env*`, `*.key`, `*.pem`, `node_modules/`, `dist/`, `.DS_Store`, IDE folders).
3. **If any sensitive data is found**:
   - **STOP immediately.** Do not stage, commit, or push.
   - Report the exact file paths and findings to the user.
   - Ask the user how to remediate (redact, remove, move to environment variables / GitHub Actions Secrets, or add to `.gitignore`) and re-run the audit after cleanup.

---

## Step 3: Create or Update `README.md`

1. Inspect the codebase to accurately describe the project.
2. Create or edit `README.md` at the repository root with:
   - Project title and concise overview
   - **Live Demo** link pointing to the expected GitHub Pages URL: `https://<OWNER>.github.io/<REPO>/`
   - Key features
   - Tech stack
   - Local setup / usage instructions
   - Deployment overview (GitHub Actions + GitHub Pages)
   - License (if present in the repo)
3. Ensure no sensitive data or machine-specific local paths appear in `README.md`.

---

## Step 4: Set Up CI/CD via GitHub Actions

1. Create or update `.github/workflows/deploy-pages.yml` tailored to the project's stack:
   - **Static site** (e.g., `index.html` at root): upload `.` (or the static output directory) directly.
   - **Build-based site** (e.g., Vite, React, Next.js static export, Astro): include install, lint/test (if defined), and build steps before uploading the build output directory (e.g., `./dist` or `./build`).
2. Use the standard GitHub Pages deployment workflow structure:
   - Triggers: `push` to `main` and `workflow_dispatch`
   - Least-privilege `permissions`:
     ```yaml
     permissions:
       contents: read
       pages: write
       id-token: write
     ```
   - `concurrency` group `"pages"` with `cancel-in-progress: false`
   - Actions: `actions/checkout@v4`, `actions/configure-pages@v5` (with `enablement: true`), `actions/upload-pages-artifact@v3`, and `actions/deploy-pages@v4`.
3. If the project has tests or linters, include a CI check job (or step before deploy) so broken builds are not deployed.

---

## Step 5: Initialize, Commit, and Upload Code to GitHub

1. If the project is not yet a git repository, run `git init -b main`.
2. Verify the target GitHub repository exists using `gh repo view <OWNER>/<REPO>`:
   - If it does not exist, create it with `gh repo create <OWNER>/<REPO> --<public|private>`.
3. Configure the `origin` remote to point to the target repository (`git remote add origin ...` or `git remote set-url origin ...`).
4. Review `git status` and `git diff --cached` one final time to confirm no sensitive files are staged.
5. Stage, commit with a clear message, and push to `main`:
   ```bash
   git add -A
   git commit -m "chore: setup README, GitHub Actions CI/CD, and initial publish"
   git push -u origin main
   ```

---

## Step 6: Enable & Verify GitHub Pages Deployment

1. Ensure GitHub Pages is enabled with **GitHub Actions** as the build source:
   ```bash
   gh api repos/<OWNER>/<REPO>/pages -X POST -f build_type=workflow || \
   gh api repos/<OWNER>/<REPO>/pages -X PUT -f build_type=workflow
   ```
   *(If already enabled via `configure-pages`, confirm `build_type` is `"workflow"`.)*
2. Monitor the GitHub Actions deployment workflow until it completes:
   ```bash
   gh run list --repo <OWNER>/<REPO> --limit 5
   gh run watch --repo <OWNER>/<REPO>
   ```
   - If the workflow fails, inspect the logs (`gh run view --log-failed`), fix the issue, commit, and re-push.
3. Retrieve the live GitHub Pages URL:
   ```bash
   gh api repos/<OWNER>/<REPO>/pages --jq '.html_url'
   ```
4. Verify the live site responds successfully (HTTP 200). If the actual URL differs from what was written in `README.md`, update `README.md`, commit, and push.

---

## Step 7: Create/Edit Repository "About" Section & Add GitHub Pages Link

1. Craft a concise, informative repository description (max ~160 characters) and 3–6 relevant lowercase topics (e.g., `kanban`, `html`, `javascript`, `github-pages`).
2. Update the repository's **About** section—including both the description, topics, and the live GitHub Pages URL as the **Website / Homepage** link:
   ```bash
   gh repo edit <OWNER>/<REPO> \
     --description "<concise project description>" \
     --homepage "<GITHUB_PAGES_URL>" \
     --add-topic "<topic1>" --add-topic "<topic2>"
   ```
3. Verify the updated metadata:
   ```bash
   gh repo view <OWNER>/<REPO> --json description,homepageUrl,repositoryTopics
   ```

---

## Step 8: Final Summary Report

Provide a concise checklist to the user confirming:
- [ ] **Security Audit**: No sensitive data or secrets found/uploaded.
- [ ] **Repository**: Code pushed to `https://github.com/<OWNER>/<REPO>`.
- [ ] **README**: Created/updated with project details and live link.
- [ ] **CI/CD**: GitHub Actions workflow configured and passing.
- [ ] **GitHub Pages**: Live and verified at `<GITHUB_PAGES_URL>`.
- [ ] **About Section**: Description, topics, and GitHub Pages homepage link updated.
