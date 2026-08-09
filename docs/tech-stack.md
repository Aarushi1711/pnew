# Technology Stack

## 1. Core Principles for the Stack
The platform should favor a modern, reliable, and widely adopted stack that supports rapid delivery and long-term maintainability. The stack should balance developer productivity, ecosystem maturity, and architectural flexibility.

## 2. Recommended Backend Stack
### Runtime and Language
- TypeScript or Python for backend services
- TypeScript is preferred for strong typing and consistency across services if the system is primarily API-oriented.
- Python is valuable for AI orchestration and experimentation-heavy workflows.

### Frameworks
- NestJS for a structured backend if TypeScript is chosen
- FastAPI for Python-based services with strong async support
- Both are appropriate, but the platform should standardize on one primary framework for maintainability

### API Layer
- REST for standard CRUD and synchronous workflows
- GraphQL may be added later for flexible frontend data fetching, but it should not be the default choice at launch
- gRPC can be considered for internal service-to-service communication if service extraction occurs

## 3. Data Layer
- PostgreSQL for transactional domain data
- Redis for caching, transient state, and lightweight queues
- Object storage for media assets and submission artifacts
- OpenSearch or Elasticsearch for content search and semantic retrieval
- Vector database for AI retrieval and concept matching

## 4. Messaging and Workflow
- Kafka, RabbitMQ, or NATS for event transport
- A queue-based system is required for asynchronous AI tasks and background workflows
- Workflow orchestration can be handled by a managed orchestration tool or internal event handlers depending on scale

## 5. AI and ML Stack
- LLM provider abstraction layer to avoid lock-in
- Embedding model for semantic retrieval
- Evaluation and classification services for response quality and safety
- Prompt management and versioning system
- Guardrails and moderation layer

## 6. Authentication and Security
- OAuth 2.0 / OpenID Connect
- JWT or opaque tokens depending on the chosen auth provider
- Secret manager integration
- MFA support for admin and educator roles

## 7. Observability and Operations
- OpenTelemetry for tracing
- Prometheus and Grafana for metrics
- Structured logging with JSON output
- Sentry or equivalent for error monitoring
- Health checks and readiness probes

## 8. Infrastructure and Deployment
- Docker for containerization
- Kubernetes or managed container orchestration for production scale
- Terraform or infrastructure-as-code tooling for provisioning
- CI/CD pipeline with automated tests and environment promotion

## 9. Platform Governance
- Use a monorepo or polyrepo approach based on team size and operational complexity
- A monorepo is recommended for initial implementation to simplify coordination
- Shared internal packages should be used for domain contracts, validation rules, and common utilities

## 10. Stack Rationale
This stack is appropriate because it supports:
- strong typing and maintainability,
- rapid API delivery,
- robust async processing,
- modern AI integration,
- and clear production deployment paths.
