My Dash Architecture Specification

Purpose

This document is the master architecture specification for the entire My Dash ecosystem.

Unlike the implementation documents inside the "docs" directory, this document defines the permanent architecture that every implementation must follow.

The architecture described here is considered immutable unless a future architectural revision explicitly replaces it.

All implementation decisions must be validated against this document.

If implementation contradicts this architecture, the implementation must be refactored.

---

Project Vision

My Dash is designed to become a modern, production-ready, self-healing VPS management platform capable of managing thousands of servers while maintaining predictable performance, deterministic behavior, strong security, low operational cost, and excellent user experience.

The project is designed around several engineering principles.

Reliability.

Scalability.

Observability.

Maintainability.

Security.

Fault Tolerance.

Performance.

Developer Experience.

Every architectural decision must improve at least one of these principles without significantly degrading another.

---

System Philosophy

The system does not revolve around pages.

The system revolves around events.

Every important change occurring inside the operating system is transformed into an Event.

Events travel through multiple processing layers.

Each layer has one responsibility.

Each layer produces deterministic output.

The final result appears simultaneously in.

Dashboard.

Analytics.

Notifications.

Automation.

Audit.

AI.

History.

This architecture ensures that every module sees the same version of reality.

---

Global Architecture

The complete architecture consists of the following layers.

Presentation Layer.

↓

Realtime Communication Layer.

↓

API Gateway.

↓

Application Layer.

↓

Domain Layer.

↓

Event Bus.

↓

Infrastructure Layer.

↓

Operating System.

Each layer communicates only with adjacent layers unless explicitly documented.

Cross-layer dependencies are prohibited.

---

Core Domains

The system is divided into independent business domains.

Authentication.

Workspace.

Monitoring.

Analytics.

Notification.

Automation.

Health Engine.

Tunnel.

Docker.

GitHub.

Database.

Redis.

Scheduler.

Plugin.

Security.

Audit.

Artificial Intelligence.

Each domain owns its own logic.

Each domain exposes public contracts.

No domain is allowed to manipulate another domain's internal state directly.

Communication occurs through events or application services.

---

Data Flow

Every piece of operational information follows a deterministic path.

Operating System

↓

Collector

↓

Validation

↓

Normalization

↓

Monitoring Engine

↓

Health Engine

↓

Rule Engine

↓

Event Bus

↓

Analytics

↓

Notification

↓

Automation

↓

Realtime Gateway

↓

Dashboard

No dashboard widget may collect system information directly.

No notification provider may bypass the Event Bus.

No automation module may directly manipulate monitoring data.

---

Event Driven Architecture

Events are immutable.

After an event has been published, it cannot be modified.

If information changes.

A new event is generated.

This approach enables.

Replay.

Audit.

Debugging.

Recovery.

Historical Analysis.

Every event contains.

Identifier.

Timestamp.

Workspace.

Server.

Correlation Identifier.

Trace Identifier.

Version.

Payload.

Checksum.

Priority.

Severity.

Events must remain serializable.

Events must remain deterministic.

---

State Management

There are three kinds of state.

Persistent State.

Stored in PostgreSQL.

Realtime State.

Stored in Redis.

Presentation State.

Stored inside the frontend application.

Only one module may own each state.

State duplication must be avoided.

If duplicated for performance reasons.

Synchronization rules must be documented.

---

Frontend Architecture

Frontend follows Feature Based Architecture.

Each feature contains.

Pages.

Components.

Hooks.

Services.

Stores.

Types.

Utilities.

Tests.

Feature modules communicate through shared contracts.

Never through direct internal imports.

Global state should remain minimal.

Widget rendering must be isolated.

A widget update must never trigger unnecessary rerendering across unrelated widgets.

---

Backend Architecture

Backend follows Clean Architecture.

Presentation.

↓

Application.

↓

Domain.

↓

Repository.

↓

Infrastructure.

Business rules remain inside Domain.

Framework-specific logic remains inside Infrastructure.

Changing HTTP framework should not require Domain modifications.

Changing database technology should not require Application modifications.

---

Database Architecture

PostgreSQL is the only permanent source of truth.

Every important action must eventually be persisted.

Normalization should be preferred.

Controlled denormalization is allowed only after measurable performance analysis.

Historical data uses partitioning.

Large datasets use aggregation.

Metrics use retention policies.

Transactions must guarantee consistency.

---

Redis Architecture

Redis acts as.

Realtime Cache.

Queue.

Distributed Lock.

Presence Engine.

Pub/Sub Broker.

Temporary Session Store.

Redis is never treated as permanent storage.

The system must continue operating after Redis recovery.

---

Notification Pipeline

Monitoring generates Events.

↓

Rule Engine evaluates Events.

↓

Notification Queue stores Delivery Jobs.

↓

Template Engine renders messages.

↓

Provider Manager selects provider.

↓

Delivery Engine transmits.

↓

Verification validates delivery.

↓

History stores results.

↓

Analytics records statistics.

↓

Dashboard updates in realtime.

No notification is sent directly from Rule Engine.

---

Artificial Intelligence Architecture

Artificial Intelligence is an enhancement layer.

The dashboard must remain fully functional without AI.

AI is used only after deterministic processing has completed.

Local algorithms always execute first.

AI executes second.

Timeout.

32 seconds.

If AI succeeds.

Recommendations are updated.

If AI fails.

No core functionality is affected.

---

Self Healing Philosophy

The architecture assumes failures are inevitable.

Every important subsystem must recover automatically whenever possible.

Reconnect.

Retry.

Fallback.

Queue Recovery.

Worker Recovery.

Cache Rebuild.

Session Recovery.

Tunnel Recovery.

WebSocket Recovery.

Database Reconnection.

Redis Reconnection.

Failures should become temporary degradation rather than permanent outages.

---

Observability

Every important subsystem must expose observable metrics.

Latency.

Throughput.

Queue Length.

Memory Usage.

CPU Usage.

Error Rate.

Success Rate.

Retry Count.

Recovery Count.

Health Score.

Availability.

MTTR.

MTBF.

The dashboard itself becomes the primary operational console.

---

Scalability Strategy

Scalability must be horizontal whenever possible.

Stateless backend instances.

Shared PostgreSQL.

Shared Redis.

Distributed Workers.

Independent Notification Workers.

Independent Automation Workers.

Independent AI Workers.

Independent Analytics Workers.

Independent Scheduler Workers.

Increasing system capacity should primarily involve adding workers rather than rewriting code.

---

Reliability Model

Overall System Reliability is modeled as the combined reliability of independent subsystems.

System Reliability

=

Authentication

×

Monitoring

×

Notification

×

Database

×

Redis

×

Realtime

×

Automation

×

Tunnel

×

Analytics

The objective is not perfect reliability.

The objective is graceful degradation.

If one subsystem becomes unavailable.

The remaining system continues operating whenever technically possible.

---

Engineering Constraints

The architecture permanently requires.

Vite.

React.

TypeScript.

Tailwind CSS.

shadcn/ui.

Node.js.

PostgreSQL.

Redis.

WebSocket.

GitHub Actions.

GitHub CLI.

Primary Tunnel using Instatunnel.

Automatic fallback to LocalTunnel.

WhatsApp notifications using Baileys.

Telegram notifications using node-telegram-bot-api.

Dark theme.

Mobile First.

No unnecessary gradients.

No unnecessary visual effects.

No code comments inside generated source code.

---

Definition of Architectural Success

The architecture is considered successfully implemented only when every subsystem communicates through documented contracts, every module has a single responsibility, failures recover automatically whenever possible, realtime synchronization remains consistent, performance scales predictably, documentation matches implementation, and the project can continue evolving without requiring major architectural redesign.

This document is the permanent architectural foundation of the My Dash project.