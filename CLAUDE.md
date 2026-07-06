# Project Instructions

## Never Read Secrets

**Do not read the `.env` file** (or any secrets/credentials file) under any circumstances — not even to investigate. If a task needs to add an environment variable, or to check whether a variable of a given name already exists, **ask the user** instead of opening the file.

---

## Workflow: Plan Before Execute

**For every code-related change, always explain the What / Why / How** (defined in step 2 below). This explanation is non-negotiable for any code change. What differs is the *timing* and whether you *wait for approval*:

- **Logical / substantive code tasks** — changes involving real design decisions, non-trivial logic, touching multiple files, altering behavior, or where getting the approach wrong would be costly. Here: **do not edit or execute immediately.** Present the What/Why/How as a plan **first** and **wait for the user's approval** before making changes.

- **Trivial / mechanical code changes** — documentation/README/CHANGELOG/comment edits, renames, formatting, typo fixes, small obvious single-file edits with no design choice, or anything the user already described precisely. Here: **just do the task directly** (no waiting for approval), but **still give the What/Why/How** alongside or right after the change.

**Use judgment** to classify the task. When in doubt, lean toward just doing it; only stop to wait for approval when there's a genuine decision the user should weigh in on. Either way, the What/Why/How always accompanies the change.

### 1. Check
Investigate the existing code and understand what is already implemented related to the requested task.

### 2. Present the Plan
Show the user a clear plan covering:

- **What** — what changes will be made
- **Why** — the reason behind each change
- **How** — For a simple approach, give **one clear approach**. Only when there are **multiple valid ways** to implement it, present those approaches with their trade-offs, then **recommend which one is best for this specific task and why**.

### 3. Wait for Approval
Only make code changes after the user explicitly approves (says to execute).

**Note:** Pure questions or read-only investigation can always be answered directly without prior approval.

---

## After Execution: Record the Changes

Once a code change is approved and completed, record it in two places:

1. **CHANGELOG.md (full record of every change)** — Append an entry to `CHANGELOG.md` for every completed change: *date — what changed — why*. This is git-independent and is the primary, human-readable history of all changes. Newest entries first.

2. **Memory (only important context)** — Save only the non-obvious decisions and logic to memory — the *why* behind a change that cannot be understood from the code alone, or ongoing goals/constraints. Do **not** put every small change here; keep memory clean and meaningful so it stays useful in future chats.

Git commits are optional — commit only when the user asks.
