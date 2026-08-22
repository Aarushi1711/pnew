import type { StageNode as StageNodeData, TrackNode } from '@/lib/journey-types';
import { LevelNode } from './level-node';
import { LockIcon } from './lock-icon';
import { StageNode } from './stage-node';

const MAX_STARS_PER_MODULE = 3;

interface TrackSectionProps {
  track: TrackNode;
  trackIndex: number;
  // Spans ALL tracks (not just this one), since a track's unlockRule can
  // reference any other track -- built once at the page level.
  trackPositionById: Map<string, number>;
  expandedStageId: string | null;
  onToggleStage: (stageId: string) => void;
  onLevelClick: (moduleId: string) => void;
  pendingModuleId: string | null;
}

// Builds "Requires: World N (X%+ complete), ..." straight from the track's
// real unlockRule.requiresTracks -- never hardcoded, mirroring
// formatRequirement below at the track level.
function formatTrackRequirement(track: TrackNode, trackPositionById: Map<string, number>): string | null {
  const rule = track.unlockRule;
  if (!rule || !rule.requiresTracks || rule.requiresTracks.length === 0) {
    return null;
  }

  const parts = rule.requiresTracks.map((requirement) => {
    const position = trackPositionById.get(requirement.trackId);
    const label = position ? `World ${position}` : 'an earlier world';
    return `${label} (${requirement.minPercent}%+ complete)`;
  });

  return `Requires: ${parts.join(', ')}`;
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
  trackPositionById,
  expandedStageId,
  onToggleStage,
  onLevelClick,
  pendingModuleId,
}: TrackSectionProps) {
  const expandedStage = track.stages.find((stage) => stage.id === expandedStageId);
  const stagePositionById = new Map(track.stages.map((stage, i) => [stage.id, i + 1]));

  // Tracks are never concealed (unlike Stages) -- the real title always
  // shows, locked or not. A locked track just shows why, and doesn't reveal
  // its stage row, mirroring how a locked Stage doesn't reveal its Levels.
  if (track.locked) {
    const requirementText = formatTrackRequirement(track, trackPositionById);
    return (
      <section className="mb-10">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          World {trackIndex}
        </span>
        <h2 className="mt-1 font-display text-2xl font-bold text-foreground">{track.title}</h2>
        <div className="mt-6 flex items-center gap-4 rounded-2xl border border-border bg-muted px-6 py-5 opacity-70">
          <div className="grid size-10 flex-shrink-0 place-items-center rounded-full bg-muted-foreground/15 text-muted-foreground">
            <LockIcon size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Locked</p>
            {requirementText && <p className="mt-0.5 text-xs text-muted-foreground">{requirementText}</p>}
          </div>
        </div>
      </section>
    );
  }

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
