# AI System Architecture

## 1. Role of AI in the Platform
The AI system should function as a learning coach, diagnostic engine, and personalization layer. It should support learners by explaining concepts, scaffolding solutions, offering hints, and identifying skill gaps. It should not replace the pedagogical design but amplify it.

## 2. AI System Goals
- Explain complex DSA topics clearly and contextually.
- Generate hints and guidance without giving away full solutions.
- Diagnose confusion patterns and suggest targeted remediation.
- Personalize the journey based on learner performance and behavior.
- Keep feedback grounded in observed learner state and curriculum context.

## 3. AI Capability Modules
### 3.1 Tutor Module
Responsible for conversational guidance, concept explanations, and adaptive feedback.

### 3.2 Hint Generator
Produces staged hints based on the learner’s current attempt, progress, and the problem context.

### 3.3 Diagnostic Engine
Analyzes submissions, error patterns, and time-to-solution metrics to infer weak areas.

### 3.4 Recommendation Engine
Selects the next challenge, concept, or mission based on learner mastery and prior history.

### 3.5 Content Assistant
Helps authors create or refine curriculum, examples, and explanations.

## 4. AI Orchestration Design
The AI system should be orchestrated by a dedicated service that:
- receives a request with structured context,
- assembles relevant curriculum and learner state,
- calls one or more AI providers or internal tools,
- validates outputs,
- and returns a structured result to the application layer.

## 5. Context Assembly
Every AI request should include:
- learner profile and skill level,
- current topic and lesson context,
- recent submissions and errors,
- mission and journey context,
- and the learner’s explicit goal or question.

## 6. Prompt Strategy
The prompt layer should be modular and versioned. The system should separate:
- system instructions,
- task-specific prompt templates,
- retrieved reference material,
- and learner-specific context.

## 7. Retrieval-Augmented Guidance
The AI should ground guidance in curated curriculum and problem context using retrieval over:
- lesson content,
- problem descriptions,
- approved examples,
- and concept definitions.

## 8. Safety and Guardrails
- Prevent leakage of hidden answers or unsafe content.
- Limit the AI from revealing full solutions prematurely.
- Apply content moderation and policy checks to user prompts and outputs.
- Keep a human-reviewable audit trail for sensitive or high-impact advice.

## 9. Model Abstraction Layer
The system should not couple itself to a single provider. A model abstraction layer should support switching between providers and comparing outputs.

## 10. Evaluation of AI Output
The platform should evaluate responses for:
- correctness,
- helpfulness,
- tone and pedagogy,
- safety,
- and relevance.

## 11. Non-Functional Requirements for AI
- Low latency for hints and explanations
- High reliability under load
- Caching of common responses
- Fallback behavior when AI services are unavailable
- Cost controls and request budgeting

## 12. AI Lifecycle Management
The AI system should support experimentation, prompt versioning, rollout control, and model comparison. It should be possible to change behavior safely without breaking the learner experience.
