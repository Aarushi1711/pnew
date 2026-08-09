# Folder Structure

## 1. Repository Structure Principles
The repository should reflect the architecture and make ownership clear. Each domain should have its own bounded surface area, and shared infrastructure concerns should live in a small set of clearly named directories.

## 2. Recommended Monorepo Layout
```text
/root
  /apps
    /web                  # future frontend experience
    /admin                # educator/admin tooling
    /api                  # primary backend application
    /worker               # background job workers

  /packages
    /shared-auth          # auth contracts and helpers
    /shared-domain        # domain models and shared interfaces
    /shared-config        # environment/config utilities
    /shared-ui-primitives # reusable UI definitions if frontend is introduced later
    /shared-contracts     # API contracts and event schemas

  /services
    /identity             # auth and identity domain
    /curriculum           # curriculum and content management
    /assessment           # submissions, evaluation, and grading
    /progression          # learner state and journey logic
    /ai-coach             # tutoring, hints, and response generation
    /missions             # mission creation and execution
    /squad                # collaboration and teams
    /gamification         # achievements, rewards, streaks
    /analytics            # reporting and insights

  /infrastructure
    /terraform            # infra as code
    /docker               # container definitions
    /k8s                  # manifests if using Kubernetes

  /docs
    /architecture         # architecture notes and design docs

  /tests
    /integration
    /e2e
    /contract
```

## 3. Ownership Guidelines
- Domain modules should own their data and application logic.
- Shared packages should remain small and stable.
- Infrastructure concerns must not be embedded in domain code.

## 4. File Organization Inside a Domain
Each domain module should follow a consistent internal structure:
```text
/domain-name
  /application
    /use-cases
    /commands
    /queries
    /services
  /domain
    /models
    /events
    /value-objects
    /repositories
    /policies
  /infrastructure
    /persistence
    /clients
    /queue
    /auth
  /presentation
    /controllers
    /dto
    /mappers
  /tests
```

## 5. Naming Conventions
- Use domain nouns for modules and files.
- Use verbs in application use-case names.
- Use event names in past tense.
- Avoid crossing module boundaries with direct imports where possible.

## 6. Documentation Placement
- Product and architecture decisions should live in the docs directory.
- Runbooks and deployment guidance should be stored close to infrastructure assets.
