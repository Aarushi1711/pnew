import type { StageNode as StageNodeData, TrackNode } from '@/lib/journey-types';
import { LevelNode } from './level-node';
import { StageNode } from './stage-node';

const MAX_STARS_PER_MODULE = 3;

interface TrackSectionProps {
  track: TrackNode;
  trackIndex: number;
  expandedStageId: string | null;
  onToggleStage: (stageId: string) => void;
  onLevelClick: (moduleId: string) => void;
  pendingModuleId: string | null;
}

// Builds "Requires: Mission N (X+ stars), ..." straight from the stage's
// real unlockRule.requiresStages -- never hardcoded, so a threshold or
// dependency change in the data shows up here with no code change.
// stagePositionById is scoped to this track's own stages, matching how
// requirements are actually authored (sibling stages within one track).
function formatRequirement(stage: StageNodeData, stagePositionById: Map<string, number>): string | null {
  const rule = stage.unlockRule;
  if (!rule || !('requiresStages' in rule) || rule.requiresStages.length === 0) {
    return null;
  }

  const parts = rule.requiresStages.map((requirement) => {
    const position = stagePositionById.get(requirement.stageId);
    const label = position ? `Mission ${position}` : 'an earlier mission';
    return `${label} (${requirement.minStars}+ stars)`;
  });

  return `Requires: ${parts.join(', ')}`;
}

export function TrackSection({
  track,
  trackIndex,
  expandedStageId,
  onToggleStage,
  onLevelClick,
  pendingModuleId,
}: TrackSectionProps) {
  const expandedStage = track.stages.find((stage) => stage.id === expandedStageId);
  const stagePositionById = new Map(track.stages.map((stage, i) => [stage.id, i + 1]));

  return (
    <section className="mb-10">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        World {trackIndex}
      </span>
      <h2 className="mt-1 font-display text-2xl font-bold text-foreground">{track.title}</h2>
      {track.description && <p className="mt-1 text-sm text-muted-foreground">{track.description}</p>}

      <div className="mt-6 flex items-center gap-3 overflow-x-auto pb-2">
        {track.stages.map((stage, i) => (
          <div key={stage.id} className="flex items-center gap-3">
            {i > 0 && <div className="h-px w-8 flex-shrink-0 bg-border" aria-hidden="true" />}
            <StageNode
              index={i + 1}
              locked={stage.locked}
              starsEarned={stage.modules.reduce((sum, m) => sum + m.starsEarned, 0)}
              maxStars={stage.modules.length * MAX_STARS_PER_MODULE}
              expanded={stage.id === expandedStageId}
              requirementText={stage.locked ? formatRequirement(stage, stagePositionById) : null}
              onClick={() => onToggleStage(stage.id)}
            />
          </div>
        ))}
      </div>

      {expandedStage && (
        <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-border bg-muted/40 p-4">
          {expandedStage.modules.length === 0 ? (
            <p className="text-sm text-muted-foreground">No levels in this mission yet.</p>
          ) : (
            expandedStage.modules.map((moduleNode, i) => (
              <LevelNode
                key={moduleNode.id}
                index={i + 1}
                starsEarned={moduleNode.starsEarned}
                hasMorePractice={moduleNode.hasMorePractice}
                locked={false}
                pending={pendingModuleId === moduleNode.id}
                onClick={() => onLevelClick(moduleNode.id)}
              />
            ))
          )}
        </div>
      )}
    </section>
  );
}
