# Database Architecture

## 1. Database Strategy
The platform should use a relational database as the system of record for core business entities and a small set of supporting stores for search, caching, and event-driven workloads. PostgreSQL is the preferred primary store because it supports relational integrity, transactions, and a mature ecosystem.

## 2. Primary Database: PostgreSQL
### 2.1 Why PostgreSQL
- strong support for relational consistency,
- mature JSON capabilities for flexible content and metadata,
- robust indexing,
- and strong operational tooling.

### 2.2 Core Tables and Domains
The database should model the following major entities:
- users
- profiles
- learning_paths
- topics
- lessons
- problems
- problem_versions
- submissions
- evaluations
- skill_assessments
- missions
- mission_progress
- squads
- squad_memberships
- achievements
- user_rewards
- notifications
- audit_events

## 3. Data Model Design Principles
- Use explicit foreign keys and constraints where data integrity matters.
- Keep immutable history tables for submissions, evaluations, and progression events.
- Avoid storing derived analytics in the operational schema unless needed for performance.
- Version content entities to enable safe iteration and curriculum changes.

## 4. Recommended Schema Patterns
### 4.1 Versioned Content
Content entities should be versioned so instructors can update curriculum without breaking historical learner state.

### 4.2 Event Sourcing for Progression
While full event sourcing may be too heavy initially, key progression events should be stored as immutable records to support detailed replays and analytics.

### 4.3 Append-Only Activity Table
An activity log should capture learner interactions, such as:
- lesson starts,
- hints requested,
- submission attempts,
- mission completions,
- and reward unlocks.

## 5. Secondary Stores
### 5.1 Redis
Redis should be used for:
- session caching,
- rate limiting,
- transient state,
- leaderboard snapshots,
- and short-lived job coordination.

### 5.2 Object Storage
Object storage should hold:
- images,
- generated explanation assets,
- code snapshots,
- and media attachments.

### 5.3 Search and Vector Store
A search engine or vector database should support:
- semantic concept retrieval,
- curriculum search,
- and AI retrieval augmented generation.

## 6. Data Lifecycle and Retention
- Keep core learner and curriculum data indefinitely or for a defined legal retention period.
- Archive old activity logs based on retention policy.
- Remove temporary or generated artifacts after expiration.

## 7. Security and Compliance
- Encrypt sensitive data at rest and in transit.
- Separate personal data from analytics where appropriate.
- Maintain audit trails for admin operations and major learner state changes.

## 8. Migration Strategy
Use database migrations with strong version control and backward compatibility. Schema changes should support rollouts without downtime whenever possible.
