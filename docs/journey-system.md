# Journey System Design

## 1. Purpose of the Journey System
The journey system is the backbone of the learning experience. It defines how a learner moves through topics, gains mastery, unlocks content, and experiences a coherent sense of progress. It must map educational progression to a motivational narrative without becoming overly rigid.

## 2. Core Concepts
- journey: the learner’s overall progression path
- track: a larger thematic progression area such as arrays, trees, or dynamic programming
- stage: a milestone within a track
- module: a packaged educational sequence
- checkpoint: a major validation point
- mastery state: the learner’s competency signal for a concept

## 3. Journey Model
The journey system should be driven by a graph of nodes and edges rather than a simple sequential list. This allows:
- branching by proficiency,
- adaptive challenge selection,
- and future support for personalized curricula.

## 4. State Transitions
A learner’s path should transition through states such as:
- not started,
- in progress,
- blocked,
- mastered,
- revisiting,
- and completed.

## 5. Progress Computation
Progress should be calculated from multiple signals:
- lesson completion,
- exercise success,
- time spent,
- retry patterns,
- assistance usage,
- and milestone achievements.

## 6. Skill Mapping
The system should maintain a dynamic model of skills such as:
- array traversal,
- hash map reasoning,
- recursion fundamentals,
- graph search,
- and tree balancing.

## 7. Adaptive Logic
The journey engine should adjust content difficulty and sequencing based on learner performance. For example:
- if a learner repeatedly fails on a concept, offer easier scaffolding;
- if performance is strong, unlock more advanced tasks;
- if a learner is disengaged, reintroduce a more rewarding challenge.

## 8. Content Unlocking Rules
Unlock rules should be declarative and configurable. They may depend on:
- prerequisites,
- mastery thresholds,
- streaks,
- mission participation,
- or previous challenge completion.

## 9. Narrative Integration
The journey system should feed the world-facing experience: each state transition should be understandable as an advancement within the learning world.

## 10. Analytics and Feedback
The journey system must provide detailed feedback to:
- the learner,
- the educator,
- and the AI coach.

## 11. Extensibility
The journey model must be extensible enough to support later features such as personalized learning paths, challenge packs, and competency-based progression.
