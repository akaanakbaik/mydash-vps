FREEBUFF.md

Purpose

This document defines the mandatory operating procedure for the FreeBuff AI Agent while developing the My Dash project.

This file complements the documentation inside the "docs" directory.

If there is any conflict between assumptions and project documentation, the documentation inside "docs" always has higher priority.

---

Primary Mission

Build My Dash exactly according to the architecture defined inside the documentation.

The objective is not to generate code quickly.

The objective is to produce a production-ready VPS Dashboard that is stable, secure, maintainable, scalable, and fully verified.

---

Startup Procedure

Before generating or modifying any code.

Always execute the following process mentally.

Read "docs/main.md".

Determine the active Batch requested by the user.

Read every markdown file inside that Batch.

Build an internal understanding of the architecture.

Identify affected modules.

Identify dependencies.

Create an implementation plan.

Only then begin implementation.

Never skip this sequence.

---

Batch Rules

Never read Batch 4 before Batch 3 has been implemented.

Never implement Batch 7 features while Batch 6 is incomplete.

Never mix unfinished batches.

Every batch represents one architectural milestone.

Complete.

Verify.

Improve.

Only then continue.

---

Implementation Rules

Every implementation must follow.

Architecture before code.

Design before implementation.

Testing before publication.

Quality before speed.

Maintainability before shortcuts.

Never generate placeholder implementations.

Never leave unfinished modules.

Never leave TODO.

Never leave FIXME.

Never fake functionality.

---

Code Quality

Generated code must satisfy the following.

No code comments.

No duplicate logic.

No duplicate components.

No duplicate utilities.

No unused imports.

No unused variables.

No dead code.

No magic values when configuration is more appropriate.

Consistent naming.

Small reusable modules.

Predictable architecture.

---

Architecture Rules

Always preserve.

Clean Architecture.

Domain Driven Design.

Repository Pattern.

Dependency Injection.

Service Layer.

Shared Components.

Reusable Hooks.

Reusable Utilities.

Single Responsibility Principle.

Low Coupling.

High Cohesion.

Event Driven communication whenever appropriate.

---

Performance Rules

Always minimize.

CPU usage.

Memory usage.

Disk operations.

Database queries.

Redis operations.

Bundle size.

Network traffic.

WebSocket bandwidth.

Rendering cost.

Measure performance before optimization.

Measure again after optimization.

---

AI Usage Policy

Artificial Intelligence is optional.

Core functionality must never depend on AI.

AI is allowed only for.

Analysis.

Prediction.

Recommendations.

Summaries.

Diagnostics.

Natural language explanations.

Maximum AI timeout.

32 seconds.

If AI fails.

Immediately continue using deterministic local algorithms.

Never block user interaction while waiting for AI.

---

Verification Rules

After every major implementation.

Run Build.

Run Lint.

Run Type Checking.

Run Unit Tests.

Run Integration Tests.

Run Architecture Validation.

Run Performance Validation.

Run Security Review.

Run Self Review.

Fix every detected problem before continuing.

---

Git Workflow

Before every commit.

Review changed files.

Review architecture.

Review imports.

Review dependencies.

Review configuration.

Review secrets.

Review formatting.

Review tests.

Only commit stable code.

Never commit temporary files.

Never commit cache.

Never commit logs.

Never commit session files.

Never commit environment files.

Never commit internal AI prompt documentation when it is intended to remain private.

---

GitHub Workflow

If GitHub CLI is available.

Verify Git installation.

Verify GitHub CLI installation.

Verify authentication.

Verify remote repository.

Verify current branch.

Verify repository permissions.

Verify repository synchronization.

Only then.

Commit.

Push.

Verify remote repository again.

If authentication fails.

Stop.

Explain the issue.

Never attempt unauthorized authentication.

---

Self Review

Before ending any task.

Ask yourself.

Does this implementation follow the documentation?

Does this implementation follow the architecture?

Is the implementation reusable?

Can it scale?

Can it recover automatically?

Can another engineer maintain it?

Is anything duplicated?

Is there hidden technical debt?

If any answer is negative.

Improve the implementation before continuing.

---

Final Rule

Never stop because the code compiles.

Stop only when.

The implementation is correct.

The implementation is verified.

The implementation is documented.

The implementation is tested.

The implementation is production ready.